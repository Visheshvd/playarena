const webPush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

// Configure web-push with VAPID keys
webPush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@playarena.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Send push notification to a specific user
 */
async function sendNotificationToUser(userId, payload) {
  try {
    // Get all active subscriptions for the user
    const subscriptions = await PushSubscription.find({ 
      user: userId, 
      isActive: true 
    });

    if (subscriptions.length === 0) {
      console.log(`No active push subscriptions found for user ${userId}`);
      return { success: false, message: 'No subscriptions found' };
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/logo.png',
      badge: payload.badge || '/badge.png',
      data: payload.data || {},
      tag: payload.tag || 'default',
      requireInteraction: payload.requireInteraction || false
    });

    // Send to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth
            }
          };

          await webPush.sendNotification(pushSubscription, notificationPayload);
          return { success: true, endpoint: sub.endpoint };
        } catch (error) {
          console.error('Failed to send to endpoint:', sub.endpoint, error.message);
          
          // If subscription is no longer valid, mark it as inactive
          if (error.statusCode === 410 || error.statusCode === 404) {
            await PushSubscription.findByIdAndUpdate(sub._id, { isActive: false });
          }
          
          return { success: false, endpoint: sub.endpoint, error: error.message };
        }
      })
    );

    const successCount = results.filter(r => r.value?.success).length;
    console.log(`Sent push notification to ${successCount}/${subscriptions.length} subscriptions for user ${userId}`);

    return { 
      success: true, 
      sent: successCount, 
      total: subscriptions.length 
    };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send push notification to all admins
 */
async function sendNotificationToAdmins(payload) {
  try {
    const User = require('../models/User');
    const admins = await User.find({ role: 'admin' }).select('_id');
    
    const results = await Promise.all(
      admins.map(admin => sendNotificationToUser(admin._id, payload))
    );

    return { 
      success: true, 
      adminsNotified: results.filter(r => r.success).length 
    };
  } catch (error) {
    console.error('Error sending notifications to admins:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send push notification to multiple users
 */
async function sendNotificationToUsers(userIds, payload) {
  try {
    const results = await Promise.all(
      userIds.map(userId => sendNotificationToUser(userId, payload))
    );

    return { 
      success: true, 
      usersNotified: results.filter(r => r.success).length,
      totalUsers: userIds.length
    };
  } catch (error) {
    console.error('Error sending notifications to users:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendNotificationToUser,
  sendNotificationToAdmins,
  sendNotificationToUsers
};
