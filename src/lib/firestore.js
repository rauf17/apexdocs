import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./firebase";

// createDocument(userId, templateContent, templateName) -> adds doc to "documents" collection, returns docId
export const createDocument = async (userId, templateContent, templateName) => {
  try {
    const docRef = await addDoc(collection(db, "documents"), {
      userId,
      content: templateContent,
      name: templateName,
      isStarred: false,
      shareSlug: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
};

// getDocuments(userId) -> fetches all docs where userId matches, ordered by updatedAt desc
export const getDocuments = async (userId) => {
  console.log("[DEBUG] getDocuments called with userId:", userId);
  try {
    const q = query(
      collection(db, "documents"),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    console.log("[DEBUG] getDocuments querySnapshot size:", querySnapshot.size);
    const docs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // Sort on client side to avoid requiring a composite index in Firestore
    docs.sort((a, b) => {
      const timeA = a.updatedAt?.toDate()?.getTime() || 0;
      const timeB = b.updatedAt?.toDate()?.getTime() || 0;
      return timeB - timeA;
    });

    console.log("[DEBUG] getDocuments mapped docs:", docs);
    return docs;
  } catch (error) {
    console.error("[DEBUG] Error fetching documents:", error);
    throw error;
  }
};

// getDocument(docId) -> fetches single document by ID
export const getDocument = async (docId) => {
  try {
    const docRef = doc(db, "documents", docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching document:", error);
    throw error;
  }
};

// updateDocument(docId, data) -> updates document fields + sets updatedAt to now
export const updateDocument = async (docId, data) => {
  try {
    const docRef = doc(db, "documents", docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

// deleteDocument(docId) -> deletes document
export const deleteDocument = async (docId) => {
  try {
    await deleteDoc(doc(db, "documents", docId));
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};

// toggleStar(docId, currentValue) -> toggles isStarred boolean
export const toggleStar = async (docId, currentValue) => {
  try {
    const docRef = doc(db, "documents", docId);
    await updateDoc(docRef, {
      isStarred: !currentValue,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error toggling star:", error);
    throw error;
  }
};

// createShareSlug(docId) -> generates UUID, saves as shareSlug field, returns slug
export const createShareSlug = async (docId) => {
  try {
    const slug = crypto.randomUUID();
    const docRef = doc(db, "documents", docId);
    await updateDoc(docRef, {
      shareSlug: slug,
      updatedAt: serverTimestamp()
    });
    return slug;
  } catch (error) {
    console.error("Error creating share slug:", error);
    throw error;
  }
};

// getDocumentBySlug(slug) -> fetches document where shareSlug == slug (public)
export const getDocumentBySlug = async (slug) => {
  try {
    const q = query(collection(db, "documents"), where("shareSlug", "==", slug));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching document by slug:", error);
    throw error;
  }
};
