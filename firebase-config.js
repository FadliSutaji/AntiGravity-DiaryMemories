/* ========================================
   FIREBASE CONFIG — diary-fafa
   Firestore for cross-device sync
   ======================================== */

// Firebase SDK is loaded via CDN in HTML (compat version)
// This file initializes Firebase and provides helper functions

firebase.initializeApp({
    apiKey: "AIzaSyBwmEYCCfMVf9n04wb1Xfnak2vj0_B6j5M",
    authDomain: "diary-fafa.firebaseapp.com",
    projectId: "diary-fafa",
    storageBucket: "diary-fafa.firebasestorage.app",
    messagingSenderId: "504690563834",
    appId: "1:504690563834:web:b24a19cb9464d4862d8743",
    measurementId: "G-Q3341E5XZ8"
});

const db = firebase.firestore();
const storage = firebase.storage();

/* ========================================
   FIRESTORE HELPERS
   ======================================== */

// Save data to Firestore (merge by default)
async function dbSave(collection, docId, data) {
    try {
        await db.collection(collection).doc(docId).set(data, { merge: true });
    } catch (e) {
        console.warn('Firestore save failed:', e);
    }
}

// Load a single document from Firestore
async function dbLoad(collection, docId) {
    try {
        const doc = await db.collection(collection).doc(docId).get();
        return doc.exists ? doc.data() : null;
    } catch (e) {
        console.warn('Firestore load failed:', e);
        return null;
    }
}

// Delete a document from Firestore
async function dbDelete(collection, docId) {
    try {
        await db.collection(collection).doc(docId).delete();
    } catch (e) {
        console.warn('Firestore delete failed:', e);
    }
}

// Load all documents from a collection (ordered by timestamp desc)
async function dbLoadAll(collection, orderField = 'timestamp', dir = 'desc') {
    try {
        const snapshot = await db.collection(collection).orderBy(orderField, dir).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.warn('Firestore loadAll failed:', e);
        return [];
    }
}

// Real-time listener for a collection
function dbListen(collection, callback, orderField = 'timestamp', dir = 'desc') {
    return db.collection(collection).orderBy(orderField, dir).onSnapshot(
        snapshot => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(data);
        },
        err => console.warn('Firestore listen error:', err)
    );
}

// Real-time listener for a single document
function dbListenDoc(collection, docId, callback) {
    return db.collection(collection).doc(docId).onSnapshot(
        doc => callback(doc.exists ? doc.data() : null),
        err => console.warn('Firestore listenDoc error:', err)
    );
}

// Upload base64 image to Firebase Storage and return public URL
async function dbUploadImage(base64Data, folder = 'photos') {
    try {
        if (!base64Data || !base64Data.startsWith('data:image')) return base64Data; // Already a URL or null

        const filename = `${folder}/${Date.now()}-${Math.floor(Math.random() * 10000)}.jpg`;
        const storageRef = storage.ref().child(filename);
        
        // Upload string
        const snapshot = await storageRef.putString(base64Data, 'data_url');
        // Get public URL
        const downloadURL = await snapshot.ref.getDownloadURL();
        return downloadURL;
    } catch (e) {
        console.warn('Firebase Storage upload failed:', e);
        return null;
    }
}

console.log('🔥 Firebase (Firestore + Storage) connected — diary-fafa');
