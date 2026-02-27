"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./guest.module.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import * as XLSX from 'xlsx-js-style';
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

type ThemeValue = "book" | "icon" | "glass" | "list" | "tech";

export default function GuestPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [displayName, setDisplayName] = useState("사용자");
    const [currentTheme, setCurrentTheme] = useState<ThemeValue | null>(null);
    const [isLoadingTheme, setIsLoadingTheme] = useState(true);

    // 재무 대시보드 관련 상태
    const [showFinancial, setShowFinancial] = useState(false);
    const [financialData, setFinancialData] = useState<{ income: any[], expense: any[] } | null>(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // 엑셀 리포트 관련 상태
    const [showExcel, setShowExcel] = useState(false);
    const [excelConfig, setExcelConfig] = useState({ year: new Date().getFullYear(), type: 'all' });

    useEffect(() => {
        if (session?.user) {
            const user = session.user as any;
            let name = user.name || "사용자";
            if (user.user_level >= 10) {
                name += " (관리자)";
            } else {
                name += " 님";
            }
            setDisplayName(name);
        }
    }, [session]);

    useEffect(() => {
        if (status !== "authenticated") return;
        const routeByTheme = async () => {
            try {
                const res = await fetch("/api/theme", { method: "GET" });
                const data = await res.json();
                const theme = data?.theme as ThemeValue | undefined;

                if (theme && theme !== "book") {
                    router.replace(`/guest/${theme}`);
                } else {
                    setCurrentTheme("book");
                    setIsLoadingTheme(false);
                }
            } catch {
                setCurrentTheme("book");
                setIsLoadingTheme(false);
            }
        };
        routeByTheme();
    }, [status, router]);

    // 재무 데이터 로드
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

    // 재무 대시보드 클릭 핸들러
    const handleFinancialClick = async () => {
        const success = await loadFinancialData();
        if (success) setShowFinancial(true);
    };

    // 엑셀 리포트 클릭 핸들러
    const handleExcelClick = async () => {
        // 재무 데이터가 없으면 먼저 로드
        if (!financialData) {
            const success = await loadFinancialData();
            if (!success) {
                alert("재무 데이터를 불러올 수 없습니다.");
                return;
            }
        }
        setShowExcel(true);
    };

    // 연도별 통계 계산
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

    // 엑셀 다운로드
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

            // 제목을 A1에서 E1까지 셀 병합
            ws['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }
            ];

            // 제목 행 스타일 (A1)
            const titleCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
            ws[titleCell] = {
                v: `${excelConfig.year}년 ${title} 내역`,
                s: {
                    font: { sz: 16, bold: true, color: { rgb: "000000" } },
                    alignment: { horizontal: "center", vertical: "center" },
                    fill: { fgColor: { rgb: "E8F5E9" } }
                }
            };

            // 헤더 행 스타일 (2행: NO, 날짜, 항목, 비고, 금액)
            for (let c = 0; c <= 4; c++) {
                const cellAddr = XLSX.utils.encode_cell({ r: 1, c });
                ws[cellAddr] = {
                    v: ws[cellAddr]?.v || "",
                    s: {
                        font: { bold: true, color: { rgb: "FFFFFF" } },
                        alignment: { horizontal: "center", vertical: "center" },
                        fill: { fgColor: { rgb: "4CAF50" } },
                        border: {
                            top: { style: "thin", color: { rgb: "000000" } },
                            bottom: { style: "thin", color: { rgb: "000000" } },
                            left: { style: "thin", color: { rgb: "000000" } },
                            right: { style: "thin", color: { rgb: "000000" } }
                        }
                    }
                };
            }

            // 데이터 행 스타일 (3행부터 마지막 행까지)
            const startRow = 2;
            const endRow = filtered.length + 2;
            for (let r = startRow; r <= endRow; r++) {
                for (let c = 0; c <= 4; c++) {
                    const cellAddr = XLSX.utils.encode_cell({ r, c });
                    const cell = ws[cellAddr];
                    if (!cell) continue;

                    let cellStyle: any = {
                        alignment: { horizontal: c === 4 ? "right" : "center", vertical: "center" },
                        border: {
                            top: { style: "thin", color: { rgb: "CCCCCC" } },
                            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                            left: { style: "thin", color: { rgb: "CCCCCC" } },
                            right: { style: "thin", color: { rgb: "CCCCCC" } }
                        }
                    };

                    // 금액 열 (E열, c=4)
                    if (c === 4) {
                        // 데이터 행의 금액
                        if (r < endRow) {
                            cellStyle.numberFormat = "#,##0"; // 콤마 포맷
                        }
                        // 합계 행 (마지막 행)
                        else {
                            cellStyle.font = { bold: true, color: { rgb: "FF0000" } }; // 빨간색
                            cellStyle.numberFormat = "#,##0"; // 콤마 포맷
                            cellStyle.fill = { fgColor: { rgb: "FFF3CD" } };
                        }
                    }

                    ws[cellAddr] = {
                        v: cell.v,
                        s: cellStyle
                    };
                }
            }

            // 열 너비 설정
            ws['!cols'] = [
                { wch: 8 },   // NO
                { wch: 12 },  // 날짜
                { wch: 20 },  // 항목
                { wch: 30 },  // 비고
                { wch: 15 }   // 금액
            ];

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

    if (isLoadingTheme || status === "loading") {
        return <div className="text-center mt-5">Loading...</div>;
    }

    if (status === "unauthenticated") {
        router.replace("/login");
        return null;
    }

    return (
        <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", overflow: "hidden" }}>
            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>회원관리 도서관</h2>

                <div className={styles.adminInfo}>
                    👤 내 정보: <strong>{displayName}</strong> (Level {(session?.user as any)?.user_level || 0})
                </div>

                <div className={styles.optionBox}>
                    {/* 1. 연락망 보기 */}
                    <Link href="/members/view" className={styles.selectCard}>
                        <div className={`${styles.bookSpine} ${styles.bgTel}`}>
                            <i className={`bi bi-people-fill ${styles.bookIcon}`}></i>
                            <div className={styles.bookTitle}>연락망 보기</div>
                        </div>
                    </Link>

                    {/* 2. 사용내역 열람 */}
                    <Link href="/account/view" className={styles.selectCard}>
                        <div className={`${styles.bookSpine} ${styles.bgView}`}>
                            <i className={`bi bi-eye ${styles.bookIcon}`}></i>
                            <div className={styles.bookTitle}>사용내역 열람</div>
                        </div>
                    </Link>

                    {/* 3. 영수증 열람 */}
                    <Link href="/receipt/view" className={styles.selectCard}>
                        <div className={`${styles.bookSpine} ${styles.bgImage}`}>
                            <i className={`bi bi-image ${styles.bookIcon}`}></i>
                            <div className={styles.bookTitle}>영수증 열람</div>
                        </div>
                    </Link>

                    {/* 4. 월회비 납부현황 */}
                    <Link href="/guest/fee/status" className={styles.selectCard}>
                        <div className={`${styles.bookSpine} ${styles.bgCard}`}>
                            <i className={`bi bi-credit-card ${styles.bookIcon}`}></i>
                            <div className={styles.bookTitle}>월회비 납부현황</div>
                        </div>
                    </Link>

                    {/* 5. 재무 대시보드 */}
                    <div className={styles.selectCard} onClick={handleFinancialClick}>
                        <div className={`${styles.bookSpine} ${styles.bgFinancial}`}>
                            <i className={`bi bi-pie-chart-fill ${styles.bookIcon}`}></i>
                            <div className={styles.bookTitle}>재무 대시보드</div>
                        </div>
                    </div>

                    {/* 6. 엑셀 리포트 */}
                    <div className={styles.selectCard} onClick={handleExcelClick}>
                        <div className={`${styles.bookSpine} ${styles.bgExcel}`}>
                            <i className={`bi bi-file-earmark-excel-fill ${styles.bookIcon}`}></i>
                            <div className={styles.bookTitle}>엑셀 리포트</div>
                        </div>
                    </div>
                </div>

                <div className={styles.btnArea}>
                    <button
                        className={`btn btn-outline-danger btn-lg ${styles.btnSame} shadow-sm`}
                        onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                        서재 나가기
                    </button>
                </div>
            </div>

            {/* 재무 대시보드 모달 */}
            {showFinancial && (
                <div 
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                        padding: '20px'
                    }}
                    onClick={() => setShowFinancial(false)}
                >
                    <div 
                        style={{
                            background: 'white', padding: '25px', borderRadius: '20px', maxWidth: '900px', width: '100%',
                            maxHeight: '90vh', overflowY: 'auto', position: 'relative'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                            <h4 style={{ margin: 0, fontWeight: 'bold' }}>🎯 재무 대시보드</h4>
                            <button 
                                onClick={() => setShowFinancial(false)}
                                style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer' }}
                            >✕</button>
                        </div>

                        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 'bold', color: '#666' }}>연도 선택</span>
                            <select
                                style={{ width: 'auto' }}
                                className="form-select"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                            >
                                {[0, 1, 2, 3].map(i => (
                                    <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}년</option>
                                ))}
                            </select>
                        </div>

                        {/* 반응형: 모바일에서는 세로 배치, 데스크톱에서는 가로 배치 */}
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexDirection: 'row' }} className="financial-summary">
                            <div style={{ padding: '15px', borderRadius: '12px', textAlign: 'center', flex: 1, background: '#d4edda', color: '#155724', minWidth: '120px' }}>
                                <div style={{ fontSize: '14px' }}>연간 총 수입</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{totalInc.toLocaleString()}원</div>
                            </div>
                            <div style={{ padding: '15px', borderRadius: '12px', textAlign: 'center', flex: 1, background: '#f8d7da', color: '#721c24', minWidth: '120px' }}>
                                <div style={{ fontSize: '14px' }}>연간 총 지출</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{totalExp.toLocaleString()}원</div>
                            </div>
                            <div style={{ padding: '15px', borderRadius: '12px', textAlign: 'center', flex: 1, background: '#cce5ff', color: '#004085', minWidth: '120px' }}>
                                <div style={{ fontSize: '14px' }}>순 이익</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{(totalInc - totalExp).toLocaleString()}원</div>
                            </div>
                        </div>

                        {/* 반응형: 모바일에서는 세로 배치, 데스크톱에서는 가로 배치 */}
                        <div style={{ display: 'flex', gap: '20px', flexDirection: 'row' }} className="financial-charts">
                            <div style={{ flex: 2, padding: '15px', border: '1px solid #ddd', borderRadius: '8px', background: 'white', height: '300px', minWidth: '0' }}>
                                <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
                            </div>
                            <div style={{ flex: 1, padding: '15px', border: '1px solid #ddd', borderRadius: '8px', background: 'white', height: '300px', minWidth: '200px' }}>
                                <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
                            </div>
                        </div>

                        <style jsx>{`
                            @media (max-width: 768px) {
                                .financial-summary {
                                    flex-direction: column !important;
                                }
                                .financial-charts {
                                    flex-direction: column !important;
                                }
                                .financial-charts div {
                                    height: 250px !important;
                                }
                            }
                        `}</style>
                    </div>
                </div>
            )}

            {/* 엑셀 리포트 모달 */}
            {showExcel && (
                <div 
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}
                    onClick={() => setShowExcel(false)}
                >
                    <div 
                        style={{
                            background: 'white', padding: '30px', borderRadius: '20px', maxWidth: '500px', width: '90%',
                            position: 'relative'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h4 style={{ margin: 0, fontWeight: 'bold', color: '#28a745' }}>📊 엑셀 리포트 설정</h4>
                            <button 
                                onClick={() => setShowExcel(false)}
                                style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer' }}
                            >✕</button>
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
                            <select className="form-select" value={excelConfig.type} onChange={e => setExcelConfig({ ...excelConfig, type: e.target.value })}>
                                <option value="all">전체 (수입 + 지출)</option>
                                <option value="income">수입 내역만</option>
                                <option value="expense">지출 내역만</option>
                            </select>
                        </div>

                        <button className="btn btn-success w-100 p-3 fw-bold rounded-pill" onClick={downloadExcel}>
                            📥 엑셀 파일 다운로드 (.xlsx)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
