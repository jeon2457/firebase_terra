# 🚀 Next.js 로그인 페이지 완벽 가이드 (왕초보용)

## 📁 파일 위치
**`c:\GitHub_vercel_mongodb\vercel_mongodb\next-app\src\app\login\page.tsx`**

---

## 📖 기본 개념 설명

### 1. "use client" 란?
```typescript
// 이 파일은 브라우저에서 실행됩니다 (서버X)
"use client";
```
**🤔 왜 필요할까?**
- Next.js 13+ 에서는 기본적으로 서버 컴포넌트
- 로그인 폼은 사용자 입력을 받아야 하므로 브라우저에서 실행되어야 함

---

### 2. React Hook 들의 이해

```typescript
// 상태 관리를 위한 Hook 들
const [id, setId] = useState("");                    // 아이디 입력값 저장
const [password, setPassword] = useState("");        // 비밀번호 입력값 저장  
const [error, setError] = useState("");              // 에러 메시지 저장
const [showPassword, setShowPassword] = useState(false); // 비밀번호 표시/숨김
```

**💡 useState란?**
- 컴포넌트의 상태(값)을 관리하는 React Hook
- `useState(초기값)` → `[현재값, 값을변경하는함수]`

**예시:**
```typescript
// 초기값: ""
const [id, setId] = useState("");

// id = "user123" (직접 변경 불가!)
// setId("user123") (이렇게 변경 가능!)
```

---

### 3. NextAuth.js 이해하기

```typescript
import { signIn, useSession } from "next-auth/react";
```

**🛡️ NextAuth.js란?**
- Next.js용 인증(로그인) 라이브러리
- 세션 관리, 소셜 로그인, 보안 등을 자동으로 처리

**주요 함수:**
- `signIn()`: 로그인 실행
- `useSession()`: 현재 로그인 상태 확인

---

## 🔍 코드 한 줄씩 자세히 설명

### 1. import 문 (외부 도구 가져오기)
```typescript
import { useState, useEffect } from "react";           // React Hook 들
import { signIn, useSession } from "next-auth/react";   // 로그인 기능
import { useRouter } from "next/navigation";            // 페이지 이동
import "bootstrap/dist/css/bootstrap.min.css";          // CSS 프레임워크
import "bootstrap-icons/font/bootstrap-icons.css";      // 아이콘
```

**💭 각 import 의미:**
- `react`: 사용자 입력, 상태 관리 등 핵심 기능
- `next-auth/react`: 로그인/로그아웃 기능
- `next/navigation`: 페이지 전환 (예: 로그인 성공 → 대시보드)
- `bootstrap`: 예쁜 버튼, 입력창 등 스타일

---

### 2. 컴포넌트 함수 선언
```typescript
export default function LoginPage() {
    // 여기에 로그인 로직 작성
}
```

**🎯 export default 란?**
- 이 파일을 import 할 때 기본으로 가져오는 것
- `import LoginPage from './login/page'` 이렇게 사용

---

### 3. 상태 변수들 선언
```typescript
// 입력값 저장
const [id, setId] = useState("");                    // 아이디 입력창 값
const [password, setPassword] = useState("");        // 비밀번호 입력창 값
const [error, setError] = useState("");              // 에러 메시지 ("아이디가 틀렸습니다" 등)
const [showPassword, setShowPassword] = useState(false); // 비밀번호 보이기/숨기기
```

**🤔 초기값이 왜 "" 일까?**
- 처음에는 입력창이 비어있어야 하므로
- 사용자가 타이핑하면 setId()로 값이 채워짐

---

### 4. 라우터와 세션 설정
```typescript
const router = useRouter();                    // 페이지 이동 도구
const { data: session } = useSession({        // 로그인 상태 확인
    required: false,                           // 로그인 필수 아님
    onUnauthenticated() {                      // 로그인 안 된 경우
        // 그냥 로그인 페이지 유지
    }
});
```

**🛣️ useRouter 란?**
- `router.push("/dashboard")` → 대시보드 페이지로 이동
- `router.back()` → 이전 페이지로 이동

**🔐 useSession 이란?**
- 현재 사용자가 로그인했는지 확인
- `session`에 사용자 정보 있음

---

### 5. 로고 애니메이션 효과
```typescript
useEffect(() => {
    // 로고 애니메이션
    const logo = document.getElementById("logoImg");
    if (logo) {
        logo.classList.add("animate-shake");        // 흔들기
        setTimeout(() => {
            logo.classList.remove("animate-shake");
            logo.classList.add("animate-spin");     // 돌리기
        }, 1500);
        setTimeout(() => {
            logo.classList.remove("animate-spin");
        }, 3000);
    }
}, []); // [] = 컴포넌트 처음 로드될 때만 실행
```

**🎬 useEffect 란?**
- 컴포넌트가 화면에 나타날 때 특정 작업 실행
- `[]` 빈 배열 = 처음 한 번만 실행

---

### 6. 로그인 처리 함수
```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();                    // 새로고침 방지
    setError("");                          // 이전 에러 지우기

    const result = await signIn("credentials", {
        id,                                 // 입력한 아이디
        password,                           // 입력한 비밀번호
        redirect: false,                   // 자동 이동 금지
    });

    if (result?.error) {
        setError(result.error);             // 에러 표시
    } else {
        // 로그인 성공!
        setTimeout(() => {
            window.location.href = "/dashboard";  // 대시보드로 이동
        }, 500);                            // 0.5초 후 이동
    }
};
```

**🤔 왜 `e.preventDefault()` 일까?**
- form 제출 시 페이지 새로고침 기본 동작 방지
- 우리가 원하는 대로 처리하기 위해

**⏰ 왜 setTimeout 일까?**
- 로그인 처리 후 잠시 대기
- 세션이 완전히 생성되도록 시간 줌

---

### 7. JSX (화면에 보이는 부분)
```typescript
return (
    <>
        {/* CSS 스타일 */}
        <style jsx global>{`
            /* 여기에 CSS 코드 */
        `}</style>

        {/* 실제 화면 */}
        <div className="login-wrapper">
            <div className="login-container">
                {/* 로그인 카드 */}
                <div className="login-card">
                    {/* 로고 */}
                    <div className="card-header">
                        <img src="/images/clova.png" alt="로고" id="logoImg" />
                        <h2>로그인</h2>
                    </div>

                    {/* 입력 폼 */}
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            {/* 아이디 입력 */}
                            <input 
                                type="text"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                placeholder="아이디 또는 이메일"
                            />

                            {/* 비밀번호 입력 */}
                            <input 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호"
                            />

                            {/* 로그인 버튼 */}
                            <button type="submit">
                                로그인
                            </button>
                        </form>

                        {/* 에러 메시지 */}
                        {error && <div className="error">{error}</div>}
                    </div>
                </div>
            </div>
        </div>
    </>
);
```

**💡 JSX 란?**
- JavaScript + XML
- HTML처럼 보이지만 실제로는 JavaScript
- React가 이해할 수 있는 형태로 변환됨

---

## 🎨 CSS 스타일 설명

### 주요 스타일들:
```css
.login-wrapper {
    min-height: 100vh;        /* 화면 전체 높이 */
    display: flex;            /* 중앙 정렬 */
    align-items: center;      /* 세로 중앙 */
    justify-content: center;  /* 가로 중앙 */
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
    background: rgba(255, 255, 255, 0.95);  /* 반투명 흰색 */
    border-radius: 20px;                     /* 둥근 모서리 */
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15); /* 그림자 */
    backdrop-filter: blur(10px);            /* 배경 흐림 효과 */
}

.btn-login {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 50px;      /* 둥근 버튼 */
    transition: all 0.3s ease; /* 부드러운 애니메이션 */
}
```

**🌈 주요 효과:**
- **그라데이션**: 아름다운 색상 전환
- **그림자**: 입체감 있는 카드 느낌
- **둥근 모서리**: 부드러운 느낌
- **호버 효과**: 마우스 올리면 살짝 올라감

---

## 🚀 실제 작동 순서

1. **페이지 로드** → 로고 애니메이션 실행
2. **사용자 입력** → 상태 변수에 저장
3. **로그인 버튼 클릭** → handleSubmit 실행
4. **NextAuth 검증** → 서버와 통신
5. **성공/실패** → 대시보드 이동 또는 에러 표시

---

## 💡 배울 점 정리

### ✅ 핵심 개념:
- **useState**: 사용자 입력값 관리
- **useEffect**: 컴포넌트 생명주기 관리
- **useSession**: 로그인 상태 확인
- **signIn**: 로그인 처리
- **JSX**: React 컴포넌트 작성법

### 🛡️ 보안 특징:
- **redirect: false**: 안전한 페이지 전환
- **setTimeout**: 세션 생성 대기
- **에러 처리**: 사용자에게 명확한 피드백

### 🎨 UX 특징:
- **애니메이션**: 생동감 있는 UI
- **반응형 디자인**: 모바일/태블릿 지원
- **비밀번호 표시/숨김**: 사용성 향상
- **호버 효과**: 인터랙티브한 경험

---

## 📚 다음 단계는?

1. **회원가입 페이지** 만들기
2. **비밀번호 찾기** 기능 추가
3. **소셜 로그인** (구글, 카카오) 연동
4. **자동 로그인** 기능 구현

이제 Next.js 로그인이 어떻게 작동하는지 완전히 이해했습니다! 🎉