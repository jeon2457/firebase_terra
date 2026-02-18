"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./guest.module.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type ThemeValue = "book" | "icon" | "glass" | "list" | "tech";

export default function GuestPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [displayName, setDisplayName] = useState("사용자");
    const [currentTheme, setCurrentTheme] = useState<ThemeValue | null>(null);
    const [isLoadingTheme, setIsLoadingTheme] = useState(true);

    useEffect(() => {
        if (session?.user) {
            const user = session.user as any;
            let name = user.name || "사용자";
            // 심플한 직책 로직 (추후 보강 가능)
            if (user.user_level >= 10) {
                name += " (관리자)";
            } else {
                name += " 님";
            }
            setDisplayName(name);
        }
    }, [session]);

    useEffect(() => {
        const routeByTheme = async () => {
            if (status !== "authenticated") return;
            try {
                const res = await fetch("/api/theme", { method: "GET" });
                const data = await res.json();
                const theme = data?.theme as ThemeValue | undefined;

                if (theme && theme !== "book") {
                    router.replace(`/guest/${theme}`);
                } else {
                    setCurrentTheme("book");
                    setIsLoadingTheme(false);
                }
            } catch {
                setCurrentTheme("book");
                setIsLoadingTheme(false);
            }
        };
        routeByTheme();
    }, [status, router]);

    if (isLoadingTheme || status === "loading") {
        return <div className="text-center mt-5">Loading...</div>;
    }

    // 로그인 안된 경우 처리 (middleware가 없다면 여기서 처리)
    if (status === "unauthenticated") {
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
        return null;
    }

    // currentTheme이 "book"이 아니면 이 컴포넌트가 렌더링되지 않으므로,
    // 이 시점에서는 currentTheme이 "book"임을 확신할 수 있습니다.
    return (
        <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", overflow: "hidden" }}>
            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>회원관리 도서관</h2>

                <div className={styles.adminInfo}>
                    👤 내 정보: <strong>{displayName}</strong> (Level {(session?.user as any)?.user_level || 0})
                </div>

                <div className={styles.optionBox}>
                    {/* 1. 연락망 보기 */}
                    <Link href="/members/view" className={styles.selectCard}>
                        <div className={`${styles.bookSpine} ${styles.bgTel}`}>
                            <i className={`bi bi-people-fill ${styles.bookIcon}`}></i>
                            <div className={styles.bookTitle}>연락망 보기</div>
                        </div>
                    </Link>
                </div>

                <div className={styles.btnArea}>
                    <button
                        className={`btn btn-outline-danger btn-lg ${styles.btnSame} shadow-sm`}
                        onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                        서재 나가기
                    </button>
                </div>
            </div>
        </div>
    );
}
