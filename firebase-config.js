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

// Upload base64 image to Cloudinary and return public URL
async function dbUploadImage(base64Data) {
    try {
        if (!base64Data || !base64Data.startsWith('data:image')) return base64Data; // Already URL or null

        const cloudName = 'dwhfh6ak0';
        const uploadPreset = 'diary-fafa';
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

        const formData = new FormData();
        formData.append('file', base64Data);
        formData.append('upload_preset', uploadPreset);

        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (data.secure_url) {
            return data.secure_url;
        } else {
            console.warn('Cloudinary upload failed:', data);
            return null;
        }
    } catch (e) {
        console.warn('Cloudinary upload error:', e);
        return null;
    }
}

console.log('🔥 Firebase (Firestore) & ☁️ Cloudinary connected! — diary-fafa');
