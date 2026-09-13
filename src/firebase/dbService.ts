import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './config';
import { CropProduct, FarmerProfile, Order } from '../types';

const CROPS_COLLECTION = 'crops';
const FARMERS_COLLECTION = 'farmers';
const ORDERS_COLLECTION = 'orders';

/**
 * Save or update a farmer profile in Firestore
 */
export async function saveFarmerProfileToDb(farmer: FarmerProfile, uid?: string): Promise<void> {
  try {
    const docRef = doc(db, FARMERS_COLLECTION, farmer.id);
    await setDoc(docRef, {
      ...farmer,
      authUid: uid || null,
      updatedAt: serverTimestamp()
    }, { merge: true });

    if (uid) {
      // Also link in users collection
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        role: 'farmer',
        farmerId: farmer.id,
        name: farmer.name,
        phone: farmer.phone,
        email: farmer.email || null,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  } catch (error) {
    console.warn('Could not persist farmer profile to Firestore:', error);
  }
}

/**
 * Save a new or edited crop lot to Firestore
 */
export async function saveCropToDb(crop: CropProduct): Promise<void> {
  try {
    const cropRef = doc(db, CROPS_COLLECTION, crop.id);
    await setDoc(cropRef, {
      ...crop,
      createdAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.warn('Could not persist crop listing to Firestore:', error);
  }
}

/**
 * Fetch all live crops from Firestore
 */
export async function fetchCropsFromDb(): Promise<CropProduct[]> {
  try {
    const cropsCol = collection(db, CROPS_COLLECTION);
    const snapshot = await getDocs(cropsCol);
    if (snapshot.empty) return [];
    
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as CropProduct[];
  } catch (error) {
    console.warn('Could not fetch crops from Firestore:', error);
    return [];
  }
}

/**
 * Save a buyer order to Firestore
 */
export async function saveOrderToDb(order: Order): Promise<void> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, order.id);
    await setDoc(orderRef, {
      ...order,
      timestamp: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.warn('Could not persist order to Firestore:', error);
  }
}

/**
 * Fetch all orders from Firestore
 */
export async function fetchOrdersFromDb(): Promise<Order[]> {
  try {
    const ordersCol = collection(db, ORDERS_COLLECTION);
    const snapshot = await getDocs(ordersCol);
    if (snapshot.empty) return [];
    
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as Order[];
  } catch (error) {
    console.warn('Could not fetch orders from Firestore:', error);
    return [];
  }
}

/**
 * Fetch all registered farmers from Firestore
 */
export async function fetchFarmersFromDb(): Promise<FarmerProfile[]> {
  try {
    const farmersCol = collection(db, FARMERS_COLLECTION);
    const snapshot = await getDocs(farmersCol);
    if (snapshot.empty) return [];
    
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as FarmerProfile[];
  } catch (error) {
    console.warn('Could not fetch farmers from Firestore:', error);
    return [];
  }
}

/**
 * Real-time listener for orders across all participants
 */
export function subscribeToOrders(
  callback: (orders: Order[]) => void
): Unsubscribe {
  try {
    const ordersCol = collection(db, ORDERS_COLLECTION);
    return onSnapshot(ordersCol, (snapshot) => {
      if (!snapshot.empty) {
        const orders = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        })) as Order[];
        callback(orders);
      }
    }, (error) => {
      console.warn('Real-time order listener notice:', error);
    });
  } catch (error) {
    console.warn('Could not establish real-time order listener:', error);
    return () => {};
  }
}

/**
 * Real-time listener for live crop marketplace listings
 */
export function subscribeToCrops(
  callback: (crops: CropProduct[]) => void
): Unsubscribe {
  try {
    const cropsCol = collection(db, CROPS_COLLECTION);
    return onSnapshot(cropsCol, (snapshot) => {
      if (!snapshot.empty) {
        const crops = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        })) as CropProduct[];
        callback(crops);
      }
    }, (error) => {
      console.warn('Real-time crop listener notice:', error);
    });
  } catch (error) {
    console.warn('Could not establish real-time crop listener:', error);
    return () => {};
  }
}

