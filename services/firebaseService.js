const admin = require('firebase-admin');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYoneYWVChCstCD6PMFjd5biJ8HJZh7Io",
  authDomain: "blood-donation-fc136.firebaseapp.com",
  projectId: "blood-donation-fc136",
  storageBucket: "blood-donation-fc136.firebasestorage.app",
  messagingSenderId: "439502128204",
  appId: "1:439502128204:web:9dc74e77dabbc3d77220e9"
};

// Initialize Firebase Admin SDK if not already initialized
let firebaseApp;
let isFirebaseInitialized = false;

try {
  // Check if Firebase is already initialized
  firebaseApp = admin.app();
  isFirebaseInitialized = true;
} catch (error) {
  // Initialize Firebase Admin SDK with minimal configuration for development
  // In production, you should use proper service account credentials
  try {
    // For development, we'll use a minimal setup
    // This will have limited functionality but won't crash the app
    console.log('Initializing Firebase Admin SDK for development...');
    
    // Note: For full functionality in production, you need proper service account credentials
    // For now, we'll just set up the project ID to prevent crashes
    firebaseApp = admin.initializeApp({
      projectId: firebaseConfig.projectId
    });
    
    console.log('Firebase Admin SDK initialized successfully');
    isFirebaseInitialized = true;
  } catch (initError) {
    console.error('Failed to initialize Firebase Admin SDK:', initError);
    isFirebaseInitialized = false;
    firebaseApp = null;
  }
}

/**
 * Send push notification to a single device
 * @param {string} token - FCM token of the device
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data payload
 * @returns {Promise<Object>} - Result of the send operation
 */
const sendPushNotification = async (token, title, body, data = {}) => {
  try {
    if (!isFirebaseInitialized || !firebaseApp) {
      console.warn('Firebase not properly initialized, skipping push notification');
      return {
        success: false,
        error: 'Firebase not configured for push notifications',
        token: token
      };
    }

    if (!token) {
      throw new Error('FCM token is required');
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        ...data,
        timestamp: Date.now().toString(),
      },
      token: token,
      webpush: {
        headers: {
          Urgency: 'high',
        },
        notification: {
          title: title,
          body: body,
          icon: '/icon-192x192.png', // You can add your app icon here
          badge: '/badge-72x72.png',
          requireInteraction: true,
          actions: [
            {
              action: 'view',
              title: 'View',
              icon: '/view-icon.png'
            },
            {
              action: 'dismiss',
              title: 'Dismiss',
              icon: '/dismiss-icon.png'
            }
          ]
        },
        fcm_options: {
          link: process.env.FRONTEND_URL || 'http://localhost:5173'
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('Push notification sent successfully:', response);
    
    return {
      success: true,
      messageId: response,
      token: token
    };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return {
      success: false,
      error: error.message,
      token: token
    };
  }
};

/**
 * Send push notifications to multiple devices
 * @param {Array<string>} tokens - Array of FCM tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data payload
 * @returns {Promise<Object>} - Result of the multicast operation
 */
const sendPushNotificationToMultiple = async (tokens, title, body, data = {}) => {
  try {
    if (!isFirebaseInitialized || !firebaseApp) {
      console.warn('Firebase not properly initialized, skipping push notifications');
      return {
        success: false,
        error: 'Firebase not configured for push notifications',
        successCount: 0,
        failureCount: tokens ? tokens.length : 0
      };
    }

    if (!tokens || tokens.length === 0) {
      throw new Error('At least one FCM token is required');
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        ...data,
        timestamp: Date.now().toString(),
      },
      tokens: tokens,
      webpush: {
        headers: {
          Urgency: 'high',
        },
        notification: {
          title: title,
          body: body,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          requireInteraction: true,
        },
        fcm_options: {
          link: process.env.FRONTEND_URL || 'http://localhost:5173'
        }
      }
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    console.log(`Push notifications sent to ${response.successCount} devices out of ${tokens.length}`);
    
    if (response.failureCount > 0) {
      console.log('Failed tokens:', response.responses
        .map((resp, idx) => ({ token: tokens[idx], error: resp.error }))
        .filter(item => item.error));
    }

    return {
      success: response.successCount > 0,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    };
  } catch (error) {
    console.error('Error sending push notifications to multiple devices:', error);
    return {
      success: false,
      error: error.message,
      successCount: 0,
      failureCount: tokens ? tokens.length : 0
    };
  }
};

/**
 * Send push notification to topic subscribers
 * @param {string} topic - Topic name
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data payload
 * @returns {Promise<Object>} - Result of the topic send operation
 */
const sendPushNotificationToTopic = async (topic, title, body, data = {}) => {
  try {
    if (!topic) {
      throw new Error('Topic name is required');
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        ...data,
        timestamp: Date.now().toString(),
      },
      topic: topic,
      webpush: {
        headers: {
          Urgency: 'high',
        },
        notification: {
          title: title,
          body: body,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          requireInteraction: true,
        },
        fcm_options: {
          link: process.env.FRONTEND_URL || 'http://localhost:5173'
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('Push notification sent to topic successfully:', response);
    
    return {
      success: true,
      messageId: response,
      topic: topic
    };
  } catch (error) {
    console.error('Error sending push notification to topic:', error);
    return {
      success: false,
      error: error.message,
      topic: topic
    };
  }
};

/**
 * Subscribe tokens to a topic
 * @param {Array<string>} tokens - Array of FCM tokens
 * @param {string} topic - Topic name
 * @returns {Promise<Object>} - Result of the subscription operation
 */
const subscribeToTopic = async (tokens, topic) => {
  try {
    if (!tokens || tokens.length === 0) {
      throw new Error('At least one FCM token is required');
    }
    
    if (!topic) {
      throw new Error('Topic name is required');
    }

    const response = await admin.messaging().subscribeToTopic(tokens, topic);
    console.log(`Successfully subscribed ${response.successCount} tokens to topic ${topic}`);
    
    return {
      success: response.successCount > 0,
      successCount: response.successCount,
      failureCount: response.failureCount,
      topic: topic
    };
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    return {
      success: false,
      error: error.message,
      topic: topic
    };
  }
};

/**
 * Unsubscribe tokens from a topic
 * @param {Array<string>} tokens - Array of FCM tokens
 * @param {string} topic - Topic name
 * @returns {Promise<Object>} - Result of the unsubscription operation
 */
const unsubscribeFromTopic = async (tokens, topic) => {
  try {
    if (!tokens || tokens.length === 0) {
      throw new Error('At least one FCM token is required');
    }
    
    if (!topic) {
      throw new Error('Topic name is required');
    }

    const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
    console.log(`Successfully unsubscribed ${response.successCount} tokens from topic ${topic}`);
    
    return {
      success: response.successCount > 0,
      successCount: response.successCount,
      failureCount: response.failureCount,
      topic: topic
    };
  } catch (error) {
    console.error('Error unsubscribing from topic:', error);
    return {
      success: false,
      error: error.message,
      topic: topic
    };
  }
};

module.exports = {
  sendPushNotification,
  sendPushNotificationToMultiple,
  sendPushNotificationToTopic,
  subscribeToTopic,
  unsubscribeFromTopic,
  firebaseApp
};