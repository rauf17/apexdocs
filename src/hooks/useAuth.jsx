import { useState, useEffect, createContext, useContext } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUserProfile, createUserProfile, updateUserProfile } from '../lib/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          let userProf = await getUserProfile(firebaseUser.uid);
          if (!userProf) {
            userProf = {
              plan: 'free',
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || ''
            };
            await createUserProfile(firebaseUser.uid, userProf);
          }
          setProfile(userProf);
        } catch (err) {
          console.error("Failed to load user profile:", err);
          setProfile({ plan: 'free' });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (name, email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    return result;
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  };

  const logOut = async () => {
    return await firebaseSignOut(auth);
  };

  const updatePlan = async (newPlan) => {
    if (!user) return;
    try {
      await updateUserProfile(user.uid, { plan: newPlan });
      setProfile(prev => prev ? { ...prev, plan: newPlan } : { plan: newPlan });
    } catch (err) {
      console.error("Failed to update user plan:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signInWithGoogle, logOut, updatePlan }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;
