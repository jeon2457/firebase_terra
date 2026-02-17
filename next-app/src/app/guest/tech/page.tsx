"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type ThemeValue = "book" | "icon" | "glass" | "list" | "tech";

export default function GuestTechPage() {
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
            if (theme && theme !== "tech") {
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

    const Card = ({ href, icon, color, title }: { href: string; icon: string; color: string; title: string }) => (
        <Link href={href} className="tech-app">
            <div className="tech-app-icon" style={{ backgroundColor: color }}>
                <i className={`bi ${icon}`} style={{ color: "#fff" }} />
            </div>
            <div className="tech-app-label">{title}</div>
        </Link>
    );

    return (
        <div className="wrap">
            <style jsx>{`
        .wrap {
          min-height: 100vh;
          background: #000;
          color: #e2e8f0;
          padding: 30px 16px 50px;
        }
        .container {
          max-width: 1000px;
          margin: 0 auto;
        }
        .space-title {
          text-align: center;
          font-weight: 900;
          letter-spacing: 1px;
          color: #fff;
          margin: 18px 0 16px;
          text-shadow: 0 2px 18px rgba(0,0,0,0.9);
        }
        .space-topbar {
          max-width: 520px;
          margin: 0 auto 26px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 14px;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.16);
          box-shadow: 0 18px 40px rgba(0,0,0,0.55);
        }
        .space-admin {
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(255,255,255,0.92);
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
        .tech-appgrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 26px 22px;
          max-width: 420px;
          margin: 0 auto;
          padding: 6px 0 20px;
        }
        .tech-app {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          text-decoration: none;
          user-select: none;
        }
        .tech-app-icon {
          width: 86px;
          height: 86px;
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 18px 35px rgba(0,0,0,0.45);
          font-size: 2rem;
        }
        .icon i {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          line-height: 1;
          position: relative;
          z-index: 1;
        }
        .tech-app-label {
          color: rgba(255,255,255,0.95);
          font-weight: 900;
          text-shadow: 0 2px 10px rgba(0,0,0,0.9);
          text-align: center;
          line-height: 1.25;
        }
        .controls {
          margin-top: 26px;
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .btn-tech {
          background: rgba(0,0,0,0.5);
          border: 1px solid #38bdf8;
          color: #38bdf8;
          padding: 12px 26px;
          border-radius: 8px;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .tech-appgrid { 
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
          }
          .tech-app-icon { 
            width: 72px; 
            height: 72px; 
            font-size: 1.8rem;
          }
        }
        @media (max-width: 480px) {
          .tech-appgrid { 
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }
          .tech-app-icon { 
            width: 64px; 
            height: 64px; 
            font-size: 1.6rem;
          }
          .tech-app-label { font-size: 0.92rem; }
        }
      `}</style>

            <div className="container">
                <div className="space-title">GUEST MENU</div>
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

                <div className="tech-appgrid">
                    <Card href="/members/view" icon="bi-people-fill" color="#1f7bff" title="연락망 보기" />
                    <Card href="/account/view" icon="bi-eye" color="#3b3b3f" title="사용내역 열람" />
                    <Card href="/account/edit" icon="bi-pencil-fill" color="#d9423b" title="사용내역 편집" />
                    <Card href="/receipt/view" icon="bi-image" color="#5c6ac4" title="영수증 열람" />
                    <Card href="/receipt/upload" icon="bi-upload" color="#1f7bff" title="영수증 업로드" />
                    <Card href="/fee/status" icon="bi-credit-card" color="#16a085" title="회비 현황" />
                    <Card href="#" icon="bi-pie-chart-fill" color="#FFB300" title="재무 대시보드" />
                    <Card href="#" icon="bi-file-earmark-excel-fill" color="#1D6F42" title="엑셀 리포트" />
                </div>

                <div className="controls">
                    <button className="btn-tech" onClick={() => signOut({ callbackUrl: "/login" })}>LOGOUT</button>
                </div>
            </div>
        </div>
    );
}
