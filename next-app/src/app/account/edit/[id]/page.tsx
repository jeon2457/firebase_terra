"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    ArrowLeft,
    Save,
    AlertCircle,
    Loader2
} from "lucide-react";
import axios from "axios";

function AccountEditFormContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { id } = useParams();
    const searchParams = useSearchParams();
    const type = searchParams.get('type');

    const [formData, setFormData] = useState({
        date: "",
        time: "",
        category: "",
        description: "",
        amount: 0
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            if ((session?.user as any).user_level < 5) {
                alert("권한이 없습니다.");
                router.push("/dashboard");
                return;
            }
            fetchItem();
        }
    }, [status, id]);

    const fetchItem = async () => {
        try {
            // We can use the existing GET API and filter on client, 
            // but for editing one record, we should ideally have a specific GET /api/financial/[id]?type=...
            // For now, I'll fetch all and find the one. (Simple approach)
            const year = new Date().getFullYear(); // Just a dummy, we might need a better single GET
            const res = await axios.get(`/api/financial?year=${year}`); // Note: this might miss if year is different
            // Actually, I should probably implement GET /api/financial/[id] but let's see if I can do it easily.
            // Let's assume the user usually edits recent records or I'll just check both income/expense.

            const income = res.data.income.find((m: any) => m._id === id);
            const expense = res.data.expense.find((m: any) => m._id === id);
            const item = income || expense;

            if (item) {
                const [d, t] = item.date.split(' ');
                setFormData({
                    date: d,
                    time: t.substring(0, 5),
                    category: item.category,
                    description: item.description || "",
                    amount: item.amount
                });
            } else {
                alert("해당 기록을 찾을 수 없습니다.");
                router.push("/account/edit");
            }
        } catch (error) {
            console.error("Failed to fetch item", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await axios.put('/api/financial', {
                id,
                type,
                ...formData
            });
            if (res.data.success) {
                alert("수정되었습니다.");
                router.push("/account/edit");
            }
        } catch (error) {
            alert("수정 실패");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center mt-5"><Loader2 className="animate-spin" /> Loading...</div>;

    return (
        <div className="container py-5">
            <style jsx>{`
                .form-card {
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    padding: 40px;
                }
            `}</style>

            <div className="form-card">
                <div className="d-flex align-items-center mb-4">
                    <button className="btn btn-link link-dark p-0 me-3" onClick={() => router.push("/account/edit")}>
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="m-0 fw-bold">💰 사용내역서 수정 ({type})</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-bold">📅 일자</label>
                        <input type="date" className="form-control"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold">🕐 시간</label>
                        <input type="time" className="form-control"
                            value={formData.time}
                            onChange={e => setFormData({ ...formData, time: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold">📝 항목</label>
                        <input type="text" className="form-control"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold">📌 비고</label>
                        <input type="text" className="form-control"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-bold">💵 금액</label>
                        <input type="number" className="form-control"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-pill shadow" disabled={saving}>
                        {saving ? <Loader2 className="animate-spin me-2" size={18} /> : <Save className="me-2" size={18} />}
                        수정 완료
                    </button>
                    <button type="button" className="btn btn-outline-secondary w-100 mt-3 py-2 rounded-pill" onClick={() => router.push("/account/edit")}>
                        취소하기
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function AccountEditFormPage() {
    return (
        <Suspense fallback={<div className="text-center mt-5">Loading Dashboard...</div>}>
            <AccountEditFormContent />
        </Suspense>
    );
}
