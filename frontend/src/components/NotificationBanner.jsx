import { useState, useEffect } from 'react';
import { 
  subscribeToPushNotifications, 
  unsubscribeFromPushNotifications,
  checkSubscriptionStatus,
  registerServiceWorker
} from '../utils/notification';

function NotificationBanner() {
  const [show, setShow] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkStatus();
    // Register service worker on component mount
    registerServiceWorker();
  }, []);

  const checkStatus = async () => {
    const status = await checkSubscriptionStatus();
    setSubscribed(status.subscribed);
    
    // Show banner if notifications are supported but not subscribed
    if (status.supported && !status.subscribed && status.permission !== 'denied') {
      setShow(true);
    }
  };

  const handleEnable = async () => {
    setLoading(true);
    const result = await subscribeToPushNotifications();
    setLoading(false);

    if (result.success) {
      setSubscribed(true);
      setShow(false);
    } else {
      alert('Failed to enable notifications. Please check your browser settings.');
    }
  };

  const handleDismiss = () => {
    setShow(false);
    // Store dismissal in localStorage to not show again for this session
    sessionStorage.setItem('notificationBannerDismissed', 'true');
  };

  const handleToggle = async () => {
    setLoading(true);
    
    if (subscribed) {
      await unsubscribeFromPushNotifications();
      setSubscribed(false);
    } else {
      const result = await subscribeToPushNotifications();
      if (result.success) {
        setSubscribed(true);
      }
    }
    
    setLoading(false);
  };

  // Don't show if dismissed this session
  if (sessionStorage.getItem('notificationBannerDismissed')) {
    return null;
  }

  if (!show && !subscribed) {
    return null;
  }

  return (
    <>
      {/* Banner for unsubscribed users */}
      {show && !subscribed && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-cyan-500/90 to-purple-500/90 backdrop-blur-sm border-b border-cyan-400/50 p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <h3 className="text-white font-bold">Stay Updated!</h3>
                <p className="text-white/90 text-sm">
                  Enable notifications to get instant updates about bookings and matches
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleEnable}
                disabled={loading}
                className="px-6 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {loading ? 'Enabling...' : 'Enable'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification toggle button (always visible after subscription) */}
      {subscribed && (
        <button
          onClick={handleToggle}
          disabled={loading}
          className="fixed bottom-4 right-4 z-40 p-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          title={subscribed ? 'Notifications enabled' : 'Enable notifications'}
        >
          <span className="text-2xl">{subscribed ? '🔔' : '🔕'}</span>
        </button>
      )}
    </>
  );
}

export default NotificationBanner;
