import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    if (path.startsWith("/admin") && token?.role !== "ADMIN" && token?.role !== "SUPER_ADMIN")
      return NextResponse.redirect(new URL("/", req.url));
    if (path.startsWith("/super-admin") && token?.role !== "SUPER_ADMIN")
      return NextResponse.redirect(new URL("/", req.url));
    if (path.startsWith("/team") && token?.role !== "TEAM_MEMBER" && token?.role !== "ADMIN" && token?.role !== "SUPER_ADMIN")
      return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  },
  { callbacks: { authorized: ({ token }) => !!token } }
);

export const config = {
  matcher: ["/manager/:path*", "/admin/:path*", "/team/:path*", "/super-admin/:path*"],
};
