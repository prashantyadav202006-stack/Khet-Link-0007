import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

export interface UserProfileData {
  uid: string;
  email: string | null;
  role: 'farmer' | 'buyer';
  name?: string;
  phone?: string;
  farmerId?: string;
  farmerProfile?: any;
  buyerOrgName?: string;
  buyerOrgType?: string;
  createdAt?: any;
}

/**
 * Register a new user in Firebase Auth and record their profile in Firestore 'users'
 */
export async function registerWithFirebase(
  email: string,
  pass: string,
  role: 'farmer' | 'buyer',
  extraData: Record<string, any> = {}
): Promise<{ user: User; profile: UserProfileData }> {
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = credential.user;

  const profile: UserProfileData = {
    uid: user.uid,
    email: user.email,
    role,
    name: extraData.fullName || extraData.buyerOrgName || 'Khet Link User',
    phone: extraData.phone || extraData.mobileNumber || '',
    ...extraData
  };

  await setDoc(doc(db, 'users', user.uid), {
    ...profile,
    createdAt: serverTimestamp()
  }, { merge: true });

  return { user, profile };
}

/**
 * Log in an existing user with email and password
 */
export async function loginWithFirebase(
  email: string,
  pass: string
): Promise<{ user: User; profile: UserProfileData | null }> {
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  const user = credential.user;

  const userSnap = await getDoc(doc(db, 'users', user.uid));
  const profile = userSnap.exists() ? (userSnap.data() as UserProfileData) : null;

  return { user, profile };
}

/**
 * Log out currently signed in user
 */
export async function logoutFromFirebase(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribe to auth state changes to keep sessions persistent
 */
export function subscribeToAuthState(
  callback: (user: User | null, profile: UserProfileData | null) => void
) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        const profile = userSnap.exists() ? (userSnap.data() as UserProfileData) : null;
        callback(user, profile);
      } catch (err) {
        console.warn('Error fetching user profile on auth change:', err);
        callback(user, null);
      }
    } else {
      callback(null, null);
    }
  });
}
