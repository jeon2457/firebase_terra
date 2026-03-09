"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
    X,
    TrendingUp,
    Activity,
    BarChart2
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
import ActivityDashboardModal from './ActivityDashboardModal';
import StockDisclosureModal from './StockDisclosureModal';

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
    theme?: "book" | "icon" | "glass" | "list" | "tech";
};

export default function DashboardContent({ theme = "book" }: Props) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [selectedPage, setSelectedPage] = useState<string | null>(null);

    const spaceCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const [showFinancial, setShowFinancial] = useState(false);
    const [showActivity, setShowActivity] = useState(false); // 활동 대시보드 상태 추가
    const [financialData, setFinancialData] = useState<{ income: any[], expense: any[] } | null>(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [showExcel, setShowExcel] = useState(false);
    const [excelConfig, setExcelConfig] = useState({ year: new Date().getFullYear(), type: 'all' });

    // 주식공시 열람 모달 상태
    const [showStockDisclosure, setShowStockDisclosure] = useState(false);

    // 회원 등급 이름 변환 함수
    const getLevelName = (level: number) => {
        switch (level) {
            case 1: return "임시회원";
            case 2: return "회원";
            case 3: return "우수회원";
            case 5: return "Premium";
            case 10: return "관리자";
            default: return "회원";
        }
    };

    // Safe user display name computation
    const userDisplayName = (() => {
        if (!session?.user) return "사용자";
        const user = session.user as any;
        let name = user.name || "사용자";
        const remark = user.remark;

        if (user.user_level >= 10) {
            // 관리자는 그대로 유지
            name += " (관리자)";
        } else {
            // 비고(직책) 데이터가 있으면 우선 표시, 없으면 회원 등급 표시
            if (remark && remark.trim()) {
                name += ` ${remark.trim()}`;
            } else {
                name += ` ${getLevelName(user.user_level)}`;
            }
            name += "님";
        }
        return name;
    })();

    useEffect(() => {
        if (theme !== "glass" && theme !== "tech") return;

        const canvas = spaceCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let w = 0;
        let h = 0;
        let dpr = 1;
        let animationId = 0;
        let isRunning = true;

        const starCount = 300;
        const speed = 1.0;

        const maxMeteors = 3;
        const meteorSpawnChancePerFrame = theme === "tech" ? 0.02 : 0.015;

        let stars: Array<{ x: number; y: number; z: number; px: number; py: number }> = [];

        let meteors: Array<{
            x: number;
            y: number;
            vx: number;
            vy: number;
            life: number;
            maxLife: number;
            length: number;
            headRadius: number;
            alpha: number;
        }> = [];

        const initSpace = () => {
            try {
                w = window.innerWidth;
                h = window.innerHeight;
                dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
                canvas.width = Math.floor(w * dpr);
                canvas.height = Math.floor(h * dpr);
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                stars = [];
                for (let i = 0; i < starCount; i++) {
                    stars.push({
                        x: Math.random() * w - w / 2,
                        y: Math.random() * h - h / 2,
                        z: Math.random() * w,
                        px: 0,
                        py: 0,
                    });
                }
            } catch (e) {
                console.warn("Failed to initialize canvas:", e);
            }
        };

        const drawSpace = () => {
            if (!isRunning) return;

            try {
                if (!canvas || !ctx || w === 0 || h === 0) {
                    animationId = requestAnimationFrame(drawSpace);
                    return;
                }

                ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
                ctx.fillRect(0, 0, w, h);

                ctx.save();
                ctx.translate(w / 2, h / 2);

                for (let i = 0; i < starCount; i++) {
                    const s = stars[i];
                    if (s.z <= 0) continue;

                    const x = s.x / (s.z / w);
                    const y = s.y / (s.z / w);

                    if (s.px !== 0) {
                        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, 1.5 - s.z / w)})`;
                        ctx.lineWidth = Math.max(0.8, (1 - s.z / w) * 3);
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        ctx.moveTo(s.px, s.py);
                        ctx.lineTo(x, y);
                        ctx.stroke();
                    }

                    s.px = x;
                    s.py = y;
                    s.z -= speed;

                    if (s.z <= 0) {
                        s.x = Math.random() * w - w / 2;
                        s.y = Math.random() * h - h / 2;
                        s.z = w;
                        s.px = 0;
                        s.py = 0;
                    }
                }

                ctx.restore();

                if (meteors.length < maxMeteors && Math.random() < meteorSpawnChancePerFrame) {
                    const startX = Math.random() * w;
                    const startY = -40 - Math.random() * 120;
                    const baseSpeed = 12 + Math.random() * 10;
                    const angle = (Math.PI * (115 + Math.random() * 20)) / 180;
                    const vx = Math.cos(angle) * baseSpeed;
                    const vy = Math.sin(angle) * baseSpeed;

                    meteors.push({
                        x: startX,
                        y: startY,
                        vx,
                        vy,
                        life: 0,
                        maxLife: 45 + Math.floor(Math.random() * 35),
                        length: 260 + Math.random() * 220,
                        headRadius: 2.2 + Math.random() * 2.8,
                        alpha: 0.95,
                    });
                }

                if (meteors.length) {
                    ctx.save();
                    ctx.globalCompositeOperation = "lighter";

                    for (const m of meteors) {
                        m.life += 1;
                        m.x += m.vx;
                        m.y += m.vy;

                        const progress = m.life / m.maxLife;
                        const fade = Math.max(0, 1 - progress);
                        const a = m.alpha * fade;

                        const tx = m.x - m.vx;
                        const ty = m.y - m.vy;
                        const lx = tx - (m.vx * m.length) / 18;
                        const ly = ty - (m.vy * m.length) / 18;

                        const grad = ctx.createLinearGradient(tx, ty, lx, ly);
                        grad.addColorStop(0, `rgba(255,255,255,${a})`);
                        grad.addColorStop(0.12, `rgba(160,220,255,${a * 0.65})`);
                        grad.addColorStop(1, `rgba(0,0,0,0)`);

                        ctx.strokeStyle = grad;
                        ctx.lineWidth = 2.2;
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        ctx.moveTo(tx, ty);
                        ctx.lineTo(lx, ly);
                        ctx.stroke();

                        ctx.fillStyle = `rgba(255,255,255,${a})`;
                        ctx.beginPath();
                        ctx.arc(tx, ty, m.headRadius, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    meteors = meteors.filter(m => m.life < m.maxLife && m.x < w + 200 && m.y < h + 200);
                    ctx.restore();
                }

                animationId = requestAnimationFrame(drawSpace);
            } catch (error) {
                console.warn("Canvas animation error, continuing:", error);
                if (isRunning) {
                    animationId = requestAnimationFrame(drawSpace);
                }
            }
        };

        try {
            initSpace();
            drawSpace();

            const handleResize = () => {
                try {
                    initSpace();
                } catch (e) {
                    console.warn("Resize handler error:", e);
                }
            };

            window.addEventListener("resize", handleResize);

            return () => {
                isRunning = false;
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                window.removeEventListener("resize", handleResize);
            };
        } catch (error) {
            console.error("Failed to initialize canvas animation:", error);
        }
    }, [theme]);

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

    const openMenuPath = async (path: string) => {
        // menuItems와 adminMenuItems 모두 검색
        const allItems = [...menuItems, ...adminMenuItems];
        const selected = allItems.find(m => m.path === path);
        if (!selected) return;

        if (path === "/fee/status" && (session?.user as any)?.user_level < 10) {
            router.push("/guest/fee/status");
            return;
        }

        // 전화연락망 열람: 관리자(user_level >= 10)는 /members/view, 일반회원은 /guest/members/view
        if (path === "/guest/members/view") {
            if ((session?.user as any)?.user_level >= 10) {
                router.push("/members/view");
            } else {
                router.push("/guest/members/view");
            }
            return;
        }

        if (path === 'financial') {
            const success = await loadFinancialData();
            if (success) setShowFinancial(true);
            return;
        }
        if (path === 'activity') {
            setShowActivity(true);
            return;
        }
        if (path === 'excel') {
            if (!financialData) {
                const success = await loadFinancialData();
                if (!success) {
                    alert("재무 데이터를 불러올 수 없습니다.");
                    return;
                }
            }
            setShowExcel(true);
            return;
        }
        if (selected.path === "#stock-disclosure") {
            setShowStockDisclosure(true);
            return;
        }
        router.push(selected.path);
    };

    const handleGoNext = async () => {
        const allItems = [...menuItems, ...adminMenuItems];
        const selected = allItems.find(m => m.path === selectedPage);
        if (!selected) {
            alert("펼쳐볼 책을 선택해주세요.");
            return;
        }
        await openMenuPath(selected.path);
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
        if (!financialData) {
            alert("재무 데이터가 없습니다. 모달을 닫고 다시 시도해주세요.");
            return;
        }
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

            // 열별 최대 문자 길이 계산 (헤더 포함)
            const colWidths = [4, 10, 4, 4, 4]; // 최솟값
            const headers2 = ["NO", "날짜", "항목", "비고", "금액"];
            headers2.forEach((h, c) => {
                colWidths[c] = Math.max(colWidths[c], h.length * 2);
            });
            filtered.forEach((item, idx) => {
                const rowVals = [String(idx + 1), item.date.split(' ')[0], item.category, item.description || '', item.amount.toLocaleString()];
                rowVals.forEach((v, c) => {
                    // 한글은 2바이트로 계산
                    const len = [...String(v)].reduce((acc, ch) => acc + (/[\u3131-\uD7A3]/.test(ch) ? 2 : 1), 0);
                    colWidths[c] = Math.max(colWidths[c], len);
                });
            });
            // 합계 행 금액 너비
            const totalLen = total.toLocaleString().length + 1;
            colWidths[4] = Math.max(colWidths[4], totalLen);

            const ws = XLSX.utils.aoa_to_sheet(rows);

            // ── 제목 A1:E1 셀 병합 ──
            ws['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }
            ];

            // ── 제목 행 스타일 (A1) : 폰트 크기 기본+4, 중앙정렬 ──
            const titleCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
            ws[titleCell] = {
                v: `${excelConfig.year}년 ${title} 내역`,
                s: {
                    font: { sz: 16, bold: true, color: { rgb: "000000" } },
                    alignment: { horizontal: "center", vertical: "center" },
                    fill: { fgColor: { rgb: "E8F5E9" } }
                }
            };

            // ── 헤더 행 스타일 (2행: NO·날짜·항목·비고·금액) 중앙정렬 ──
            const headers = ["NO", "날짜", "항목", "비고", "금액"];
            for (let c = 0; c <= 4; c++) {
                const cellAddr = XLSX.utils.encode_cell({ r: 1, c });
                ws[cellAddr] = {
                    v: headers[c],
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

            // ── 데이터 행 스타일 (3행 ~ 마지막-1행) ──
            const startRow = 2;
            const endRow = filtered.length + 2; // 합계 행 인덱스
            for (let r = startRow; r <= endRow; r++) {
                const isTotal = r === endRow; // 합계 행 여부
                for (let c = 0; c <= 4; c++) {
                    const cellAddr = XLSX.utils.encode_cell({ r, c });
                    const cell = ws[cellAddr];
                    if (!cell) continue;

                    const isAmountCol = c === 4;

                    const cellStyle: any = {
                        alignment: {
                            horizontal: isAmountCol ? "right" : "center",
                            vertical: "center"
                        },
                        border: {
                            top: { style: "thin", color: { rgb: "CCCCCC" } },
                            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                            left: { style: "thin", color: { rgb: "CCCCCC" } },
                            right: { style: "thin", color: { rgb: "CCCCCC" } }
                        }
                    };

                    if (isAmountCol) {
                        cellStyle.numFmt = "#,##0"; // 금액 콤마 포맷
                        // 숫자 타입 명시 (numFmt가 실제 적용되려면 필요)
                        ws[cellAddr] = { v: cell.v, t: 'n', s: cellStyle };
                        if (isTotal) {
                            // 합계 행: 빨간색 굵게
                            cellStyle.font = { bold: true, color: { rgb: "CC0000" } };
                            cellStyle.fill = { fgColor: { rgb: "FFF3CD" } };
                            ws[cellAddr] = { v: cell.v, t: 'n', s: cellStyle };
                        }
                        continue;
                    }

                    if (isTotal && !isAmountCol) {
                        cellStyle.font = { bold: true };
                        cellStyle.fill = { fgColor: { rgb: "FFF3CD" } };
                    }

                    ws[cellAddr] = { v: cell.v, s: cellStyle };
                }
            }

            // ── 열 너비 설정 (데이터에 맞게 자동 조정) ──
            ws['!cols'] = colWidths.map(w => ({ wch: Math.min(w + 2, 50) }));

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


    // 관리자 전용 메뉴에 "주식공시 열람" 추가
    const adminMenuItems = [
        { title: "주식공시 열람", icon: <TrendingUp />, color: "bg-stock", path: "#stock-disclosure" },
    ];

    const menuItems = [
        { title: "회원관리", icon: <Phone />, color: "bg-tel", path: "/members" },
        { title: "전화연락망 열람", icon: <Phone />, color: "bg-tel", path: "/guest/members/view" },
        { title: "사용내역 입력", icon: <Pencil />, color: "bg-input", path: "/account/input" },
        { title: "사용내역 편집", icon: <Pencil />, color: "bg-edit", path: "/account/edit" },
        { title: "사용내역 열람", icon: <Eye />, color: "bg-view", path: "/account/view" },
        { title: "영수증 업로드", icon: <Upload />, color: "bg-upload", path: "/receipt/upload" },
        { title: "영수증 편집", icon: <Scissors />, color: "bg-scissors", path: "/receipt/edit" },
        { title: "영수증 열람", icon: <ImageIcon />, color: "bg-image", path: "/receipt/view" },
        { title: "월회비 입금현황", icon: <CreditCard />, color: "bg-card", path: "/fee/status" },
        { title: "활동 대시보드", icon: <Activity />, color: "bg-danger", path: "activity" },
        { title: "재무 대시보드", icon: <BarChart2 />, color: "bg-financial", path: "financial" },
        { title: "엑셀 리포트", icon: <FileSpreadsheet />, color: "bg-excel", path: "excel" },
        { title: "다음 지도 만들기", icon: <MapIcon />, color: "bg-map", path: "/map/create" },
        { title: "실시간 위치공유", icon: <MapIcon />, color: "bg-location", path: "/map/location-share" },
        { title: "각종 모임 활동", icon: <Users />, color: "bg-activities", path: "/activities" },
        { title: "데이터베이스 백업", icon: <Database />, color: "bg-activities", path: "/backup" },
        { title: "시스템 매뉴얼", icon: <BookOpen />, color: "bg-manual", path: "/manual" },
        { title: "학습하기", icon: <BookOpen />, color: "bg-activities", path: "/learn" },
    ];

    const guestSpecificPaths = [
        "/guest/members/view",
        "/account/view",
        "/receipt/view",
        "/fee/status",
        "/guest/fee/status",
        "financial",
        "excel",
    ];

    // 관리자 전용 메뉴를 포함한 전체 메뉴 (관리자만 하단에股票공시 열람 추가)
    const allAdminMenuItems = [...menuItems, ...adminMenuItems];

    const filteredMenuItems = (session?.user as any)?.user_level >= 10
        ? allAdminMenuItems
        : menuItems.filter(item => guestSpecificPaths.includes(item.path));

    const wrapStyle: React.CSSProperties =
        theme === "glass"
            ? {
                minHeight: "100vh",
                background: "linear-gradient(180deg, #000000 0%, #0b1220 55%, #000000 100%)",
                padding: "30px 0",
            }
            : theme === "tech"
                ? {
                    minHeight: "100vh",
                    background: "#000",
                    padding: "30px 0",
                }
                : {
                    minHeight: "100vh",
                    background: "#f0f2f5",
                    padding: "30px 0",
                };

    return (
        <div style={wrapStyle} className={theme === "glass" ? "theme-glass" : theme === "tech" ? "theme-tech" : ""}>
            {(theme === "glass" || theme === "tech") && (
                <canvas
                    ref={spaceCanvasRef}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        zIndex: 0,
                        pointerEvents: "none",
                    }}
                />
            )}
            <style>{`
        .wrap-container {
          max-width: 1100px;
          position: relative;
          z-index: 1;
        }
        .section-title {
          text-align: center;
          color: ${theme === "glass" || theme === "tech" ? "#e2e8f0" : "#2c3e50"};
          font-weight: 800;
          margin-bottom: 25px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .admin-info {
          text-align: center;
          font-size: 14px;
          color: ${theme === "glass" || theme === "tech" ? "rgba(255,255,255,0.85)" : "#555"};
          margin-bottom: 40px;
          background: ${theme === "glass" || theme === "tech" ? "rgba(0,0,0,0.45)" : "rgba(255, 255, 255, 0.8)"};
          padding: 12px;
          border-radius: 10px;
          border: ${theme === "glass" || theme === "tech" ? "1px solid rgba(255,255,255,0.12)" : "none"};
          border-bottom: ${theme === "glass" || theme === "tech" ? "1px solid rgba(255,255,255,0.12)" : "2px solid #ddd"};
        }
        .option-box {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-start;
          gap: 15px;
          padding: 20px 15px;
          background: ${theme === "book" ? "#8d6e63" : theme === "glass" ? "rgba(255,255,255,0.02)" : theme === "tech" ? "rgba(0,0,0,0.12)" : "#ffffff"};
          border-radius: 5px;
          box-shadow: ${theme === "book" ? "inset 0 10px 20px rgba(0, 0, 0, 0.3), 0 15px 30px rgba(0, 0, 0, 0.2)" : theme === "glass" ? "0 25px 60px rgba(0,0,0,0.6)" : theme === "tech" ? "0 0 25px rgba(56, 189, 248, 0.18)" : "0 10px 25px rgba(0,0,0,0.07)"};
          border-bottom: ${theme === "book" ? "15px solid #5d4037" : "none"};
          border: ${theme === "glass" ? "1px solid rgba(255,255,255,0.10)" : theme === "tech" ? "1px solid rgba(56, 189, 248, 0.25)" : "1px solid rgba(0,0,0,0.06)"};
        }

        /* glass/tech header like PHP */
        .space-title {
          text-align: center;
          font-weight: 900;
          letter-spacing: 1px;
          color: #fff;
          margin: 18px 0 16px;
          text-shadow: 0 2px 18px rgba(0,0,0,0.9);
        }
        .space-topbar {
          max-width: 520px;
          margin: 0 auto 26px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 14px;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.16);
          box-shadow: 0 18px 40px rgba(0,0,0,0.55);
        }
        .space-admin {
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(255,255,255,0.92);
          font-weight: 800;
          font-size: 0.95rem;
        }
        .space-admin-badge {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.16);
        }
        .space-logout {
          border: 0;
          padding: 8px 14px;
          border-radius: 999px;
          font-weight: 900;
          background: linear-gradient(180deg, #ff5b7a, #ff274f);
          color: #fff;
          box-shadow: 0 10px 20px rgba(255,39,79,0.25);
        }

        /* tech icon grid (colored rounded squares + labels) */
        .tech-appgrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 26px 22px;
          max-width: 420px;
          margin: 0 auto;
          padding: 6px 0 20px;
        }
        .tech-app {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
        }
        .tech-app-icon {
          width: 86px;
          height: 86px;
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 18px 35px rgba(0,0,0,0.45);
        }
        .tech-app-label {
          color: rgba(255,255,255,0.95);
          font-weight: 900;
          text-shadow: 0 2px 10px rgba(0,0,0,0.9);
          text-align: center;
          line-height: 1.25;
        }

        /* glass 2-column rounded translucent cards */
        .glass-menugrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
          max-width: 560px;
          margin: 0 auto;
          padding: 6px 0 20px;
        }
        .glass-menu {
          border-radius: 22px;
          padding: 22px 16px;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(0,0,0,0.18);
          box-shadow: 0 22px 50px rgba(0,0,0,0.55);
          color: #fff;
          text-align: center;
          user-select: none;
          transition: 0.2s ease;
        }
        .glass-menu:hover { transform: translateY(-4px); }
        .glass-menu-icon {
          width: 60px;
          height: 60px;
          border-radius: 18px;
          margin: 0 auto 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          color: #fff;
        }
        .glass-menu-label {
          font-weight: 900;
          text-shadow: 0 2px 10px rgba(0,0,0,0.9);
        }
        .glass-menu-icon.glass-icon-bg-tel { color: #FF9500 !important; }
        .glass-menu-icon.glass-icon-bg-input { color: #4A90E2 !important; }
        .glass-menu-icon.glass-icon-bg-edit { color: #FF3B30 !important; }
        .glass-menu-icon.glass-icon-bg-view { color: #34C759 !important; }
        .glass-menu-icon.glass-icon-bg-upload { color: #007AFF !important; }
        .glass-menu-icon.glass-icon-bg-scissors { color: #AF52DE !important; }
        .glass-menu-icon.glass-icon-bg-image { color: #5856D6 !important; }
        .glass-menu-icon.glass-icon-bg-card { color: #5AC8FA !important; }
        .glass-menu-icon.glass-icon-bg-financial { color: #FFCC00 !important; }
        .glass-menu-icon.glass-icon-bg-excel { color: #30D158 !important; }
        .glass-menu-icon.glass-icon-bg-map { color: #00C7BE !important; }
        .glass-menu-icon.glass-icon-bg-location { color: #26A69A !important; }
        .glass-menu-icon.glass-icon-bg-activities { color: #FF9500 !important; }
        .glass-menu-icon.glass-icon-bg-manual { color: #8E8E93 !important; }
        .glass-menu-icon.glass-icon-bg-stock { color: #00C853 !important; }

        /* Glass theme design button */
        .glass-theme-btn {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.20);
          color: rgba(255,255,255,0.95);
          padding: 12px 24px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 0.95rem;
          backdrop-filter: blur(10px);
          box-shadow: 0 18px 40px rgba(0,0,0,0.35);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .glass-theme-btn:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.35);
          transform: translateY(-2px);
          box-shadow: 0 22px 50px rgba(0,0,0,0.45);
        }

        /* Tech theme design button */
        .tech-theme-btn {
          background: linear-gradient(180deg, rgba(56, 189, 248, 0.15), rgba(56, 189, 248, 0.08));
          border: 1px solid rgba(56, 189, 248, 0.45);
          color: #38bdf8;
          padding: 12px 24px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 0.95rem;
          backdrop-filter: blur(10px);
          box-shadow: 0 0 25px rgba(56, 189, 248, 0.18);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .tech-theme-btn:hover {
          background: linear-gradient(180deg, rgba(56, 189, 248, 0.25), rgba(56, 189, 248, 0.15));
          border-color: #38bdf8;
          transform: translateY(-2px);
          box-shadow: 0 0 35px rgba(56, 189, 248, 0.35);
        }

        @media (max-width: 520px) {
          .glass-menugrid { max-width: 420px; }
          .glass-menu { padding: 18px 14px; border-radius: 20px; }
          .tech-appgrid { gap: 22px 18px; }
          .tech-app-icon { width: 82px; height: 82px; }
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
        .bg-location { background: #00897B; border-left: 5px solid #00695c; }
        .bg-activities { background: #e67e22; border-left: 5px solid #d35400; }
        .bg-manual { background: #7f8c8d; border-left: 5px solid #626567; }
        .bg-stock { background: linear-gradient(180deg, #00C853, #00E676); border-left: 5px solid #00C853; }

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

        /* icon theme */
        .icon-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 14px;
          width: 100%;
        }
        .icon-item {
          text-decoration: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 8px 6px;
          border-radius: 14px;
          border: 2px solid transparent;
          transition: 0.15s ease;
          user-select: none;
        }
        .icon-item.active {
          background: rgba(13,110,253,0.10);
          border-color: rgba(13,110,253,0.45);
        }
        .icon-box {
          width: 72px;
          height: 72px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 6px 16px rgba(0,0,0,0.18);
        }
        .icon-label {
          font-size: 12px;
          font-weight: 800;
          color: #111827;
          text-align: center;
          line-height: 1.2;
          min-height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-bg-tel { background: linear-gradient(180deg, #34AADC, #0076FF); }
        .icon-bg-input { background: linear-gradient(180deg, #111827, #334155); }
        .icon-bg-edit { background: linear-gradient(180deg, #ef4444, #b91c1c); }
        .icon-bg-view { background: linear-gradient(180deg, #4CD964, #28A745); }
        .icon-bg-upload { background: linear-gradient(180deg, #3b82f6, #1d4ed8); }
        .icon-bg-scissors { background: linear-gradient(180deg, #a855f7, #6d28d9); }
        .icon-bg-image { background: linear-gradient(180deg, #5856D6, #3F51B5); }
        .icon-bg-card { background: linear-gradient(180deg, #14b8a6, #0f766e); }
        .icon-bg-financial { background: linear-gradient(180deg, #FFD700, #FFA000); }
        .icon-bg-excel { background: linear-gradient(180deg, #1D6F42, #43A047); }
        .icon-bg-map { background: linear-gradient(180deg, #0ea5e9, #0369a1); }
        .icon-bg-location { background: linear-gradient(180deg, #26A69A, #00897B); }
        .icon-bg-activities { background: linear-gradient(180deg, #fb923c, #ea580c); }
        .icon-bg-manual { background: linear-gradient(180deg, #94a3b8, #475569); }
        .icon-bg-stock { background: linear-gradient(180deg, #00C853, #00E676); }

        /* list theme */
        .list-box {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .list-item {
          background: white;
          border-radius: 14px;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          border: 2px solid transparent;
          box-shadow: 0 6px 14px rgba(0,0,0,0.06);
          user-select: none;
        }
        .list-item.active {
          border-color: rgba(13,110,253,0.35);
          background: rgba(13,110,253,0.06);
        }
        .list-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .list-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #eef2ff;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .list-title {
          font-weight: 900;
          color: #111827;
        }
        .list-sub {
          font-size: 12px;
          color: #6b7280;
        }

        /* glass theme */
        .glass-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          width: 100%;
        }
        .glass-card {
          border-radius: 18px;
          padding: 18px 14px;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.45);
          color: #fff;
          text-align: center;
          user-select: none;
          transition: 0.2s ease;
        }
        .glass-card:hover { transform: translateY(-4px); }
        .glass-card.active {
          border-color: rgba(255,255,255,0.30);
          background: rgba(255,255,255,0.08);
        }
        .glass-ico {
          width: 56px;
          height: 56px;
          margin: 0 auto 10px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.10);
        }
        .glass-title { font-weight: 900; }

        /* tech theme */
        .tech-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 16px;
          width: 100%;
        }
        .tech-card {
          border: 1px solid rgba(56, 189, 248, 0.45);
          border-radius: 16px;
          padding: 18px 14px;
          height: 160px;
          text-align: center;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: rgba(0,0,0,0.08);
          transition: all 0.25s;
          user-select: none;
        }
        .tech-card:hover {
          transform: translateY(-4px);
          background: rgba(56, 189, 248, 0.08);
          box-shadow: 0 0 25px rgba(56, 189, 248, 0.25);
          border-color: #38bdf8;
        }
        .tech-card.active {
          background: rgba(56, 189, 248, 0.12);
          box-shadow: 0 0 25px rgba(56, 189, 248, 0.25);
        }
        .tech-ico {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: #38bdf8;
        }
        .tech-title {
          color: #94a3b8;
          font-weight: 900;
          text-shadow: 1px 1px 5px rgba(0,0,0,0.8);
        }

        @media (max-width: 992px) {
          .icon-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 576px) {
          .icon-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
          .icon-box { width: 66px; height: 66px; }
          .icon-label { font-size: 11px; }
        }
        .custom-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 15px;
          backdrop-filter: blur(4px);
        }
        .custom-modal {
          background: white;
          padding: 30px;
          border-radius: 20px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          margin: auto;
        }
        .theme-glass .custom-modal,
        .theme-tech .custom-modal {
          background: rgba(15, 20, 35, 0.92);
          border: 1px solid rgba(255,255,255,0.15);
          color: #e2e8f0;
          box-shadow: 0 30px 80px rgba(0,0,0,0.7);
        }
        .theme-glass .custom-modal h4,
        .theme-tech .custom-modal h4 {
          color: #fff;
        }
        .theme-glass .custom-modal .form-label,
        .theme-tech .custom-modal .form-label {
          color: #cbd5e1;
        }
        .theme-glass .custom-modal .form-select,
        .theme-tech .custom-modal .form-select {
          background-color: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.2);
          color: #e2e8f0;
        }
        .theme-glass .custom-modal .form-select option,
        .theme-tech .custom-modal .form-select option {
          background-color: #1e293b;
          color: #e2e8f0;
        }
        .theme-glass .custom-modal .btn-link,
        .theme-tech .custom-modal .btn-link {
          color: rgba(255,255,255,0.7) !important;
        }
        .theme-tech .custom-modal {
          border-color: rgba(56, 189, 248, 0.3);
          box-shadow: 0 0 50px rgba(56, 189, 248, 0.15), 0 30px 80px rgba(0,0,0,0.7);
        }
        @media (max-width: 768px) {
          .custom-modal {
            padding: 20px;
            border-radius: 15px;
            max-height: 85vh;
          }
          .custom-modal .row {
            flex-direction: column;
          }
          .custom-modal .col-lg-8,
          .custom-modal .col-lg-4 {
            width: 100%;
            margin-bottom: 15px;
          }
          .custom-modal .d-flex.gap-3 {
            flex-direction: column;
          }
        }
        @media (max-width: 480px) {
          .custom-modal {
            padding: 15px;
            border-radius: 12px;
          }
          .custom-modal h4 {
            font-size: 1.1rem;
          }
          .custom-modal .summary-card {
            padding: 10px;
          }
          .custom-modal .summary-card .h4 {
            font-size: 1rem;
          }
        }
        .summary-card {
          padding: 15px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          flex: 1;
        }
      `}</style>

            <div className="container wrap-container py-5">
                {(theme === "glass" || theme === "tech") ? (
                    <>
                        <div className="space-title">{theme === "tech" ? "TERRAONE" : "TERRAONE NEXUS"}</div>
                        <div className="space-topbar">
                            <div className="space-admin">
                                <div className="space-admin-badge">
                                    <Users size={16} />
                                </div>
                                <span>{userDisplayName}</span>
                            </div>
                            <button className="space-logout" onClick={() => signOut({ callbackUrl: "/login" })}>로그아웃</button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="section-title">회원관리 도서관{theme !== "book" ? ` (${theme})` : ""}</h2>
                        <div className="admin-info">
                            👤 내 정보: <strong>{userDisplayName}</strong>
                            {(session?.user as any)?.user_level >= 10 && (
                                <span> (Level {(session?.user as any)?.user_level || 0})</span>
                            )}
                            {(theme === "list" && (session?.user as any)?.user_level < 10) && (
                                <button
                                    className="btn btn-sm btn-outline-secondary ms-2"
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                >
                                    로그아웃
                                </button>
                            )}
                        </div>
                    </>
                )}

                <div className="option-box">
                    {theme === "book" && (
                        <>
                            {filteredMenuItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    className={`select-card ${selectedPage === item.path ? 'active' : ''}`}
                                    onClick={() => openMenuPath(item.path)}
                                >
                                    <div className={`book-spine ${item.color}`}>
                                        <div className="mb-1">{item.icon}</div>
                                        <div className="book-title">{item.title}</div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {theme === "icon" && (
                        <div className="icon-grid">
                            {filteredMenuItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    className={`icon-item ${selectedPage === item.path ? 'active' : ''}`}
                                    onClick={() => openMenuPath(item.path)}
                                >
                                    <div className={`icon-box icon-${item.color}`}>
                                        {item.icon}
                                    </div>
                                    <div className="icon-label">{item.title}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {theme === "list" && (
                        <div className="list-box">
                            {filteredMenuItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    className={`list-item ${selectedPage === item.path ? 'active' : ''}`}
                                    onClick={() => openMenuPath(item.path)}
                                >
                                    <div className="list-left">
                                        <div className="list-icon">{item.icon}</div>
                                        <div>
                                            <div className="list-title">{item.title}</div>
                                            <div className="list-sub">클릭해서 선택</div>
                                        </div>
                                    </div>
                                    <i className="bi bi-chevron-right" aria-hidden="true" role="presentation" style={{ color: "#94a3b8", fontWeight: 900 }} />
                                </div>
                            ))}
                        </div>
                    )}

                    {theme === "glass" && (
                        <div className="glass-menugrid">
                            {filteredMenuItems.map((item, idx) => (
                                <div key={idx} className="glass-menu" onClick={() => openMenuPath(item.path)}>
                                    <div className={`glass-menu-icon glass-icon-${item.color}`}>{item.icon}</div>
                                    <div className="glass-menu-label">{item.title}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {theme === "tech" && (
                        <div className="tech-appgrid">
                            {filteredMenuItems.map((item, idx) => (
                                <div key={idx} className="tech-app" onClick={() => openMenuPath(item.path)}>
                                    <div className={`tech-app-icon icon-${item.color}`}>{item.icon}</div>
                                    <div className="tech-app-label">{item.title}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 테마설정 버튼 - 관리자 전용, 모든 테마 */}
                {(session?.user as any)?.user_level >= 10 && (
                    <div className="text-center mt-5 d-flex flex-column gap-3 align-items-center">
                        {theme === "glass" ? (
                            <button className="glass-theme-btn" onClick={() => router.push("/theme")}>
                                <Palette className="me-2" size={18} /> 디자인 변경 / 테마설정
                            </button>
                        ) : theme === "tech" ? (
                            <button className="tech-theme-btn" onClick={() => router.push("/theme")}>
                                <Palette className="me-2" size={18} /> 디자인 변경 / 테마설정
                            </button>
                        ) : (
                            <>
                                <button className="btn btn-outline-secondary rounded-pill fw-bold" onClick={() => router.push("/theme")}>
                                    <Palette className="me-2" size={18} /> 디자인 변경 / 테마 설정
                                </button>
                                <div className="d-flex flex-column flex-md-row gap-3">
                                    <button className="btn btn-primary btn-same shadow-lg d-flex align-items-center justify-content-center" onClick={handleGoNext}>
                                        <BookOpen className="me-2" size={20} /> 책 펼쳐보기
                                    </button>
                                    <button className="btn btn-outline-danger btn-same shadow-sm d-flex align-items-center justify-content-center" onClick={() => signOut({ callbackUrl: "/login" })}>
                                        <LogOut className="me-2" size={20} /> 서재 나가기
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* 로그아웃 버튼 - 게스트(user_level < 10), icon/glass/tech 테마 */}
                {(session?.user as any)?.user_level < 10 && (theme === "icon" || theme === "glass" || theme === "tech") && (
                    <div className="text-center mt-5">
                        {theme === "glass" ? (
                            <button
                                className="glass-theme-btn"
                                style={{ background: "rgba(255,60,60,0.15)", borderColor: "rgba(255,80,80,0.4)" }}
                                onClick={() => signOut({ callbackUrl: "/login" })}
                            >
                                <LogOut className="me-2" size={18} /> 로그아웃
                            </button>
                        ) : theme === "tech" ? (
                            <button
                                className="tech-theme-btn"
                                style={{ background: "rgba(255,60,60,0.12)", borderColor: "rgba(255,80,80,0.4)", color: "#f87171" }}
                                onClick={() => signOut({ callbackUrl: "/login" })}
                            >
                                <LogOut className="me-2" size={18} /> 로그아웃
                            </button>
                        ) : (
                            <button
                                className="btn btn-outline-danger rounded-pill fw-bold px-4"
                                onClick={() => signOut({ callbackUrl: "/login" })}
                            >
                                <LogOut className="me-2" size={18} /> 로그아웃
                            </button>
                        )}
                    </div>
                )}

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
                                    {(() => {
                                        const years = [];
                                        const currentYearVal = new Date().getFullYear();
                                        for (let i = 5; i >= 0; i--) {
                                            years.push(currentYearVal - i);
                                        }
                                        if (new Date().getMonth() === 11 && new Date().getDate() >= 1) {
                                            years.push(currentYearVal + 1);
                                        }
                                        return [...new Set(years)].sort((a, b) => b - a).map(y => (
                                            <option key={y} value={y}>{y}년</option>
                                        ));
                                    })()}
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
                                    {(() => {
                                        const years = [];
                                        const currentYearVal = new Date().getFullYear();
                                        for (let i = 5; i >= 0; i--) {
                                            years.push(currentYearVal - i);
                                        }
                                        if (new Date().getMonth() === 11 && new Date().getDate() >= 1) {
                                            years.push(currentYearVal + 1);
                                        }
                                        return [...new Set(years)].sort((a, b) => b - a).map(y => (
                                            <option key={y} value={y}>{y}년</option>
                                        ));
                                    })()}
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

                {/* 활동 대시보드 모달 */}
                {showActivity && (
                    <ActivityDashboardModal onClose={() => setShowActivity(false)} theme={theme} />
                )}

                {/* 주식공시 열람 모달 */}
                {showStockDisclosure && (
                    <StockDisclosureModal onClose={() => setShowStockDisclosure(false)} />
                )}
            </div>
        </div>
    );
}
