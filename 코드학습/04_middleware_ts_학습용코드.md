# 🚨 미들웨어 - middleware.ts 완전 학습 가이드

## 🎯 이 파일이 하는 역할

`middleware.ts`는 **Next.js의 "경찰"**입니다. 모든 요청이 들어올 때 가장 먼저 검사하여:
- ✅ 로그인 사용자인지 확인
- ✅ 접근하면 안 되는 페이지인지 차단
- ✅ 필요하면 다른 페이지로 리다이렉트

마치 건물 입구의 보안 요원처럼, **모든 요청을 한 곳에서 관리**합니다!

> 💡 **초보자 용어**:
> - **Middleware** = "중간에서 처리하는 것" (모든 요청 전에 실행)
> - **Token** = 사용자가 로그인했다는 증명서
> - **Route** = URL 경로 (예: `/dashboard`, `/login`)

---

## 📖 코드 상세 분석

```typescript
// 1️⃣ 필요한 함수와 타입 임포트
// NextResponse: Next.js에서 HTTP 응답을 만드는 도구
// getToken: NextAuth JWT 토큰을 확인하는 함수
// NextRequest: Next.js 요청 객체의 타입
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// 2️⃣ 미들웨어 함수 정의
// 모든 요청이 시작될 때 가장 먼저 이 함수가 실행됩니다!
export async function middleware(request: NextRequest) {
    // 3️⃣ 사용자의 토큰(로그인 정보) 가져오기
    // getToken은 NextAuth가 저장한 JWT 토큰을 읽습니다.
    // token이 있으면 = 로그인된 사용자
    // token이 없으면 = 로그인 안 된 사용자
    const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET  // 암호화 비밀키
    });
    
    // 4️⃣ 요청 URL에서 경로(pathname) 추출
    // 예: https://example.com/dashboard → pathname = "/dashboard"
    const { pathname } = request.nextUrl;

    /* 🔴 [규칙 1] 로그인 페이지(/login) 접근 제어 */
    // 이미 로그인한 사용자가 로그인 페이지에 가려고 하면 대시보드로 보냄
    // 왜? 로그인한 사람이 로그인 페이지를 볼 필요가 없으니까!
    if (pathname === "/login") {
        if (token) {  // 로그인된 상태라면
            // user_level 가져오기 (10 이상 = 관리자, 미만 = 일반 사용자)
            const userLevel = (token as any).user_level || 1;
            
            if (userLevel >= 10) {
                // 관리자는 대시보드로
                return NextResponse.redirect(new URL("/dashboard", request.url));
            } else {
                // 일반 사용자는 게스트 페이지로
                return NextResponse.redirect(new URL("/guest", request.url));
            }
        }
        // 로그인 안 된 상태 → 로그인 페이지 그대로 보여주기
        return NextResponse.next();
    }

    /* 🔴 [규칙 2] 공개 허용 경로 정의 */
    // 이 경로들은 로그인하지 않아도 접근 가능
    const publicPaths = [
        "/guest/members/view",  // 게스트가 회원 조회 가능
        "/account/view",        // 누구나 계정 보기 가능
        "/receipt/view"         // 누구나 영수증 보기 가능
    ];
    
    // pathname이 publicPaths에 포함되어 있는지 확인
    const isPublicPage = publicPaths.includes(pathname);

    /* 🔴 [규칙 3] 보호된 경로(로그인 필須) 정의 */
    // 이 경로들은 로그인한 사용자만 접근 가능
    const protectedPaths = [
        "/dashboard",     // 대시보드
        "/members",       // 회원 관리
        "/account",       // 계정
        "/receipt",       // 영수증
        "/theme",         // 테마 설정
        "/api/members",   // API
        "/api/theme",     // API
        "/api/financial"  // API
    ];
    
    // pathname이 protectedPaths 중 하나로 시작하는지 확인
    // 예: /dashboard/tech → startsWith("/dashboard") = true
    const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

    /* 🔴 [규칙 4] 보호된 경로 접근 제어 */
    // 보호된 경로 + 공개 경로 아님 + 로그인 안 된 상태
    if (isProtected && !isPublicPage && !token) {
        // 로그인 페이지로 리다이렉트
        const loginUrl = new URL("/login", request.url);
        // 향후 기능: 로그인 후 원래 페이지로 돌아오기 (callbackUrl)
        // loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    /* 🟢 모든 검사 통과 */
    // 위의 어떤 조건도 만족하지 않으면 그대로 진행
    return NextResponse.next();
}

// 5️⃣ 미들웨어가 실행될 경로 설정
// 모든 경로에서 미들웨어를 실행할 수는 없으므로(성능 때문에),
// 중요한 경로들만 선택하여 미들웨어를 적용합니다.
export const config = {
    matcher: [
        "/login",              // 로그인 페이지
        "/dashboard/:path*",   // /dashboard로 시작하는 모든 경로
        "/members/:path*",     // /members로 시작하는 모든 경로
        "/account/:path*",     // /account로 시작하는 모든 경로
        "/receipt/:path*",     // /receipt로 시작하는 모든 경로
        "/theme/:path*",       // /theme로 시작하는 모든 경로
        "/api/members/:path*", // API 경로들
        "/api/theme/:path*",
        "/api/financial/:path*",
    ],
};
```

---

## 🧠 핵심 개념 정리

### 📌 1. 미들웨어(Middleware)란?

**비유**: 택배 분류 센터와 비슷합니다!

```
택배 들어옴
  ↓
크기 확인 → 목적지 확인 → 유효성 확인
  ↓
문제있음? → 반송, 문제없음? → 배송 진행
```

**웹에서의 미들웨어**:

```
HTTP 요청 들어옴
  ↓
middleware.ts 실행 (누가 왔는지, 어디 가는지 확인)
  ↓
문제있음? → 리다이렉트, 문제없음? → 페이지 렌더링
```

### 📌 2. NextAuth와 JWT 토큰

**JWT Token이란?**

```
토큰 = [Header].[Payload].[Signature]

Header: 토큰 종류 (JWT)
Payload: 사용자 정보 (아이디, 이름, user_level 등)
Signature: 위변조 방지 서명

예:
{
  "sub": "user123",
  "name": "홍길동",
  "user_level": 1,
  "iat": 1234567890
}
```

**getToken() 함수**:

```typescript
const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET
});

// token이 있으면
if (token) {
    // 로그인된 사용자!
    console.log(token.user_level);  // 사용자의 권한 확인
}
```

### 📌 3. 경로 매칭 (Matcher)

```typescript
matcher: [
    "/login",              // 정확히 /login만
    "/dashboard/:path*",   // /dashboard 아래 모든 경로
                          // 예: /dashboard, /dashboard/tech, /dashboard/icon 등
]
```

**`:path*`의 의미**:
- `:` = 변수
- `path` = 경로
- `*` = 0개 이상 반복
- `/dashboard/:path*` = `/dashboard` + 뒤에 뭐든 올 수 있음

### 📌 4. 리다이렉트의 종류

```typescript
// 방식 1: 간단한 리다이렉트
return NextResponse.redirect(new URL("/login", request.url));

// 방식 2: 쿼리 파라미터 추가
const loginUrl = new URL("/login", request.url);
loginUrl.searchParams.set("callbackUrl", pathname);
return NextResponse.redirect(loginUrl);
// 결과: /login?callbackUrl=/dashboard

// 방식 3: 그대로 진행
return NextResponse.next();
```

---

## 🔄 실행 흐름도

```
사용자가 /dashboard 접속
  ↓
미들웨어 실행 (middleware.ts)
  ↓
[규칙 1] /login인가? → NO
  ↓
[규칙 4] /dashboard는 보호 경로? → YES
       토큰이 있는가? → NO
  ↓
❌ 리다이렉트: /login으로 보냄
  ↓
브라우저: /login으로 이동
  ↓
미들웨어 실행 (다시!)
  ↓
[규칙 1] /login인가? → YES
       ? 토큰이 있는가? → NO
  ↓
✅ 통과: LoginPage 표시
```

---

## 💡 초보자가 꼭 알아야 할 점

### Q1: "matcher"를 모든 경로에 적용하면 안 되나요?

**답변**: ❌ **안 됩니다!**

```typescript
// ❌ 나쁜 예: 모든 경로
matcher: ["/:path*"]  // 심각한 성능 저하!

// ✅ 좋은 예: 필요한 경로만
matcher: [
    "/login",
    "/dashboard/:path*",
    "/api/:path*"
]
```

**이유**: 미들웨어는 **매우 빠르게 실행**되어야 합니다. 불필요한 경로까지 검사하면 성능이 떨어집니다.

### Q2: Token이 없으면 항상 로그인 페이지로 보내나요?

**답변**: ❌ **공개 경로는 예외입니다!**

```typescript
const publicPaths = [
    "/guest/members/view",  // 이 경로는 로그인 없이 접근 가능
    "/account/view",
    "/receipt/view"
];

const isPublicPage = publicPaths.includes(pathname);

// 보호 + 공개 아님 + 토큰 없음 → 로그인 리다이렉트
if (isProtected && !isPublicPage && !token) {
    // 리다이렉트
}

// 하지만 공개 경로면 login으로 안 보냄!
```

### Q3: user_level은 뭘 하는 건가요?

**답변**: **권한 구분**입니다!

```typescript
const userLevel = (token as any).user_level || 1;

if (userLevel >= 10) {
    // 관리자 (level 10 이상)
    // → /dashboard로 보냄 (관리 기능 제공)
} else {
    // 일반 사용자 (level 1-9)
    // → /guest로 보냄 (제한된 기능 제공)
}
```

| level | 권한 | 페이지 |
|-------|------|--------|
| 1-9 | 일반 사용자 | /guest, /account 등 |
| 10 이상 | 관리자 | /dashboard, /members 등 |

---

## 🎨 시각화: 요청 흐름

```
┌─────────────────────────────────┐
│ 사용자 요청                       │
│ (어떤 URL로든)                   │
└───────────┬─────────────────────┘
            ↓
┌─────────────────────────────────┐
│ 미들웨어 실행 (middleware.ts)    │
│                                 │
│ 1. 경로가 /login?              │
│ 2. 경로가 공개 경로?            │
│ 3. 경로가 보호 경로?            │
│ 4. 토큰이 있는가?              │
│                                 │
│ 규칙에 따라 처리...             │
└───────────┬─────────────────────┘
            ↓
    ┌───────┴───────┐
    ↓               ↓
 리다이렉트      계속 진행
    ↓               ↓
/login으로   페이지 렌더링
    ↓               ↓
┌─────────────────────────────────┐
│ 브라우저에 표시                   │
└─────────────────────────────────┘
```

---

## 🚀 실습: 미들웨어 수정해보기

### 연습 1: 새로운 보호 경로 추가

```typescript
// 현재
const protectedPaths = [
    "/dashboard",
    "/members",
    "/account",
    "/receipt",
    "/theme",
    "/api/members",
    "/api/theme",
    "/api/financial"
];

// 변경: 새 경로 추가
const protectedPaths = [
    "/dashboard",
    "/members",
    "/account",
    "/receipt",
    "/theme",
    "/vote",              // ← 새로 추가 (투표 기능)
    "/api/members",
    "/api/theme",
    "/api/financial"
];
```

### 연습 2: 공개 경로 추가

```typescript
// 현재
const publicPaths = [
    "/guest/members/view",
    "/account/view",
    "/receipt/view"
];

// 변경: 새 경로 추가
const publicPaths = [
    "/guest/members/view",
    "/account/view",
    "/receipt/view",
    "/guest/fee/status"    // ← 새로 추가 (게스트도 회비 조회 가능)
];
```

### 연습 3: 관리자만 접근 가능하게

```typescript
// 추가: 관리자 전용 경로
const adminOnlyPaths = ["/admin"];

const isAdminOnly = adminOnlyPaths.some((path) => pathname.startsWith(path));

// 확인
if (isAdminOnly && token) {
    const userLevel = (token as any).user_level || 1;
    if (userLevel < 10) {
        // 관리자가 아니면 리다이렉트
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }
}
```

---

## 🧩 다른 파일과의 연계

### layout.tsx와의 관계

```
사용자 요청
  ↓
middleware.ts ← 먼저 실행!
  (접근 권한 검사)
  ↓
layout.tsx
  (HTML 구조)
  ↓
각 페이지 (page.tsx)
```

### Providers.tsx와의 관계

```
middleware.ts (서버에서 실행)
  ↓
token 확인, 리다이렉트 결정
  ↓
layout.tsx
  ↓
Providers.tsx (클라이언트)
  ↓
SessionProvider
  ↓
useSession() 사용 가능
```

**순서**:
1. **middleware.ts**: 접근 권한 검사 (서버)
2. **Providers.tsx**: 세션 정보 전달 (클라이언트)
3. **각 페이지**: useSession()으로 정보 사용

---

## ✅ 최종 정리

| 항목 | 설명 |
|------|------|
| **파일명** | `src/middleware.ts` |
| **실행 시점** | 모든 요청이 들어올 때 가장 먼저 |
| **주요 역할** | 로그인 검사, 경로별 접근 제어 |
| **사용 라이브러리** | NextAuth (getToken), Next.js (NextResponse) |
| **공개 경로** | 로그인 안 해도 접근 가능 (3개) |
| **보호 경로** | 로그인 필수 (대시보드, 회원 등) |
| **권한 구분** | user_level (10 이상 = 관리자) |

---

## 🎓 배운 것 정리

1. ✅ **미들웨어** (모든 요청을 먼저 검사)
2. ✅ **JWT 토큰** (로그인 증명서)
3. ✅ **경로 매칭** (필요한 경로만 설정)
4. ✅ **리다이렉트** (사용자를 다른 페이지로 보냄)
5. ✅ **권한 관리** (user_level로 역할 구분)
6. ✅ **공개/보호 경로** (접근 제어)

**핵심**: 미들웨어는 **보안의 첫 번째 방어선**입니다! 🔒
