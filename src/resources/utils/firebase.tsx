// utils/firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAAkH4U8cu07CJ2oMbuI09yZtQEgDce2yo",
  authDomain: "flatstore-web.firebaseapp.com",
  projectId: "flatstore-web",
  storageBucket: "flatstore-web.firebasestorage.app",
  messagingSenderId: "759842096394",
  appId: "1:759842096394:web:e0336b119c4bc3567626f3",
  measurementId: "G-TYND3G3CZB"
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

export const getFcmToken = async (): Promise<string | null> => {
  try {
    const token = await getToken(messaging, {
      vapidKey: 'BI-Gpyi6WX4qqhw28uqwDgPyqfGXjs-RO4YniAf3KTiwQSSj6JGBhy93_YRzsdiUuU8mTMdzXFHXtXt7npglYUc',
    });
    return token || null;
  } catch (err) {
    console.error('Error getting FCM token', err);
    return null;
  }
};
