# Dashboard Page 학습서

이 문서는 `next-app/src/app/dashboard/page.tsx` 파일의 코드를 이해하기 위한 초보자용 학습 자료입니다. 각 줄 또는 블록에 대한 설명을 포함한 주석을 달아놓았으니 차근차근 읽어보세요.

---

```tsx
// 이 파일은 Next.js의 클라이언트 컴포넌트입니다. "use client" 지시어로 시작하여 브라우저에서 실행됨을 명시합니다.
"use client";

// 필요한 훅과 라이브러리를 가져옵니다.
import { useRouter } from "next/navigation"; // 라우팅(페이지 이동) 기능
import { useEffect, useState } from "react"; // React의 상태와 생명주기 훅
import { useSession } from "next-auth/react"; // 인증 세션 정보를 얻기 위한 훅
import "bootstrap/dist/css/bootstrap.min.css"; // 부트스트랩 CSS를 전역으로 가져옵니다.
import DashboardContent from "./DashboardContent"; // 하위 컴포넌트

// ThemeValue 타입은 대시보드에서 사용할 테마를 정의합니다.
type ThemeValue = "book" | "icon" | "glass" | "list" | "tech";

// 기본으로 내보내는 함수형 컴포넌트
export default function DashboardPage() {
    // 세션과 상태를 가져옵니다.
    const { data: session, status } = useSession();
    const router = useRouter();

    // 현재 테마와 로딩 상태를 로컬 상태로 관리합니다.
    const [currentTheme, setCurrentTheme] = useState<ThemeValue | null>(null);
    const [isLoadingTheme, setIsLoadingTheme] = useState(true);

    // 컴포넌트가 처음 렌더링되거나 status/router가 바뀔 때 실행됩니다.
    useEffect(() => {
        // 인증이 안된 상태에서의 처리는 middleware.ts에서 이미 하고 있습니다.
        document.title = "대시보드"; // 브라우저 탭 제목 설정
    }, [status, router]);

    // 인증이 완료되면 서버에서 테마 정보를 불러와서 라우팅 처리를 합니다.
    useEffect(() => {
        const routeByTheme = async () => {
            if (status !== "authenticated") return; // 로그인되지 않으면 아무 작업도 하지 않음
            try {
                const res = await fetch("/api/theme", { method: "GET" });
                const data = await res.json();
                const theme = data?.theme as ThemeValue | undefined;

                // 테마가 있고 기본 "book"이 아니라면 해당 테마 페이지로 리디렉션
                if (theme && theme !== "book") {
                    router.replace(`/dashboard/${theme}`);
                } else {
                    // 테마가 없거나 "book"인 경우 기본값을 설정
                    setCurrentTheme("book");
                    setIsLoadingTheme(false);
                }
            } catch {
                // 네트워크 오류 등 실패 시에도 기본값 사용
                setCurrentTheme("book");
                setIsLoadingTheme(false);
            }
        };
        routeByTheme();
    }, [status, router]);

    // 아직 테마를 로딩 중이거나 인증 상태가 로딩 중이라면 로딩 표시
    if (isLoadingTheme || status === "loading") {
        return <div className="text-center mt-5">Loading...</div>;
    }

    // 로딩이 끝나면 실제 대시보드 내용을 렌더링
    return <DashboardContent theme={currentTheme || "book"} />;
}
```

---

## 코드 설명 요약

1. **`use client`**: 이 컴포넌트가 서버 대신 클라이언트(브라우저)에서 실행되어야 한다는 의미입니다.
2. **인증 확인**: `useSession` 훅을 사용하여 사용자가 로그인했는지 `status`로 확인합니다.
3. **테마 로딩 및 라우팅**: `/api/theme`을 호출하여 사용자의 선호 테마를 불러오고, 적절한 경로로 이동하거나 기본값을 설정합니다.
4. **로딩 처리**: 테마/세션이 준비될 때까지 간단한 로딩 메시지를 표시합니다.
5. **대시보드 내용 표시**: 로딩이 끝나면 `DashboardContent` 컴포넌트를 현재 테마와 함께 렌더링합니다.

위 코드는 Next.js와 MongoDB를 사용하여 인증된 사용자에게 개인화된 대시보드를 보여주는 구조의 예시입니다. 이 코드를 통해 라우팅, 인증 상태 관리, 서버 API 호출 등의 기본 개념을 학습할 수 있습니다.

> ✅ **파일 생성 위치**: `코드학습/dashboard_page_learning.md`

필요한 추가 학습 자료가 있으면 언제든지 요청하세요!