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
          background: radial-gradient(1000px 800px at 50% 0%, rgba(255,255,255,0.08), rgba(0,0,0,0) 60%),
            linear-gradient(180deg, #000000 0%, #0b1220 55%, #000000 100%);
          padding: 36px 14px 40px;
          color: #fff;
        }
        .panel {
          max-width: 600px;
          margin: 0 auto;
          border-radius: 36px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.02);
          padding: 30px 18px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.8);
          backdrop-filter: blur(0px);
          -webkit-backdrop-filter: blur(0px);
        }
        .title {
          text-align: center;
          font-weight: 900;
          letter-spacing: 2px;
          margin-bottom: 14px;
          font-size: 1.8rem;
          text-shadow: 0 2px 12px rgba(0,0,0,0.8);
        }
        .info {
          text-align: center;
          font-size: 13px;
          color: rgba(255,255,255,0.85);
          margin-bottom: 22px;
          background: rgba(0,0,0,0.5);
          padding: 10px;
          border-radius: 50px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px 18px;
        }
        .card {
          text-decoration: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .icon {
          width: 86px;
          height: 86px;
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.4rem;
          color: #fff;
          box-shadow: 0 10px 22px rgba(0,0,0,0.6);
          position: relative;
          overflow: hidden;
        }
        .icon:after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.10), transparent);
          transform: rotate(45deg);
          transition: 0.6s;
        }
        .card:hover .icon:after { left: 100%; }
        .label {
          font-size: 13px;
          font-weight: 800;
          color: #fff;
          text-align: center;
          text-shadow: 0 2px 8px rgba(0,0,0,1);
        }
        .bg-tel { background: linear-gradient(180deg, #5AC8FA, #007AFF); }
        .bg-account { background: linear-gradient(180deg, #FF9500, #FF5E00); }
        .bg-camera { background: linear-gradient(180deg, #4CD964, #28A745); }
        .bg-pass { background: linear-gradient(180deg, #FFCC00, #FBC02D); color: #222; }
        .bg-pass i { color: #222; }
        .bg-financial { background: linear-gradient(180deg, #FFD700, #FFA000); color: #222; }
        .bg-financial i { color: #222; }
        .bg-excel { background: linear-gradient(180deg, #1D6F42, #43A047); }

        @media (max-width: 480px) {
          .panel { padding: 24px 14px; border-radius: 32px; }
          .grid { gap: 18px 12px; }
          .icon { width: 78px; height: 78px; font-size: 2.2rem; }
        }
      `}</style>

            <div className="panel">
                <div className="title">메뉴 선택</div>
                <div className="info">
                    👤 <span style={{ color: "#4cd964" }}><strong>{displayName}</strong></span>
                </div>

                <div className="grid">
                    <Link href="/members/view" className="card">
                        <div className="icon bg-tel"><i className="bi bi-people-fill" /></div>
                        <div className="label">연락망 보기</div>
                    </Link>

                    <Link href="/account/view" className="card">
                        <div className="icon bg-account"><i className="bi bi-file-earmark-text" /></div>
                        <div className="label">내역서 보기</div>
                    </Link>

                    <Link href="/receipt/view" className="card">
                        <div className="icon bg-camera"><i className="bi bi-camera-fill" /></div>
                        <div className="label">영수증 보기</div>
                    </Link>

                    <div className="card" onClick={() => alert("준비중입니다.")}
                        role="button" tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter") alert("준비중입니다."); }}>
                        <div className="icon bg-pass"><i className="bi bi-credit-card" /></div>
                        <div className="label">월회비 현황</div>
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

                <div className="text-center" style={{ marginTop: 28 }}>
                    <button className="btn btn-outline-danger btn-lg" style={{ borderRadius: 20, fontWeight: 800 }} onClick={() => signOut({ callbackUrl: "/login" })}>
                        로그아웃
                    </button>
                </div>
            </div>
        </div>
    );
}
