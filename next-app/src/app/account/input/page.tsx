"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ArrowLeft, Save, LogOut, Info } from "lucide-react";
import axios from "axios";

export default function AccountInputPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: "",
        time: "00:00",
        type: "지출",
        category: "",
        description: "",
        amount: ""
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            setFormData(prev => ({
                ...prev,
                date: `${year}-${month}-${day}`,
                time: `${hours}:${minutes}`
            }));
        }
    }, [status, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.date || !formData.amount || !formData.category) {
            alert("필수 항목을 모두 입력해주세요.");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post("/api/financial", formData);
            if (res.data.success) {
                alert("✨ 데이터 전송이 완료되었습니다!");
                // Clear unimportant fields
                setFormData(prev => ({
                    ...prev,
                    category: "",
                    description: "",
                    amount: ""
                }));
            }
        } catch (error: any) {
            alert("저장 실패: " + (error.response?.data?.message || "서버 오류"));
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") return <div className="text-center mt-5">Loading...</div>;

    return (
        <div className="container-fluid py-4" style={{ background: "#e0e5ec", minHeight: "100vh" }}>
            <style jsx>{`
                .neumorphic-box {
                    background: #e0e5ec;
                    border-radius: 30px;
                    box-shadow: 15px 15px 30px #a3b1c6, -15px -15px 30px #ffffff;
                    padding: 40px;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .section-title {
                    text-align: center;
                    color: #4A90E2;
                    font-weight: 700;
                    margin-bottom: 35px;
                    padding: 15px;
                    background: #e0e5ec;
                    border-radius: 15px;
                    box-shadow: inset 6px 6px 12px #a3b1c6, inset -6px -6px 12px #ffffff;
                    font-size: 24px;
                }
                .form-group label {
                    font-weight: 700;
                    color: #555;
                    margin-bottom: 10px;
                    display: block;
                    padding-left: 10px;
                }
                .form-control, .form-select {
                    width: 100%;
                    border: none;
                    padding: 15px 20px;
                    font-size: 16px;
                    border-radius: 15px;
                    background: #e0e5ec;
                    box-shadow: 5px 5px 10px #a3b1c6, -5px -5px 10px #ffffff;
                    outline: none;
                    color: #333;
                    transition: all 0.3s ease;
                    margin-bottom: 20px;
                }
                .form-control:focus, .form-select:focus {
                    box-shadow: inset 5px 5px 10px #a3b1c6, inset -5px -5px 10px #ffffff;
                    color: #4A90E2;
                }
                .info-box {
                    margin: 30px 0;
                    padding: 18px;
                    background: #e0e5ec;
                    box-shadow: inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff;
                    border-radius: 15px;
                    font-size: 14px;
                    line-height: 1.6;
                    color: #666;
                }
                .btn-submit {
                    width: 100%;
                    padding: 18px;
                    border-radius: 15px;
                    font-size: 18px;
                    font-weight: bold;
                    border: none;
                    background: #4A90E2;
                    color: #fff;
                    box-shadow: 6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff;
                    transition: all 0.2s;
                }
                .btn-submit:active {
                    box-shadow: inset 6px 6px 12px #3a72b3, inset -6px -6px 12px #5aaeff;
                    transform: scale(0.98);
                }
                .btn-back {
                    display: block;
                    text-align: center;
                    width: 100%;
                    padding: 15px;
                    margin-top: 15px;
                    border-radius: 15px;
                    color: #777;
                    text-decoration: none;
                    font-weight: bold;
                    box-shadow: 6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff;
                }
                .btn-back:hover { color: #4A90E2; }
                .user-info {
                    max-width: 600px;
                    margin: 0 auto 20px;
                    padding: 15px 25px;
                    background: #e0e5ec;
                    border-radius: 15px;
                    box-shadow: 6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
            `}</style>

            <div className="user-info">
                <span>👤 {(session?.user as any).name} 관리자</span>
                <button className="btn btn-link link-danger p-0 fw-bold text-decoration-none" onClick={() => router.push("/logout")}>
                    <LogOut size={18} className="me-1" /> 로그아웃
                </button>
            </div>

            <div className="neumorphic-box">
                <h1 className="section-title">📊 사용내역서 입력</h1>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>📅 날짜</label>
                        <input type="date" name="date" className="form-control" required
                            value={formData.date} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>🕐 시간</label>
                        <input type="time" name="time" className="form-control" required
                            value={formData.time} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>📈 유형 (Type)</label>
                        <select name="type" className="form-select" required
                            value={formData.type} onChange={handleChange}>
                            <option value="지출">💸 지출</option>
                            <option value="수입">💰 수입(월회비)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>📂 항목</label>
                        <input type="text" name="category" className="form-control" required
                            placeholder="예: 월회비, 회식비, 식사비 등"
                            value={formData.category} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>📝 상세 내용 (비고)</label>
                        <input type="text" name="description" className="form-control"
                            placeholder="상세 설명을 입력하세요"
                            value={formData.description} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>💵 금액 (원)</label>
                        <input type="number" name="amount" className="form-control" required
                            placeholder="숫자만 입력하세요"
                            value={formData.amount} onChange={handleChange} />
                    </div>

                    <div className="info-box">
                        <Info size={18} className="me-2 text-primary" />
                        <strong>안내:</strong><br />
                        모임 사용내역서 작성은 실시간으로 반영됩니다.
                        상세 내용은 나중에 편집 페이지에서 수정 가능합니다.
                    </div>

                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? "저장 중..." : "저장하기"}
                    </button>

                    <button type="button" className="btn-back" onClick={() => router.push("/dashboard")}>
                        <ArrowLeft size={18} className="me-1" /> 돌아가기
                    </button>
                </form>
            </div>
        </div>
    );
}
