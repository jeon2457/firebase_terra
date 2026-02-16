"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    Phone,
    Pencil,
    Eye,
    Upload,
    Scissors,
    ImageIcon,
    CreditCard,
    PieChart,
    FileSpreadsheet,
    Map as MapIcon,
    Users,
    Database,
    BookOpen,
    LogOut,
    Palette,
    X
} from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import * as XLSX from 'xlsx-js-style';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

type Props = {
    themeLabel?: string;
};

export default function DashboardContent({ themeLabel }: Props) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [selectedPage, setSelectedPage] = useState<string | null>(null);

    const [showFinancial, setShowFinancial] = useState(false);
    const [financialData, setFinancialData] = useState<{ income: any[], expense: any[] } | null>(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [showExcel, setShowExcel] = useState(false);
    const [excelConfig, setExcelConfig] = useState({ year: new Date().getFullYear(), type: 'all' });

    const loadFinancialData = async () => {
        try {
            const res = await axios.get('/api/financial');
            if (res.data.success) {
                setFinancialData({ income: res.data.income, expense: res.data.expense });
                return true;
            }
        } catch (error) {
            console.error("Failed to load financial data", error);
        }
        return false;
    };

    const handleGoNext = async () => {
        const selected = menuItems.find(m => m.path === selectedPage);
        if (!selected) {
            alert("펼쳐볼 책을 선택해주세요.");
            return;
        }
        if (selected.path === "#financial") {
            const success = await loadFinancialData();
            if (success) setShowFinancial(true);
        } else if (selected.path === "#excel") {
            setShowExcel(true);
        } else {
            router.push(selected.path);
        }
    };

    if (status === "loading" || !session) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    const getYearlyStats = () => {
        if (!financialData) return { mInc: [], mExp: [], totalInc: 0, totalExp: 0 };
        const mInc = new Array(12).fill(0);
        const mExp = new Array(12).fill(0);
        let totalInc = 0;
        let totalExp = 0;

        financialData.income.forEach(item => {
            const d = new Date(item.date);
            if (d.getFullYear() === selectedYear) {
                mInc[d.getMonth()] += item.amount;
                totalInc += item.amount;
            }
        });

        financialData.expense.forEach(item => {
            const d = new Date(item.date);
            if (d.getFullYear() === selectedYear) {
                mExp[d.getMonth()] += item.amount;
                totalExp += item.amount;
            }
        });

        return { mInc, mExp, totalInc, totalExp };
    };

    const { mInc, mExp, totalInc, totalExp } = getYearlyStats();

    const barData = {
        labels: Array.from({ length: 12 }, (_, i) => `${i + 1}월`),
        datasets: [
            { label: '수입', data: mInc, backgroundColor: '#4CAF50' },
            { label: '지출', data: mExp, backgroundColor: '#f44336' }
        ]
    };

    const doughnutData = {
        labels: ['총 수입', '총 지출'],
        datasets: [{
            data: [totalInc, totalExp],
            backgroundColor: ['#4CAF50', '#f44336']
        }]
    };

    const downloadExcel = () => {
        if (!financialData) return;
        const wb = XLSX.utils.book_new();

        const createSheet = (data: any[], title: string) => {
            const filtered = data.filter(item => new Date(item.date).getFullYear() === excelConfig.year)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            const rows: (string | number)[][] = [[`${excelConfig.year}년 ${title} 내역`], ["NO", "날짜", "항목", "비고", "금액"]];
            let total = 0;
            filtered.forEach((item, idx) => {
                rows.push([idx + 1, item.date.split(' ')[0], item.category, item.description || '', item.amount]);
                total += item.amount;
            });
            rows.push(["", "", "", "합계", total]);

            const ws = XLSX.utils.aoa_to_sheet(rows);
            return ws;
        };

        if (excelConfig.type === 'all' || excelConfig.type === 'income') {
            XLSX.utils.book_append_sheet(wb, createSheet(financialData.income, '수입'), "수입내역");
        }
        if (excelConfig.type === 'all' || excelConfig.type === 'expense') {
            XLSX.utils.book_append_sheet(wb, createSheet(financialData.expense, '지출'), "지출내역");
        }
        XLSX.writeFile(wb, `TerraOne_Report_${excelConfig.year}.xlsx`);
    };

    const menuItems = [
        { title: "전화연락망 관리", icon: <Phone />, color: "bg-tel", path: "/members" },
        { title: "사용내역 입력", icon: <Pencil />, color: "bg-input", path: "/account/input" },
        { title: "사용내역 편집", icon: <Pencil />, color: "bg-edit", path: "/account/edit" },
        { title: "사용내역 열람", icon: <Eye />, color: "bg-view", path: "/account/view" },
        { title: "영수증 업로드", icon: <Upload />, color: "bg-upload", path: "/receipt/upload" },
        { title: "영수증 편집", icon: <Scissors />, color: "bg-scissors", path: "/receipt/edit" },
        { title: "영수증 열람", icon: <ImageIcon />, color: "bg-image", path: "/receipt/view" },
        { title: "월회비 입금현황", icon: <CreditCard />, color: "bg-card", path: "/fee/status" },
        { title: "재무 대시보드", icon: <PieChart />, color: "bg-financial", path: "#financial" },
        { title: "엑셀 리포트", icon: <FileSpreadsheet />, color: "bg-excel", path: "#excel" },
        { title: "다음 지도 만들기", icon: <MapIcon />, color: "bg-map", path: "/map/create" },
        { title: "각종 모임 활동", icon: <Users />, color: "bg-activities", path: "/activities" },
        { title: "데이터베이스 백업", icon: <Database />, color: "bg-activities", path: "/backup" },
        { title: "시스템 매뉴얼", icon: <BookOpen />, color: "bg-manual", path: "/manual" },
    ];

    return (
        <div className="container py-5">
            <style jsx>{`
        .section-title {
          text-align: center;
          color: #2c3e50;
          font-weight: 800;
          margin-bottom: 25px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .admin-info {
          text-align: center;
          font-size: 14px;
          color: #555;
          margin-bottom: 40px;
          background: rgba(255, 255, 255, 0.8);
          padding: 12px;
          border-radius: 10px;
          border-bottom: 2px solid #ddd;
        }
        .option-box {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-start;
          gap: 15px;
          padding: 20px 15px;
          background: #8d6e63;
          border-radius: 5px;
          box-shadow: inset 0 10px 20px rgba(0, 0, 0, 0.3), 0 15px 30px rgba(0, 0, 0, 0.2);
          border-bottom: 15px solid #5d4037;
        }
        .select-card {
          position: relative;
          width: 60px;
          height: 200px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          transform-origin: bottom center;
        }
        .book-spine {
          width: 100%;
          height: 100%;
          border-radius: 3px 8px 8px 3px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 15px 5px;
          color: white;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
        }
        .book-spine::before {
          content: '';
          position: absolute;
          top: 0;
          left: 5px;
          width: 2px;
          height: 100%;
          background: rgba(255, 255, 255, 0.2);
        }
        .book-title {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 1px;
          text-align: center;
          height: 70%;
        }
        .bg-tel { background: #d35400; border-left: 5px solid #a04000; }
        .bg-input { background: #2c3e50; border-left: 5px solid #1a252f; }
        .bg-edit { background: #c0392b; border-left: 5px solid #962d22; }
        .bg-view { background: #27ae60; border-left: 5px solid #1e8449; }
        .bg-upload { background: #2980b9; border-left: 5px solid #1f6391; }
        .bg-scissors { background: #8e44ad; border-left: 5px solid #6c3483; }
        .bg-image { background: #2c3e50; border-left: 5px solid #1a252f; }
        .bg-card { background: #16a085; border-left: 5px solid #117a65; }
        .bg-financial { background: #FFB300; border-left: 5px solid #FF6F00; color: #333 !important; }
        .bg-financial .book-title { color: #333; }
        .bg-excel { background: #1D6F42; border-left: 5px solid #0f4c2c; }
        .bg-map { background: #2980b9; border-left: 5px solid #1f6391; }
        .bg-activities { background: #e67e22; border-left: 5px solid #d35400; }
        .bg-manual { background: #7f8c8d; border-left: 5px solid #626567; }

        .select-card:hover {
          transform: translateY(-25px) rotate(1deg);
          z-index: 10;
        }
        .select-card.active {
          transform: translateY(-30px);
        }
        .select-card.active .book-spine {
          box-shadow: 0 15px 25px rgba(0, 0, 0, 0.4), 0 0 15px rgba(255, 255, 255, 0.5);
          filter: brightness(1.2);
        }
        .btn-same {
          width: 220px;
          height: 50px;
          font-weight: 700;
          border-radius: 30px;
        }
        .custom-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .custom-modal {
          background: white;
          padding: 30px;
          border-radius: 20px;
          max-width: 900px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }
        .summary-card {
          padding: 15px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          flex: 1;
        }
      `}</style>

            <h2 className="section-title">회원관리 도서관{themeLabel ? ` (${themeLabel})` : ""}</h2>
            <div className="admin-info">
                👤 관리자: <strong>{(session.user as any).id}</strong> (Level {(session.user as any).user_level})
            </div>

            <div className="option-box">
                {menuItems.map((item, idx) => (
                    <div
                        key={idx}
                        className={`select-card ${selectedPage === item.path ? 'active' : ''}`}
                        onClick={() => setSelectedPage(item.path)}
                    >
                        <div className={`book-spine ${item.color}`}>
                            <div className="mb-1">{item.icon}</div>
                            <div className="book-title">{item.title}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-4 d-flex flex-column gap-3 align-items-center">
                <button className="btn btn-outline-secondary rounded-pill fw-bold" onClick={() => router.push("/theme")}
                >
                    <Palette className="me-2" size={18} /> 디자인 변경 / 테마 설정
                </button>
                <div className="d-flex flex-column flex-md-row gap-3">
                    <button className="btn btn-primary btn-same shadow-lg d-flex align-items-center justify-content-center" onClick={handleGoNext}>
                        <BookOpen className="me-2" size={20} /> 책 펼쳐보기
                    </button>
                    <button className="btn btn-outline-danger btn-same shadow-sm d-flex align-items-center justify-content-center" onClick={() => signOut()}>
                        <LogOut className="me-2" size={20} /> 서재 나가기
                    </button>
                </div>
            </div>

            {showFinancial && (
                <div className="custom-modal-overlay" onClick={() => setShowFinancial(false)}>
                    <div className="custom-modal" onClick={e => e.stopPropagation()}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-bold m-0"><PieChart className="me-2" /> 재무 대시보드</h4>
                            <button className="btn btn-link link-dark p-0" onClick={() => setShowFinancial(false)}><X size={24} /></button>
                        </div>

                        <div className="mb-4 d-flex align-items-center gap-3">
                            <span className="fw-bold text-secondary">연도 선택</span>
                            <select
                                className="form-select w-auto"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                            >
                                {[0, 1, 2, 3].map(i => (
                                    <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}년</option>
                                ))}
                            </select>
                        </div>

                        <div className="d-flex gap-3 mb-4">
                            <div className="summary-card bg-success-subtle text-success">
                                <div className="small">연간 총 수입</div>
                                <div className="h4 fw-bold">{totalInc.toLocaleString()}원</div>
                            </div>
                            <div className="summary-card bg-danger-subtle text-danger">
                                <div className="small">연간 총 지출</div>
                                <div className="h4 fw-bold">{totalExp.toLocaleString()}원</div>
                            </div>
                            <div className="summary-card bg-primary-subtle text-primary">
                                <div className="small">순 이익</div>
                                <div className="h4 fw-bold">{(totalInc - totalExp).toLocaleString()}원</div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-8 mb-4">
                                <div className="p-3 border rounded shadow-sm bg-white" style={{ height: '350px' }}>
                                    <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
                                </div>
                            </div>
                            <div className="col-lg-4 mb-4">
                                <div className="p-3 border rounded shadow-sm bg-white" style={{ height: '350px' }}>
                                    <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showExcel && (
                <div className="custom-modal-overlay" onClick={() => setShowExcel(false)}>
                    <div className="custom-modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-bold m-0"><FileSpreadsheet className="me-2 text-success" /> 엑셀 리포트 설정</h4>
                            <button className="btn btn-link link-dark p-0" onClick={() => setShowExcel(false)}><X size={24} /></button>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">대상 연도</label>
                            <select className="form-select" value={excelConfig.year} onChange={e => setExcelConfig({ ...excelConfig, year: Number(e.target.value) })}>
                                {[0, 1, 2, 3].map(i => (
                                    <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}년</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold">출력 항목</label>
                            <select className="form-select" value={excelConfig.type} onChange={e => setExcelConfig({ ...excelConfig, type: (e.target as any).value })}>
                                <option value="all">전체 (수입 + 지출)</option>
                                <option value="income">수입 내역만</option>
                                <option value="expense">지출 내역만</option>
                            </select>
                        </div>

                        <button className="btn btn-success w-100 p-3 fw-bold rounded-pill" onClick={downloadExcel}>
                            <Upload className="me-2" size={18} /> 엑셀 파일 다운로드 (.xlsx)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
