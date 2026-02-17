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

    const Item = ({ href, icon, title, desc }: { href: string; icon: string; title: string; desc: string; }) => (
        <Link href={href} className="item">
            <div className="icon"><i className={`bi ${icon}`} /></div>
            <div className="text">
                <div className="t">{title}</div>
                <div className="d">{desc}</div>
            </div>
        </Link>
    );

    return (
        <div className="wrap">
            <style jsx>{`
        .wrap { min-height: 100vh; background: #f7f9fc; padding: 20px 14px 50px; }
        .container { max-width: 650px; margin: 0 auto; }
        .header { background: white; padding: 12px 20px; border-radius: 12px; display: flex; justify-content: center; align-items: center; gap: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 22px; }
        .list { display: flex; flex-direction: column; gap: 14px; }
        .item { 
          background: white; 
          border-radius: 15px; 
          padding: 20px 24px; 
          display: flex; 
          align-items: center; 
          gap: 18px; 
          cursor: pointer; 
          transition: all 0.2s ease; 
          border: 2px solid transparent; 
          box-shadow: 0 4px 6px rgba(0,0,0,0.03); 
          text-decoration: none; 
        }
        .item:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 6px 15px rgba(0,0,0,0.08); 
        }
        .icon { 
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
        .t { font-weight: 800; font-size: 1.05rem; color: #2c3e50; margin-bottom: 2px; }
        .d { font-size: 0.85rem; color: #8898aa; }
        .btn-exec { margin-top: 22px; width: 100%; padding: 14px 16px; border-radius: 30px; font-weight: 900; }

        @media (max-width: 480px) {
          .icon { width: 44px; height: 44px; font-size: 1.4rem; }
          .item { padding: 16px 18px; gap: 14px; }
          .t { font-size: 1rem; }
          .d { font-size: 0.8rem; }
        }
      `}</style>

            <div className="container">
                <div className="header">
                    👤 사용자: <strong>{displayName}</strong>
                </div>

                <div className="list">
                    <Item href="/members/view" icon="bi-people-fill" title="연락망 보기" desc="동기 연락처 정보 확인" />
                    <Item href="/account/view" icon="bi-eye" title="사용내역 열람" desc="모임 사용 내역 상세 보기" />
                    <Item href="/receipt/view" icon="bi-image" title="영수증 열람" desc="지출 영수증 사진 모아보기" />
                    <Item href="#" icon="bi-credit-card" title="회비 현황" desc="월회비 및 입금 현황 확인" />
                    <Item href="#" icon="bi-pie-chart-fill" title="재무 대시보드" desc="연도별 수입/지출 차트 분석" />
                    <Item href="#" icon="bi-file-earmark-excel-fill" title="엑셀 리포트" desc="회계장부 엑셀 다운로드" />
                </div>

                <button className="btn btn-primary btn-exec" onClick={() => signOut({ callbackUrl: "/login" })}>
                    로그아웃
                </button>
            </div>
        </div>
    );
}
