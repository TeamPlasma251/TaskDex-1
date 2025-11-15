// Firebase helper functions
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';

// Helper function to query a user's profile based on their UID
export const queryUserByUID = async (uid) => {
  if (!db || !uid) return null;
  
  try {
    const userDocRef = doc(db, 'artifacts', 'default-app-id', 'users', uid, 'profile', 'data');
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (e) {
    console.error("Error querying user:", e);
    return null;
  }
};

