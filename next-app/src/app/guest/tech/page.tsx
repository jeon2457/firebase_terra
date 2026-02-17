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
        <Link href={href} className="card">
            <div className="icon" style={{ backgroundColor: color }}>
                <i className={`bi ${icon}`} style={{ color: "#fff" }} />
            </div>
            <div className="title">{title}</div>
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
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(56, 189, 248, 0.3);
        }
        .page-title {
          font-size: 1.6rem;
          font-weight: 800;
          background: linear-gradient(90deg, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }
        .badge {
          background: rgba(15, 23, 42, 0.5);
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 0.9rem;
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 26px 22px;
          max-width: 420px;
          margin: 0 auto;
        }
        .card {
          position: relative;
          text-align: center;
          cursor: pointer;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: transparent;
          transition: all 0.2s ease;
          user-select: none;
        }
        .card:hover { transform: translateY(-2px); }
        .icon {
          width: 86px;
          height: 86px;
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          box-shadow: 0 18px 35px rgba(0,0,0,0.45);
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
        .title {
          color: rgba(255,255,255,0.95);
          font-weight: 900;
          text-shadow: 0 2px 10px rgba(0,0,0,0.9);
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
          .grid { 
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
          }
          .icon { 
            width: 72px; 
            height: 72px; 
            font-size: 1.8rem;
          }
        }
        @media (max-width: 480px) {
          .grid { 
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }
          .icon { 
            width: 64px; 
            height: 64px; 
            font-size: 1.6rem;
          }
          .title { font-size: 0.92rem; }
        }
      `}</style>

            <div className="container">
                <div className="header">
                    <h1 className="page-title">GUEST MENU</h1>
                    <div className="badge">{displayName}</div>
                </div>

                <div className="grid">
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
