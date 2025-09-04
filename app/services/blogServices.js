import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    orderBy,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '@/firebase/firebase.config';

const COLLECTION_NAME = 'blogs';

export const blogService = {
    // Create a new blog post
    async createBlog(blogData) {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...blogData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating blog:', error);
            throw error;
        }
    },

    // Get all blog posts
    async getAllBlogs() {
        try {
            const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate()
            }));
        } catch (error) {
            console.error('Error getting blogs:', error);
            throw error;
        }
    },

    // Get blog by ID
    async getBlogById(id) {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data(),
                    createdAt: docSnap.data().createdAt?.toDate(),
                    updatedAt: docSnap.data().updatedAt?.toDate()
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error getting blog:', error);
            throw error;
        }
    },

    // Get blogs by category
    async getBlogsByCategory(category) {
        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                where('category', '==', category),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate()
            }));
        } catch (error) {
            console.error('Error getting blogs by category:', error);
            throw error;
        }
    },

    // Update blog post
    async updateBlog(id, blogData) {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, {
                ...blogData,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating blog:', error);
            throw error;
        }
    },

    // Delete blog post
    async deleteBlog(id) {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
        } catch (error) {
            console.error('Error deleting blog:', error);
            throw error;
        }
    }
};