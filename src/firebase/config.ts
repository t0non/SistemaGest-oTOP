import {initializeApp, getApps, getApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';

export const firebaseConfig = {
  "projectId": "studio-4772271246-e1289",
  "appId": "1:332630561458:web:dd5aa4a48cb013171defab",
  "apiKey": "AIzaSyAbhgQPmfkl6MOBMJRHdXH4i34ib991Tbw",
  "authDomain": "studio-4772271246-e1289.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "332630561458"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
