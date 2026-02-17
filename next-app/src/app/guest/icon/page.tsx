"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type ThemeValue = "book" | "icon" | "glass" | "list" | "tech";

export default function GuestIconPage() {
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
            if (theme && theme !== "icon") {
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
          background: #f4f6f9;
          padding: 26px 14px 40px;
        }
        .container {
          max-width: 650px;
          margin: 0 auto;
        }
        .title {
          text-align: center;
          color: #333;
          font-weight: 800;
          margin-bottom: 18px;
          font-size: 1.6rem;
        }
        .info {
          text-align: center;
          font-size: 14px;
          color: #555;
          margin-bottom: 20px;
          background: rgba(255, 255, 255, 0.7);
          padding: 10px;
          border-radius: 20px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px 14px;
          justify-items: center;
        }
        .card {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          text-decoration: none;
          padding: 6px;
        }
        .icon {
          width: 72px;
          height: 72px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: #fff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          margin-bottom: 8px;
          padding: 0;
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
        .label {
          font-size: 12px;
          font-weight: 600;
          color: #333;
          text-align: center;
          line-height: 1.2;
          min-height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          word-break: keep-all;
        }
        .bg-tel { background: linear-gradient(180deg, #34AADC, #0076FF); }
        .bg-view { background: linear-gradient(180deg, #4CD964, #28A745); }
        .bg-image { background: linear-gradient(180deg, #5856D6, #3F51B5); }
        .bg-card { background: linear-gradient(180deg, #FFCC00, #FBC02D); color: #222; }
        .bg-card i { color: #222; }
        .bg-financial { background: linear-gradient(180deg, #FFD700, #FFA000); color: #222; }
        .bg-financial i { color: #222; }
        .bg-excel { background: linear-gradient(180deg, #1D6F42, #43A047); }

        @media (max-width: 480px) {
          .grid { grid-template-columns: repeat(3, 1fr); gap: 10px 10px; }
          .icon { 
            width: 66px; 
            height: 66px; 
            font-size: 1.9rem;
            border-radius: 16px;
          }
          .label { font-size: 11px; min-height: 24px; }
        }
        @media (max-width: 380px) {
          .grid { grid-template-columns: repeat(2, 1fr); gap: 8px 8px; }
          .icon { 
            width: 60px; 
            height: 60px; 
            font-size: 1.7rem;
            border-radius: 14px;
          }
          .label { font-size: 10px; min-height: 22px; }
        }
      `}</style>

            <div className="container">
                <div className="title">회원관리 메뉴판</div>
                <div className="info">
                    👤 내 정보: <strong>{displayName}</strong> (Level {(session?.user as any)?.user_level || 0})
                </div>

                <div className="grid">
                    <Link href="/members/view" className="card">
                        <div className="icon bg-tel"><i className="bi bi-people-fill" /></div>
                        <div className="label">연락망 보기</div>
                    </Link>

                    <Link href="/account/view" className="card">
                        <div className="icon bg-view"><i className="bi bi-eye" /></div>
                        <div className="label">내역 열람</div>
                    </Link>

                    <Link href="/receipt/view" className="card">
                        <div className="icon bg-image"><i className="bi bi-image" /></div>
                        <div className="label">영수증 열람</div>
                    </Link>

                    <div className="card" onClick={() => alert("준비중입니다.")}
                        role="button" tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter") alert("준비중입니다."); }}>
                        <div className="icon bg-card"><i className="bi bi-credit-card" /></div>
                        <div className="label">회비 현황</div>
                    </div>

                    <div className="card" onClick={() => alert("준비중입니다.")}
                        role="button" tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter") alert("준비중입니다."); }}>
                        <div className="icon bg-financial"><i className="bi bi-pie-chart-fill" /></div>
                        <div className="label">재무 대시보드</div>
                    </div>

                    <div className="card" onClick={() => alert("준비중입니다.")}
                        role="button" tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter") alert("준비중입니다."); }}>
                        <div className="icon bg-excel"><i className="bi bi-file-earmark-excel-fill" /></div>
                        <div className="label">엑셀 리포트</div>
                    </div>
                </div>

                <div className="text-center mt-4">
                    <button className="btn btn-outline-danger rounded-pill fw-bold px-4" onClick={() => signOut({ callbackUrl: "/login" })}>
                        로그아웃
                    </button>
                </div>
            </div>
        </div>
    );
}
