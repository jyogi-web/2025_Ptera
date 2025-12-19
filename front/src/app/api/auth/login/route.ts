import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 },
      );
    }

    // Set session expiration to 5 days
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    // Create the session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const cookieStore = await cookies();

    // Set cookie with secure options
    cookieStore.set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
