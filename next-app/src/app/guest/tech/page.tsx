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
            <div className="icon" style={{ color }}>
                <i className={`bi ${icon}`} />
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
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 18px;
        }
        .card {
          position: relative;
          border: 1px solid rgba(56, 189, 248, 0.45);
          border-radius: 16px;
          padding: 22px 14px;
          height: 170px;
          text-align: center;
          cursor: pointer;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          background: transparent;
          transition: all 0.25s;
        }
        .card:hover {
          transform: translateY(-4px);
          background: rgba(56, 189, 248, 0.08);
          box-shadow: 0 0 25px rgba(56, 189, 248, 0.3);
          border-color: #38bdf8;
        }
        .icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          padding: 0;
          margin: 0;
          position: relative;
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
          color: #94a3b8;
          font-weight: 700;
          text-shadow: 1px 1px 5px rgba(0,0,0,0.8);
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
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 14px;
          }
          .icon { 
            width: 54px; 
            height: 54px; 
            font-size: 1.6rem;
          }
          .card { 
            height: 150px;
            padding: 18px 12px;
          }
        }
        @media (max-width: 480px) {
          .grid { 
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .icon { 
            width: 50px; 
            height: 50px; 
            font-size: 1.5rem;
          }
          .card { 
            height: 140px;
            padding: 16px 10px;
          }
          .title { font-size: 0.9rem; }
        }
      `}</style>

            <div className="container">
                <div className="header">
                    <h1 className="page-title">GUEST MENU</h1>
                    <div className="badge">{displayName}</div>
                </div>

                <div className="grid">
                    <Card href="/members/view" icon="bi-people-fill" color="#4ade80" title="연락망 보기" />
                    <Card href="/account/view" icon="bi-eye" color="#60a5fa" title="사용내역 열람" />
                    <Card href="/receipt/view" icon="bi-image" color="#c084fc" title="영수증 열람" />
                    <Card href="#" icon="bi-credit-card" color="#fbbf24" title="회비 현황" />
                    <Card href="#" icon="bi-pie-chart-fill" color="#f59e0b" title="재무 대시보드" />
                    <Card href="#" icon="bi-file-earmark-excel-fill" color="#10b981" title="엑셀 리포트" />
                </div>

                <div className="controls">
                    <button className="btn-tech" onClick={() => signOut({ callbackUrl: "/login" })}>LOGOUT</button>
                </div>
            </div>
        </div>
    );
}
