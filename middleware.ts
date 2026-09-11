import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "tec_admin_session";

/**
 * A cheap gate only — it checks that a session cookie exists. Whether the token
 * is actually valid, and what role it carries, is decided by the API on every
 * request (see lib/session.ts).
 */
export function middleware(req: NextRequest) {
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);
  const { pathname, search } = req.nextUrl;
  const isLogin = pathname === "/login";

  if (!hasSession && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search =
      pathname === "/" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (hasSession && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // /quiz is the member quiz. It is public and must never be sent to /login —
  // it is opened by members inside Circle, who have no admin session.
  matcher: ["/((?!quiz|api|_next/static|_next/image|favicon.ico).*)"],
};
