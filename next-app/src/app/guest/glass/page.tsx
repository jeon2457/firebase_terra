"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type ThemeValue = "book" | "icon" | "glass" | "list" | "tech";

export default function GuestGlassPage() {
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
            if (theme && theme !== "glass") {
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
          background: linear-gradient(180deg, #000000 0%, #0b1220 55%, #000000 100%);
          padding: 30px 0;
          color: #fff;
        }
        .wrap-container {
          max-width: 1100px;
          position: relative;
          z-index: 1;
        }
        .space-title {
          text-align: center;
          font-weight: 900;
          letter-spacing: 1px;
          color: #e2e8f0;
          margin: 18px 0 16px;
          text-shadow: 0 2px 18px rgba(0,0,0,0.9);
        }
        .space-topbar {
          max-width: 520px;
          margin: 0 auto 26px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255,255,255,0.03);
          padding: 12px 18px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.16);
          box-shadow: 0 18px 40px rgba(0,0,0,0.55);
        }
        .space-admin {
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(255,255,255,0.9);
          font-weight: 800;
          font-size: 0.95rem;
        }
        .space-admin-badge {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.16);
        }
        .space-logout {
          border: 0;
          padding: 8px 14px;
          border-radius: 999px;
          font-weight: 900;
          background: linear-gradient(180deg, #ff5b7a, #ff274f);
          color: #fff;
          box-shadow: 0 10px 20px rgba(255,39,79,0.25);
        }
        .glass-menugrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          width: 100%;
        }
        .glass-menu {
          border-radius: 18px;
          padding: 18px 14px;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.45);
          color: #fff;
          text-align: center;
          user-select: none;
          transition: 0.2s ease;
        }
        .glass-menu:hover { transform: translateY(-4px); }
        .glass-menu-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto 10px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.10);
        }
        .glass-menu-label { font-weight: 900; }
        .icon-bg-tel { background: linear-gradient(180deg, #5AC8FA, #007AFF); }
        .icon-bg-account { background: linear-gradient(180deg, #FF9500, #FF5E00); }
        .icon-bg-camera { background: linear-gradient(180deg, #4CD964, #28A745); }
        .icon-bg-pass { background: linear-gradient(180deg, #FFCC00, #FBC02D); color: #222; }
        .icon-bg-pass i { color: #222; }
        .icon-bg-financial { background: linear-gradient(180deg, #FFD700, #FFA000); color: #222; }
        .icon-bg-financial i { color: #222; }
        .icon-bg-excel { background: linear-gradient(180deg, #1D6F42, #43A047); }

        @media (max-width: 768px) {
          .glass-menugrid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
          .glass-menu { padding: 16px 12px; }
          .glass-menu-icon { width: 50px; height: 50px; font-size: 1.4rem; }
        }
        @media (max-width: 480px) {
          .glass-menugrid { gap: 12px; }
          .glass-menu { padding: 14px 10px; }
          .glass-menu-icon { width: 45px; height: 45px; font-size: 1.3rem; }
        }
      `}</style>

            <div className="container wrap-container py-5">
                <div className="space-title">TERRAONE NEXUS</div>
                <div className="space-topbar">
                    <div className="space-admin">
                        <div className="space-admin-badge">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <div>사용자: <strong>{displayName}</strong></div>
                    </div>
                    <button className="space-logout" onClick={() => signOut({ callbackUrl: "/login" })}>로그아웃</button>
                </div>

                <div className="glass-menugrid">
                    <div className="glass-menu" onClick={() => router.push("/members/view")}>
                        <div className="glass-menu-icon icon-bg-tel">👥</div>
                        <div className="glass-menu-label">연락망 보기</div>
                    </div>

                    <div className="glass-menu" onClick={() => router.push("/account/view")}>
                        <div className="glass-menu-icon icon-bg-account">👁️</div>
                        <div className="glass-menu-label">사용내역 열람</div>
                    </div>

                    <div className="glass-menu" onClick={() => router.push("/receipt/view")}>
                        <div className="glass-menu-icon icon-bg-camera">📷</div>
                        <div className="glass-menu-label">영수증 열람</div>
                    </div>

                    <div className="glass-menu" onClick={() => alert("준비중입니다.")}>
                        <div className="glass-menu-icon icon-bg-pass">💳</div>
                        <div className="glass-menu-label">월회비 현황</div>
                    </div>

                    <div className="glass-menu" onClick={() => alert("준비중입니다.")}>
                        <div className="glass-menu-icon icon-bg-financial">📊</div>
                        <div className="glass-menu-label">재무 대시보드</div>
                    </div>

                    <div className="glass-menu" onClick={() => alert("준비중입니다.")}>
                        <div className="glass-menu-icon icon-bg-excel">📊</div>
                        <div className="glass-menu-label">엑셀 리포트</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
