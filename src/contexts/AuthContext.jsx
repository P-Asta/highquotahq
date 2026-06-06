import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    loading: true,
    user: null,
    profile: null
  });

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ loading: false, user: null, profile: null });
        return;
      }

      try {
        const snapshot = await getDoc(doc(db, "users", user.uid));
        setState({
          loading: false,
          user,
          profile: snapshot.exists() ? snapshot.data() : null
        });
      } catch (error) {
        console.error("Failed to load auth profile", error);
        setState({ loading: false, user, profile: null });
      }
    });
  }, []);

  const value = useMemo(() => {
    const roles = state.profile?.roles || [];
    return {
      ...state,
      roles,
      isStaff: roles.some((role) => ["admin", "verifier", "modded-verifier", "site-developer"].includes(role)),
      username: state.profile?.username || state.user?.email || ""
    };
  }, [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
