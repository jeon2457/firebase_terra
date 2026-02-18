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
    if (status !== "authenticated") return;
    const ensureTheme = async () => {
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
    router.replace("/login");
    return null;
  }

  return (
    <div className="wrap">
      <style>{`
        .wrap {
          min-height: 100vh;
          background: #f4f6f9;
          padding: 26px 14px 40px;
        }
        .container {
          max-width: 700px;
          margin: 0 auto;
          width: 100%;
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
        .icon-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px 18px;
          justify-items: center;
          margin-top: 40px;
          padding-top: 20px;
        }
        .icon-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          text-decoration: none !important;
          user-select: none;
        }
        .icon-box {
          width: 82px;
          height: 82px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 1.9rem;
          box-shadow: 0 18px 35px rgba(0,0,0,0.45);
        }
        .icon-label {
          color: #333;
          font-weight: 800;
          text-align: center;
          line-height: 1.25;
          text-decoration: none !important;
        }
        .icon-bg-tel { background: linear-gradient(180deg, #34AADC, #0076FF); }
        .icon-bg-view { background: linear-gradient(180deg, #4CD964, #28A745); }
        .icon-bg-edit { background: linear-gradient(180deg, #ef4444, #b91c1c); }
        .icon-bg-image { background: linear-gradient(180deg, #5856D6, #3F51B5); }
        .icon-bg-upload { background: linear-gradient(180deg, #3b82f6, #1d4ed8); }
        .icon-bg-card { background: linear-gradient(180deg, #14b8a6, #0f766e); }
        .icon-bg-financial { background: linear-gradient(180deg, #FFD700, #FFA000); color: #222; }
        .icon-bg-excel { background: linear-gradient(180deg, #1D6F42, #43A047); }

        @media (max-width: 768px) {
          .container { max-width: 100%; padding: 0 10px; }
          .icon-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
          .icon-box { width: 72px; height: 72px; font-size: 1.7rem; border-radius: 18px; }
          .icon-label { font-size: 12px; }
        }
        @media (max-width: 480px) {
          .container { padding: 0 5px; }
          .icon-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .icon-box { width: 64px; height: 64px; font-size: 1.6rem; border-radius: 16px; }
          .icon-label { font-size: 11px; }
        }
        @media (max-width: 380px) {
          .grid { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 12px 12px;
          }
          .icon { 
            width: 65px; 
            height: 65px; 
            font-size: 1.7rem;
            border-radius: 13px;
          }
          .label { font-size: 10px; min-height: 22px; }
        }
      `}</style>

      <div className="container">
        <div className="title">회원관리 메뉴판</div>
        <div className="info">
          👤 내 정보: <strong>{displayName}</strong> (Level {(session?.user as any)?.user_level || 0})
        </div>

        <div className="icon-grid">
          {/* 1. 연락망 보기 */}
          <Link href="/members/view" className="icon-item">
            <div className="icon-box icon-bg-tel"><i className="bi bi-people-fill" /></div>
            <div className="icon-label">연락망 보기</div>
          </Link>

          {/* 2. 사용내역 열람 */}
          <Link href="/account/view" className="icon-item">
            <div className="icon-box icon-bg-view"><i className="bi bi-eye" /></div>
            <div className="icon-label">사용내역 열람</div>
          </Link>

          {/* 3. 영수증 열람 */}
          <Link href="/receipt/view" className="icon-item">
            <div className="icon-box icon-bg-image"><i className="bi bi-image" /></div>
            <div className="icon-label">영수증 열람</div>
          </Link>

          {/* 4. 월회비 납부현황 (링크 없음/준비중) */}
          <div className="icon-item" onClick={() => alert("준비중입니다.")} role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") alert("준비중입니다."); }}>
            <div className="icon-box icon-bg-card"><i className="bi bi-credit-card" /></div>
            <div className="icon-label">월회비 납부현황</div>
          </div>

          {/* 5. 재무 대시보드 (준비중) */}
          <div className="icon-item" onClick={() => alert("준비중입니다.")} role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") alert("준비중입니다."); }}>
            <div className="icon-box icon-bg-financial"><i className="bi bi-pie-chart-fill" /></div>
            <div className="icon-label">재무 대시보드</div>
          </div>

          {/* 6. 엑셀 리포트 (준비중) */}
          <div className="icon-item" onClick={() => alert("준비중입니다.")} role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") alert("준비중입니다."); }}>
            <div className="icon-box icon-bg-excel"><i className="bi bi-file-earmark-excel-fill" /></div>
            <div className="icon-label">엑셀 리포트</div>
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
