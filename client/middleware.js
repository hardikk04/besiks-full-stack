import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// ✅ helper to safely verify token
async function verifyJWT(token) {
  try {
    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // ✅ Protect admin routes
  // if (pathname.startsWith("/admin")) {
  //   if (!token) {
  //     // No token → redirect to login
  //     return NextResponse.redirect(new URL("/auth/admin/login", request.url));
  //   }

  //   const payload = await verifyJWT(token);

  //   if (!payload || payload.role !== "admin") {
  //     // Invalid token or not admin → redirect
  //     return NextResponse.redirect(new URL("/auth/admin/login", request.url));
  //   }
  // }

  // ✅ Prevent logged-in admins from going to login again
  if (pathname.startsWith("/auth/admin/login")) {
    if (token) {
      const payload = await verifyJWT(token);
      if (payload?.role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin/dashboard"], // applies to admin + login page
};
