# Firebase Setup Guide

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get Started**
3. Enable **Email/Password** authentication:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"
4. Enable **Google** authentication:
   - Click on "Google"
   - Toggle "Enable" to ON
   - Enter your project support email
   - Click "Save"

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, click the **gear icon** (⚙️) next to "Project Overview"
2. Select **Project settings**
3. Scroll down to **Your apps** section
4. If you don't have a web app, click **</>** (Web icon) to add one
5. Register your app with a nickname (e.g., "Medi Mart Web")
6. Copy the Firebase configuration object

You'll see something like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## Step 4: Create .env File

1. In the `frontend` directory, create a file named `.env`
2. Add the following content (replace with your actual values):

```env
# Backend API URL
VITE_BASE_API=http://localhost:5000

# Firebase Configuration
VITE_FIREBASE_APIKEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTHDOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECTID=your-project-id
VITE_FIREBASE_STORAGEBUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGINGSENDERID=123456789012
VITE_FIREBASE_APPID=1:123456789012:web:abcdef1234567890
```

## Step 5: Restart Your Development Server

After creating the `.env` file:
1. Stop your frontend dev server (Ctrl+C)
2. Start it again: `npm run dev`

## Important Notes

- The `.env` file should be in the `frontend` directory (same level as `package.json`)
- Never commit the `.env` file to Git (it should already be in `.gitignore`)
- Make sure there are no spaces around the `=` sign
- Don't use quotes around the values in `.env` file

## Troubleshooting

If you still see errors:
1. Check the browser console for specific error messages
2. Verify all environment variables are set correctly
3. Make sure you restarted the dev server after creating `.env`
4. Check that Firebase Authentication is enabled in Firebase Console

