"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
            if (user.user_level >= 10) name += " (관리자)";
            else name += " 님";
            setDisplayName(name);
        }
    }, [session]);

    useEffect(() => {
        const ensureTheme = async () => {
            if (status !== "authenticated") return;
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
        <div className="wrap">
            <style jsx>{`
        .wrap { 
          min-height: 100vh; 
          background: #f7f9fc; 
          padding: 20px 14px 50px; 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .container { 
          max-width: 650px; 
          margin: 0 auto; 
          width: 100%;
          box-sizing: border-box;
        }
        .header { 
          background: white; 
          padding: 12px 20px; 
          border-radius: 12px; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          gap: 10px; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.05); 
          margin-bottom: 22px; 
        }
        .list-box {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .list-item {
          background: white;
          border-radius: 14px;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: nowrap;
          cursor: pointer;
          border: 2px solid transparent;
          box-shadow: 0 6px 14px rgba(0,0,0,0.06);
          user-select: none;
          transition: all 0.2s ease;
          text-decoration: none;
          color: inherit;
        }
        .list-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(0,0,0,0.1);
        }
        .list-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }
        .list-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          background: #eef2ff;
          color: #4f46e5;
          padding: 0;
          margin: 0;
          position: relative;
          flex-shrink: 0;
        }
        .list-icon i {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          line-height: 1;
          position: relative;
          z-index: 1;
        }
        .list-title { 
          font-weight: 800; 
          font-size: 1.05rem; 
          color: #2c3e50; 
          margin-bottom: 2px; 
        }
        .list-sub { 
          font-size: 0.85rem; 
          color: #8898aa; 
        }
        .btn-exec { 
          margin-top: 22px; 
          width: 100%; 
          padding: 14px 16px; 
          border-radius: 30px; 
          font-weight: 900; 
        }
        .list-arrow {
          color: #94a3b8;
          font-weight: 900;
          display: inline-flex;
          align-items: center;
          flex-shrink: 0;
          margin-left: 12px;
        }

        @media (max-width: 480px) {
          .list-icon { width: 44px; height: 44px; font-size: 1.4rem; }
          .list-item { padding: 16px 18px; gap: 14px; }
          .list-title { font-size: 1rem; }
          .list-sub { font-size: 0.8rem; }
        }
      `}</style>

            <div className="container">
                <div className="header">
                    👤 사용자: <strong>{displayName}</strong>
                </div>

                <div className="list-box">
                    <Link href="/members/view" className="list-item">
                        <div className="list-left">
                            <div className="list-icon"><i className="bi bi-people-fill" /></div>
                            <div>
                                <div className="list-title">연락망 보기</div>
                                <div className="list-sub">동기 연락처 정보 확인</div>
                            </div>
                        </div>
                        <svg className="list-arrow" aria-hidden="true" role="presentation" width="18" height="18" viewBox="0 0 24 24">
                          <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>

                    <Link href="/account/view" className="list-item">
                        <div className="list-left">
                            <div className="list-icon"><i className="bi bi-eye" /></div>
                            <div>
                                <div className="list-title">사용내역 열람</div>
                                <div className="list-sub">모임 사용 내역 상세 보기</div>
                            </div>
                        </div>
                        <svg className="list-arrow" aria-hidden="true" role="presentation" width="18" height="18" viewBox="0 0 24 24">
                          <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>

                    <Link href="/receipt/view" className="list-item">
                        <div className="list-left">
                            <div className="list-icon"><i className="bi bi-image" /></div>
                            <div>
                                <div className="list-title">영수증 열람</div>
                                <div className="list-sub">지출 영수증 사진 모아보기</div>
                            </div>
                        </div>
                        <svg className="list-arrow" aria-hidden="true" role="presentation" width="18" height="18" viewBox="0 0 24 24">
                          <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>

                    <div className="list-item" onClick={() => alert("준비중입니다.")}
                        role="button" tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter") alert("준비중입니다."); }}>
                        <div className="list-left">
                            <div className="list-icon"><i className="bi bi-credit-card" /></div>
                            <div>
                                <div className="list-title">회비 현황</div>
                                <div className="list-sub">월회비 및 입금 현황 확인</div>
                            </div>
                        </div>
                        <svg className="list-arrow" aria-hidden="true" role="presentation" width="18" height="18" viewBox="0 0 24 24">
                          <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    <div className="list-item" onClick={() => alert("준비중입니다.")}
                        role="button" tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter") alert("준비중입니다."); }}>
                        <div className="list-left">
                            <div className="list-icon"><i className="bi bi-pie-chart-fill" /></div>
                            <div>
                                <div className="list-title">재무 대시보드</div>
                                <div className="list-sub">연도별 수입/지출 차트 분석</div>
                            </div>
                        </div>
                        <svg className="list-arrow" aria-hidden="true" role="presentation" width="18" height="18" viewBox="0 0 24 24">
                          <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    <div className="list-item" onClick={() => alert("준비중입니다.")}
                        role="button" tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter") alert("준비중입니다."); }}>
                        <div className="list-left">
                            <div className="list-icon"><i className="bi bi-file-earmark-excel-fill" /></div>
                            <div>
                                <div className="list-title">엑셀 리포트</div>
                                <div className="list-sub">회계장부 엑셀 다운로드</div>
                            </div>
                        </div>
                        <svg className="list-arrow" aria-hidden="true" role="presentation" width="18" height="18" viewBox="0 0 24 24">
                          <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                <button className="btn btn-primary btn-exec" onClick={() => signOut({ callbackUrl: "/login" })}>
                    로그아웃
                </button>
            </div>
        </div>
    );
}
