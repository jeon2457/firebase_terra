<?php
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';

if (!isset($_SESSION['user_id'])) {
  header("Location: login.php");
  exit;
}
$current_theme = $_COOKIE['user_site_theme'] ?? 'book';
if ($current_theme !== 'glass') {
  $mapping = ['book' => 'guest_menu_book.php', 'icon' => 'guest_menu_1.php', 'list' => 'guest_menu_3.php', 'tech' => 'guest_menu_4.php'];
  if (isset($mapping[$current_theme])) {
    header("Location: " . $mapping[$current_theme]);
    exit;
  }
}
$user_id = $_SESSION['user_id'];
$user_name = $_SESSION['user_name'] ?? '사용자';
$user_level = $_SESSION['user_level'] ?? 0;
$user_remark = $_SESSION['user_remark'] ?? '';
$display_name = $user_name;
if (strpos($user_remark, '회장') !== false) {
  $display_name .= " 회장님";
} elseif (strpos($user_remark, '총무') !== false) {
  $display_name .= " 총무님";
}
?>
<!DOCTYPE html>
<html lang="ko">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>메뉴선택-glass형(Guest)</title>
  <link rel="manifest" href="manifest.json">
  <meta name="msapplication-config" content="/browserconfig.xml">
  <link rel="icon" href="/favicon.png?v=2" />

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    #space-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      background: #000000;
    }

    body {
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
    }

    .container {
      max-width: 600px;
      margin: 40px auto;
      padding: 35px 25px;
      background: rgba(255, 255, 255, 0);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      border-radius: 40px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: none;
    }

    h2.title {
      text-align: center;
      color: #fff;
      font-weight: 800;
      margin-bottom: 25px;
      letter-spacing: 1px;
      text-shadow: 0 2px 15px rgba(0, 0, 0, 1);
    }

    .admin-info {
      text-align: center;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 70px;
      background: rgba(255, 255, 255, 0.05);
      padding: 12px;
      border-radius: 50px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-weight: 600;
    }

    .option-box {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 30px 20px;
      justify-items: center;
    }

    .select-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      cursor: pointer;
      position: relative;
      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .select-card:hover {
      transform: scale(1.1);
    }

    .select-card input[type="checkbox"] {
      position: absolute;
      opacity: 0;
    }

    .app-icon {
      width: 80px;
      height: 80px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      color: white;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.6);
      transition: all 0.3s ease;
      margin-bottom: 10px;
      position: relative;
      overflow: hidden;
    }

    .app-icon::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transform: rotate(45deg);
      transition: 0.6s;
    }

    .select-card:hover .app-icon::after {
      left: 100%;
    }

    .bg-tel {
      background: linear-gradient(180deg, #5AC8FA, #007AFF);
    }

    .bg-account {
      background: linear-gradient(180deg, #FF9500, #FF5E00);
    }

    .bg-camera {
      background: linear-gradient(180deg, #4CD964, #28A745);
    }

    .bg-pass {
      background: linear-gradient(180deg, #FFCC00, #FBC02D);
    }

    .bg-financial {
      background: linear-gradient(180deg, #FFD700, #FFA000);
    }

    .bg-excel {
      background: linear-gradient(180deg, #1D6F42, #43A047);
    }

    .select-card.active .app-icon {
      box-shadow: 0 0 0 4px #fff, 0 0 25px #007AFF;
      transform: scale(0.9);
    }

    .app-label {
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      text-align: center;
      word-break: keep-all;
      line-height: 1.2;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 1);
    }

    .btn-area {
      margin-top: 80px;
      display: flex;
      flex-direction: column;
      gap: 15px;
      align-items: center;
    }

    .btn-same {
      width: 100% !important;
      max-width: 300px;
      height: 55px !important;
      font-weight: 800 !important;
      font-size: 18px !important;
      border-radius: 20px !important;
      letter-spacing: 1px;
      transition: 0.3s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn-primary {
      background-color: #007AFF;
      border: none;
      box-shadow: 0 10px 20px rgba(0, 122, 255, 0.4);
    }

    .btn-primary:hover {
      background-color: #0063ce;
      transform: translateY(-2px);
    }

    .btn-outline-danger {
      background-color: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 59, 48, 0.5);
      color: #ff3b30;
      text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
    }

    .btn-outline-danger:hover {
      background-color: #ff3b30;
      color: white;
      border-color: #ff3b30;
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

    @media (max-width:480px) {
      .container {
        width: calc(100% - 30px);
        margin: 20px auto;
        padding: 25px 15px;
        border: none;
      }

      .app-icon {
        width: 75px;
        height: 75px;
        font-size: 2.3rem;
      }

      .admin-info {
        margin-bottom: 50px;
        font-size: 13px;
      }

      .btn-same {
        height: 52px !important;
        font-size: 17px !important;
      }
    }
  </style>
</head>

<body><canvas id="space-canvas"></canvas>
  <div class="container">
    <h2 class="title">메뉴 선택</h2>
    <div class="admin-info">👤 <span style="color:#4cd964"><?= htmlspecialchars($display_name) ?></span> (일반 회원 권한)
    </div>
    <div class="option-box">
      <label class="select-card" for="opt_tel"><input type="checkbox" id="opt_tel" name="pageSelect"
          value="tel_view_guest.php">
        <div class="app-icon bg-tel"><i class="bi bi-people-fill"></i></div>
        <div class="app-label">연락망 보기</div>
      </label>
      <label class="select-card" for="opt_account"><input type="checkbox" id="opt_account" name="pageSelect"
          value="account_view_guest.php">
        <div class="app-icon bg-account"><i class="bi bi-file-earmark-text"></i></div>
        <div class="app-label">내역서 보기</div>
      </label>
      <label class="select-card" for="opt_images"><input type="checkbox" id="opt_images" name="pageSelect"
          value="images_view_guest.php">
        <div class="app-icon bg-camera"><i class="bi bi-camera-fill"></i></div>
        <div class="app-label">영수증 보기</div>
      </label>
      <label class="select-card" for="opt_pass"><input type="checkbox" id="opt_pass" name="pageSelect"
          value="account_pass_guest.php">
        <div class="app-icon bg-pass"><i class="bi bi-credit-card"></i></div>
        <div class="app-label">월회비 현황</div>
      </label>
      <label class="select-card" for="opt_financial"><input type="checkbox" id="opt_financial" name="pageSelect"
          value="#financialDashboard">
        <div class="app-icon bg-financial"><i class="bi bi-pie-chart-fill"></i></div>
        <div class="app-label">재무 대시보드</div>
      </label>
      <label class="select-card" for="opt_excel"><input type="checkbox" id="opt_excel" name="pageSelect"
          value="#excelDownload">
        <div class="app-icon bg-excel"><i class="bi bi-file-earmark-excel-fill"></i></div>
        <div class="app-label">엑셀 리포트</div>
      </label>
    </div>
    <div class="btn-area"><button type="button" class="btn btn-primary btn-same shadow" onclick="goNext()">앱
        실행하기</button><button type="button" class="btn btn-outline-danger btn-same shadow-sm"
        id="logoutBtn">로그아웃</button></div>
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
              class="form-select form-select-sm" style="width:100px;" onchange="changeDashYear(this)"></select>
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
        <div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal fade" id="excelModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header bg-success text-white" style="background-color:#1D6F42!important;">
          <h5 class="modal-title"><i class="bi bi-file-earmark-excel-fill"></i> 엑셀 리포트 설정</h5><button type="button"
            class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
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
              style="background-color:#1D6F42;border:none;"><i class="bi bi-download"></i> 엑셀 파일 다운로드 (.xlsx)</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js"></script>
  <script>const canvas = document.getElementById('space-canvas'), ctx = canvas.getContext('2d'); let w, h, stars = [], starCount = 350, speed = 0.6; function initSpace() { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h; stars = []; for (let i = 0; i < starCount; i++) { stars.push({ x: Math.random() * w - w / 2, y: Math.random() * h - h / 2, z: Math.random() * w, px: 0, py: 0 }); } } function drawSpace() { ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0, 0, w, h); ctx.save(); ctx.translate(w / 2, h / 2); for (let i = 0; i < starCount; i++) { let s = stars[i], x = s.x / (s.z / w), y = s.y / (s.z / w); if (s.px !== 0) { ctx.strokeStyle = `rgba(255,255,255,${Math.min(1, 1.8 - s.z / w)})`; ctx.lineWidth = Math.max(1, (1 - s.z / w) * 3); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(s.px, s.py); ctx.stroke(); } s.px = x; s.py = y; s.z -= speed; if (s.z <= 0 || x < -w || x > w || y < -h || y > h) { s.z = w; s.x = Math.random() * w - w / 2; s.y = Math.random() * h - h / 2; s.px = 0; s.py = 0; } } ctx.restore(); requestAnimationFrame(drawSpace); } window.addEventListener('resize', initSpace); initSpace(); drawSpace(); const checkboxes = document.querySelectorAll('input[name="pageSelect"]'), cards = document.querySelectorAll('.select-card'); checkboxes.forEach((checkbox, index) => { checkbox.addEventListener('change', () => { if (checkbox.checked) { checkboxes.forEach((other, i) => { if (i !== index) { other.checked = false; cards[i].classList.remove('active'); } }); cards[index].classList.add('active'); } else { cards[index].classList.remove('active'); } }); }); function goNext() { const selected = document.querySelector('input[name="pageSelect"]:checked'); if (!selected) { alert("실행할 앱 아이콘을 선택해주세요."); return; } if (selected.value === '#financialDashboard') { openDashboardModal(); return; } if (selected.value === '#excelDownload') { openExcelModal(); return; } location.href = selected.value; } document.getElementById("logoutBtn").addEventListener("click", () => { if (confirm('로그아웃 하시겠습니까?')) { location.href = 'logout.php'; } }); let incomeDataCache = [], expenseDataCache = [], selectedYear = new Date().getFullYear(), incomeChart, yearChart; async function loadFinancialData() { if (incomeDataCache.length > 0) return true; try { const res = await fetch('./php/get_financial_data.php'), data = await res.json(); if (data.success) { incomeDataCache = data.income; expenseDataCache = data.expense; return true; } } catch (e) { console.error("Data Load Error:", e); } return false; } window.openDashboardModal = async function () { if (await loadFinancialData()) { new bootstrap.Modal(document.getElementById('financialModal')).show(); updateDashboard(); } else { alert("데이터를 불러오는데 실패했습니다."); } }; window.updateDashboard = function () { const select = document.getElementById('dashYearSelect'); if (select.options.length === 0) { const currentY = new Date().getFullYear(); for (let y = currentY; y >= currentY - 3; y--) { const opt = document.createElement('option'); opt.value = y; opt.text = y + "년"; if (y === selectedYear) opt.selected = true; select.appendChild(opt); } } const sumYear = (data, year) => data.reduce((sum, item) => { const d = new Date(item.date); return d.getFullYear() === year ? sum + Number(item.amount) : sum; }, 0), totalInc = sumYear(incomeDataCache, selectedYear), totalExp = sumYear(expenseDataCache, selectedYear); document.getElementById('dashTotalIncome').innerText = totalInc.toLocaleString() + '원'; document.getElementById('dashTotalExpense').innerText = totalExp.toLocaleString() + '원'; document.getElementById('dashTotalBalance').innerText = (totalInc - totalExp).toLocaleString() + '원'; renderCharts(); }; window.changeDashYear = function (el) { selectedYear = parseInt(el.value); updateDashboard(); }; function renderCharts() { const months = Array.from({ length: 12 }, (_, i) => (i + 1) + "월"), mInc = new Array(12).fill(0), mExp = new Array(12).fill(0); incomeDataCache.forEach(item => { const d = new Date(item.date); if (d.getFullYear() === selectedYear) mInc[d.getMonth()] += Number(item.amount); }); expenseDataCache.forEach(item => { const d = new Date(item.date); if (d.getFullYear() === selectedYear) mExp[d.getMonth()] += Number(item.amount); }); if (yearChart) yearChart.destroy(); yearChart = new Chart(document.getElementById('yearlyChart'), { type: 'bar', data: { labels: months, datasets: [{ label: '수입', data: mInc, backgroundColor: '#4CAF50' }, { label: '지출', data: mExp, backgroundColor: '#f44336' }] }, options: { responsive: true, maintainAspectRatio: false } }); if (incomeChart) incomeChart.destroy(); incomeChart = new Chart(document.getElementById('incomeChart'), { type: 'doughnut', data: { labels: ['총 수입', '총 지출'], datasets: [{ data: [mInc.reduce((a, b) => a + b, 0), mExp.reduce((a, b) => a + b, 0)], backgroundColor: ['#4CAF50', '#f44336'] }] }, options: { responsive: true, maintainAspectRatio: false } }); } window.openExcelModal = async function () { const select = document.getElementById('excelYearSelect'); if (select.options.length === 0) { const currentY = new Date().getFullYear(); for (let y = currentY; y >= currentY - 3; y--) { const opt = document.createElement('option'); opt.value = y; opt.text = y + "년"; select.appendChild(opt); } } new bootstrap.Modal(document.getElementById('excelModal')).show(); }; window.downloadExcelReport = async function () { if (!(await loadFinancialData())) { alert("데이터 로드 실패"); return; } const year = parseInt(document.getElementById('excelYearSelect').value), type = document.getElementById('excelTypeSelect').value, wb = XLSX.utils.book_new(); if (type === 'all' || type === 'income') XLSX.utils.book_append_sheet(wb, createSheet(incomeDataCache, year, '수입'), "수입내역"); if (type === 'all' || type === 'expense') XLSX.utils.book_append_sheet(wb, createSheet(expenseDataCache, year, '지출'), "지출내역"); XLSX.writeFile(wb, `TerraOne_회계장부_${year}년.xlsx`); }; function createSheet(data, year, title) { const filtered = data.filter(item => new Date(item.date).getFullYear() === year).sort((a, b) => new Date(a.date) - new Date(b.date)), rows = [[`${year}년 ${title} 내역`], ["NO", "날짜", "항목", "비고", "금액"]]; let total = 0; filtered.forEach((item, idx) => { const amt = Number(item.amount); rows.push([idx + 1, item.date.split(' ')[0], item.category, item.description, amt]); total += amt; }); rows.push(["", "", "", "합계", total]); const ws = XLSX.utils.aoa_to_sheet(rows); ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }]; const range = XLSX.utils.decode_range(ws['!ref']); for (let R = range.s.r; R <= range.e.r; ++R) { for (let C = range.s.c; C <= range.e.c; ++C) { const ref = XLSX.utils.encode_cell({ c: C, r: R }); if (!ws[ref]) continue; ws[ref].s = { alignment: { horizontal: (C === 4 ? "right" : "center"), vertical: "center" }, border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } }; if (R === 1) ws[ref].s.fill = { fgColor: { rgb: "1D6F42" } }, ws[ref].s.font = { color: { rgb: "FFFFFF" }, bold: true }; if (R === 0) ws[ref].s.font = { bold: true, sz: 16 }; } } ws['!cols'] = [{ wch: 6 }, { wch: 12 }, { wch: 15 }, { wch: 35 }, { wch: 12 }]; return ws; }</script>
</body>

</html>