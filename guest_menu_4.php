<?php
ob_start();
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';

// 로그인 체크
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
require_once __DIR__ . '/php/db-connect-mongo.php';

// [테마 설정] 이 페이지는 'tech' 테마 전용입니다.
$current_theme = 'tech';

// DB/쿠키에서 현재 테마 확인 로직 (타 페이지 강제이동 방지용)
if (isset($_SESSION['user_id'])) {
    try {
        $userDoc = $collection->findOne(['id' => $_SESSION['user_id']]);
        if ($userDoc && !empty($userDoc['site_theme'])) {
            $current_theme = $userDoc['site_theme'];
        } elseif (isset($_COOKIE['user_site_theme'])) {
            $current_theme = $_COOKIE['user_site_theme'];
        }
    } catch (Exception $e) { /* 무시 */
    }
}

// 만약 테마가 tech가 아니라면, 해당 테마 페이지로 이동
if ($current_theme !== 'tech') {
    $mapping = [
        'book' => 'guest_menu_book.php',
        'icon' => 'guest_menu_1.php',
        'glass' => 'guest_menu_2.php',
        'list' => 'guest_menu_3.php'
    ];
    if (isset($mapping[$current_theme])) {
        header("Location: " . $mapping[$current_theme]);
        exit;
    }
}

$user_id = htmlspecialchars($_SESSION['user_id']);
$user_name = htmlspecialchars($_SESSION['user_name'] ?? '사용자');
$user_level = htmlspecialchars($_SESSION['user_level'] ?? 0);

// 직책에 따른 이름 표시 처리
$user_remark = $_SESSION['user_remark'] ?? '';
$display_name = $user_name;
if (strpos($user_remark, '회장') !== false) {
    $display_name .= " 회장님";
} elseif (strpos($user_remark, '총무') !== false) {
    $display_name .= " 총무님";
} else {
    $display_name .= "님";
}
?>
<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>메뉴선택-Tech형(Guest)</title>

    <link rel="manifest" href="manifest.json">
    <meta name="msapplication-config" content="/browserconfig.xml">
    <link rel="icon" href="/favicon.png?v=2" />

    <!-- Bootstrap 5 & Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <!-- Google Fonts (Rubik for Tech feel) -->
    <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap" rel="stylesheet">

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
    </style>
</head>

<body>

    <!-- 🚀 우주 워프 효과 스크립트 (직접 포함) -->
    <canvas id="starfield"></canvas>

    <div class="dashboard-container">
        <div class="header-area">
            <h1 class="page-title"><i class="bi bi-grid-3x3-gap-fill"></i> GUEST MENU</h1>
            <div class="user-badge">
                <i class="bi bi-person-circle"></i> <?= htmlspecialchars($display_name) ?>
            </div>
        </div>

        <form id="selectForm">
            <div class="tech-grid">
                <!-- 1. 연락망 보기 (Green) -->
                <label class="tech-card" onclick="selectCard(this)">
                    <input type="checkbox" name="pageSelect" value="tel_view_guest.php">
                    <div class="icon-box">
                        <i class="bi bi-people-fill" style="color: #4ade80;"></i>
                    </div>
                    <div class="card-title">연락망 보기</div>
                </label>

                <!-- 2. 사용내역 열람 (Blue) -->
                <label class="tech-card" onclick="selectCard(this)">
                    <input type="checkbox" name="pageSelect" value="account_view_guest.php">
                    <div class="icon-box">
                        <i class="bi bi-eye" style="color: #60a5fa;"></i>
                    </div>
                    <div class="card-title">사용내역 열람</div>
                </label>

                <!-- 3. 영수증 열람 (Purple) -->
                <label class="tech-card" onclick="selectCard(this)">
                    <input type="checkbox" name="pageSelect" value="images_view_guest.php">
                    <div class="icon-box">
                        <i class="bi bi-images" style="color: #c084fc;"></i>
                    </div>
                    <div class="card-title">영수증 열람</div>
                </label>

                <!-- 4. 회비 현황 (Gold) -->
                <label class="tech-card" onclick="selectCard(this)">
                    <input type="checkbox" name="pageSelect" value="account_pass_guest.php">
                    <div class="icon-box">
                        <i class="bi bi-credit-card-2-front" style="color: #fbbf24;"></i>
                    </div>
                    <div class="card-title">회비 현황</div>
                </label>

                <!-- 5. 재무 대시보드 -->
                <label class="tech-card" onclick="selectCard(this)">
                    <input type="checkbox" name="pageSelect" value="#financialDashboard">
                    <div class="icon-box">
                        <i class="bi bi-pie-chart-fill" style="color: #f59e0b;"></i>
                    </div>
                    <div class="card-title">재무 대시보드</div>
                </label>

                <!-- 6. 엑셀 리포트 -->
                <label class="tech-card" onclick="selectCard(this)">
                    <input type="checkbox" name="pageSelect" value="#excelDownload">
                    <div class="icon-box">
                        <i class="bi bi-file-earmark-excel-fill" style="color: #10b981;"></i>
                    </div>
                    <div class="card-title">엑셀 리포트</div>
                </label>
            </div>

            <div class="control-bar">
                <button type="button" class="btn-tech" onclick="goNext()">
                    실행하기 <i class="bi bi-arrow-right-short"></i>
                </button>
                <a href="./logout.php" class="btn-tech btn-sub" style="border-color:#ef4444; color:#ef4444;">
                    <i class="bi bi-power"></i> LOGOUT
                </a>
            </div>
        </form>
    </div>

    <!-- 💰 재무 대시보드 모달 -->
    <div class="modal fade" id="financialModal" tabindex="-1">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title"><i class="bi bi-pie-chart-fill"></i> 재무 대시보드</h5><button type="button"
                        class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" style="padding:20px;background:#f8f9fa;">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6 class="m-0 fw-bold text-secondary">연도 선택</h6><select id="dashYearSelect"
                            class="form-select form-select-sm" style="width:100px;"
                            onchange="changeDashYear(this)"></select>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-bottom:20px;">
                        <div
                            style="background:white;border-radius:12px;padding:15px;text-align:center;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                            <div style="font-size:0.9rem;color:#666;margin-bottom:5px;">연간 총 수입</div>
                            <div style="font-size:1.2rem;font-weight:700;color:#4CAF50;" id="dashTotalIncome">0원</div>
                        </div>
                        <div
                            style="background:white;border-radius:12px;padding:15px;text-align:center;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                            <div style="font-size:0.9rem;color:#666;margin-bottom:5px;">연간 총 지출</div>
                            <div style="font-size:1.2rem;font-weight:700;color:#f44336;" id="dashTotalExpense">0원</div>
                        </div>
                        <div
                            style="background:white;border-radius:12px;padding:15px;text-align:center;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                            <div style="font-size:0.9rem;color:#666;margin-bottom:5px;">순 이익 (총잔액)</div>
                            <div style="font-size:1.2rem;font-weight:700;color:#2196F3;" id="dashTotalBalance">0원</div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-lg-8">
                            <div
                                style="background:white;border-radius:15px;padding:15px;margin-bottom:20px;box-shadow:0 4px 6px rgba(0,0,0,0.05);height:400px;">
                                <canvas id="yearlyChart"></canvas>
                            </div>
                        </div>
                        <div class="col-lg-4">
                            <div
                                style="background:white;border-radius:15px;padding:15px;margin-bottom:20px;box-shadow:0 4px 6px rgba(0,0,0,0.05);height:400px;">
                                <canvas id="incomeChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer"><button type="button" class="btn btn-secondary"
                        data-bs-dismiss="modal">닫기</button></div>
            </div>
        </div>
    </div>

    <!-- 📗 엑셀 다운로드 설정 모달 -->
    <div class="modal fade" id="excelModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-success text-white" style="background-color:#1D6F42!important;">
                    <h5 class="modal-title"><i class="bi bi-file-earmark-excel-fill"></i> 엑셀 리포트 설정</h5><button
                        type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3"><label class="form-label fw-bold">대상 연도</label><select id="excelYearSelect"
                            class="form-select"></select></div>
                    <div class="mb-4"><label class="form-label fw-bold">출력 항목</label><select id="excelTypeSelect"
                            class="form-select">
                            <option value="all">전체 (수입 + 지출)</option>
                            <option value="income">수입 내역만</option>
                            <option value="expense">지출 내역만</option>
                        </select></div>
                    <div class="d-grid"><button class="btn btn-success p-3 fw-bold" onclick="downloadExcelReport()"
                            style="background-color:#1D6F42;border:none;"><i class="bi bi-download"></i> 엑셀 파일 다운로드
                            (.xlsx)</button></div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js"></script>

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

        function goNext() { const selected = document.querySelector('input[name="pageSelect"]:checked'); if (!selected) { alert("접속할 메뉴를 선택해주세요."); return; } if (selected.value === '#financialDashboard') { openDashboardModal(); return; } if (selected.value === '#excelDownload') { openExcelModal(); return; } location.href = selected.value; }
        let incomeDataCache = [], expenseDataCache = [], selectedYear = new Date().getFullYear(), incomeChart, yearChart; async function loadFinancialData() { if (incomeDataCache.length > 0) return true; try { const res = await fetch('./php/get_financial_data.php'), data = await res.json(); if (data.success) { incomeDataCache = data.income; expenseDataCache = data.expense; return true; } } catch (e) { console.error("Data Load Error:", e); } return false; } window.openDashboardModal = async function () { if (await loadFinancialData()) { new bootstrap.Modal(document.getElementById('financialModal')).show(); updateDashboard(); } else { alert("데이터를 불러오는데 실패했습니다."); } }; window.updateDashboard = function () { const select = document.getElementById('dashYearSelect'); if (select.options.length === 0) { const currentY = new Date().getFullYear(); for (let y = currentY; y >= currentY - 3; y--) { const opt = document.createElement('option'); opt.value = y; opt.text = y + "년"; if (y === selectedYear) opt.selected = true; select.appendChild(opt); } } const sumYear = (data, year) => data.reduce((sum, item) => { const d = new Date(item.date); return d.getFullYear() === year ? sum + Number(item.amount) : sum; }, 0), totalInc = sumYear(incomeDataCache, selectedYear), totalExp = sumYear(expenseDataCache, selectedYear); document.getElementById('dashTotalIncome').innerText = totalInc.toLocaleString() + '원'; document.getElementById('dashTotalExpense').innerText = totalExp.toLocaleString() + '원'; document.getElementById('dashTotalBalance').innerText = (totalInc - totalExp).toLocaleString() + '원'; renderCharts(); }; window.changeDashYear = function (el) { selectedYear = parseInt(el.value); updateDashboard(); }; function renderCharts() { const months = Array.from({ length: 12 }, (_, i) => (i + 1) + "월"), mInc = new Array(12).fill(0), mExp = new Array(12).fill(0); incomeDataCache.forEach(item => { const d = new Date(item.date); if (d.getFullYear() === selectedYear) mInc[d.getMonth()] += Number(item.amount); }); expenseDataCache.forEach(item => { const d = new Date(item.date); if (d.getFullYear() === selectedYear) mExp[d.getMonth()] += Number(item.amount); }); if (yearChart) yearChart.destroy(); yearChart = new Chart(document.getElementById('yearlyChart'), { type: 'bar', data: { labels: months, datasets: [{ label: '수입', data: mInc, backgroundColor: '#4CAF50' }, { label: '지출', data: mExp, backgroundColor: '#f44336' }] }, options: { responsive: true, maintainAspectRatio: false } }); if (incomeChart) incomeChart.destroy(); incomeChart = new Chart(document.getElementById('incomeChart'), { type: 'doughnut', data: { labels: ['총 수입', '총 지출'], datasets: [{ data: [mInc.reduce((a, b) => a + b, 0), mExp.reduce((a, b) => a + b, 0)], backgroundColor: ['#4CAF50', '#f44336'] }] }, options: { responsive: true, maintainAspectRatio: false } }); } window.openExcelModal = async function () { const select = document.getElementById('excelYearSelect'); if (select.options.length === 0) { const currentY = new Date().getFullYear(); for (let y = currentY; y >= currentY - 3; y--) { const opt = document.createElement('option'); opt.value = y; opt.text = y + "년"; select.appendChild(opt); } } new bootstrap.Modal(document.getElementById('excelModal')).show(); }; window.downloadExcelReport = async function () { if (!(await loadFinancialData())) { alert("데이터 로드 실패"); return; } const year = parseInt(document.getElementById('excelYearSelect').value), type = document.getElementById('excelTypeSelect').value, wb = XLSX.utils.book_new(); if (type === 'all' || type === 'income') XLSX.utils.book_append_sheet(wb, createSheet(incomeDataCache, year, '수입'), "수입내역"); if (type === 'all' || type === 'expense') XLSX.utils.book_append_sheet(wb, createSheet(expenseDataCache, year, '지출'), "지출내역"); XLSX.writeFile(wb, `TerraOne_회계장부_${year}년.xlsx`); }; function createSheet(data, year, title) { const filtered = data.filter(item => new Date(item.date).getFullYear() === year).sort((a, b) => new Date(a.date) - new Date(b.date)), rows = [[`${year}년 ${title} 내역`], ["NO", "날짜", "항목", "비고", "금액"]]; let total = 0; filtered.forEach((item, idx) => { const amt = Number(item.amount); rows.push([idx + 1, item.date.split(' ')[0], item.category, item.description, amt]); total += amt; }); rows.push(["", "", "", "합계", total]); const ws = XLSX.utils.aoa_to_sheet(rows); ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }]; const range = XLSX.utils.decode_range(ws['!ref']); for (let R = range.s.r; R <= range.e.r; ++R) { for (let C = range.s.c; C <= range.e.c; ++C) { const ref = XLSX.utils.encode_cell({ c: C, r: R }); if (!ws[ref]) continue; ws[ref].s = { alignment: { horizontal: (C === 4 ? "right" : "center"), vertical: "center" }, border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } }; if (R === 1) ws[ref].s.fill = { fgColor: { rgb: "1D6F42" } }, ws[ref].s.font = { color: { rgb: "FFFFFF" }, bold: true }; if (R === 0) ws[ref].s.font = { bold: true, sz: 16 }; } } ws['!cols'] = [{ wch: 6 }, { wch: 12 }, { wch: 15 }, { wch: 35 }, { wch: 12 }]; return ws; }
    </script>

</body>

</html>