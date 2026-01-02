// Firebase Authentication Service
// This will be initialized when Firebase config is provided

let auth = null;
let googleAuthProvider = null;
let recaptchaVerifier = null;

export const initializeFirebase = async () => {
  try {
    const { firebaseConfig, isFirebaseConfigured } = await import('../config/firebase');
    
    if (!isFirebaseConfigured()) {
      // Silent fail - don't show error in console for production
      return false;
    }

    // Dynamic import - only load Firebase when config is available
    const { initializeApp } = await import('firebase/app');
    const { getAuth, GoogleAuthProvider, RecaptchaVerifier } = await import('firebase/auth');

    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleAuthProvider = new GoogleAuthProvider();
    
    // Add custom parameters for Google Sign In
    googleAuthProvider.setCustomParameters({
      prompt: 'select_account'
    });

    console.log('✅ Firebase initialized successfully');
    return true;
  } catch (error) {
    // Silent fail in production
    return false;
  }
};

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    if (!auth) {
      const initialized = await initializeFirebase();
      if (!initialized) {
        return {
          success: false,
          error: 'Google Sign In is not available. Please use email registration.'
        };
      }
    }

    const { signInWithPopup } = await import('firebase/auth');
    const result = await signInWithPopup(auth, googleAuthProvider);
    
    // Get user info
    const user = result.user;
    const token = await user.getIdToken();

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber
      },
      token
    };
  } catch (error) {
    console.error('Google sign in error:', error);

    // Handle user cancelled popup
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      return {
        success: false,
        error: 'Google Sign In cancelled'
      };
    }

    return {
      success: false,
      error: error.message || 'Google Sign In failed. Please try again.'
    };
  }
};

// Setup OTP Recaptcha (for phone verification)
export const setupRecaptcha = (elementId) => {
  try {
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }

    const { RecaptchaVerifier } = require('firebase/auth');
    
    recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
      size: 'invisible',
      callback: (response) => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      }
    });

    return recaptchaVerifier;
  } catch (error) {
    console.error('Recaptcha setup error:', error);
    return null;
  }
};

// Send OTP to phone number
export const sendOTP = async (phoneNumber, recaptchaVerifier) => {
  try {
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }

    const { signInWithPhoneNumber } = await import('firebase/auth');
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    
    return {
      success: true,
      confirmationResult
    };
  } catch (error) {
    console.error('Send OTP error:', error);
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    };
  }
};

// Verify OTP
export const verifyOTP = async (confirmationResult, otp) => {
  try {
    const result = await confirmationResult.confirm(otp);
    const user = result.user;
    const token = await user.getIdToken();

    return {
      success: true,
      user: {
        uid: user.uid,
        phoneNumber: user.phoneNumber
      },
      token
    };
  } catch (error) {
    console.error('Verify OTP error:', error);
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    };
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth?.currentUser;
};

// Sign out
export const signOut = async () => {
  try {
    if (auth) {
      const { signOut: firebaseSignOut } = await import('firebase/auth');
      await firebaseSignOut(auth);
    }
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error };
  }
};

