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
  try {
    const q = query(
      collection(db, "documents"),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching documents:", error);
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
