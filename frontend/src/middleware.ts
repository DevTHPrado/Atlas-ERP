import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Since we are using Zustand with localStorage, the token isn't accessible securely in the middleware
  // We can either use a cookie to store the token, or handle protection in a React layout/component.
  // Given Next.js 15, handling auth check client-side or moving token to cookies is standard.
  // For this foundation, we will check if the user is trying to access protected routes
  // and handle actual redirection cleanly in the AuthProvider on the client side,
  // OR we can read a specific cookie if we had one.
  // Since we rely on localStorage in this implementation, middleware will just pass through 
  // and the client-side AuthProvider will handle the protection to avoid hydration mismatches.
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
