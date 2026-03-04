"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

type ThemeValue = "book" | "icon" | "glass" | "list" | "tech";

function ApplyThemeContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedTheme = searchParams.get("theme") as ThemeValue;

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
        if (!selectedTheme) {
            router.push("/theme");
        }
        document.title = "테마 적용 범위 선택";
    }, [status, router, selectedTheme]);

    const handleApply = async (mode: "admin" | "all") => {
        const confirmMsg = mode === "admin"
            ? "관리자(마스터) 모드에만 테마를 적용하시겠습니까?"
            : "모든 회원(게스트 모드 포함)에게 테마를 적용하시겠습니까?";

        if (!confirm(confirmMsg)) return;

        setSaving(true);
        try {
            const res = await fetch("/api/theme", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ theme: selectedTheme, mode })
            });
            const data = await res.json();
            if (!res.ok || !data?.success) {
                alert(data?.message || "테마 저장 중 오류가 발생했습니다.");
                return;
            }
            alert(mode === "admin" ? "관리자 모드에 테마가 적용되었습니다." : "전체 적용이 완료되었습니다.");
            router.push("/dashboard");
        } catch {
            alert("테마 저장 중 오류가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    if (status === "loading") {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <div className="container" style={{ maxWidth: 600, paddingTop: 60, paddingBottom: 40 }}>
            <style>{`
                .apply-container {
                    background: white;
                    border-radius: 30px;
                    padding: 40px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.08);
                    text-align: center;
                }
                .option-card {
                    padding: 24px;
                    border-radius: 20px;
                    border: 2px solid #f0f0f0;
                    margin-bottom: 20px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: left;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .option-card:hover {
                    border-color: #0d6efd;
                    background: #f8fbff;
                    transform: translateY(-2px);
                }
                .option-icon {
                    font-size: 32px;
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f0f4f9;
                    border-radius: 15px;
                }
                .option-info h5 {
                    margin: 0 0 4px 0;
                    font-weight: 800;
                }
                .option-info p {
                    margin: 0;
                    font-size: 0.9rem;
                    color: #666;
                }
                .theme-preview {
                    display: inline-block;
                    padding: 4px 12px;
                    background: #e7f1ff;
                    color: #0d6efd;
                    border-radius: 20px;
                    font-weight: 700;
                    font-size: 0.85rem;
                    margin-bottom: 20px;
                }
                .back-link {
                    margin-top: 20px;
                    color: #888;
                    cursor: pointer;
                    text-decoration: underline;
                    font-size: 0.9rem;
                }
            `}</style>

            <div className="apply-container">
                <div className="theme-preview">선택된 테마: {selectedTheme}</div>
                <h2 style={{ fontWeight: 900, marginBottom: 10 }}>적용 범위를 선택해주세요</h2>
                <p className="text-muted mb-5">디자인을 어디까지 적용할지 한 번 더 확인합니다.</p>

                <div className="option-card" onClick={() => !saving && handleApply("admin")}>
                    <div className="option-icon">👑</div>
                    <div className="option-info">
                        <h5>마스터 모드에만 적용</h5>
                        <p>관리자 계정의 대시보드 디자인만 변경합니다.</p>
                    </div>
                </div>

                <div className="option-card" onClick={() => !saving && handleApply("all")}>
                    <div className="option-icon">🌐</div>
                    <div className="option-info">
                        <h5>게스트 모드 포함 전체 적용</h5>
                        <p>모든 회원의 대시보드 디자인을 즉시 변경합니다.</p>
                    </div>
                </div>

                {saving && (
                    <div className="mt-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 fw-bold">테마 적용 중...</p>
                    </div>
                )}

                {!saving && (
                    <div className="back-link" onClick={() => router.back()}>
                        이전 단계로 돌아가기
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ApplyPage() {
    return (
        <Suspense fallback={<div className="text-center mt-5">Loading...</div>}>
            <ApplyThemeContent />
        </Suspense>
    );
}
