import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Register service worker
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    });
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

// Check if notifications are supported
export function areNotificationsSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

// Get current notification permission
export function getNotificationPermission() {
  if (!areNotificationsSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission() {
  if (!areNotificationsSupported()) {
    throw new Error('Notifications not supported');
  }

  const permission = await Notification.requestPermission();
  return permission;
}

// Convert base64 string to Uint8Array (for VAPID key)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Subscribe to push notifications
export async function subscribeToPushNotifications() {
  try {
    // Check permission
    if (Notification.permission !== 'granted') {
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }
    }

    // Register service worker
    const registration = await navigator.serviceWorker.ready;

    // Get VAPID public key from server
    const { data } = await axios.get(`${API_URL}/notification/vapid-public-key`);
    const vapidPublicKey = data.data.publicKey;

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    // Send subscription to server
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    await axios.post(
      `${API_URL}/notification/subscribe`,
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
        },
        userAgent: navigator.userAgent
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('✓ Push notification subscription successful');
    return { success: true, subscription };
  } catch (error) {
    console.error('Push notification subscription failed:', error);
    return { success: false, error: error.message };
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return { success: true, message: 'No active subscription' };
    }

    // Unsubscribe from push manager
    await subscription.unsubscribe();

    // Remove subscription from server
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    await axios.delete(`${API_URL}/notification/unsubscribe`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: {
        endpoint: subscription.endpoint
      }
    });

    console.log('✓ Unsubscribed from push notifications');
    return { success: true };
  } catch (error) {
    console.error('Unsubscribe failed:', error);
    return { success: false, error: error.message };
  }
}

// Check subscription status
export async function checkSubscriptionStatus() {
  try {
    if (!areNotificationsSupported()) {
      return { subscribed: false, supported: false };
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    return {
      supported: true,
      subscribed: !!subscription,
      permission: Notification.permission
    };
  } catch (error) {
    console.error('Failed to check subscription status:', error);
    return { supported: false, subscribed: false, error: error.message };
  }
}

// Test notification (local)
export function showTestNotification() {
  if (Notification.permission === 'granted') {
    new Notification('PlayArena Test', {
      body: 'Push notifications are working! 🎉',
      icon: '/logo.png',
      badge: '/badge.png'
    });
  }
}
