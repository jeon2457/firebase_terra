import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = request.nextUrl;

    // 1. 이미 로그인된 사용자가 로그인 페이지(/login)에 접근할 경우 대시보드로 즉시 리다이렉트
    if (pathname === "/login") {
        if (token) {
            const userLevel = (token as any).user_level || 1;
            if (userLevel >= 10) {
                return NextResponse.redirect(new URL("/dashboard", request.url));
            } else {
                return NextResponse.redirect(new URL("/guest", request.url));
            }
        }
        return NextResponse.next();
    }

    // 2. 공개 허용 경로 (/guest/members/view, /account/view, /receipt/view)
    const publicPaths = ["/guest/members/view", "/account/view", "/receipt/view"];
    const isPublicPage = publicPaths.includes(pathname);

    // 3. 보호된 경로(/dashboard, /members, /account, /receipt, /theme 등) 접근 제어
    const protectedPaths = ["/dashboard", "/members", "/account", "/receipt", "/theme", "/api/members", "/api/theme", "/api/financial"];
    const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

    if (isProtected && !isPublicPage && !token) {
        // 인증되지 않은 경우 로그인 페이지로 리다이렉트 (이후 돌아올 경로 파라미터 포함 가능)
        const loginUrl = new URL("/login", request.url);
        // loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

// 미들웨어를 적용할 경로 설정
export const config = {
    matcher: [
        "/login",
        "/dashboard/:path*",
        "/members/:path*",
        "/account/:path*",
        "/receipt/:path*",
        "/theme/:path*",
        "/api/members/:path*",
        "/api/theme/:path*",
        "/api/financial/:path*",
    ],
};
