import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [status, setStatus] = useState("");

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function resolveEmail(identifier) {
    if (identifier.includes("@")) return identifier;
    const snapshot = await getDocs(query(collection(db, "users"), where("usernameLower", "==", identifier.trim().toLowerCase())));
    if (snapshot.empty) throw new Error("Username not found.");
    return snapshot.docs[0].data().email;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus(mode === "login" ? "Logging in..." : "Creating account...");

    try {
      if (mode === "login") {
        const email = await resolveEmail(form.username);
        await signInWithEmailAndPassword(auth, email, form.password);
      } else {
        const usernameLower = form.username.trim().toLowerCase();
        if (usernameLower.length < 3) throw new Error("This username is too short.");
        if (!/^[a-z0-9_.-]+$/.test(usernameLower)) throw new Error("Invalid username. Use A-z, 0-9, _, ., or -.");
        const existing = await getDocs(query(collection(db, "users"), where("usernameLower", "==", usernameLower)));
        if (!existing.empty) throw new Error("This username is already taken.");
        const credential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await setDoc(doc(db, "users", credential.user.uid), {
          email: form.email,
          username: form.username.trim(),
          usernameLower,
          createdAt: new Date().toISOString().slice(0, 10),
          roles: []
        });
      }
      navigate("/");
    } catch (error) {
      console.error(error);
      setStatus(error.message || "Authentication failed.");
    }
  }

  async function resetPassword() {
    if (!form.email) {
      setStatus("Enter your email first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, form.email);
      setStatus("Password reset email sent.");
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <section className="section-shell">
      <PageHeader eyebrow="account" title={mode === "login" ? "Login" : "Register"}>
        Use your username or email to access profile and staff tools.
      </PageHeader>
      <Card className="mx-auto max-w-md p-5">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required />
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="reset-email">Email for reset</Label>
              <Input id="reset-email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="Optional" />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="username">{mode === "login" ? "Username or email" : "Username"}</Label>
            <Input id="username" value={form.username} onChange={(event) => update("username", event.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={form.password} onChange={(event) => update("password", event.target.value)} required />
          </div>
          <Button type="submit">{mode === "login" ? "Login" : "Register"}</Button>
          <div className="flex flex-wrap gap-3 text-sm">
            <button type="button" className="font-medium text-[#0072f5] hover:underline" onClick={() => setMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? "Register instead" : "Login instead"}
            </button>
            {mode === "login" ? (
              <button type="button" className="font-medium text-[#0072f5] hover:underline" onClick={resetPassword}>
                Reset password
              </button>
            ) : null}
          </div>
          {status ? <p className="text-sm text-[#4d4d4d]">{status}</p> : null}
        </form>
      </Card>
    </section>
  );
}
