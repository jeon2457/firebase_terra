"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";

type ThemeValue = "book" | "icon" | "glass" | "list" | "tech";

export default function ThemePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [currentTheme, setCurrentTheme] = useState<ThemeValue>("book");
    const [selectedTheme, setSelectedTheme] = useState<ThemeValue>("book");
    const [saving, setSaving] = useState(false);

    const isAdmin = useMemo(() => {
        const level = (session?.user as any)?.user_level;
        return typeof level === "number" && level >= 10;
    }, [session]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        const load = async () => {
            if (status !== "authenticated") return;
            if (!isAdmin) {
                router.push("/dashboard");
                return;
            }

            try {
                const res = await fetch("/api/theme", { method: "GET" });
                const data = await res.json();
                if (data?.success && data?.theme) {
                    setCurrentTheme(data.theme);
                    setSelectedTheme(data.theme);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [status, isAdmin, router]);

    const applyThemeToAll = async () => {
        if (!confirm("모든 회원의 메뉴 디자인이 변경됩니다.\n진행하시겠습니까?")) return;

        setSaving(true);
        try {
            const res = await fetch("/api/theme", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ theme: selectedTheme })
            });
            const data = await res.json();
            if (!res.ok || !data?.success) {
                alert(data?.message || "테마 저장 중 오류가 발생했습니다.");
                return;
            }
            setCurrentTheme(selectedTheme);
            alert("테마가 전체 적용되었습니다.");
            router.push("/dashboard");
        } catch {
            alert("테마 저장 중 오류가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    if (status === "loading" || loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    if (!session) return null;

    return (
        <div className="container" style={{ maxWidth: 650, paddingTop: 30, paddingBottom: 40 }}>
            <style jsx>{`
        .title-area {
          text-align: center;
          margin-bottom: 28px;
        }
        .theme-card {
          background: white;
          border-radius: 20px;
          padding: 18px 18px;
          margin-bottom: 14px;
          cursor: pointer;
          border: 2px solid transparent;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 16px;
          user-select: none;
        }
        .theme-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.10);
        }
        .theme-card.active {
          border-color: #0d6efd;
          background-color: #e7f1ff;
        }
        .theme-icon {
          width: 60px;
          text-align: center;
          font-size: 32px;
        }
        .theme-info h5 {
          margin: 0 0 6px 0;
          font-weight: 800;
          color: #333;
        }
        .theme-info p {
          margin: 0;
          font-size: 0.9rem;
          color: #666;
        }
      `}</style>

            <div className="title-area">
                <h2 style={{ fontWeight: 900, marginBottom: 6 }}>디자인 테마 설정</h2>
                <div className="text-muted" style={{ fontSize: 14 }}>
                    관리자가 선택한 디자인이 <strong>모든 회원</strong>에게 적용됩니다.
                </div>
            </div>

            <div
                className={`theme-card ${selectedTheme === "book" ? "active" : ""}`}
                onClick={() => setSelectedTheme("book")}
            >
                <div className="theme-icon" style={{ color: "#0d6efd" }}>📚</div>
                <div className="theme-info">
                    <h5>책장형 (Bookshelf)</h5>
                    <p>클래식하고 깔끔한 도서관 스타일 디자인</p>
                </div>
            </div>

            <div
                className={`theme-card ${selectedTheme === "icon" ? "active" : ""}`}
                onClick={() => setSelectedTheme("icon")}
            >
                <div className="theme-icon" style={{ color: "#198754" }}>🟩</div>
                <div className="theme-info">
                    <h5>아이콘형 (App Grid)</h5>
                    <p>아이폰 스타일의 컬러풀한 앱 아이콘 디자인</p>
                </div>
            </div>

            <div
                className={`theme-card ${selectedTheme === "glass" ? "active" : ""}`}
                onClick={() => setSelectedTheme("glass")}
            >
                <div className="theme-icon" style={{ color: "#0dcaf0" }}>🪐</div>
                <div className="theme-info">
                    <h5>글래스형 (Space Glass)</h5>
                    <p>우주 배경의 생동감 넘치는 글래스모피즘 디자인</p>
                </div>
            </div>

            <div
                className={`theme-card ${selectedTheme === "list" ? "active" : ""}`}
                onClick={() => setSelectedTheme("list")}
            >
                <div className="theme-icon" style={{ color: "#fd7e14" }}>📄</div>
                <div className="theme-info">
                    <h5>목록형 (Classic List)</h5>
                    <p>가장 표준적이고 직관적인 리스트 스타일</p>
                </div>
            </div>

            <div
                className={`theme-card ${selectedTheme === "tech" ? "active" : ""}`}
                onClick={() => setSelectedTheme("tech")}
            >
                <div className="theme-icon" style={{ color: "#0f172a" }}>🖥️</div>
                <div className="theme-info">
                    <h5>모던 테크형 (Modern Tech)</h5>
                    <p>어두운 배경의 전문가용 대시보드 스타일</p>
                </div>
            </div>

            <button
                className="btn btn-primary w-100"
                style={{ padding: "14px 16px", fontWeight: 800, borderRadius: 12, marginTop: 18 }}
                onClick={applyThemeToAll}
                disabled={saving}
            >
                선택한 테마로 전체 적용하기
            </button>

            <button
                className="btn btn-outline-secondary w-100"
                style={{ padding: "14px 16px", fontWeight: 800, borderRadius: 12, marginTop: 10 }}
                onClick={() => router.push("/dashboard")}
                disabled={saving}
            >
                취소하고 돌아가기
            </button>

            <div className="text-center text-muted" style={{ marginTop: 14, fontSize: 13 }}>
                현재 적용된 테마: <strong>{currentTheme}</strong>
            </div>
        </div>
    );
}
