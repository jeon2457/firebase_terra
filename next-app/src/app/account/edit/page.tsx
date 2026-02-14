"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import {
    ArrowLeft,
    Trash2,
    Edit,
    AlertCircle
} from "lucide-react";
import axios from "axios";

function AccountEditContent() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [incomeData, setIncomeData] = useState<any[]>([]);
    const [expenseData, setExpenseData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [mounted, setMounted] = useState(false);
    const [modalData, setModalData] = useState<any | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Auth check
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            if ((session?.user as any).user_level < 5) {
                alert("권한이 없습니다.");
                router.push("/dashboard");
                return;
            }
            fetchData();
        }
    }, [status, currentYear]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/financial?year=${currentYear}`);
            if (res.data.success) {
                setIncomeData(res.data.income || []);
                setExpenseData(res.data.expense || []);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, type: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        try {
            const res = await axios.delete(`/api/financial?id=${id}&type=${type}`);
            if (res.data.success) {
                alert("삭제되었습니다.");
                fetchData();
            }
        } catch (error) {
            alert("삭제 실패");
        }
    };

    const openModal = (item: any) => setModalData(item);
    const closeModal = () => setModalData(null);

    // Filter data safely
    const filteredIncome = incomeData.filter(item => {
        if (!item.date) return false;
        const monthPart = item.date.split('-')[1];
        return monthPart && parseInt(monthPart) === currentMonth;
    });

    const filteredExpense = expenseData.filter(item => {
        if (!item.date) return false;
        const monthPart = item.date.split('-')[1];
        return monthPart && parseInt(monthPart) === currentMonth;
    });

    const years = [0, 1, 2, 3].map(i => new Date().getFullYear() - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    // Safe formatting helpers
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        const parts = dateStr.split(' ');
        if (parts.length > 0 && parts[0].length >= 5) {
            return parts[0].substring(5); // "MM-DD"
        }
        return dateStr;
    }

    const formatAmount = (val: any) => {
        if (typeof val === 'number') return val.toLocaleString();
        return val || "0";
    }

    if (!mounted) return <div className="text-center mt-5">Loading...</div>;
    if (status === "loading") return <div className="text-center mt-5">Loading...</div>;

    // Truncate style helper
    const truncateStyle = {
        maxWidth: "100px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        cursor: "pointer"
    } as React.CSSProperties;

    return (
        <div className="container py-3" style={{ maxWidth: '800px' }}>
            <style jsx>{`
                .edit-table th, .edit-table td {
                    vertical-align: middle;
                    text-align: center;
                    font-size: 13px; /* Reduced font size */
                    padding: 8px 4px; /* Reduced padding */
                }
                .edit-table th {
                    white-space: nowrap; /* Prevent wrapping for headers */
                    background-color: #f8f9fa;
                }
                .amount-col {
                    text-align: right !important;
                    font-weight: bold;
                    white-space: nowrap;
                }
                .mobile-month-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 5px;
                }
                @media (max-width: 576px) {
                    .mobile-month-grid {
                        grid-template-columns: repeat(6, 1fr);
                    }
                    .edit-table th, .edit-table td {
                        font-size: 11px;
                        padding: 6px 2px;
                    }
                    .btn-action {
                        padding: 2px 4px; 
                        font-size: 10px;
                    }
                }
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); z-index: 1050;
                    display: flex; align-items: center; justify-content: center;
                }
                .modal-content-box {
                    background: white; padding: 20px; border-radius: 10px;
                    width: 90%; max-width: 400px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                <h4 className="m-0 fw-bold text-danger">⚙️ 사용내역서 편집</h4>
                <div className="dropdown">
                    <button className="btn btn-dark btn-sm dropdown-toggle rounded-pill px-3" data-bs-toggle="dropdown">
                        {currentYear}년
                    </button>
                    <ul className="dropdown-menu">
                        {years.map(y => (
                            <li key={y}><button className="dropdown-item" onClick={() => setCurrentYear(y)}>{y}년</button></li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Month Selector */}
            <div className="mb-4">
                <div className="mobile-month-grid">
                    {months.map(m => (
                        <button key={m}
                            className={`btn btn-sm ${m === currentMonth ? 'btn-primary' : 'btn-outline-secondary'}`}
                            style={{ padding: '6px 0', fontSize: '12px' }}
                            onClick={() => setCurrentMonth(m)}
                        >
                            {m}월
                        </button>
                    ))}
                </div>
            </div>

            <div className="alert alert-warning py-2 text-center small mb-4">
                <AlertCircle size={14} className="me-1" /> 삭제 시 복구 불가! 상세내용은 클릭해서 확인.
            </div>

            {/* Income Table */}
            <h6 className="fw-bold mb-2 text-success border-start border-success border-3 ps-2">[수입 목록]</h6>
            <div className="table-responsive mb-4 border rounded shadow-sm">
                <table className="table edit-table table-hover m-0">
                    <thead>
                        <tr>
                            <th style={{ width: '15%' }}>일자</th>
                            <th style={{ width: '20%' }}>항목</th>
                            <th style={{ width: '30%' }}>비고</th>
                            <th className="amount-col" style={{ width: '20%' }}>금액</th>
                            <th style={{ width: '15%' }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredIncome.length === 0 ? (
                            <tr><td colSpan={5} className="py-3 text-muted">데이터가 없습니다.</td></tr>
                        ) : filteredIncome.map((tr) => (
                            <tr key={tr._id} onClick={() => openModal(tr)}>
                                <td>{formatDate(tr.date)}</td>
                                <td><div style={truncateStyle}>{tr.category}</div></td>
                                <td><div style={truncateStyle}>{tr.description}</div></td>
                                <td className="amount-col text-primary">{formatAmount(tr.amount)}</td>
                                <td onClick={(e) => e.stopPropagation()}>
                                    <div className="d-flex gap-1 justify-content-center">
                                        <button className="btn btn-primary btn-sm btn-action p-1"
                                            onClick={() => router.push(`/account/edit/${tr._id}?type=수입`)}>
                                            <Edit size={12} />
                                        </button>
                                        <button className="btn btn-danger btn-sm btn-action p-1"
                                            onClick={() => handleDelete(tr._id, "수입")}>
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Expense Table */}
            <h6 className="fw-bold mb-2 text-danger border-start border-danger border-3 ps-2">[지출 목록]</h6>
            <div className="table-responsive mb-4 border rounded shadow-sm">
                <table className="table edit-table table-hover m-0">
                    <thead>
                        <tr>
                            <th style={{ width: '15%' }}>일자</th>
                            <th style={{ width: '20%' }}>항목</th>
                            <th style={{ width: '30%' }}>비고</th>
                            <th className="amount-col" style={{ width: '20%' }}>금액</th>
                            <th style={{ width: '15%' }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpense.length === 0 ? (
                            <tr><td colSpan={5} className="py-3 text-muted">데이터가 없습니다.</td></tr>
                        ) : filteredExpense.map((tr) => (
                            <tr key={tr._id} onClick={() => openModal(tr)}>
                                <td>{formatDate(tr.date)}</td>
                                <td><div style={truncateStyle}>{tr.category}</div></td>
                                <td><div style={truncateStyle}>{tr.description}</div></td>
                                <td className="amount-col text-danger">{formatAmount(tr.amount)}</td>
                                <td onClick={(e) => e.stopPropagation()}>
                                    <div className="d-flex gap-1 justify-content-center">
                                        <button className="btn btn-primary btn-sm btn-action p-1"
                                            onClick={() => router.push(`/account/edit/${tr._id}?type=지출`)}>
                                            <Edit size={12} />
                                        </button>
                                        <button className="btn btn-danger btn-sm btn-action p-1"
                                            onClick={() => handleDelete(tr._id, "지출")}>
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bottom Back Button */}
            <div className="mt-4 mb-5 pb-5">
                <button className="btn btn-secondary w-100 py-2 fw-bold" onClick={() => router.push("/dashboard")}>
                    <ArrowLeft size={18} className="me-2" /> 돌아가기
                </button>
            </div>

            {/* Detail Modal */}
            {modalData && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
                        <h5 className="fw-bold mb-3 border-bottom pb-2">상세 내용</h5>
                        <div className="mb-2"><strong>일자:</strong> {modalData.date}</div>
                        <div className="mb-2"><strong>항목:</strong> {modalData.category}</div>
                        <div className="mb-2"><strong>금액:</strong> {formatAmount(modalData.amount)}원</div>
                        <div className="mb-3 p-2 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>
                            <strong>비고:</strong><br />
                            {modalData.description}
                        </div>
                        <div className="text-end">
                            <button className="btn btn-secondary btn-sm" onClick={closeModal}>닫기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AccountEditPage() {
    return (
        <Suspense fallback={<div className="text-center mt-5">Loading Dashboard...</div>}>
            <AccountEditContent />
        </Suspense>
    );
}
