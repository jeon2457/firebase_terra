<?php
ob_start();
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';

// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
require_once __DIR__ . '/php/auth_check.php';
require_once __DIR__ . '/php/db-connect-mongo.php';

// [테마 설정] 이 페이지는 'tech' 테마 전용입니다.
$current_theme = 'tech';

// DB/쿠키에서 현재 테마 확인 로직
if (isset($_SESSION['user_id'])) {
    try {
        // members 컬렉션에서 사용자 ID로 테마 조회
        $userDoc = $collection->findOne(['id' => $_SESSION['user_id']]);
        if ($userDoc && !empty($userDoc['site_theme'])) {
            $current_theme = $userDoc['site_theme'];
        } elseif (isset($_COOKIE['user_site_theme'])) {
            $current_theme = $_COOKIE['user_site_theme'];
        }
    } catch (Exception $e) { /* 무시 */
    }
}

// 만약 테마가 tech가 아니라면, 해당 테마 페이지로 강제 이동
if ($current_theme !== 'tech') {
    $mapping = [
        'book' => 'select.php',
        'icon' => 'select_menu_1.php',
        'glass' => 'select_menu_2.php',
        'list' => 'select_menu_3.php'
    ];
    if (isset($mapping[$current_theme])) {
        header("Location: " . $mapping[$current_theme]);
        exit;
    }
}

$admin_id = htmlspecialchars($_SESSION['user_id']);
$admin_level = htmlspecialchars($_SESSION['user_level']);
?>
<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>관리자 대시보드 - Tech</title>

    <link rel="manifest" href="manifest.json">
    <meta name="msapplication-config" content="/browserconfig.xml">
    <link rel="icon" href="/favicon.png?v=2" />

    <!-- Bootstrap 5 & Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <!-- Google Fonts (Rubik for Tech feel) -->
    <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js"></script>

    <style>
        :root {
            /* 배경은 캔버스가 처리하므로 투명하게 */
            --bg-dark: #000000;

            /* 🔥 [수정됨] 카드 배경 완전 투명 (transparent) */
            --card-bg: transparent;

            --text-main: #e2e8f0;
            --text-sub: #94a3b8;
            --accent-color: #38bdf8;
            /* Cyan */
            --glow-color: rgba(56, 189, 248, 0.5);
        }

        body {
            background-color: var(--bg-dark);
            color: var(--text-main);
            font-family: 'Rubik', sans-serif;
            min-height: 100vh;
            padding-bottom: 50px;
            overflow-x: hidden;
            position: relative;
            margin: 0;
        }

        /* 🚀 배경 워프 효과 캔버스 스타일 */
        #starfield {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            /* 콘텐츠 뒤로 */
            background: #000;
            /* 캔버스 기본 배경 */
        }

        .dashboard-container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px 20px;
            position: relative;
            z-index: 10;
        }

        /* Header Area */
        .header-area {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(56, 189, 248, 0.3);
        }

        .page-title {
            font-size: 1.8rem;
            font-weight: 700;
            background: linear-gradient(90deg, #38bdf8, #818cf8);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 0;
            text-shadow: 0 0 30px rgba(56, 189, 248, 0.5);
        }

        .user-badge {
            background: rgba(15, 23, 42, 0.5);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }

        /* Grid Layout */
        .tech-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 20px;
        }

        /* Card Style */
        .tech-card {
            position: relative;
            background: var(--card-bg);
            /* 완전 투명 */

            /* 🔥 [수정됨] 테두리를 조금 더 선명하게 해서 영역 구분 */
            border: 1px solid rgba(56, 189, 248, 0.5);

            border-radius: 16px;
            padding: 25px 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 180px;

            /* 🔥 [중요] 배경 블러 제거하여 혜성이 그대로 보이게 함 */
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            box-shadow: none;
            /* 기본 그림자 제거 */
        }

        .tech-card input[type="checkbox"] {
            position: absolute;
            opacity: 0;
            cursor: pointer;
            height: 0;
            width: 0;
        }

        .icon-box {
            width: 60px;
            height: 60px;
            /* 아이콘 배경은 약간 남겨서 가독성 확보 (반투명) */
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            color: var(--text-sub);
            margin-bottom: 15px;
            transition: all 0.3s ease;
            /* 아이콘 박스 뒤는 살짝 블러처리 */
            backdrop-filter: blur(2px);
        }

        .card-title {
            font-size: 1rem;
            font-weight: 500;
            color: var(--text-sub);
            transition: color 0.3s ease;
            text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.8);
            /* 글자 잘 보이게 그림자 추가 */
        }

        /* Hover Effects */
        .tech-card:hover {
            transform: translateY(-5px);
            /* 호버 시 아주 약한 틴트만 줌 */
            background: rgba(56, 189, 248, 0.1);
            box-shadow: 0 0 25px rgba(56, 189, 248, 0.4), inset 0 0 10px rgba(56, 189, 248, 0.1);
            border-color: #38bdf8;
        }

        .tech-card:hover .icon-box {
            background: rgba(56, 189, 248, 0.2);
            color: #fff;
            box-shadow: 0 0 15px rgba(56, 189, 248, 0.5);
            border-color: #38bdf8;
        }

        .tech-card:hover .card-title {
            color: #fff;
            text-shadow: 0 0 10px rgba(56, 189, 248, 1);
        }

        /* Active (Selected) State */
        .tech-card.active {
            border-color: var(--accent-color);
            background: rgba(56, 189, 248, 0.15);
            /* 선택됨 표시 */
            box-shadow: 0 0 30px var(--glow-color), inset 0 0 20px rgba(56, 189, 248, 0.2);
        }

        .tech-card.active .icon-box {
            background: var(--accent-color);
            box-shadow: 0 0 20px var(--glow-color);
            transform: scale(1.1);
            color: #000;
        }

        .tech-card.active .icon-box i {
            color: #0f172a !important;
        }

        .tech-card.active .card-title {
            color: var(--accent-color);
            font-weight: 700;
            text-shadow: 0 0 10px var(--glow-color);
        }

        /* Bottom Controls */
        .control-bar {
            margin-top: 50px;
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
        }

        .btn-tech {
            background: rgba(0, 0, 0, 0.5);
            /* 버튼 배경 */
            border: 1px solid var(--accent-color);
            color: var(--accent-color);
            padding: 12px 30px;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
        }

        .btn-tech:hover {
            background: var(--accent-color);
            color: #000;
            box-shadow: 0 0 30px var(--glow-color);
        }

        .btn-sub {
            border-color: #64748b;
            color: #94a3b8;
        }

        .btn-sub:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            border-color: #94a3b8;
            box-shadow: 0 0 15px rgba(148, 163, 184, 0.4);
        }

        @media (max-width: 576px) {
            .tech-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .tech-card {
                height: 150px;
                padding: 15px 10px;
            }

            .icon-box {
                width: 45px;
                height: 45px;
                font-size: 1.4rem;
            }

            .card-title {
                font-size: 0.9rem;
            }
        }

        /* 📊 대시보드 모달 스타일 (Tech Theme Override) */
        .dashboard-modal-body {
            padding: 20px;
            background: #f8f9fa;
            /* Light background for charts */
            color: #333;
        }

        .chart-container {
            background: white;
            border-radius: 15px;
            padding: 15px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            color: #333;
        }

        .summary-card-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }

        .summary-card {
            background: white;
            border-radius: 12px;
            padding: 15px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            color: #333;
        }

        .summary-title {
            font-size: 0.9rem;
            color: #666;
            margin-bottom: 5px;
        }

        .summary-amount {
            font-size: 1.2rem;
            font-weight: 700;
        }

        .text-income {
            color: #4CAF50;
        }

        .text-expense {
            color: #f44336;
        }

        .text-balance {
            color: #2196F3;
        }

        @media (max-width: 768px) {
            .summary-card-row {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>

<body>

    <!-- 🚀 우주 워프 효과 스크립트 (직접 포함) -->
    <canvas id="starfield"></canvas>

    <div class="dashboard-container">
        <div class="header-area">
            <h1 class="page-title"><i class="bi bi-grid-3x3-gap-fill"></i> SYSTEM MENU</h1>
            <div class="user-badge">
                <i class="bi bi-person-circle"></i> <?= $admin_id ?> (Lv.<?= $admin_level ?>)
            </div>
        </div>

        <form id="selectForm">
            <div class="tech-grid">
                <!-- 1. 전화연락망 관리 (Green) -->
                <label class="tech-card" onclick="selectCard(this)">
                    <input type="checkbox" name="pageSelect" value="./tel_select_1.php">
                    <div class="icon-box">
                        <i class="bi bi-telephone" style="color: #4ade80;"></i>
                    </div>
                    <div class="card-title">전화연락망 관리</div>
                </label>

                <!-- 2. 사용내역 입력 (Yellow) -->
                <label class="tech-card" onclick="selectCard(this)">
                    <input type="checkbox" name="pageSelect" value="account_input.php">
                    <div class="icon-box">
                        <i class="bi bi-pencil-square" style="color: #facc15;"></i>
                    </div>
                    <div class="card-title">사용내역 입력</div>
                </label>

                <!-- 3. 사용내역 편집 (Orange) -->
                <label class="tech-card" onclick="selectCard(this)">
                    <input type="checkbox" name="pageSelect" value="account_edit.php">
                    <div class="icon-box">
                        <i class="bi bi-sliders" style="color: #fb923c;"></i>
                    </div>
                    <div class="card-title">사용내역 편집</div>
                </label>

                <!-- 4. 사용내역 열람 (Blue) -->
                <label class="tech-card" onclick="selectCard(this)">
                    <input type="checkbox" name="pageSelect" value="account_view.php">
                    <div class="icon-box">
                        <i class="bi bi-table" style="color: #60a5fa;"></i>
                    </div>
                    <div class="card-title">사용내역 열람</div>
                </label>

                <!-- 5. 영수증 업로드 (Cyan) -->
                <label class="tech-card" onclick="selectCard(this)">
                    <input type="checkbox" name="pageSelect" value="images_upload.php">
                    <div class="icon-box">
                        <i class="bi bi-cloud-upload" style="color: #22d3ee;"></i>
                    </div>
                    <div class="card-title">영수증 업로드</div>
                </label>

                <!-- 6. 영수증 편집 (Pink) -->
                <label class="tech-card" onclick="selectCard(this)">
                    <input type="checkbox" name="pageSelect" value="images_edit.php">
                    <div class="icon-box">
                        <i class="bi bi-scissors" style="color: #f472b6;"></i>
                    </div>
                    <div class="card-title">영수증 편집</div>
                </label>

                <!-- 7. 영수증 열람 (Purple) -->
                <label class="tech-card" onclick="selectCard(this)">
                    <input type="checkbox" name="pageSelect" value="images_view.php">
                    <div class="icon-box">
                        <i class="bi bi-images" style="color: #c084fc;"></i>
                    </div>
                    <div class="card-title">영수증 열람</div>
                </label>

                <!-- 8. 월회비 입금현황 (Gold) -->
                <label class="tech-card" onclick="selectCard(this)">
                    <input type="checkbox" name="pageSelect" value="account_pass.php">
                    <div class="icon-box">
                        <i class="bi bi-credit-card-2-front" style="color: #fbbf24;"></i>
                    </div>
                    <div class="card-title">월회비 입금현황</div>
                </label>

                <!-- 9. 재무 대시보드 (Gold) -->
                <label class="tech-card" onclick="selectCard(this)">
                    <input type="checkbox" name="pageSelect" value="#financialDashboard">
                    <div class="icon-box">
                        <i class="bi bi-pie-chart-fill" style="color: #FFD700;"></i>
                    </div>
                    <div class="card-title">재무 대시보드</div>
                </label>

                <!-- 10. 엑셀 리포트 (Green) -->
                <label class="tech-card" onclick="selectCard(this)">
                    <input type="checkbox" name="pageSelect" value="#excelDownload">
                    <div class="icon-box">
                        <i class="bi bi-file-earmark-excel-fill" style="color: #4ade80;"></i>
                    </div>
                    <div class="card-title">엑셀 리포트</div>
                </label>

                <!-- 9. 다음 지도 만들기 (Red/Rose) -->
                <label class="tech-card" onclick="selectCard(this)">
                    <input type="checkbox" name="pageSelect" value="map.php">
                    <div class="icon-box">
                        <i class="bi bi-map-fill" style="color: #f43f5e;"></i>
                    </div>
                    <div class="card-title">다음 지도 만들기</div>
                </label>

                <!-- 10. 각종 모임 활동 (Teal) -->
                <label class="tech-card" onclick="selectCard(this)">
                    <input type="checkbox" name="pageSelect" value="select_1.php">
                    <div class="icon-box">
                        <i class="bi bi-people-fill" style="color: #2dd4bf;"></i>
                    </div>
                    <div class="card-title">각종 모임 활동</div>
                </label>


                <label class="tech-card" onclick="selectCard(this)">
                    <input type="checkbox" name="pageSelect" value="database_backup_restore.php">
                    <div class="icon-box">
                        <i class="bi bi-database-fill-gear" style="color: #e2e8f0;"></i>
                    </div>
                    <div class="card-title">데이타베이스 백업</div>
                </label>

                <!-- 11. 시스템 매뉴얼 (White/Gray) -->
                <label class="tech-card" onclick="selectCard(this)">
                    <input type="checkbox" name="pageSelect" value="firebase_system_manual.html">
                    <div class="icon-box">
                        <i class="bi bi-journal-text" style="color: #e2e8f0;"></i>
                    </div>
                    <div class="card-title">시스템 매뉴얼</div>
                </label>
            </div>

            <div class="control-bar">
                <button type="button" class="btn-tech" onclick="goNext()">
                    실행하기 <i class="bi bi-arrow-right-short"></i>
                </button>
                <a href="menu_design_selection.php" class="btn-tech btn-sub">
                    <i class="bi bi-palette"></i> 테마변경
                </a>
                <a href="./logout.php" class="btn-tech btn-sub" style="border-color:#ef4444; color:#ef4444;">
                    <i class="bi bi-power"></i> LOGOUT
                </a>
            </div>
        </form>
    </div>


    <!-- 🚀 우주 워프 효과 스크립트 -->
    <script>
        /* 🌠 우주 비행 애니메이션 (선명도 최적화 버전) */
        const canvas = document.getElementById('starfield');
        const ctx = canvas.getContext('2d');

        let w, h, stars = [];
        const starCount = 300; // 개수를 줄여서 각각의 별을 더 선명하게 만듦
        const speed = 1.0;     // 쾌적한 속도

        function initSpace() {
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = w;
            canvas.height = h;
            stars = [];
            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * w - w / 2,
                    y: Math.random() * h - h / 2,
                    z: Math.random() * w,
                    px: 0, py: 0
                });
            }
        }

        function drawSpace() {
            /* ✅ 핵심: 0.1보다 높은 0.25를 사용하여 별의 머리를 더 하얗고 선명하게 표현함 */
            ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
            ctx.fillRect(0, 0, w, h);

            ctx.save();
            ctx.translate(w / 2, h / 2);

            for (let i = 0; i < starCount; i++) {
                let s = stars[i];

                let x = s.x / (s.z / w);
                let y = s.y / (s.z / w);

                if (s.px !== 0) {
                    // 별의 선명도를 위해 순백색(255,255,255) 농도를 높임
                    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, 1.5 - s.z / w)})`;
                    ctx.lineWidth = Math.max(0.8, (1 - s.z / w) * 3);
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(s.px, s.py);
                    ctx.stroke();
                }

                s.px = x;
                s.py = y;
                s.z -= speed;

                if (s.z <= 0 || x < -w || x > w || y < -h || y > h) {
                    s.z = w;
                    s.x = Math.random() * w - w / 2;
                    s.y = Math.random() * h - h / 2;
                    s.px = 0;
                    s.py = 0;
                }
            }
            ctx.restore();
            requestAnimationFrame(drawSpace);
        }

        window.addEventListener('resize', initSpace);
        initSpace();
        drawSpace();



        // 카드 선택 로직
        function selectCard(element) {
            document.querySelectorAll('.tech-card').forEach(card => {
                card.classList.remove('active');
                let checkbox = card.querySelector('input[type="checkbox"]');
                if (checkbox) checkbox.checked = false;
            });

            element.classList.add('active');
            let checkbox = element.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = true;
        }

        function goNext() {
            const selected = document.querySelector('input[name="pageSelect"]:checked');
            if (!selected) {
                alert("접속할 메뉴를 선택해주세요.");
                return;
            }

            // 💰 재무 대시보드 선택 시
            if (selected.value === '#financialDashboard') {
                openDashboardModal();
                return;
            }

            // 📗 엑셀 리포트 선택 시
            if (selected.value === '#excelDownload') {
                openExcelModal();
                return;
            }

            location.href = selected.value;
        }

        // =========================================
        // 📊 재무 대시보드 & 엑셀 리포트 로직
        // =========================================

        let incomeDataCache = [];
        let expenseDataCache = [];
        let selectedYear = new Date().getFullYear();
        let yearChart, incomeChart;

        // 데이터 로드 (MySQL API)
        async function fetchFinancialData() {
            try {
                const response = await fetch('php/get_financial_data.php');
                const data = await response.json();

                if (data.error) {
                    alert("데이터 로드 오류: " + data.error);
                    return false;
                }

                incomeDataCache = data.income || [];
                expenseDataCache = data.expense || [];
                return true;
            } catch (error) {
                console.error("API Error:", error);
                alert("데이터를 가져오는 중 오류가 발생했습니다.");
                return false;
            }
        }

        // --- Dashboard Logic ---
        async function openDashboardModal() {
            // 데이터가 없으면 먼저 가져옴
            if (incomeDataCache.length === 0 && expenseDataCache.length === 0) {
                const success = await fetchFinancialData();
                if (!success) return;
            }

            const modal = new bootstrap.Modal(document.getElementById('financialModal'));
            modal.show();
            updateDashboard();
        }

        window.updateDashboard = function () {
            updateYearOptions('dashYearSelect'); // 연도 선택 옵션 갱신

            // Calculate Totals for selectedYear
            const yearTotalIncome = sumYearAmount(incomeDataCache, selectedYear);
            const yearTotalExpense = sumYearAmount(expenseDataCache, selectedYear);
            const yearTotalBalance = yearTotalIncome - yearTotalExpense;

            document.getElementById('dashTotalIncome').innerText = yearTotalIncome.toLocaleString() + '원';
            document.getElementById('dashTotalExpense').innerText = yearTotalExpense.toLocaleString() + '원';
            document.getElementById('dashTotalBalance').innerText = yearTotalBalance.toLocaleString() + '원';

            renderCharts();
        }

        window.changeDashYear = function (select) {
            selectedYear = parseInt(select.value);
            updateDashboard();
        }

        function updateYearOptions(elementId) {
            const select = document.getElementById(elementId);
            // 이미 옵션이 있고 현재 연도가 선택되어 있다면 스킵 (불필요한 리렌더링 방지)
            if (select.options.length > 0 && parseInt(select.value) === selectedYear) return;

            select.innerHTML = '';
            const currentY = new Date().getFullYear();
            // 최근 3년 + 내년 정도까지
            for (let y = currentY + 1; y >= currentY - 4; y--) {
                const option = document.createElement('option');
                option.value = y;
                option.text = `${y}년`;
                if (y === selectedYear) option.selected = true;
                select.appendChild(option);
            }
        }

        function sumYearAmount(dataArray, year) {
            return dataArray.reduce((sum, item) => {
                if (!item.date) return sum;
                const d = new Date(item.date);
                if (d.getFullYear() === year) {
                    return sum + Number(item.amount);
                }
                return sum;
            }, 0);
        }

        function renderCharts() {
            // 1. Monthly Comparison (Bar Chart)
            const ctxYear = document.getElementById('yearlyChart').getContext('2d');
            const months = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);

            const monthlyIncome = new Array(12).fill(0);
            const monthlyExpense = new Array(12).fill(0);

            incomeDataCache.forEach(item => {
                if (!item.date) return;
                const d = new Date(item.date);
                if (d.getFullYear() === selectedYear) monthlyIncome[d.getMonth()] += Number(item.amount);
            });

            expenseDataCache.forEach(item => {
                if (!item.date) return;
                const d = new Date(item.date);
                if (d.getFullYear() === selectedYear) monthlyExpense[d.getMonth()] += Number(item.amount);
            });

            if (yearChart) yearChart.destroy();
            yearChart = new Chart(ctxYear, {
                type: 'bar',
                data: {
                    labels: months,
                    datasets: [
                        { label: '수입', data: monthlyIncome, backgroundColor: '#4CAF50' },
                        { label: '지출', data: monthlyExpense, backgroundColor: '#f44336' }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: `${selectedYear}년 월별 수입/지출 현황` }
                    }
                }
            });

            // 2. Income vs Expense Ratio (Pie Chart) - Total for the year
            const ctxIncome = document.getElementById('incomeChart').getContext('2d');
            const totalInc = monthlyIncome.reduce((a, b) => a + b, 0);
            const totalExp = monthlyExpense.reduce((a, b) => a + b, 0);

            if (incomeChart) incomeChart.destroy();
            incomeChart = new Chart(ctxIncome, {
                type: 'doughnut',
                data: {
                    labels: ['총 수입', '총 지출'],
                    datasets: [{
                        data: [totalInc, totalExp],
                        backgroundColor: ['#4CAF50', '#f44336'],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' },
                        title: { display: true, text: `${selectedYear}년 전체 비율` }
                    }
                }
            });
        }

        // --- Excel Report Logic ---
        async function openExcelModal() {
            // 데이터가 없으면 먼저 가져옴
            if (incomeDataCache.length === 0 && expenseDataCache.length === 0) {
                const success = await fetchFinancialData();
                if (!success) return;
            }

            updateYearOptions('excelYearSelect');
            const modal = new bootstrap.Modal(document.getElementById('excelModal'));
            modal.show();
        }

        window.downloadExcelReport = function () {
            const year = parseInt(document.getElementById('excelYearSelect').value);
            const type = document.getElementById('excelTypeSelect').value; // all, income, expense

            const btn = document.querySelector('#excelModal .btn-success');
            const originalText = btn.innerText;
            btn.innerText = "데이터 처리 중...";
            btn.disabled = true;

            try {
                let wb = XLSX.utils.book_new();

                if (type === 'all' || type === 'income') {
                    const wsIncome = createSheet(incomeDataCache, year, '수입');
                    XLSX.utils.book_append_sheet(wb, wsIncome, "수입내역");
                }

                if (type === 'all' || type === 'expense') {
                    const wsExpense = createSheet(expenseDataCache, year, '지출');
                    XLSX.utils.book_append_sheet(wb, wsExpense, "지출내역");
                }

                // Save File
                XLSX.writeFile(wb, `TerraOne_회계장부_${year}년.xlsx`);

                // Close Modal
                const modalEl = document.getElementById('excelModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();

            } catch (e) {
                alert("엑셀 생성 중 오류가 발생했습니다: " + e.message);
                console.error(e);
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        }

        function createSheet(dataArray, year, sheetName) {
            // Filter and Sort Data
            const sortedItems = dataArray
                .filter(item => {
                    if (!item.date) return false;
                    const d = new Date(item.date);
                    return d.getFullYear() === year;
                })
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            // Prepare Data Array
            const rows = [];

            // 1. Title Row
            rows.push([`${year}년 ${sheetName} 내역`]);

            // 2. Header Row
            const header = ["NO", "날짜", "Time", "항목(Category)", "비고(Description)", "금액"];
            rows.push(header);

            let total = 0;
            sortedItems.forEach((item, index) => {
                const d = new Date(item.date);
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                // 시간 처리는 DB 포맷에 따라 다를 수 있음 (YYYY-MM-DD HH:MM:SS)
                const timeStr = item.date.length > 10 ? item.date.substring(11, 16) : '';

                const amount = Number(item.amount) || 0;
                rows.push([
                    index + 1,
                    dateStr,
                    timeStr,
                    item.category || '',
                    item.description || '',
                    amount
                ]);
                total += amount;
            });

            // Add Summary Row
            rows.push(["", "", "", "합계", "", total]);

            // Create Sheet
            const ws = XLSX.utils.aoa_to_sheet(rows);

            // Merge Title Row (A1:F1)
            if (!ws['!merges']) ws['!merges'] = [];
            ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } });

            // --- 🎨 Styling Logic (xlsx-js-style) ---
            const range = XLSX.utils.decode_range(ws['!ref']);

            // Define Styles
            const titleStyle = {
                font: { bold: true, sz: 18, color: { rgb: "333333" } },
                alignment: { horizontal: "center", vertical: "center" },
                fill: { fgColor: { rgb: "FFFFFF" } }
            };

            const headerStyle = {
                font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "1D6F42" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                    top: { style: "thin" }, bottom: { style: "thin" },
                    left: { style: "thin" }, right: { style: "thin" }
                }
            };

            const centerStyle = {
                alignment: { horizontal: "center", vertical: "center" },
                border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
            };

            const rightStyle = {
                alignment: { horizontal: "right", vertical: "center" },
                border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } },
                numFmt: "#,##0" // 천단위 콤마
            };

            const summaryStyle = {
                font: { bold: true },
                fill: { fgColor: { rgb: "E2EFDA" } },
                alignment: { horizontal: "right" },
                border: { top: { style: "double" } },
                numFmt: "#,##0"
            };

            // Apply Styles
            for (let R = range.s.r; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cell_address = { c: C, r: R };
                    const cell_ref = XLSX.utils.encode_cell(cell_address);

                    if (!ws[cell_ref]) continue;

                    if (R === 0) { // Title
                        ws[cell_ref].s = titleStyle;
                    } else if (R === 1) { // Header
                        ws[cell_ref].s = headerStyle;
                    } else if (R < range.e.r) { // Data
                        if (C === 5) {
                            ws[cell_ref].s = rightStyle;
                            ws[cell_ref].t = 'n';
                        } else {
                            ws[cell_ref].s = centerStyle;
                        }
                    } else { // Summary (Last Row)
                        ws[cell_ref].s = summaryStyle;
                        if (C === 3) {
                            ws[cell_ref].s = { ...summaryStyle, alignment: { horizontal: "center" } };
                        }
                    }
                }
            }

            // Column Widths
            ws['!cols'] = [
                { wch: 6 },  // NO
                { wch: 12 }, // Date
                { wch: 10 }, // Time
                { wch: 20 }, // Category
                { wch: 45 }, // Desc
                { wch: 15 }  // Amount
            ];

            return ws;
        }
    </script>
    <!-- 💰 재무 대시보드 모달 -->
    <div class="modal fade" id="financialModal" tabindex="-1">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content text-dark">
                <div class="modal-header bg-primary text-white"
                    style="background: linear-gradient(135deg, #FFD700, #FFA000) !important; color: #333 !important;">
                    <h5 class="modal-title fw-bold"><i class="bi bi-pie-chart-fill"></i> 재무 대시보드</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body dashboard-modal-body text-dark">

                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6 class="m-0 fw-bold text-secondary">연도 선택</h6>
                        <select id="dashYearSelect" class="form-select form-select-sm shadow-sm" style="width: 120px;"
                            onchange="changeDashYear(this)"></select>
                    </div>

                    <!-- 요약 카드 -->
                    <div class="summary-card-row">
                        <div class="summary-card">
                            <div class="summary-title">연간 총 수입</div>
                            <div class="summary-amount text-income" id="dashTotalIncome">0원</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-title">연간 총 지출</div>
                            <div class="summary-amount text-expense" id="dashTotalExpense">0원</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-title">순 이익 (총 잔액)</div>
                            <div class="summary-amount text-balance" id="dashTotalBalance">0원</div>
                        </div>
                    </div>

                    <!-- 차트 영역 -->
                    <div class="row">
                        <div class="col-lg-8">
                            <div class="chart-container" style="height: 400px;">
                                <canvas id="yearlyChart"></canvas>
                            </div>
                        </div>
                        <div class="col-lg-4">
                            <div class="chart-container" style="height: 400px;">
                                <canvas id="incomeChart"></canvas>
                            </div>
                        </div>
                    </div>

                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
                </div>
            </div>
        </div>
    </div>

    <!-- 📗 엑셀 다운로드 설정 모달 -->
    <div class="modal fade" id="excelModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content text-dark">
                <div class="modal-header bg-success text-white" style="background-color: #1D6F42 !important;">
                    <h5 class="modal-title"><i class="bi bi-file-earmark-excel-fill"></i> 엑셀 리포트 설정</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label fw-bold">대상 연도</label>
                        <select id="excelYearSelect" class="form-select"></select>
                    </div>
                    <div class="mb-4">
                        <label class="form-label fw-bold">출력 항목</label>
                        <select id="excelTypeSelect" class="form-select">
                            <option value="all">전체 (수입 + 지출)</option>
                            <option value="income">수입 내역만</option>
                            <option value="expense">지출 내역만</option>
                        </select>
                    </div>
                    <div class="d-grid">
                        <button class="btn btn-success p-3 fw-bold" onclick="downloadExcelReport()"
                            style="background-color: #1D6F42; border:none;">
                            <i class="bi bi-download"></i> 엑셀 파일 다운로드 (.xlsx)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>