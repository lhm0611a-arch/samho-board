import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import config from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
};

const app = initializeApp(firebaseConfig);

let db: ReturnType<typeof initializeFirestore>;
try {
  db = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
      experimentalAutoDetectLongPolling: true,
    },
    config.firestoreDatabaseId
  );
} catch {
  // If already initialized or persistent cache unsupported
  db = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
    },
    config.firestoreDatabaseId
  );
}

const auth = getAuth(app);

export { app, db, auth };

