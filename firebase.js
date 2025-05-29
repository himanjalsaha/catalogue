// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore ,  collection, getDocs, query, orderBy} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBv5FXrCOC1ryIrw7pK_M7xwkF7Mqw6lh4",
  authDomain: "studyskme.firebaseapp.com",
  projectId: "studyskme",
  storageBucket: "studyskme.appspot.com",
  messagingSenderId: "886749747761",
  appId: "1:886749747761:web:ee09eccfc14bfb6ffbd310",
  measurementId: "G-NQ04S0CJV2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app)
const storage  = getStorage(app)
const auth = getAuth(app)


export { app,  db, storage , auth };

export const fetchProducts = async () => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const products = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        ...data,
        // Convert Firestore timestamp to readable format if needed
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      });
    });
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Function to get unique categories from products
export const getCategories = (products) => {
  const categoryMap = new Map();
  
  // Add "All Products" category
  categoryMap.set('all', { id: 'all', name: 'All Products', count: products.length });
  
  // Count products by category
  products.forEach(product => {
    const category = product.category;
    if (category) {
      if (categoryMap.has(category)) {
        categoryMap.get(category).count++;
      } else {
        // Map category IDs to readable names
        const categoryNames = {
          'windows': 'Aluminium Windows',
          'doors': 'Doors & Frames',
          'railings': 'Railings & Balustrades',
          'curtain-walls': 'Curtain Walls',
          'roofing': 'Roofing Systems'
        };
        
        categoryMap.set(category, {
          id: category,
          name: categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1),
          count: 1
        });
      }
    }
  });
  
  return Array.from(categoryMap.values());
};