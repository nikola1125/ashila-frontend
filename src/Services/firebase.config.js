import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
};

// Validate Firebase configuration
const requiredEnvVars = [
  { key: 'VITE_FIREBASE_APIKEY', name: 'API Key' },
  { key: 'VITE_FIREBASE_AUTHDOMAIN', name: 'Auth Domain' },
  { key: 'VITE_FIREBASE_PROJECTID', name: 'Project ID' },
  { key: 'VITE_FIREBASE_STORAGEBUCKET', name: 'Storage Bucket' },
  { key: 'VITE_FIREBASE_MESSAGINGSENDERID', name: 'Messaging Sender ID' },
  { key: 'VITE_FIREBASE_APPID', name: 'App ID' }
];

const missingVars = requiredEnvVars.filter(
  (varInfo) => !import.meta.env[varInfo.key] || import.meta.env[varInfo.key] === ''
);

if (missingVars.length > 0) {
  console.error('❌ Missing Firebase environment variables:');
  missingVars.forEach(varInfo => {
    console.error(`   - ${varInfo.name} (${varInfo.key})`);
  });
  console.error('\n📝 To fix this:');
  console.error('1. Go to https://console.firebase.google.com/');
  console.error('2. Select your project → Settings (⚙️) → Project settings');
  console.error('3. Scroll to "Your apps" and copy the config values');
  console.error('4. Create a .env file in the frontend directory with:');
  console.error('   VITE_FIREBASE_APIKEY=your-api-key');
  console.error('   VITE_FIREBASE_AUTHDOMAIN=your-project.firebaseapp.com');
  console.error('   VITE_FIREBASE_PROJECTID=your-project-id');
  console.error('   VITE_FIREBASE_STORAGEBUCKET=your-project.appspot.com');
  console.error('   VITE_FIREBASE_MESSAGINGSENDERID=your-sender-id');
  console.error('   VITE_FIREBASE_APPID=your-app-id');
  console.error('   VITE_BASE_API=http://localhost:5000');
  console.error('5. Restart your dev server (npm run dev)');
}

// Initialize Firebase
let app;
let auth;

try {
  // Check if we have minimum required config
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Firebase API Key and Project ID are required');
  }
  
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  if (missingVars.length > 0) {
    throw new Error(`Firebase configuration incomplete. Missing: ${missingVars.map(v => v.name).join(', ')}. Please check FIREBASE_SETUP.md for instructions.`);
  }
  throw new Error('Firebase configuration error. Please check your environment variables.');
}

// Export everything you need
export { app, auth };
export default app;