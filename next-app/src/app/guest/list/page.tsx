"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../guest.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type ThemeValue = "book" | "icon" | "glass" | "list" | "tech";

export default function GuestListPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [displayName, setDisplayName] = useState("사용자");


    const themePath = useMemo(() => {
        return (t: ThemeValue) => (t === "book" ? "/guest" : `/guest/${t}`);
    }, []);

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
        const ensureTheme = async () => {
            const res = await fetch("/api/theme");
            const data = await res.json();
            const theme = data?.theme as ThemeValue | undefined;
            if (theme && theme !== "list") {
                router.replace(themePath(theme));
            }
        };
        ensureTheme().catch(() => {
            // ignore
        });
    }, [status, router, themePath]);

    if (status === "loading") return <div className="text-center mt-5">Loading...</div>;
    if (status === "unauthenticated") {
        if (typeof window !== "undefined") window.location.href = "/login";
        return null;
    }

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

                    {/* 2. 사용내역 열람 */}
                    <Link href="/account/view" className={styles.selectCard}>
                        <div className={`${styles.bookSpine} ${styles.bgView}`}>
                            <i className={`bi bi-eye ${styles.bookIcon}`}></i>
                            <div className={styles.bookTitle}>사용내역 열람</div>
                        </div>
                    </Link>

                    {/* 3. 영수증 열람 */}
                    <Link href="/receipt/view" className={styles.selectCard}>
                        <div className={`${styles.bookSpine} ${styles.bgImage}`}>
                            <i className={`bi bi-image ${styles.bookIcon}`}></i>
                            <div className={styles.bookTitle}>영수증 열람</div>
                        </div>
                    </Link>

                    {/* 4. 월회비 납부현황 (링크 없음/준비중) */}
                    <div className={styles.selectCard} onClick={() => alert("준비중입니다.")}>
                        <div className={`${styles.bookSpine} ${styles.bgCard}`}>
                            <i className={`bi bi-credit-card ${styles.bookIcon}`}></i>
                            <div className={styles.bookTitle}>월회비 납부현황</div>
                        </div>
                    </div>

                    {/* 5. 재무 대시보드 (준비중) */}
                    <div className={styles.selectCard} onClick={() => alert("준비중입니다.")}>
                        <div className={`${styles.bookSpine} ${styles.bgFinancial}`}>
                            <i className={`bi bi-pie-chart-fill ${styles.bookIcon}`}></i>
                            <div className={styles.bookTitle}>재무 대시보드</div>
                        </div>
                    </div>

                    {/* 6. 엑셀 리포트 (준비중) */}
                    <div className={styles.selectCard} onClick={() => alert("준비중입니다.")}>
                        <div className={`${styles.bookSpine} ${styles.bgExcel}`}>
                            <i className={`bi bi-file-earmark-excel-fill ${styles.bookIcon}`}></i>
                            <div className={styles.bookTitle}>엑셀 리포트</div>
                        </div>
                    </div>
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
