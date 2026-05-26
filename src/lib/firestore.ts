import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if config is available
let app: FirebaseApp | null = null;
let db: Firestore | null = null;

// Check if Firebase is configured
const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'your_firebase_api_key_here'
  );
};

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // Try to initialize with offline persistence and better error handling
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } catch {
      // Fallback to regular initialization if persistence fails
      db = getFirestore(app);
    }
    console.log('Firebase initialized with config:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...'
    });
    
    // Test connection with a simple read
    if (typeof window !== 'undefined') {
      const testConnection = async () => {
        try {
          const testDoc = doc(db!, 'test', 'connection');
          await getDoc(testDoc);
          console.log('✅ Firebase connection successful');
        } catch (error: unknown) {
          if (error && typeof error === 'object' && 'code' in error && error.code === 'unavailable') {
            console.error('❌ Firebase connection failed - Check network/firewall');
            console.error('Possible causes:');
            console.error('1. Corporate firewall blocking *.firebaseio.com');
            console.error('2. Browser extensions (ad blockers, privacy tools)');
            console.error('3. Local network restrictions');
            console.error('4. Firebase project not properly activated');
          } else if (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') {
            console.log('⚠️ Firebase connected but needs security rules update');
          } else {
            console.error('Firebase error:', error);
          }
        }
      };
      testConnection();
    }
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
    app = null;
    db = null;
  }
} else {
  console.log('Firebase not configured - using localStorage only');
}

export interface SavedQuote {
  id: string;
  userEmail: string;
  quoteName: string;
  quoteData: {
    projectType: string;
    quoteText: string;
    analysisType: "free" | "pro" | "subscription" | "lifetime";
  };
  analysisResult: {
    plainEnglishBreakdown: string[];
    redFlags?: string[];
    costComparison?: string[];
    smartQuestions?: string[];
    healthScore?: {
      grade: string;
      color: string;
      description: string;
      percentage?: number;
    };
    majorConcern?: string;
    extractedInfo?: {
      totalPrice?: number;
      contractorName?: string;
      contractorCompany?: string;
      projectType?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export class FirestoreService {
  private static COLLECTION_NAME = 'savedQuotes';

  static async saveQuote(quote: Omit<SavedQuote, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const quoteId = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const quoteData: SavedQuote = {
      ...quote,
      id: quoteId,
      createdAt: now,
      updatedAt: now,
    };

    console.log(`💾 Saving quote "${quote.quoteName}" for user: ${quote.userEmail}`);

    // Try Firestore first if configured, fallback to localStorage
    if (db) {
      try {
        await setDoc(doc(db, this.COLLECTION_NAME, quoteId), quoteData);
        console.log(`✅ Quote "${quote.quoteName}" saved to Firestore: ${quoteId}`);
        return quoteId;
      } catch (error) {
        console.warn('Firestore save failed, falling back to localStorage:', error);
      }
    } else {
      console.log('📱 Firebase not initialized, saving to localStorage only');
    }
    
    // Fallback to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
      const updated = [quoteData, ...existing];
      localStorage.setItem('savedQuotes', JSON.stringify(updated));
      console.log('Quote saved to localStorage');
      return quoteId;
    } catch (error) {
      console.error('Error saving quote to localStorage:', error);
      throw new Error('Failed to save quote');
    }
  }

  static async getQuotesByUser(userEmail: string): Promise<SavedQuote[]> {
    console.log(`🔍 Loading quotes for user: ${userEmail}`);
    
    // Try Firestore first if configured and available
    if (db) {
      try {
        const q = query(
          collection(db, this.COLLECTION_NAME),
          where('userEmail', '==', userEmail)
        );
        
        const querySnapshot = await getDocs(q);
        const quotes: SavedQuote[] = [];
        
        querySnapshot.forEach((doc) => {
          quotes.push(doc.data() as SavedQuote);
        });
        
        // Sort by creation date (newest first)
        const sortedQuotes = quotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        console.log(`✅ Loaded ${sortedQuotes.length} quotes from Firestore for ${userEmail}`);
        return sortedQuotes;
      } catch (error) {
        console.warn('Firestore load failed, falling back to localStorage:', error);
      }
    } else {
      console.log('📱 Firebase not initialized, using localStorage only');
    }
    
    // Fallback to localStorage
    try {
      const saved = localStorage.getItem('savedQuotes') || '[]';
      const quotes: SavedQuote[] = JSON.parse(saved);
      
      // Filter by user email for consistency (though localStorage is usually user-specific)
      const userQuotes = quotes.filter(q => q.userEmail === userEmail || q.userEmail === 'anonymous');
      
      // Sort by creation date (newest first)
      const sortedQuotes = userQuotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      console.log('Quotes loaded from localStorage');
      return sortedQuotes;
    } catch (error) {
      console.error('Error loading quotes from localStorage:', error);
      return [];
    }
  }

  static async getQuote(quoteId: string): Promise<SavedQuote | null> {
    try {
      if (!db) {
        console.warn('Firestore not initialized');
        return null;
      }
      const docRef = doc(db, this.COLLECTION_NAME, quoteId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as SavedQuote;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting quote from Firestore:', error);
      throw new Error('Failed to get quote');
    }
  }

  static async deleteQuote(quoteId: string): Promise<void> {
    // Try Firestore first if configured
    if (db) {
      try {
        await deleteDoc(doc(db, this.COLLECTION_NAME, quoteId));
        console.log('Quote deleted from Firestore');
      } catch (error) {
        console.warn('Firestore delete failed, falling back to localStorage:', error);
      }
    }
    
    // Also delete from localStorage (works as fallback or in addition to Firestore)
    try {
      const existing = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
      const updated = existing.filter((q: SavedQuote) => q.id !== quoteId);
      localStorage.setItem('savedQuotes', JSON.stringify(updated));
      console.log('Quote deleted from localStorage');
    } catch (error) {
      console.error('Error deleting quote from localStorage:', error);
      throw new Error('Failed to delete quote');
    }
  }

  static async updateQuote(quoteId: string, updates: Partial<SavedQuote>): Promise<void> {
    try {
      if (!db) {
        console.warn('Firestore not initialized');
        return;
      }
      
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, this.COLLECTION_NAME, quoteId), updateData, { merge: true });
    } catch (error) {
      console.error('Error updating quote in Firestore:', error);
      throw new Error('Failed to update quote');
    }
  }

  // Migration helper: Move localStorage quotes to Firestore (only if Firestore is configured)
  static async migrateLocalStorageQuotes(userEmail: string): Promise<void> {
    // Only migrate if Firestore is configured and available
    if (!db) {
      console.log('Firestore not configured - skipping migration');
      return;
    }

    try {
      const saved = localStorage.getItem('savedQuotes') || '[]';
      const localQuotes = JSON.parse(saved);
      
      if (localQuotes.length > 0) {
        console.log(`Migrating ${localQuotes.length} quotes from localStorage to Firestore...`);
        
        for (const quote of localQuotes) {
          // Update userEmail for anonymous quotes
          const migratedQuote = {
            ...quote,
            userEmail: quote.userEmail === 'anonymous' ? userEmail : quote.userEmail,
          };
          
          // Save to Firestore with existing ID
          await setDoc(doc(db, this.COLLECTION_NAME, quote.id), migratedQuote);
        }
        
        // Clear localStorage after successful migration
        localStorage.removeItem('savedQuotes');
        console.log('Migration completed successfully!');
      }
    } catch (error) {
      console.error('Error migrating quotes from localStorage:', error);
      // Don't throw error - migration failure shouldn't break the app
    }
  }
} 