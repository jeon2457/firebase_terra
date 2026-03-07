# 📊 대시보드 - DashboardContent.tsx 완전 학습 가이드

## 🎯 이 파일이 하는 역할

`DashboardContent.tsx`는 **사용자에게 보여줄 대시보드의 main content를 담당**하는 컴포넌트입니다. 로그인한 사용자의 정보, 재정 데이터, 차트, 메뉴 등을 표시합니다.

> 💡 **주요 기능**:
> - 🎨 5가지 테마 지원 (book, icon, glass, list, tech)
> - 📈 재무 데이터 시각화 (차트.js)
> - 🎬 캔버스 애니메이션 (별, 유성)
> - 🔐 세션 관리 및 로그아웃
> - 📱 다양한 기능 메뉴 접근

---

## 📖 코드 구조 분석

### 1️⃣ 임포트 및 초기 설정

```tsx
"use client";

// React 훅들
import { useSession, signOut } from "next-auth/react";  // 세션 및 로그아웃
import { useRouter } from "next/navigation";            // 페이지 이동
import { useEffect, useRef, useState } from "react";    // 상태 및 생명주기

// 스타일과 아이콘
import "bootstrap/dist/css/bootstrap.min.css";
import {
    Phone, Pencil, Eye, Upload, Scissors, ImageIcon,   // Lucide Icons
    CreditCard, PieChart, FileSpreadsheet, Map as MapIcon,
    Users, Database, BookOpen, LogOut, Palette, X, TrendingUp
} from "lucide-react";

// 차트 라이브러리 (재무 데이터 시각화)
import { Chart as ChartJS, ... } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// HTTP 요청 및 Excel
import axios from 'axios';
import * as XLSX from 'xlsx-js-style';

// 컴포넌트
import StockDisclosureModal from './StockDisclosureModal';

// Chart.js 플러그인 등록 (차트가 제대로 그려지도록)
ChartJS.register(...);

/* 👇 [타입 정의] Props 타입 */
type Props = {
    theme?: "book" | "icon" | "glass" | "list" | "tech";
};
```

### 2️⃣ 컴포넌트 시작 - 상태 관리

```tsx
export default function DashboardContent({ theme = "book" }: Props) {
    // 👇 [인증] 세션 정보 가져오기
    const { data: session, status } = useSession();
    const router = useRouter();
    
    // 👇 [UI 상태]
    const [selectedPage, setSelectedPage] = useState<string | null>(null);
    
    // 👇 [애니메이션] 캔버스 참조
    const spaceCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // 👇 [재무 데이터]
    const [showFinancial, setShowFinancial] = useState(false);
    const [financialData, setFinancialData] = useState<{ 
        income: any[], 
        expense: any[] 
    } | null>(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // 👇 [Excel 다운로드]
    const [showExcel, setShowExcel] = useState(false);
    const [excelConfig, setExcelConfig] = useState({ 
        year: new Date().getFullYear(), 
        type: 'all' 
    });

    // 👇 [모달]
    const [showStockDisclosure, setShowStockDisclosure] = useState(false);

    /* 👇 [사용자 정보 표시] */
    const userDisplayName = (() => {
        if (!session?.user) return "사용자";
        
        const user = session.user as any;
        let name = user.name || "사용자";
        const position = user.remark;

        // 권한에 따라 표시 정보 다르게
        if (user.user_level >= 10) {
            name += " (관리자)";  // 관리자
        } else {
            // 일반 사용자 - 직책 표시
            if (position && (position.includes("회장") || position.includes("총무"))) {
                name += ` ${position}`;
            }
            name += "님";
        }
        return name;
    })();

    /* 👇 [캔버스 애니메이션] glass, tech 테마에서만 실행 */
    useEffect(() => {
        if (theme !== "glass" && theme !== "tech") return;

        const canvas = spaceCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 변수들
        let w = 0, h = 0, dpr = 1, animationId = 0;
        let isRunning = true;

        const starCount = 300;      // 별의 개수
        const speed = 1.0;          // 별이 움직이는 속도
        const maxMeteors = 3;       // 동시에 떨어지는 유성 최대 개수

        // 별 배열
        let stars: Array<{ x: number; y: number; z: number; px: number; py: number }> = [];
        
        // 유성 배열
        let meteors: Array<{ ... }> = [];

        /* 👇 [초기화 함수] 캔버스 크기 설정 및 별 생성 */
        const initSpace = () => {
            try {
                w = window.innerWidth;
                h = window.innerHeight;
                
                // 고 DPI 장치 대응 (Retina 디스플레이)
                dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
                
                canvas.width = Math.floor(w * dpr);
                canvas.height = Math.floor(h * dpr);
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

                // 별 300개 생성
                stars = [];
                for (let i = 0; i < starCount; i++) {
                    stars.push({
                        x: Math.random() * w - w / 2,
                        y: Math.random() * h - h / 2,
                        z: Math.random() * w,  // z: 깊이 (카메라에서의 거리)
                        px: 0,  // 이전 x 좌표
                        py: 0,  // 이전 y 좌표
                    });
                }
            } catch (e) {
                console.warn("Failed to initialize canvas:", e);
            }
        };

        /* 👇 [애니메이션 함수] 별과 유성을 그린다 */
        const drawSpace = () => {
            if (!isRunning) return;

            try {
                // 배경: 검은색 반투명 (이전 프레임 흐릿하게)
                ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
                ctx.fillRect(0, 0, w, h);

                // 화면 중앙을 원점으로 (시각 효과)
                ctx.save();
                ctx.translate(w / 2, h / 2);

                // 👇 [별 그리기] 별들이 카메라 쪽으로 다가오는 효과
                for (let i = 0; i < starCount; i++) {
                    const s = stars[i];
                    if (s.z <= 0) continue;

                    // z 값으로 2D 좌표 계산 (원근감)
                    const x = s.x / (s.z / w);
                    const y = s.y / (s.z / w);

                    // 이전 점부터 현재 점까지 선 그리기 (선의 흔적)
                    if (s.px !== 0) {
                        // z가 작을수록 (가까울수록) 밝음
                        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, 1.5 - s.z / w)})`;
                        ctx.lineWidth = Math.max(0.8, (1 - s.z / w) * 3);  // 굵기도 변함
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        ctx.moveTo(s.px, s.py);
                        ctx.lineTo(x, y);
                        ctx.stroke();
                    }

                    // 현재 좌표 저장
                    s.px = x;
                    s.py = y;
                    
                    // z값 감소 (카메라에 가까워짐)
                    s.z -= speed;

                    // z가 0 이하면 뒤로 다시 보냄 (무한 반복 효과)
                    if (s.z <= 0) {
                        s.x = Math.random() * w - w / 2;
                        s.y = Math.random() * h - h / 2;
                        s.z = w;
                        s.px = 0;
                        s.py = 0;
                    }
                }

                ctx.restore();

                // 👇 [유성 생성] 일정 확률로 유성 생성
                if (meteors.length < maxMeteors && Math.random() < meteorSpawnChancePerFrame) {
                    const startX = Math.random() * w;
                    const startY = -40 - Math.random() * 120;
                    const baseSpeed = 12 + Math.random() * 10;
                    
                    // 각도 (115~135도): 아래로 내려오는 각도)
                    const angle = (Math.PI * (115 + Math.random() * 20)) / 180;
                    const vx = Math.cos(angle) * baseSpeed;
                    const vy = Math.sin(angle) * baseSpeed;

                    meteors.push({
                        x: startX,
                        y: startY,
                        vx, vy,
                        life: 0,
                        maxLife: 45 + Math.floor(Math.random() * 35),
                        length: 260 + Math.random() * 220,
                        headRadius: 2.2 + Math.random() * 2.8,
                        alpha: 0.95,
                    });
                }

                // 👇 [유성 그리기] 유성들을 화면에 그린다
                if (meteors.length) {
                    ctx.save();
                    ctx.globalCompositeOperation = "lighter";  // 빛이 섞이는 효과

                    for (const m of meteors) {
                        m.life += 1;
                        m.x += m.vx;
                        m.y += m.vy;

                        // 나이가 들수록 투명해짐
                        const progress = m.life / m.maxLife;
                        const fade = Math.max(0, 1 - progress);
                        const a = m.alpha * fade;

                        // 유성의 꼬리
                        const tx = m.x - m.vx;
                        const ty = m.y - m.vy;
                        const lx = tx - (m.vx * m.length) / 18;
                        const ly = ty - (m.vy * m.length) / 18;

                        // 그래디언트 (흰색 → 파란색 → 투명)
                        const grad = ctx.createLinearGradient(tx, ty, lx, ly);
                        grad.addColorStop(0, `rgba(255,255,255,${a})`);
                        grad.addColorStop(0.12, `rgba(160,220,255,${a * 0.65})`);
                        grad.addColorStop(1, `rgba(0,0,0,0)`);

                        // 꼬리 그리기
                        ctx.strokeStyle = grad;
                        ctx.lineWidth = 2.2;
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        ctx.moveTo(tx, ty);
                        ctx.lineTo(lx, ly);
                        ctx.stroke();

                        // 유성의 머리 (흰 동그라미)
                        ctx.fillStyle = `rgba(255,255,255,${a})`;
                        ctx.beginPath();
                        ctx.arc(tx, ty, m.headRadius, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    // 죽은 유성 제거
                    meteors = meteors.filter(m => 
                        m.life < m.maxLife && m.x < w + 200 && m.y < h + 200
                    );
                    ctx.restore();
                }

                // 다음 프레임 요청
                animationId = requestAnimationFrame(drawSpace);
            } catch (error) {
                console.warn("Canvas animation error, continuing:", error);
                if (isRunning) {
                    animationId = requestAnimationFrame(drawSpace);
                }
            }
        };

        // 👇 [시작]
        try {
            initSpace();
            drawSpace();

            // 기기 크기 변경 시 캔버스 리사이즈
            const handleResize = () => {
                try {
                    initSpace();
                } catch (e) {
                    console.warn("Resize handler error:", e);
                }
            };

            window.addEventListener("resize", handleResize);

            // 👇 [정리] 컴포넌트 언마운트 시 실행
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

    /* 👇 [데이터 로드] 재무 데이터 불러오기 */
    const loadFinancialData = async () => {
        try {
            const res = await axios.get('/api/financial');
            if (res.data.success) {
                setFinancialData({ 
                    income: res.data.income, 
                    expense: res.data.expense 
                });
                return true;
            }
        } catch (error) {
            console.error("Failed to load financial data", error);
        }
        return false;
    };

    /* 👇 [메뉴 처리] 선택된 메뉴 페이지 열기 */
    const openMenuPath = async (path: string) => {
        // 특수 처리들
        if (path === "financial") {
            const success = await loadFinancialData();
            if (success) {
                setShowFinancial(true);
                setSelectedPage("financial");
            }
            return;
        }

        if (path === "stock-disclosure") {
            setShowStockDisclosure(true);
            return;
        }

        // 일반 페이지: 라우트로 이동
        if (path) {
            router.push(path);
        }
    };

    /* 👇 [로딩 상태] */
    if (status === "loading" || !session) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    /* 👇 [차트 데이터 계산] 월별 통계 */
    const getYearlyStats = () => {
        if (!financialData) return { 
            mInc: [], mExp: [], totalInc: 0, totalExp: 0 
        };
        
        const mInc = new Array(12).fill(0);  // 월별 수입
        const mExp = new Array(12).fill(0);  // 월별 지출
        let totalInc = 0;
        let totalExp = 0;

        // 수입 데이터 정렬
        financialData.income.forEach(item => {
            const d = new Date(item.date);
            if (d.getFullYear() === selectedYear) {
                mInc[d.getMonth()] += item.amount;
                totalInc += item.amount;
            }
        });

        // 지출 데이터 정렬
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

    // 👇 [Bar 차트 데이터]
    const barData = {
        labels: Array.from({ length: 12 }, (_, i) => `${i + 1}월`),
        datasets: [
            { 
                label: '수입', 
                data: mInc, 
                backgroundColor: '#4CAF50'  // 초록색
            },
            { 
                label: '지출', 
                data: mExp, 
                backgroundColor: '#f44336'  // 빨간색
            }
        ]
    };

    // 👇 [Doughnut 차트 데이터]
    const doughnutData = {
        labels: ['총 수입', '총 지출'],
        datasets: [{
            data: [totalInc, totalExp],
            backgroundColor: ['#4CAF50', '#f44336']
        }]
    };
```

---

## 🧠 핵심 개념 정리

### 📌 1. 3D 캔버스 애니메이션 (별과 유성)

**원근감 효과 (Perspective Effect)**:

```
z축 개념
  ↑
  |
  ▲ 화면밖 (접근중)
  |
  │─────── 화면 평면
  |
  ▼ 화면밖 (멀어지는 중)
```

**z값으로 2D 좌표 변환**:
```tsx
const x = s.x / (s.z / w);
const y = s.y / (s.z / w);
// z가 작을수록 (가까울수록) x, y가 커짐 → 화면 중앙으로 다가옴
```

### 📌 2. 차트.js를 이용한 데이터 시각화

```tsx
// 1️⃣ 차트 라이브러리 등록
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// 2️⃣ 데이터 구성
const barData = {
    labels: ['1월', '2월', '3월', ...],  // X축 레이블
    datasets: [
        { label: '수입', data: [100, 200, 150], backgroundColor: '#4CAF50' },
        { label: '지출', data: [80, 120, 90], backgroundColor: '#f44336' }
    ]
};

// 3️⃣ 렌더링
<Bar data={barData} />
```

### 📌 3. 재무 데이터 계산

```tsx
const getYearlyStats = () => {
    const mInc = new Array(12).fill(0);  // [0,0,0,...0] (12개 월)
    let totalInc = 0;

    // 데이터 필터링 및 합산
    financialData.income.forEach(item => {
        const d = new Date(item.date);
        
        // 선택된 년도만 처리
        if (d.getFullYear() === selectedYear) {
            // 해당 월에 금액 추가
            mInc[d.getMonth()] += item.amount;
            // 전체 합계에도 추가
            totalInc += item.amount;
        }
    });

    return { mInc, totalInc };
};
```

---

## 💡 초보자가 꼭 알아야 할 점

### Q1: requestAnimationFrame()는 뭔가요?

**답변**: **부드러운 애니메이션을 위한 함수**입니다.

```tsx
// ❌ 나쁜 방식: setInterval (끊긴 애니메이션)
setInterval(() => {
    drawSpace();  // 약 16.67ms마다 실행
}, 16.67);

// ✅ 좋은 방식: requestAnimationFrame (브라우저 최적화)
const animate = () => {
    drawSpace();
    animationId = requestAnimationFrame(animate);  // 다음 프레임 요청
};
animate();
```

**차이점**:
- `setInterval`: 일정한 시간 간격 (CPU 낭비 가능)
- `requestAnimationFrame`: 브라우저가 화면을 그릴 때마다 실행 (최적화됨) ✅

### Q2: ctx.globalCompositeOperation = "lighter" 는?

**답변**: **색상 합성 모드**입니다. 빛이 섞이는 효과를 냅니다.

```tsx
ctx.globalCompositeOperation = "lighter";  // ← 빛이 더해짐

// 예: 흰색 + 흰색 = 더 밝은 연한색
//     흰색 + 파란색 = 밝은 하늘색
```

일반 모드에서는 뒤의 색상이 앞의 색상을 덮지만, "lighter" 모드에서는 두 색상이 합쳐집니다!

### Q3: Date.getMonth()는 왜 0부터 시작하나요?

**답변**: **JavaScript의 표준**입니다.

```tsx
const d = new Date("2024-03-15");

d.getMonth();      // 2 (3월은 0부터 시작, 0=1월, 1=2월, 2=3월)
d.getDate();       // 15 (날짜는 1부터)
d.getFullYear();   // 2024

// 따라서 배열 인덱스로 직접 사용 가능
mInc[d.getMonth()] += amount;  // mInc[2] (3월 데이터)
```

---

## 🎨 시각화: 캔버스 애니메이션 구조

```
✨ 캔버스 애니메이션 흐름

initSpace()
  │
  └─ 캔버스 크기 설정
  └─ 별 300개 생성
  └─ z값 (깊이) 할당
  
drawSpace() (반복)
  │
  ├─ 배경 그리기 (흐릿한 검은색)
  │
  ├─ 별 처리
  │   ├─ z→2D 변환
  │   ├─ 선 그리기
  │   └─ z값 감소
  │
  ├─ 유성 생성 (확률)
  │
  └─ 유성 그리기
      ├─ 꼬리 (그래디언트)
      ├─ 머리 (동그라미)
      └─ 수명 감소

다음 프레임 요청 (requestAnimationFrame)
```

---

## ✅ 최종 정리

| 항목 | 설명 |
|------|------|
| **파일** | `src/app/dashboard/DashboardContent.tsx` |
| **크기** | 1494줄 (매우 큼) |
| **주요 기능** | 대시보드 UI, 차트, 애니메이션 |
| **테마** | 5가지 (book, icon, glass, list, tech) |
| **애니메이션** | Canvas (별, 유성) |
| **차트** | Chart.js (Bar, Doughnut) |
| **데이터** | MongoDB에서 재무 정보 조회 |

---

## 🎓 배운 것 정리

1. ✅ **Canvas API** (2D 그래픽)
2. ✅ **requestAnimationFrame** (부드러운 애니메이션)
3. ✅ **원근감 효과** (3D 느낌)
4. ✅ **Chart.js** (데이터 시각화)
5. ✅ **세션 관리** (useSession)
6. ✅ **상태 관리** (useState)
7. ✅ **API 호출** (axios)

**핵심**: 이 컴포넌트는 Next.js + MongoDB를 활용한 **완전한 대시보드**의 예시입니다! 📊

---

## 📝 추가 참고: 파일 크기가 큰 이유

이 파일이 1494줄이나 되는 이유:

1. **다양한 테마 지원** (book, icon, glass, list, tech) - 각 테마마다 UI 다름
2. **많은 기능 메뉴** (계정, 회원, 대시보드, 차트, Excel 등)
3. **복잡한 상태 관리** (여러 modal, 보이기/숨김 등)
4. **캔버스 애니메이션** (원근감 3D 효과 처리)
5. **재무 데이터 계산** (월별, 연별 집계)

따라서 이것을 **짧은 코드로 이해하기보다는 주요 개념 중심**으로 학습하는 것이 좋습니다! 🎓
