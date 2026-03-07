# 🔐 로그인 페이지 - login/page.tsx 완전 학습 가이드

## 🎯 이 파일이 하는 역할

`login/page.tsx`는 **사용자가 로그인하는 페이지**입니다. 아이디와 비밀번호를 입력받고, NextAuth를 통해 검증한 후 세션을 만드는 중요한 페이지입니다.

> 💡 **초보자 용어**:
> - **signIn()** = NextAuth의 로그인 함수
> - **Credentials** = 아이디, 비밀번호 같은 인증 정보
> - **세션** = 로그인 상태를 유지하는 정보

---

## 📖 코드 상세 분석

### 1️⃣ 임포트 섹션

```tsx
// 클라이언트 컴포넌트 지시어 (브라우저에서 실행)
"use client";

// React의 상태와 생명주기 훅
import { useState, useEffect } from "react";

// NextAuth 로그인 함수와 세션 확인 훅
import { signIn, useSession } from "next-auth/react";

// 페이지 이동 함수
import { useRouter } from "next/navigation";

// Bootstrap CSS 스타일
import "bootstrap/dist/css/bootstrap.min.css";

// Bootstrap Icons (아이콘들: 눈 아이콘 등)
import "bootstrap-icons/font/bootstrap-icons.css";
```

### 2️⃣ 컴포넌트 구조

```tsx
export default function LoginPage() {
    // 👇 [상태 관리] React의 useState로 입력값들을 저장합니다
    
    // 아이디/이메일 입력값
    const [id, setId] = useState("");
    
    // 비밀번호 입력값
    const [password, setPassword] = useState("");
    
    // 로그인 실패 시 에러 메시지
    const [error, setError] = useState("");

    // 👇 [새로운 기능] 비밀번호 표시/숨김 토글
    // true = 비밀번호 보임, false = 숨김
    const [showPassword, setShowPassword] = useState(false);

    // 👇 [라우팅] 페이지 이동 함수
    const router = useRouter();
    
    // 👇 [세션 확인] NextAuth의 useSession으로 로그인 상태 확인
    const { data: session } = useSession({
        required: false,  // 로그인 필수 아님 (로그인 페이지니까)
        onUnauthenticated() {
            // 인증되지 않으면 그냥 로그인 페이지 유지
        }
    });

    /* 👇 [애니메이션 효과] 로고 흔들기 */
    useEffect(() => {
        // "logoImg" ID를 가진 요소 찾기
        const logo = document.getElementById("logoImg");
        
        if (logo) {
            // 1. 처음 1500ms(1.5초) 동안 흔들기
            logo.classList.add("animate-shake");
            
            // 2. 그 후 회전 애니메이션
            setTimeout(() => {
                logo.classList.remove("animate-shake");
                logo.classList.add("animate-spin");
            }, 1500);
            
            // 3. 총 3초 후 애니메이션 종료
            setTimeout(() => {
                logo.classList.remove("animate-spin");
            }, 3000);
        }
    }, []);

    /* 👇 [핵심 함수] 로그인 처리 */
    const handleSubmit = async (e: React.FormEvent) => {
        // 폼의 기본 제출 동작 방지 (페이지 새로고침 방지)
        e.preventDefault();
        
        // 에러 메시지 초기화
        setError("");

        // NextAuth의 signIn() 함수 호출
        const result = await signIn("credentials", {
            id,          // 입력한 아이디/이메일
            password,    // 입력한 비밀번호
            redirect: false,  // 자동 리다이렉트 하지 않음 (수동으로 처리)
        });

        // 👇 [결과 처리]
        if (result?.error) {
            // 로그인 실패: 에러 메시지 표시
            setError(result.error);
        } else {
            // 로그인 성공: /dashboard로 이동
            // 500ms 지연 (세션 정보가 준비되도록)
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 500);
        }
    };

    // 👇 [JSX 렌더링] 로그인 폼 UI
    return (
        <>
            {/* 👇 [인라인 스타일] CSS 스타일 정의 */}
            <style jsx global>{`
                /* 배경 설정: 보라색 그래디언트 */
                html, body {
                    height: 100%;
                    margin: 0;
                    font-family: 'Noto Sans KR', sans-serif;
                    
                    /* 보라색 그래디언트 배경 */
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    
                    /* 화면 중앙에 배치 */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: auto;
                }

                /* [중요] 브라우저 기본 비밀번호 아이콘 숨기기 */
                /* 우리 커스텀 눈 아이콘과 겹치지 않도록 */
                input::-ms-reveal,
                input::-ms-clear {
                    display: none;
                }

                /* 📦 로그인 박스를 감싼 전체 컨테이너 */
                .login-wrapper {
                    width: 100%;
                    min-height: 100vh;  /* 전체 높이 */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                /* 📦 로그인 카드 컨테이너 (최대 너비 설정) */
                .login-container {
                    width: 100%;
                    max-width: 420px;  /* 모바일~태블릿에서도 적당한 크기 */
                    margin: 0 auto;
                }

                /* 🎨 로그인 카드 스타일 */
                .login-card {
                    background: rgba(255, 255, 255, 0.95);  /* 거의 투명하지 않은 흰색 */
                    border-radius: 20px;                    /* 모서리 둥글게 */
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);  /* 그림자 */
                    overflow: hidden;
                    
                    /* 배경 이미지 흐릿함 효과 */
                    backdrop-filter: blur(10px);
                    
                    /* 마우스 호버 시 애니메이션 */
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                /* 마우스 호버 시 카드 위로 떠오르고 그림자 增加 */
                .login-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
                }

                /* 🎨 카드 상단 (헤더) 스타일 */
                .card-header {
                    background: linear-gradient(135deg, #667eea, #764ba2);  /* 보라색 그래디언트 */
                    padding: 40px 30px;
                    text-align: center;
                    color: white;
                }

                /* 로고 이미지 스타일 */
                .login-icon img {
                    width: 90px;
                    height: 90px;
                    border-radius: 50%;          /* 원형 */
                    border: 5px solid rgba(255, 255, 255, 0.3);  /* 흰색 테두리 (반투명) */
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                }

                /* 🎬 애니메이션 1: 흔들기 */
                @keyframes shake {
                    0%   { transform: rotate(0deg); }
                    25%  { transform: rotate(-15deg); }
                    50%  { transform: rotate(15deg); }
                    75%  { transform: rotate(-15deg); }
                    100% { transform: rotate(0deg); }
                }

                /* 🎬 애니메이션 2: 회전 */
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }

                /* 흔들기 애니메이션 적용 */
                .animate-shake {
                    animation: shake 0.5s ease-in-out 3;  /* 0.5초씩 3회*/
                }

                /* 회전 애니메이션 적용 */
                .animate-spin {
                    animation: spin 1.5s linear 1;  /* 1.5초 동안 1회 회전 */
                }

                /* 제목 스타일 */
                .card-title {
                    margin-top: 20px;
                    font-size: 1.8rem;
                    font-weight: 700;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }

                /* 📝 카드 본문 (폼 영역) */
                .card-body {
                    padding: 40px 35px;
                }

                /* 입력 레이블 스타일 */
                .form-label {
                    font-weight: 600;
                    color: #444;
                    margin-bottom: 8px;
                }

                /* 📝 입력창 공통 스타일 */
                .form-control {
                    border: none;                    /* 테두리 없음 */
                    border-bottom: 2px solid #ddd;   /* 하단선만 있음 (심플) */
                    border-radius: 0;                /* 모서리 각지게 */
                    padding: 12px 0;                 /* 위아래 패딩 */
                    font-size: 1rem;
                    background: transparent;         /* 투명 배경 */
                    transition: all 0.3s ease;
                }

                /* 입력창 포커스 시 (클릭했을 때) */
                .form-control:focus {
                    box-shadow: none;                /* 부트스트랩 기본 그림자 제거 */
                    border-bottom-color: #667eea;    /* 하단선을 보라색으로 */
                    background: transparent;
                    outline: none;                   /* 기본 outline 제거 */
                }

                /* Input Group (입력창 + 버튼 조합) */
                .input-group {
                    align-items: center;  /* 수직 중앙 정렬 */
                }

                /* Input Group 내 입력창 */
                .input-group .form-control {
                    margin-bottom: 0;
                    border-bottom: 2px solid #ddd;
                }

                /* Input Group 포커스 시 */
                .input-group:focus-within .form-control,
                .input-group:focus-within .toggle-password-btn {
                    border-bottom-color: #667eea;
                }

                /* 👁️ 눈 아이콘 버튼 스타일 */
                .toggle-password-btn {
                    border: none;
                    background: transparent;
                    border-bottom: 2px solid #ddd;   /* 입력창과 동일한 하단선 */
                    border-radius: 0;
                    color: #aaa;
                    cursor: pointer;
                    padding: 12px 10px;              /* 클릭 영역 확보 */
                    transition: all 0.3s ease;
                }

                /* 눈 아이콘 호버 시 */
                .toggle-password-btn:hover {
                    color: #667eea;
                }

                /* placeh문자열 스타일 */
                .form-control::placeholder {
                    color: #aaa;
                }

                /* 🔘 로그인 버튼 스타일 */
                .btn-login {
                    background: linear-gradient(135deg, #667eea, #764ba2);  /* 보라색 그래디언트 */
                    border: none;
                    border-radius: 50px;             /* 약간 둥근 모양 */
                    padding: 14px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: white;
                    margin-top: 30px;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
                }

                /* 로그인 버튼 호버 */
                .btn-login:hover {
                    transform: translateY(-3px);             /* 위로 이동 */
                    box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);  /* 그림자 증가 */
                    background: linear-gradient(135deg, #5a6fd8, #6a4190);  /* 색상 어두워짐 */
                }

                /* 로그인 버튼 클릭 */
                .btn-login:active {
                    transform: translateY(0);  /* 클릭 느낌 */
                }

                /* ❌ 에러 메시지 스타일 */
                .error-msg {
                    margin-top: 20px;
                    font-weight: 600;
                    text-align: center;
                    padding: 10px;
                    border-radius: 10px;
                }

                /* 📱 모바일 화면 (576px 이하) 대응 */
                @media (max-width: 576px) {
                    .login-wrapper { padding: 15px; }
                    .login-container { max-width: 100%; }
                    .card-header { padding: 30px 20px; }
                    .card-body { padding: 30px 25px; }
                    .card-title { font-size: 1.6rem; }
                    .login-icon img { width: 80px; height: 80px; }
                    .btn-login { font-size: 1rem; padding: 12px; }
                }

                /* 📱 아주 작은 화면 (400px 이하) 대응 */
                @media (max-width: 400px) {
                    .card-body { padding: 25px 20px; }
                    .card-header { padding: 25px 15px; }
                    .login-icon img { width: 70px; height: 70px; }
                    .card-title { font-size: 1.4rem; }
                }
            `}</style>

            {/* 👇 [HTML 구조] 로그인 UI */}
            <div className="login-wrapper">
                <div className="login-container">
                    <div className="login-card">
                        {/* 헤더: 로고와 제목 */}
                        <div className="card-header">
                            <div className="login-icon">
                                <img
                                    src="/images/clova.png"
                                    alt="로고"
                                    id="logoImg"  {/* 애니메이션 대상 */}
                                />
                            </div>
                            <h2 className="card-title">로그인</h2>
                        </div>

                        {/* 본문: 로그인 폼 */}
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                {/* 아이디 입력 필드 */}
                                <div className="mb-4">
                                    <label htmlFor="inputId" className="form-label">
                                        아이디 또는 이메일
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="inputId"
                                        value={id}
                                        onChange={(e) => setId(e.target.value)}
                                        placeholder="아이디 또는 이메일을 입력하세요"
                                        required  {/* 필수 입력 */}
                                        autoFocus {/* 페이지 로드 시 자동 포커스 */}
                                    />
                                </div>

                                {/* 비밀번호 입력 필드 + 눈 아이콘 버튼 */}
                                <div className="mb-4">
                                    <label htmlFor="inputPassword" className="form-label">
                                        비밀번호
                                    </label>
                                    
                                    {/* Input Group: 입력창과 버튼을 나란히 배치 */}
                                    <div className="input-group">
                                        <input
                                            type={showPassword ? "text" : "password"}  {/* 상태에 따라 타입 변경 */}
                                            className="form-control"
                                            id="inputPassword"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="비밀번호를 입력하세요"
                                            required
                                            autoComplete="current-password"
                                        />
                                        {/* 비밀번호 표시/숨김 버튼 */}
                                        <button
                                            className="toggle-password-btn"
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1}  {/* 탭 키로 건너뛰기 */}
                                        >
                                            {/* 눈 아이콘: 보이면 열린 눈, 안 보이면 닫힌 눈 */}
                                            <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                                        </button>
                                    </div>
                                </div>

                                {/* 로그인 버튼 */}
                                <button type="submit" className="btn btn-login w-100">
                                    로그인
                                </button>
                            </form>

                            {/* 에러 메시지 표시 */}
                            {error && (
                                <div className="error-msg alert alert-danger">
                                    ❌ {error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
```

---

## 🧠 핵심 개념 정리

### 📌 1. signIn() 함수 (NextAuth)

```tsx
const result = await signIn("credentials", {
    id,
    password,
    redirect: false,
});
```

| 파라미터 | 설명 |
|----------|------|
| `"credentials"` | 아이디/비밀번호로 로그인 (다른 방식: google, github 등) |
| `id` | 사용자가 입력한 아이디 |
| `password` | 사용자가 입력한 비밀번호 |
| `redirect: false` | 자동으로 페이지 이동하지 않음 (수동 처리) |

### 📌 2. 비밀번호 표시/숨김 기능

```tsx
// 상태 정의
const [showPassword, setShowPassword] = useState(false);

// input type 동적 변경
<input type={showPassword ? "text" : "password"} />

// 버튼 클릭 시 토글
<button onClick={() => setShowPassword(!showPassword)}>
    <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
</button>
```

**동작**:
- `showPassword = true` → `type="text"` → 비밀번호 보임
- `showPassword = false` → `type="password"` → 비밀번호 숨김
- 아이콘도 자동으로 변경 (열린 눈 ↔ 닫힌 눈)

### 📌 3. 로고 애니메이션

```tsx
useEffect(() => {
    const logo = document.getElementById("logoImg");
    if (logo) {
        // 1단계: 흔들기 (1.5초)
        logo.classList.add("animate-shake");
        
        // 2단계: 회전 (1.5초)
        setTimeout(() => {
            logo.classList.remove("animate-shake");
            logo.classList.add("animate-spin");
        }, 1500);
        
        // 3단계: 종료
        setTimeout(() => {
            logo.classList.remove("animate-spin");
        }, 3000);
    }
}, []);  // 컴포넌트 마운트 시 1회만 실행
```

**타이밍**:
```
0ms ─ 1500ms: 흔들기
         │──┐
      1500ms ─ 3000ms: 회전
                   │
                 종료
```

### 📌 4. 반응형 디자인 (미디어 쿼리)

```tsx
/* 데스크톱 (기본) */
.login-card { width: 420px; }

/* 태블릿 (576px 이하) */
@media (max-width: 576px) {
    .login-card { width: 100%; padding: 15px; }
}

/* 모바일 (400px 이하) */
@media (max-width: 400px) {
    .login-card { padding: 25px 20px; }
}
```

---

## 💡 초보자가 꼭 알아야 할 점

### Q1: signIn()은 어디서 검증하나요?

**답변**: NextAuth의 `[...nextauth]` 파일에서 검증합니다.

```tsx
// 이 파일: login/page.tsx (프론트엔드)
const result = await signIn("credentials", {
    id,
    password,
});

// 실제 검증: pages/api/auth/[...nextauth].ts (백엔드)
// 여기서 MongoDB에 접속해서 사용자 확인과 비밀번호 검증
// authorize: async (credentials) => {
//     // MongoDB에서 사용자 찾기
//     // 비밀번호 비교
//     // JWT 토큰 생성
// }
```

### Q2: `window.location.href`와 `router.push()`의 차이는?

**답변**:

```tsx
// ❌ 클라이언트 사이드 라우팅 (SPA 방식)
router.push("/dashboard");

// ✅ 페이지 새로고침 (전체 페이지 로드)
window.location.href = "/dashboard";
```

| 항목 | router.push | window.location.href |
|------|-----------|---------------------|
| **속도** | 빠름 (필요한 부분만 로드) | 느림 (전체 페이지 로드) |
| **JavaScript** | 필요 | 불필요 |
| **용도** | 페이지 이동 | 전체 새로고침 (서버에서 세션 재확인) |

**왜 이 코드에서 새로고침을 사용?**
```tsx
setTimeout(() => {
    window.location.href = "/dashboard";  // ← 세션 정보 새로고침
}, 500);
```

세션이 방금 생성되었으므로, 서버에서 다시 확인하는 것이 안전합니다!

### Q3: 아이콘 "bi-eye"는 뭘 하는 거예요?

**답변**: **Bootstrap Icons**라는 아이콘 라이브러리입니다.

```tsx
import "bootstrap-icons/font/bootstrap-icons.css";  // 이 줄로 임포트됨

// 사용 예
<i className="bi bi-eye"></i>          {/* 열린 눈 👁️ */}
<i className="bi bi-eye-slash"></i>    {/* 닫힌 눈 🚫 */}
<i className="bi bi-heart-fill"></i>   {/* 하트 ❤️ */}
```

---

## 🎨 시각화: 로그인 프로세스

```
사용자가 아이디/비밀번호 입력 후 로그인 클릭
  ↓
handleSubmit() 실행
  ↓
signIn("credentials", { id, password, redirect: false })
  ↓
NextAuth API 호출 (서버)
  ↓
[...nextauth].ts의 authorize() 실행
  ↓
MongoDB에서 사용자 찾기
  ↓
비밀번호 비교
  ↓
일치? → JWT 토큰 생성 + 쿠키에 저장
     ↓
      500ms 대기 (세션 정보 준비)
     ↓
      /dashboard로 이동 (window.location.href)
     ↓
      브라우저 새로고침 (전체 페이지 로드)
     ↓
      middleware.ts 검사 (토큰 확인)
     ↓
      dashboard/page.tsx 표시 ✅
```

---

## 🚀 실습: 기능 수정해보기

### 연습 1: "계정 찾기" 링크 추가

```tsx
// <button type="submit"> 아래에 추가
<div style={{ marginTop: "20px", textAlign: "center" }}>
    <p style={{ color: "#666" }}>
        계정이 없으신가요? 
        <a href="/account/input" style={{ marginLeft: "5px", color: "#667eea" }}>
            회원가입
        </a>
    </p>
    <p style={{ color: "#666" }}>
        비밀번호를 잊으셨나요?
        <a href="/account/forget-password" style={{ marginLeft: "5px", color: "#667eea" }}>
            비밀번호 찾기
        </a>
    </p>
</div>
```

### 연습 2: 로딩 상태 추가

```tsx
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);  // ← 추가

    const result = await signIn("credentials", {
        id,
        password,
        redirect: false,
    });

    setIsLoading(false);  // ← 추가

    if (result?.error) {
        setError(result.error);
    } else {
        setTimeout(() => {
            window.location.href = "/dashboard";
        }, 500);
    }
};

// 버튼에 적용
<button 
    type="submit" 
    className="btn btn-login w-100"
    disabled={isLoading}  // ← 로딩 중 비활성화
>
    {isLoading ? "로그인 중..." : "로그인"}
</button>
```

---

## ✅ 최종 정리

| 항목 | 설명 |
|------|------|
| **경로** | `src/app/login/page.tsx` |
| **주요 기능** | 아이디/비밀번호로 로그인 |
| **사용 함수** | `signIn()` (NextAuth) |
| **반응형** | ✅ 모바일, 태블릿, 데스크톱 대응 |
| **특수 기능** | 비밀번호 표시/숨김, 로고 애니메이션 |
| **CSS** | 인라인 스타일 (style jsx) |
| **아이콘** | Bootstrap Icons |

---

## 🎓 배운 것 정리

1. ✅ **signIn() 함수** (NextAuth 로그인)
2. ✅ **React 상태 관리** (useState)
3. ✅ **useEffect** (애니메이션 실행)
4. ✅ **비밀번호 표시/숨김** (input type 동적 변경)
5. ✅ **CSS 애니메이션** (@keyframes shake, spin)
6. ✅ **반응형 디자인** (미디어 쿼리)
7. ✅ **Bootstrap Icons** (아이콘 사용)
8. ✅ **폼 처리** (form submit, validation)

**핵심**: 로그인은 사용자 인증의 **첫 번째 관문**입니다! 🔐
