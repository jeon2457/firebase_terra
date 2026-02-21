"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Info,
    Calculator as CalcIcon
} from "lucide-react";
import axios from "axios";

function AccountViewContent() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [incomeData, setIncomeData] = useState<any[]>([]);
    const [expenseData, setExpenseData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [mounted, setMounted] = useState(false);
    const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

    // Calculator state
    const [calcDisplay, setCalcDisplay] = useState("0");
    const [calcRaw, setCalcRaw] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (yearDropdownOpen) {
                const dropdown = document.querySelector('.year-dropdown-container');
                if (dropdown && !dropdown.contains(event.target as Node)) {
                    setYearDropdownOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [yearDropdownOpen]);

    useEffect(() => {
        if (status !== "loading") {
            fetchData();
        }
        document.title = "사용내역 열람";
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

    // Filter and calculate totals
    const filteredIncome = incomeData.filter(item => {
        if (!item.date) return false;
        const m = parseInt(item.date.split('-')[1]);
        return m === currentMonth;
    });
    const filteredExpense = expenseData.filter(item => {
        if (!item.date) return false;
        const m = parseInt(item.date.split('-')[1]);
        return m === currentMonth;
    });

    const monthIncomeTotal = filteredIncome.reduce((sum, item) => sum + item.amount, 0);
    const monthExpenseTotal = filteredExpense.reduce((sum, item) => sum + item.amount, 0);

    const cumulativeIncome = incomeData
        .filter(item => item.date && parseInt(item.date.split('-')[1]) <= currentMonth)
        .reduce((sum, item) => sum + item.amount, 0);
    const cumulativeExpense = expenseData
        .filter(item => item.date && parseInt(item.date.split('-')[1]) <= currentMonth)
        .reduce((sum, item) => sum + item.amount, 0);

    const monthlyBalance = monthIncomeTotal - monthExpenseTotal;
    const totalBalance = cumulativeIncome - cumulativeExpense;

    // Calculator Logic
    const formatNumber = (num: number) => new Intl.NumberFormat('ko-KR').format(num);
    const handleCalc = (val: string) => {
        if (val === 'C') {
            setCalcRaw("");
            setCalcDisplay("0");
        } else if (val === '=') {
            try {
                // eslint-disable-next-line no-eval
                const result = eval(calcRaw);
                setCalcDisplay(formatNumber(result));
                setCalcRaw(result.toString());
            } catch {
                setCalcDisplay("Error");
            }
        } else {
            const newRaw = calcRaw + val;
            setCalcRaw(newRaw);
            setCalcDisplay(newRaw);
        }
    };

    // 5년 전부터 현재까지의 년도 생성, 그리고 다음 해까지 포함
    const currentDate = new Date();
    const currentYearValue = currentDate.getFullYear();
    const years = [];

    // 5년 전부터 현재까지
    for (let i = 5; i >= 0; i--) {
        years.push(currentYearValue - i);
    }

    // 12월 1일 이후에만 다음 해 자동 추가
    if (currentDate.getMonth() === 11 && currentDate.getDate() >= 1) {
        years.push(currentYearValue + 1);
    }

    // 중복 제거 및 정렬
    const uniqueYears = [...new Set(years)].sort((a, b) => a - b);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    if (!mounted) return <div className="text-center mt-5">Loading...</div>;
    if (status === "loading") return <div className="text-center mt-5">Loading...</div>;

    return (
        <div className="container-fluid py-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
            <div className="max-w-4xl mx-auto bg-white rounded-3 shadow-sm p-3" style={{ maxWidth: '800px' }}>
                <style jsx>{`
                    .view-table th, .view-table td {
                        vertical-align: middle;
                        text-align: center;
                        font-size: 13px; /* Reduced font size */
                        padding: 8px 4px; /* Reduced padding */
                    }
                    .view-table th {
                        white-space: nowrap;
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
                        .view-table th, .view-table td {
                        font-size: 11px;
                        padding: 6px 2px;
                    }
                    .year-dropdown-btn {
                         font-size: 0.63rem !important; /* 30% 더 축소 */
                         padding: 0.35rem 0.7rem !important; /* 30% 더 축소 */
                     }
                    }
                `}</style>

                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                    <h4 className="m-0 fw-bold text-primary">📊 사용내역서 보기</h4>
                    <div className="position-relative year-dropdown-container">
                        <button className="btn btn-primary dropdown-toggle rounded-pill px-3 shadow-sm year-dropdown-btn"
                            onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                            style={{ fontWeight: '600' }}>
                            📅 {currentYear}년
                        </button>
                        {yearDropdownOpen && (
                            <div className="dropdown-menu show position-absolute end-0 mt-1 shadow"
                                style={{ maxHeight: '250px', overflowY: 'auto', minWidth: '120px' }}>
                                {uniqueYears.map(y => (
                                    <button key={y}
                                        className={`dropdown-item ${y === currentYear ? 'active' : ''}`}
                                        onClick={() => {
                                            setCurrentYear(y);
                                            setYearDropdownOpen(false);
                                        }}
                                        style={{ fontWeight: y === currentYear ? '600' : 'normal', fontSize: '0.9rem' }}>
                                        {y}년 {y === new Date().getFullYear() ? '(현재)' : ''} {y === new Date().getFullYear() + 1 ? '(다음해)' : ''}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

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

                <div className="alert alert-info py-2 text-center small mb-4">
                    <Info size={14} className="me-1" /> 합계가 이상하면 월 버튼을 다시 눌러 갱신하세요!
                </div>

                {/* Income Table */}
                <h6 className="fw-bold mt-4 mb-2 d-flex align-items-center text-success border-start border-success border-3 ps-2">
                    <TrendingUp size={18} className="me-2" /> [수입 목록]
                </h6>
                <div className="table-responsive mb-4 shadow-sm rounded border">
                    <table className="table view-table table-hover m-0">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: '10%' }}>NO</th>
                                <th style={{ width: '25%' }}>일자</th>
                                <th style={{ width: '35%' }}>항목</th>
                                <th className="text-end" style={{ width: '30%' }}>금액</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredIncome.length === 0 ? (
                                <tr><td colSpan={4} className="text-center text-muted py-3">데이터가 없습니다.</td></tr>
                            ) : filteredIncome.map((tr, idx) => (
                                <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td>{tr.date ? tr.date.split(' ')[0] : '-'}</td>
                                    <td>{tr.category}</td>
                                    <td className="text-end fw-bold">{formatNumber(tr.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="table-light fw-bold">
                            <tr>
                                <td colSpan={3} className="text-end">월수입 합계:</td>
                                <td className="text-end text-primary">{formatNumber(monthIncomeTotal)}</td>
                            </tr>
                            <tr>
                                <td colSpan={3} className="text-end">월수입 누계(1~{currentMonth}월):</td>
                                <td className="text-end text-primary">{formatNumber(cumulativeIncome)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Expense Table */}
                <h6 className="fw-bold mt-4 mb-2 d-flex align-items-center text-danger border-start border-danger border-3 ps-2">
                    <TrendingDown size={18} className="me-2" /> [지출 목록]
                </h6>
                <div className="table-responsive mb-4 shadow-sm rounded border">
                    <table className="table view-table table-hover m-0">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: '10%' }}>NO</th>
                                <th style={{ width: '25%' }}>일자</th>
                                <th style={{ width: '35%' }}>항목</th>
                                <th className="text-end" style={{ width: '30%' }}>금액</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpense.length === 0 ? (
                                <tr><td colSpan={4} className="text-center text-muted py-3">데이터가 없습니다.</td></tr>
                            ) : filteredExpense.map((tr, idx) => (
                                <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td>{tr.date ? tr.date.split(' ')[0] : '-'}</td>
                                    <td>{tr.category}</td>
                                    <td className="text-end fw-bold">{formatNumber(tr.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="table-light fw-bold">
                            <tr>
                                <td colSpan={3} className="text-end">월지출 합계:</td>
                                <td className="text-end text-primary">{formatNumber(monthExpenseTotal)}</td>
                            </tr>
                            <tr>
                                <td colSpan={3} className="text-end">월지출 누계(1~{currentMonth}월):</td>
                                <td className="text-end text-primary">{formatNumber(cumulativeExpense)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Balance Box */}
                <div className="row g-4 mb-5">
                    <div className="col-6 text-center">
                        <div className="p-3 rounded-4 bg-light border-start border-primary border-5 shadow-sm">
                            <div className="text-muted small mb-1">월결산액</div>
                            <h5 className={`fw-bold m-0 ${monthlyBalance >= 0 ? 'text-primary' : 'text-danger'}`}>
                                {formatNumber(monthlyBalance)}
                            </h5>
                        </div>
                    </div>
                    <div className="col-6 text-center">
                        <div className="p-3 rounded-4 bg-light border-start border-danger border-5 shadow-sm">
                            <div className="text-muted small mb-1">총잔액 ({currentMonth}월까지)</div>
                            <h5 className="fw-bold m-0 text-danger">
                                {formatNumber(totalBalance)}
                            </h5>
                        </div>
                    </div>
                </div>

                {/* Calculator */}
                <div className="bg-white rounded-4 border p-4 shadow-sm mb-5" style={{ maxWidth: "350px", margin: "0 auto" }}>
                    <div className="d-flex align-items-center mb-3 text-secondary">
                        <CalcIcon size={18} className="me-2" /> 🧮 간편 계산기
                    </div>
                    <div className="bg-light p-3 text-end rounded-3 mb-3 fs-3 fw-bold border" style={{ minHeight: "60px" }}>
                        {calcDisplay}
                    </div>
                    <div className="row g-2">
                        {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', 'C', '+', '='].map(btn => (
                            <div key={btn} className={`col-${btn === '=' ? '6' : '3'}`}>
                                <button className={`btn w-100 py-3 fw-bold ${btn === 'C' ? 'btn-danger' : btn === '=' ? 'btn-primary' : isNaN(parseInt(btn)) && btn !== '.' ? 'btn-info text-white' : 'btn-outline-secondary'}`}
                                    onClick={() => handleCalc(btn === '/' ? '/' : btn === '*' ? '*' : btn)}>
                                    {btn === '/' ? '÷' : btn === '*' ? '×' : btn}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Back Button */}
                <div className="mt-4 mb-5 pb-5">
                    <button className="btn btn-secondary w-100 py-2 fw-bold" onClick={() => router.push("/dashboard")}>
                        <ArrowLeft size={18} className="me-2" /> 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AccountViewPage() {
    return (
        <Suspense fallback={<div className="text-center mt-5">Loading Dashboard...</div>}>
            <AccountViewContent />
        </Suspense>
    );
}
