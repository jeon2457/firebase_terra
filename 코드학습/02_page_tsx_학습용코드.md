# 🏠 홈페이지 - page.tsx 완전 학습 가이드

## 🎯 이 파일이 하는 역할

`page.tsx`는 프로젝트의 **홈페이지(루트 경로 `/`)**를 담당합니다. 사용자가 `https://vercel-terraone.vercel.app/`에 접속했을 때 가장 먼저 보이는 페이지입니다.

> 💡 **중요**: 이 홈페이지는 로그인되지 않은 사용자도 접근할 수 있지만, **즉시 로그인 페이지로 리다이렉트**됩니다!

---

## 📖 코드 상세 분석

```tsx
// 1️⃣ 서버 컴포넌트에서만 사용할 수 있는 함수 임포트
// redirect() 함수는 사용자를 다른 URL로 이동시킵니다.
// 이 함수는 서버 사이드에서만 작동하므로 "use client" 없음!
import { redirect } from "next/navigation";

// 2️⃣ Home 컴포넌트 (기본 내보내기)
// 일반적으로 페이지는 JSX를 반환하여 화면을 그리지만,
// 이 페이지는 특별합니다 - 아무것도 그리지 않고 바로 리다이렉트합니다!
export default function Home() {
  // 3️⃣ redirect() 함수 호출
  // 사용자를 "/login"으로 즉시 리다이렉트합니다.
  // 이것은 HTTP 리다이렉트이므로 매우 빠르고 효율적입니다.
  redirect("/login");
}
```

---

## 🧠 핵심 개념 정리

### 📌 1. redirect() 함수란?

```tsx
redirect("/login");
```

**역할**: 사용자를 다른 페이지로 즉시 보냅니다.

| 특징 | 설명 |
|------|------|
| **서버 사이드** | 클라이언트 자바스크립트가 아닌 서버에서 실행됨 |
| **효율성** | React 렌더링 없이 HTTP 리다이렉트로 처리 |
| **속도** | 매우 빠르고 가벼움 |
| **SEO 친화적** | 검색 엔진도 올바르게 처리함 |

### 📌 2. Router.push() vs redirect()

```tsx
// ❌ 클라이언트 사이드 (JavaScript 필요)
const router = useRouter();
router.push("/login");

// ✅ 서버 사이드 (JavaScript 불필요)
redirect("/login");
```

**차이점**:

| 항목 | router.push() | redirect() |
|------|---------------|-----------|
| **실행 위치** | 클라이언트 (브라우저) | 서버 (Vercel) |
| **"use client" 필요** | ✅ 필요 | ❌ 불필요 |
| **useRouter 필요** | ✅ 필요 | ❌ 불필요 |
| **속도** | 느림 (JS 로드 필요) | 빠름 (HTTP 리다이렉트) |
| **언제 쓰나** | 클릭 이벤트 후 이동 | 페이지 로드 시점 이동 |

### 📌 3. 왜 홈페이지에서 로그인 페이지로 리다이렉트할까?

**이유 1: 사용자 경험 개선**
- 로그인하지 않은 사용자는 홈페이지에 할 게 없음
- 바로 로그인하도록 유도

**이유 2: 보안**
- 인증되지 않은 사용자가 접근하면 안 되는 정보 보호
- 로그인 과정을 통해 사용자 검증

**이유 3: 앱 구조 단순화**
- 각 페이지에서 "인증 확인" 로직을 반복하지 않아도 됨
- 미들웨어(`middleware.ts`)가 전체적으로 관리

---

## 🔄 요청 흐름도

```
사용자가 홈페이지 접속 (/)
  ↓
Next.js 서버에서 page.tsx 실행
  ↓
redirect("/login") 함수 호출
  ↓
HTTP 302/307 리다이렉트 응답 (매우 빠름)
  ↓
브라우저가 자동으로 /login으로 이동
  ↓
LoginPage 렌더링 및 표시
```

---

## 💡 초보자가 꼭 알아야 할 점

### Q1: 아무것도 화면에 표시되지 않는데 정상인가요?

**답변**: ✅ 정상입니다!

이 파일은:
```tsx
return <h1>홈페이지</h1>;  // ❌ 이런 게 없음
```

대신:
```tsx
redirect("/login");  // ✅ 이것만 할 뿐
```

사용자는 이 페이지를 보지 않습니다. 즉시 로그인 페이지로 보내지기 때문입니다.

### Q2: "use client"가 없는 이유는?

**답변**: `redirect()`는 **서버 함수**이기 때문입니다.

```tsx
// ❌ 이렇게 하면 에러 발생!
"use client";
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");  // ← 클라이언트 컴포넌트에서 사용 불가!
}

// ✅ 이렇게 해야 함
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");  // ← 서버 컴포넌트에서 사용 가능
}
```

**규칙**:
- `redirect()` = 서버 함수 → "use client" 없음
- `useRouter()` = 클라이언트 훅 → "use client" 필요

### Q3: 다른 페이지로 바꿀 수 있나요?

**답변**: ✅ 당연하죠!

```tsx
// 예: 대시보드로 리다이렉트
export default function Home() {
  redirect("/dashboard");
}

// 예: 외부 웹사이트로 리다이렉트
export default function Home() {
  redirect("https://www.google.com");
}

// 예: 게스트 페이지로 리다이렉트
export default function Home() {
  redirect("/guest");
}
```

---

## 🎨 시각화: 페이지 라이프사이클

```
Next.js 빌드 타임
  ↓
[page.tsx] ← 실제 페이지 코드

런타임 (사용자가 접속할 때)
  ↓
요청: GET /
  ↓
Next.js 서버
  ↓
page.tsx의 Home 컴포넌트 실행
  ↓
redirect("/login") 호출
  ↓
HTTP 응답 (302 redirect)
  ↓
브라우저 자동 이동
  ↓
GET /login
  ↓
LoginPage 렌더링
```

---

## 🚀 실습: 수정해보기

### 연습 1: 다른 페이지로 리다이렉트하기

현재 코드:
```tsx
export default function Home() {
  redirect("/login");
}
```

변경 예시들:
```tsx
// 예시 1: 게스트 페이지로
export default function Home() {
  redirect("/guest");
}

// 예시 2: 대시보드로
export default function Home() {
  redirect("/dashboard");
}

// 예시 3: 회원가입 페이지로
export default function Home() {
  redirect("/account/input");
}
```

### 연습 2: 리다이렉트 전에 뭔가 처리하기

```tsx
import { redirect } from "next/navigation";

export default function Home() {
  // 로그를 남기고 싶다면
  console.log("사용자가 홈페이지에 접속했습니다.");
  
  // 그 다음 리다이렉트
  redirect("/login");
}
```

---

## 🧩 다른 파일과의 연계

### 이 파일과 middleware.ts의 관계

```tsx
// middleware.ts에서
if (pathname === "/login") {
  if (token) {
    // 이미 로그인한 사용자는 대시보드로
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}
```

하지만 홈페이지(`/`)에서는 따로 처리하지 않으므로, **page.tsx가 직접 리다이렉트**합니다.

---

## ✅ 최종 정리

| 항목 | 설명 |
|------|------|
| **경로** | `/` (루트) |
| **파일명** | `src/app/page.tsx` |
| **주요 기능** | 홈페이지 → 로그인 페이지로 리다이렉트 |
| **사용 함수** | `redirect("/login")` |
| **렌더링** | 없음 (리다이렉트만 함) |
| **"use client"** | 불필요 |
| **속도** | 매우 빠름 (HTTP 리다이렉트) |

---

## 🎓 배운 것 정리

이 간단한 파일에서 배울 수 있는 것들:

1. ✅ **서버 컴포넌트** (`"use client"` 없음)
2. ✅ **redirect() 함수** (사용자를 다른 페이지로 보냄)
3. ✅ **HTTP 리다이렉트** (매우 빠르고 효율적)
4. ✅ **Next.js 라우팅** (매우 간단함!)
5. ✅ **사용자 경험** (불필요한 페이지는 보여주지 않음)

**핵심**: 아주 간단한 코드이지만, **사용자를 올바른 곳으로 보내는 중요한 역할**을 합니다! 🎯
