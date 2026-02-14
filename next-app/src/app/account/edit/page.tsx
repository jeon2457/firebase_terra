"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    ArrowLeft,
    Trash2,
    Edit,
    AlertCircle,
    ChevronDown,
    Save
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
                setIncomeData(res.data.income);
                setExpenseData(res.data.expense);
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

    const filteredIncome = incomeData.filter(item => parseInt(item.date.split('-')[1]) === currentMonth);
    const filteredExpense = expenseData.filter(item => parseInt(item.date.split('-')[1]) === currentMonth);

    const years = [0, 1, 2, 3].map(i => new Date().getFullYear() - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    if (status === "loading") return <div className="text-center mt-5">Loading...</div>;

    return (
        <div className="container py-4">
            <style jsx>{`
                .edit-table th, .edit-table td {
                    vertical-align: middle;
                    text-align: center;
                    font-size: 14px;
                }
                .amount-col { text-align: right !important; font-weight: bold; }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => router.push("/dashboard")}>
                    <ArrowLeft size={18} className="me-1" /> 돌아가기
                </button>
                <h3 className="m-0 fw-bold text-danger">⚙️ 사용내역서 편집</h3>
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

            <div className="text-center mb-4">
                <div className="d-flex flex-wrap justify-content-center gap-2">
                    {months.map(m => (
                        <button key={m}
                            className={`btn btn-sm px-3 rounded-pill ${m === currentMonth ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setCurrentMonth(m)}
                        >
                            {m}월
                        </button>
                    ))}
                </div>
            </div>

            <div className="alert alert-warning py-2 text-center small mb-4">
                <AlertCircle size={14} className="me-1" /> 데이터 삭제 시 복구가 불가능하므로 주의하세요!
            </div>

            {/* Income Table */}
            <h5 className="fw-bold mb-3 text-success border-start border-success border-4 ps-2">[수입 목록]</h5>
            <div className="table-responsive mb-5 border rounded shadow-sm">
                <table className="table edit-table table-hover m-0">
                    <thead className="table-light">
                        <tr>
                            <th>일자</th>
                            <th>항목</th>
                            <th>비고</th>
                            <th className="amount-col">금액</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredIncome.length === 0 ? (
                            <tr><td colSpan={5} className="py-4 text-muted">데이터가 없습니다.</td></tr>
                        ) : filteredIncome.map((tr, idx) => (
                            <tr key={tr._id}>
                                <td>{tr.date.split(' ')[0]}</td>
                                <td>{tr.category}</td>
                                <td className="text-start">{tr.description}</td>
                                <td className="amount-col text-primary">{tr.amount.toLocaleString()}원</td>
                                <td>
                                    <button className="btn btn-sm btn-primary me-1"
                                        onClick={() => router.push(`/account/edit/${tr._id}?type=수입`)}>
                                        <Edit size={14} /> 수정
                                    </button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(tr._id, "수입")}>
                                        <Trash2 size={14} /> 삭제
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Expense Table */}
            <h5 className="fw-bold mb-3 text-danger border-start border-danger border-4 ps-2">[지출 목록]</h5>
            <div className="table-responsive mb-5 border rounded shadow-sm">
                <table className="table edit-table table-hover m-0">
                    <thead className="table-light">
                        <tr>
                            <th>일자</th>
                            <th>항목</th>
                            <th>비고</th>
                            <th className="amount-col">금액</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpense.length === 0 ? (
                            <tr><td colSpan={5} className="py-4 text-muted">데이터가 없습니다.</td></tr>
                        ) : filteredExpense.map((tr, idx) => (
                            <tr key={tr._id}>
                                <td>{tr.date.split(' ')[0]}</td>
                                <td>{tr.category}</td>
                                <td className="text-start">{tr.description}</td>
                                <td className="amount-col text-danger">{tr.amount.toLocaleString()}원</td>
                                <td>
                                    <button className="btn btn-sm btn-primary me-1"
                                        onClick={() => router.push(`/account/edit/${tr._id}?type=지출`)}>
                                        <Edit size={14} /> 수정
                                    </button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(tr._id, "지출")}>
                                        <Trash2 size={14} /> 삭제
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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
