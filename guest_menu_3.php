<?php
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';


// 로그인 체크
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

// 🎨 통합 테마 라우팅 로직
$current_theme = $_COOKIE['user_site_theme'] ?? 'book'; // 기본값 book
if ($current_theme !== 'list') {
    $mapping = [
        'book' => 'guest_menu_book.php',
        'icon' => 'guest_menu_1.php',
        'glass' => 'guest_menu_2.php',
        'tech' => 'guest_menu_4.php'
    ];
    if (isset($mapping[$current_theme])) {
        header("Location: " . $mapping[$current_theme]);
        exit;
    }
}

$user_id = $_SESSION['user_id'];
$user_name = $_SESSION['user_name'] ?? '사용자';
$user_level = $_SESSION['user_level'] ?? 0;

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
    <title>메뉴선택-목록형(Guest)</title>
    <link rel="manifest" href="manifest.json">
    <meta name="msapplication-config" content="/browserconfig.xml">
    <link rel="icon" href="/favicon.png?v=2" />
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <style>
        body {
            background-color: #f7f9fc;
            font-family: 'Noto Sans KR', sans-serif;
            color: #333;
            padding-bottom: 50px;
        }

        .container {
            max-width: 650px;
            margin-top: 20px;
        }

        .admin-header {
            background: white;
            padding: 12px 20px;
            border-radius: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            margin-bottom: 30px;
        }

        .btn-logout-sm {
            background-color: #ff4d4d;
            color: white;
            border: none;
            padding: 2px 10px;
            border-radius: 20px;
            font-size: 0.8rem;
            text-decoration: none;
        }

        .menu-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .menu-item {
            background: white;
            border-radius: 15px;
            padding: 18px 25px;
            display: flex;
            align-items: center;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 2px solid transparent;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.03);
            position: relative;
        }

        .menu-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
        }

        .menu-item input[type="checkbox"] {
            position: absolute;
            opacity: 0;
        }

        .menu-item.active {
            border-color: #007bff;
            background-color: #f0f7ff;
        }

        .icon-box {
            width: 48px;
            height: 48px;
            border-radius: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1.6rem;
            margin-right: 20px;
            background-color: #eef2ff;
            color: #4f46e5;
        }

        .text-box {
            flex-grow: 1;
        }

        .menu-title {
            font-weight: 700;
            font-size: 1.1rem;
            margin-bottom: 2px;
            color: #2c3e50;
        }

        .menu-desc {
            font-size: 0.85rem;
            color: #8898aa;
        }

        .btn-execute {
            background-color: #007bff;
            color: white;
            border: none;
            width: 100%;
            padding: 15px;
            border-radius: 30px;
            font-weight: 800;
            font-size: 1.15rem;
            margin-top: 40px;
            box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
            transition: all 0.3s;
        }

        .dashboard-modal-body {
            padding: 20px;
            background: #f8f9fa;
        }

        .chart-container {
            background: white;
            border-radius: 15px;
            padding: 15px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
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

        @media (max-width:768px) {
            .summary-card-row {
                grid-template-columns: 1fr;
            }
        }

        .dashboard-modal-body {
            padding: 20px;
            background: #f8f9fa;
        }

        .chart-container {
            background: white;
            border-radius: 15px;
            padding: 15px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
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

        @media (max-width:768px) {
            .summary-card-row {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="admin-header">
            <span>👤 사용자: <strong><?= htmlspecialchars($display_name) ?></strong></span>
            <a href="./logout.php" class="btn-logout-sm">로그아웃</a>
        </div>
        <form id="selectForm" onsubmit="return false;">
            <div class="menu-list">
                <label class="menu-item" for="opt_tel">
                    <input type="checkbox" id="opt_tel" name="pageSelect" value="tel_view_guest.php">
                    <div class="icon-box"><i class="bi bi-people-fill"></i></div>
                    <div class="text-box">
                        <div class="menu-title">연락망 보기</div>
                        <div class="menu-desc">동기 연락처 정보 확인</div>
                    </div>
                </label>
                <label class="menu-item" for="opt_view">
                    <input type="checkbox" id="opt_view" name="pageSelect" value="account_view_guest.php">
                    <div class="icon-box"><i class="bi bi-eye"></i></div>
                    <div class="text-box">
                        <div class="menu-title">사용내역 열람</div>
                        <div class="menu-desc">모임 사용 내역 상세 보기</div>
                    </div>
                </label>
                <label class="menu-item" for="opt_images">
                    <input type="checkbox" id="opt_images" name="pageSelect" value="images_view_guest.php">
                    <div class="icon-box"><i class="bi bi-image"></i></div>
                    <div class="text-box">
                        <div class="menu-title">영수증 열람</div>
                        <div class="menu-desc">지출 영수증 사진 모아보기</div>
                    </div>
                </label>
                <label class="menu-item" for="opt_pass"><input type="checkbox" id="opt_pass" name="pageSelect"
                        value="account_pass_guest.php">
                    <div class="icon-box"><i class="bi bi-credit-card"></i></div>
                    <div class="text-box">
                        <div class="menu-title">회비 현황</div>
                        <div class="menu-desc">월회비 및 입금 현황 확인</div>
                    </div>
                </label>
                <label class="menu-item" for="opt_financial"><input type="checkbox" id="opt_financial" name="pageSelect"
                        value="#financialDashboard">
                    <div class="icon-box"><i class="bi bi-pie-chart-fill"></i></div>
                    <div class="text-box">
                        <div class="menu-title">재무 대시보드</div>
                        <div class="menu-desc">연도별 수입/지출 차트 분석</div>
                    </div>
                </label>
                <label class="menu-item" for="opt_excel"><input type="checkbox" id="opt_excel" name="pageSelect"
                        value="#excelDownload">
                    <div class="icon-box"><i class="bi bi-file-earmark-excel-fill"></i></div>
                    <div class="text-box">
                        <div class="menu-title">엑셀 리포트</div>
                        <div class="menu-desc">회계장부 엑셀 다운로드</div>
                    </div>
                </label>
            </div>
            <button type="button" class="btn-execute" onclick="goNext()">선택한 메뉴 실행</button>
        </form>
    </div>
    <div class="modal fade" id="financialModal" tabindex="-1">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title"><i class="bi bi-pie-chart-fill"></i> 재무 대시보드</h5><button type="button"
                        class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body dashboard-modal-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6 class="m-0 fw-bold text-secondary">연도 선택</h6><select id="dashYearSelect"
                            class="form-select form-select-sm" style="width:100px;"
                            onchange="changeDashYear(this)"></select>
                    </div>
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
                            <div class="summary-title">순 이익 (총잔액)</div>
                            <div class="summary-amount text-balance" id="dashTotalBalance">0원</div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-lg-8">
                            <div class="chart-container" style="height:400px;"><canvas id="yearlyChart"></canvas></div>
                        </div>
                        <div class="col-lg-4">
                            <div class="chart-container" style="height:400px;"><canvas id="incomeChart"></canvas></div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer"><button type="button" class="btn btn-secondary"
                        data-bs-dismiss="modal">닫기</button></div>
            </div>
        </div>
    </div>
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
        const items = document.querySelectorAll('.menu-item');
        items.forEach((item, idx) => {
            item.addEventListener('click', () => {
                items.forEach((i) => {
                    i.classList.remove('active');
                    i.querySelector('input').checked = false;
                });
                const checkbox = item.querySelector('input');
                checkbox.checked = true;
                item.classList.add('active');
            });
        });
        function goNext() { const selected = document.querySelector('input[name="pageSelect"]:checked'); if (!selected) { alert("실행할 메뉴를 선택해주세요."); return; } if (selected.value === '#financialDashboard') { openDashboardModal(); return; } if (selected.value === '#excelDownload') { openExcelModal(); return; } location.href = selected.value; }
        let incomeDataCache = [], expenseDataCache = [], selectedYear = new Date().getFullYear(), incomeChart, yearChart; async function loadFinancialData() { if (incomeDataCache.length > 0) return true; try { const res = await fetch('./php/get_financial_data.php'), data = await res.json(); if (data.success) { incomeDataCache = data.income; expenseDataCache = data.expense; return true; } } catch (e) { console.error("Data Load Error:", e); } return false; } window.openDashboardModal = async function () { if (await loadFinancialData()) { new bootstrap.Modal(document.getElementById('financialModal')).show(); updateDashboard(); } else { alert("데이터를 불러오는데 실패했습니다."); } }; window.updateDashboard = function () { const select = document.getElementById('dashYearSelect'); if (select.options.length === 0) { const currentY = new Date().getFullYear(); for (let y = currentY; y >= currentY - 3; y--) { const opt = document.createElement('option'); opt.value = y; opt.text = y + "년"; if (y === selectedYear) opt.selected = true; select.appendChild(opt); } } const sumYear = (data, year) => data.reduce((sum, item) => { const d = new Date(item.date); return d.getFullYear() === year ? sum + Number(item.amount) : sum; }, 0), totalInc = sumYear(incomeDataCache, selectedYear), totalExp = sumYear(expenseDataCache, selectedYear); document.getElementById('dashTotalIncome').innerText = totalInc.toLocaleString() + '원'; document.getElementById('dashTotalExpense').innerText = totalExp.toLocaleString() + '원'; document.getElementById('dashTotalBalance').innerText = (totalInc - totalExp).toLocaleString() + '원'; renderCharts(); }; window.changeDashYear = function (el) { selectedYear = parseInt(el.value); updateDashboard(); }; function renderCharts() { const months = Array.from({ length: 12 }, (_, i) => (i + 1) + "월"), mInc = new Array(12).fill(0), mExp = new Array(12).fill(0); incomeDataCache.forEach(item => { const d = new Date(item.date); if (d.getFullYear() === selectedYear) mInc[d.getMonth()] += Number(item.amount); }); expenseDataCache.forEach(item => { const d = new Date(item.date); if (d.getFullYear() === selectedYear) mExp[d.getMonth()] += Number(item.amount); }); if (yearChart) yearChart.destroy(); yearChart = new Chart(document.getElementById('yearlyChart'), { type: 'bar', data: { labels: months, datasets: [{ label: '수입', data: mInc, backgroundColor: '#4CAF50' }, { label: '지출', data: mExp, backgroundColor: '#f44336' }] }, options: { responsive: true, maintainAspectRatio: false } }); if (incomeChart) incomeChart.destroy(); incomeChart = new Chart(document.getElementById('incomeChart'), { type: 'doughnut', data: { labels: ['총 수입', '총 지출'], datasets: [{ data: [mInc.reduce((a, b) => a + b, 0), mExp.reduce((a, b) => a + b, 0)], backgroundColor: ['#4CAF50', '#f44336'] }] }, options: { responsive: true, maintainAspectRatio: false } }); } window.openExcelModal = async function () { const select = document.getElementById('excelYearSelect'); if (select.options.length === 0) { const currentY = new Date().getFullYear(); for (let y = currentY; y >= currentY - 3; y--) { const opt = document.createElement('option'); opt.value = y; opt.text = y + "년"; select.appendChild(opt); } } new bootstrap.Modal(document.getElementById('excelModal')).show(); }; window.downloadExcelReport = async function () { if (!(await loadFinancialData())) { alert("데이터 로드 실패"); return; } const year = parseInt(document.getElementById('excelYearSelect').value), type = document.getElementById('excelTypeSelect').value, wb = XLSX.utils.book_new(); if (type === 'all' || type === 'income') XLSX.utils.book_append_sheet(wb, createSheet(incomeDataCache, year, '수입'), "수입내역"); if (type === 'all' || type === 'expense') XLSX.utils.book_append_sheet(wb, createSheet(expenseDataCache, year, '지출'), "지출내역"); XLSX.writeFile(wb, `TerraOne_회계장부_${year}년.xlsx`); }; function createSheet(data, year, title) { const filtered = data.filter(item => new Date(item.date).getFullYear() === year).sort((a, b) => new Date(a.date) - new Date(b.date)), rows = [[`${year}년 ${title} 내역`], ["NO", "날짜", "항목", "비고", "금액"]]; let total = 0; filtered.forEach((item, idx) => { const amt = Number(item.amount); rows.push([idx + 1, item.date.split(' ')[0], item.category, item.description, amt]); total += amt; }); rows.push(["", "", "", "합계", total]); const ws = XLSX.utils.aoa_to_sheet(rows); ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }]; const range = XLSX.utils.decode_range(ws['!ref']); for (let R = range.s.r; R <= range.e.r; ++R) { for (let C = range.s.c; C <= range.e.c; ++C) { const ref = XLSX.utils.encode_cell({ c: C, r: R }); if (!ws[ref]) continue; ws[ref].s = { alignment: { horizontal: (C === 4 ? "right" : "center"), vertical: "center" }, border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } }; if (R === 1) ws[ref].s.fill = { fgColor: { rgb: "1D6F42" } }, ws[ref].s.font = { color: { rgb: "FFFFFF" }, bold: true }; if (R === 0) ws[ref].s.font = { bold: true, sz: 16 }; } } ws['!cols'] = [{ wch: 6 }, { wch: 12 }, { wch: 15 }, { wch: 35 }, { wch: 12 }]; return ws; }
        
    </script>
</body>

</html>