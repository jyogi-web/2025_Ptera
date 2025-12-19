"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { user, loginWithGoogle, loginWithEmail, signupWithEmail, logout } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginView, setIsLoginView] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  // Helper to set server session
  const setServerSession = async () => {
    try {
      // We need the direct firebase user to get the ID token
      // Since useAuth user is a custom object without getIdToken()
      // We can rely on the fact that if login succeeded, auth.currentUser is set
      const { auth } = await import("@/lib/firebase");
      const idToken = await auth.currentUser?.getIdToken();

      if (!idToken) {
        throw new Error("Failed to retrieve ID token.");
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create server session.");
      }
    } catch (error) {
      console.error("Server session error:", error);
      throw error; // Re-throw to be caught by caller
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    let error: Error | null = null;

    if (isLoginView) {
      error = await loginWithEmail(email, password);
    } else {
      error = await signupWithEmail(email, password);
    }

    if (error) {
      console.error("Auth error:", error);
      alert("Authentication failed. Check console for details.");
      setLoading(false);
    } else {
      try {
        await setServerSession();
        router.push("/home");
      } catch {
        alert("Login successful but server session failed. Please try again.");
        setLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);

    const error = await loginWithGoogle();

    if (error) {
      console.error("Google login error:", error);
      alert("Google login failed.");
      setGoogleLoading(false);
    } else {
      try {
        await setServerSession();
        router.push("/home");
      } catch {
        alert(
          "Google login successful but server session failed. Please try again.",
        );
        setGoogleLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to logout from server.");
      }
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p>Logged in as: {user.email}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">
          {isLoginView ? "Login" : "Sign Up"}
        </h1>

        <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-500 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Processing..." : isLoginView ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">OR</span>
          <div className="h-px flex-1 bg-gray-300"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="flex w-full items-center justify-center gap-2 rounded border border-gray-300 bg-white py-2 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
        >
          {googleLoading ? "Processing..." : "Sign in with Google"}
        </button>

        <p className="mt-4 text-center text-sm">
          {isLoginView
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            type="button"
            onClick={() => setIsLoginView(!isLoginView)}
            className="text-blue-500 hover:underline"
          >
            {isLoginView ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
