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
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLoginView) {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password);
      }
      router.push("/");
    } catch (error) {
      console.error("Auth error:", error);
      alert("Authentication failed. Check console for details.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      router.push("/");
    } catch (error) {
      console.error("Google login error:", error);
      alert("Google login failed.");
    }
  };

  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p>Logged in as: {user.email}</p>
        <button
          type="button"
          onClick={() => logout()}
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
            className="rounded bg-blue-500 py-2 text-white hover:bg-blue-600"
          >
            {isLoginView ? "Login" : "Sign Up"}
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
          className="flex w-full items-center justify-center gap-2 rounded border border-gray-300 bg-white py-2 text-gray-700 hover:bg-gray-50"
        >
          Sign in with Google
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
