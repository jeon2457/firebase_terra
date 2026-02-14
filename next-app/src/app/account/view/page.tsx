"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    ArrowLeft,
    Calendar,
    TrendingUp,
    TrendingDown,
    Calculator,
    Info,
    ChevronDown,
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

    // Calculator state
    const [calcDisplay, setCalcDisplay] = useState("0");
    const [calcRaw, setCalcRaw] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
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

    // Filter and calculate totals
    const filteredIncome = incomeData.filter(item => {
        const m = parseInt(item.date.split('-')[1]);
        return m === currentMonth;
    });
    const filteredExpense = expenseData.filter(item => {
        const m = parseInt(item.date.split('-')[1]);
        return m === currentMonth;
    });

    const monthIncomeTotal = filteredIncome.reduce((sum, item) => sum + item.amount, 0);
    const monthExpenseTotal = filteredExpense.reduce((sum, item) => sum + item.amount, 0);

    const cumulativeIncome = incomeData
        .filter(item => parseInt(item.date.split('-')[1]) <= currentMonth)
        .reduce((sum, item) => sum + item.amount, 0);
    const cumulativeExpense = expenseData
        .filter(item => parseInt(item.date.split('-')[1]) <= currentMonth)
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

    const years = [0, 1, 2, 3].map(i => new Date().getFullYear() - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    if (status === "loading") return <div className="text-center mt-5">Loading...</div>;

    return (
        <div className="container-fluid py-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
            <div className="max-w-4xl mx-auto bg-white rounded-3 shadow-sm p-4">

                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => router.push("/dashboard")}>
                        <ArrowLeft size={18} className="me-1" /> 돌아가기
                    </button>
                    <h3 className="m-0 fw-bold text-primary">📊 사용내역서 보기</h3>
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

                <div className="alert alert-info py-2 text-center small">
                    <Info size={14} className="me-1" /> 합계가 이상하면 월 버튼을 다시 눌러 갱신하세요!
                </div>

                {/* Income Table */}
                <h5 className="fw-bold mt-5 mb-3 d-flex align-items-center text-success">
                    <TrendingUp size={20} className="me-2" /> [수입 목록]
                </h5>
                <div className="table-responsive mb-4 shadow-sm rounded border">
                    <table className="table table-hover m-0">
                        <thead className="table-light">
                            <tr>
                                <th>NO</th>
                                <th>일자</th>
                                <th>항목</th>
                                <th className="text-end">금액</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredIncome.length === 0 ? (
                                <tr><td colSpan={4} className="text-center text-muted py-4">데이터가 없습니다.</td></tr>
                            ) : filteredIncome.map((tr, idx) => (
                                <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td>{tr.date.split(' ')[0]}</td>
                                    <td>{tr.category}</td>
                                    <td className="text-end fw-bold">{formatNumber(tr.amount)}원</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="table-light fw-bold">
                            <tr>
                                <td colSpan={3} className="text-end">월수입 합계:</td>
                                <td className="text-end text-primary">{formatNumber(monthIncomeTotal)}원</td>
                            </tr>
                            <tr>
                                <td colSpan={3} className="text-end">월수입 누계(1~{currentMonth}월):</td>
                                <td className="text-end">{formatNumber(cumulativeIncome)}원</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Expense Table */}
                <h5 className="fw-bold mt-5 mb-3 d-flex align-items-center text-danger">
                    <TrendingDown size={20} className="me-2" /> [지출 목록]
                </h5>
                <div className="table-responsive mb-5 shadow-sm rounded border">
                    <table className="table table-hover m-0">
                        <thead className="table-light">
                            <tr>
                                <th>NO</th>
                                <th>일자</th>
                                <th>항목</th>
                                <th className="text-end">금액</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpense.length === 0 ? (
                                <tr><td colSpan={4} className="text-center text-muted py-4">데이터가 없습니다.</td></tr>
                            ) : filteredExpense.map((tr, idx) => (
                                <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td>{tr.date.split(' ')[0]}</td>
                                    <td>{tr.category}</td>
                                    <td className="text-end fw-bold">{formatNumber(tr.amount)}원</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="table-light fw-bold">
                            <tr>
                                <td colSpan={3} className="text-end">월지출 합계:</td>
                                <td className="text-end text-danger">{formatNumber(monthExpenseTotal)}원</td>
                            </tr>
                            <tr>
                                <td colSpan={3} className="text-end">월지출 누계(1~{currentMonth}월):</td>
                                <td className="text-end">{formatNumber(cumulativeExpense)}원</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Balance Box */}
                <div className="row g-4 mb-5">
                    <div className="col-md-6 text-center">
                        <div className="p-4 rounded-4 bg-light border-start border-primary border-5 shadow-sm">
                            <h6 className="text-muted mb-2">월결산액 (수입 - 지출)</h6>
                            <h2 className={`fw-bold ${monthlyBalance >= 0 ? 'text-primary' : 'text-danger'}`}>
                                {formatNumber(monthlyBalance)}원
                            </h2>
                        </div>
                    </div>
                    <div className="col-md-6 text-center">
                        <div className="p-4 rounded-4 bg-light border-start border-danger border-5 shadow-sm">
                            <h6 className="text-muted mb-2">총잔액 (누적 1~{currentMonth}월)</h6>
                            <h2 className={`fw-bold text-danger`}>
                                {formatNumber(totalBalance)}원
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Calculator */}
                <div className="bg-white rounded-4 border p-4 shadow-sm" style={{ maxWidth: "350px", margin: "0 auto" }}>
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

                <div className="text-center mt-5">
                    <button className="btn btn-dark btn-lg px-5 rounded-pill" onClick={() => router.push("/dashboard")}>
                        ⬅ 메인으로 돌아가기
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
