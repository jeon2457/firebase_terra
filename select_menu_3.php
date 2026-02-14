<?php
// tel_select.php
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';

// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
require_once __DIR__ . '/php/auth_check.php';
require_once __DIR__ . '/php/db-connect-mongo.php';

// 🔥[중요!] 인증(세션) 관련 코드는 반드시 HTML 출력보다 먼저 실행해야 합니다. <?php 코드는 무조건 1행에 공백없이 제일앞에 와야함!

// 🎨 통합 테마 라우팅 로직
$current_theme = $_COOKIE['user_site_theme'] ?? 'book'; // 기본값 book
if ($current_theme !== 'list') {
  $mapping = [
    'book' => 'select.php',
    'icon' => 'select_menu_1.php',
    'glass' => 'select_menu_2.php',
    'tech' => 'select_menu_4.php'
  ];
  if (isset($mapping[$current_theme])) {
    header("Location: " . $mapping[$current_theme]);
    exit;
  }
}

// 관리자 정보
$admin_id = htmlspecialchars($_SESSION['user_id'] ?? '관리자');
$admin_name = htmlspecialchars($_SESSION['user_name'] ?? '관리자');
$admin_level = htmlspecialchars($_SESSION['user_level'] ?? '10');

?>

<!DOCTYPE html>
<html lang="ko">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>시스템 관리 메뉴</title>

  <link rel="manifest" href="manifest.json">
  <meta name="msapplication-config" content="/browserconfig.xml">

  <link rel="icon" href="/favicon.png?v=2" />
  <link rel="icon" type="image/png" sizes="36x36" href="./favicons/2/android-icon-36x36.png" />
  <link rel="icon" type="image/png" sizes="48x48" href="./favicons/2/android-icon-48x48.png" />
  <link rel="icon" type="image/png" sizes="72x72" href="./favicons/2/android-icon-72x72.png" />
  <link rel="apple-touch-icon" sizes="32x32" href="./favicons/2/apple-icon-32x32.png">
  <link rel="apple-touch-icon" sizes="57x57" href="./favicons/2/apple-icon-57x57.png">
  <link rel="apple-touch-icon" sizes="60x60" href="./favicons/2/apple-icon-60x60.png">
  <link rel="apple-touch-icon" sizes="72x72" href="./favicons/2/apple-icon-72x72.png">

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js"></script>

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

    /* 상단 관리자 바 */
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

    /* 메뉴 카드 리스트 스타일 */
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

    /* 라디오/체크박스 숨김 */
    .menu-item input[type="checkbox"] {
      position: absolute;
      opacity: 0;
    }

    /* 선택되었을 때 스타일 */
    .menu-item.active {
      border-color: #007bff;
      background-color: #f0f7ff;
    }

    /* 아이콘 박스 */
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

    /* 텍스트 영역 */
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

    /* 하단 실행 버튼 */
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

    .btn-execute:active {
      transform: scale(0.98);
    }

    /* 테마 설정 버튼 */
    .btn-theme {
      background: white;
      border: 1px solid #ddd;
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 0.9rem;
      color: #666;
      display: block;
      margin: 25px auto;
      text-decoration: none;
      width: fit-content;
    }


    .btn-same {
      width: 100%;
      max-width: 320px;
      padding: 14px 0 !important;
      border-radius: 15px;
      font-weight: 700 !important;
    }

    .btn-theme-change {
      width: 100%;
      background: white;
      border: 1px solid #ddd;
      padding: 15px;
      border-radius: 30px;
      font-size: 1rem;
      color: #666;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 700;
      margin-top: 15px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.03);
    }

    .btn-theme-change:hover {
      background: #f8f9fa;
      border-color: #007bff;
      color: #007bff;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
    }

    @media (max-width: 576px) {
      .select-card {
        width: 50px;
        height: 170px;
      }

      .book-title {
        font-size: 11px;
      }

      .option-box {
        gap: 8px;
      }
    }

    /* 📊 대시보드 모달 스타일 */
    .dashboard-modal-body {
      padding: 20px;
      background: #f8f9fa;
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
  <div class="container">

    <div class="admin-header">
      <span>👤 관리자: <strong><?= $admin_name ?></strong></span>
      <a href="./logout.php" class="btn-logout-sm">로그아웃</a>
    </div>

    <form id="selectForm" onsubmit="return false;">
      <div class="menu-list">

        <label class="menu-item" for="opt_tel">
          <input type="checkbox" id="opt_tel" name="pageSelect" value="./tel_select_1.php">
          <div class="icon-box"><i class="bi bi-person-vcard"></i></div>
          <div class="text-box">
            <div class="menu-title">회원 명부</div>
            <div class="menu-desc">전체 회원 정보 열람 및 관리</div>
          </div>
        </label>

        <label class="menu-item" for="opt_input">
          <input type="checkbox" id="opt_input" name="pageSelect" value="account_main_1.php">
          <div class="icon-box"><i class="bi bi-graph-up-arrow"></i></div>
          <div class="text-box">
            <div class="menu-title">회계 관리</div>
            <div class="menu-desc">수입/지출 내역 및 장부 관리</div>
          </div>
        </label>

        <label class="menu-item" for="opt_view">
          <input type="checkbox" id="opt_view" name="pageSelect" value="images_main_1.php">
          <div class="icon-box"><i class="bi bi-receipt"></i></div>
          <div class="text-box">
            <div class="menu-title">영수증 관리</div>
            <div class="menu-desc">영수증 이미지 업로드 및 확인</div>
          </div>
        </label>

        <label class="menu-item" for="opt_account_pass">
          <input type="checkbox" id="opt_account_pass" name="pageSelect" value="account_pass.php">
          <div class="icon-box"><i class="bi bi-credit-card-2-front"></i></div>
          <div class="text-box">
            <div class="menu-title">월회비 입금현황</div>
            <div class="menu-desc">개별 회원 월회비 납부 현황</div>
          </div>
        </label>

        <label class="menu-item" for="opt_financial">
          <input type="checkbox" id="opt_financial" name="pageSelect" value="#financialDashboard">
          <div class="icon-box"><i class="bi bi-pie-chart-fill" style="color: #FFD700;"></i></div>
          <div class="text-box">
            <div class="menu-title">재무 대시보드</div>
            <div class="menu-desc">실시간 수입/지출 차트 및 분석</div>
          </div>
        </label>

        <label class="menu-item" for="opt_excel">
          <input type="checkbox" id="opt_excel" name="pageSelect" value="#excelDownload">
          <div class="icon-box"><i class="bi bi-file-earmark-excel-fill" style="color: #43A047;"></i></div>
          <div class="text-box">
            <div class="menu-title">엑셀 리포트</div>
            <div class="menu-desc">회계 장부 엑셀 다운로드</div>
          </div>
        </label>

        <label class="menu-item" for="opt_map">
          <input type="checkbox" id="opt_map" name="pageSelect" value="map.php">
          <div class="icon-box"><i class="bi bi-map"></i></div>
          <div class="text-box">
            <div class="menu-title">지도 제작</div>
            <div class="menu-desc">모임 장소 지도 생성 도구</div>
          </div>
        </label>

        <label class="menu-item" for="opt_activities">
          <input type="checkbox" id="opt_activities" name="pageSelect" value="select_1.php">
          <div class="icon-box"><i class="bi bi-calendar-check"></i></div>
          <div class="text-box">
            <div class="menu-title">모임 활동</div>
            <div class="menu-desc">경조사 및 모임 안내 문자</div>
          </div>
        </label>



        <label class="menu-item" for="opt_database">
          <input type="checkbox" id="opt_database" name="pageSelect" value="database_backup_restore.php">
          <div class="icon-box"><i class="bi bi-database-fill-gear"></i></div>
          <div class="text-box">
            <div class="menu-title">데이타베이스 백업</div>
            <div class="menu-desc">시스템 데이터 백업 및 복구</div>
          </div>
        </label>


        <!-- 📌 실시간 위치공유 (현재 닷홈은 https://를 사용하지 않으므로 이것을 사용할 수 없으므로 주석처리한다. -->
        <!-- <label class="select-card">
          <input type="checkbox" name="pageSelect" value="location_share.php">
          <div class="book-spine bg-danger"> <i class="bi bi-geo-alt-fill book-icon"></i> <div class="book-title">실시간 위치공유</div>
          </div>
        </label> -->


        <label class="menu-item" for="opt_manual2">
          <input type="checkbox" id="opt_manual2" name="pageSelect" value="firebase_system_manual.html">
          <div class="icon-box"><i class="bi bi-gear-wide-connected"></i></div>
          <div class="text-box">
            <div class="menu-title">시스템 메뉴얼</div>
            <div class="menu-desc">시스템 운영 및 관리 메뉴얼</div>
          </div>
        </label>

      </div>

      <button type="button" class="btn-execute" onclick="goNext()">선택한 메뉴 실행</button>

      <button type="button" class="btn-theme-change" onclick="location.href='menu_design_selection.php'">🎨 디자인 변경 / 테마
        설정
      </button>

      <!-- 수정됨: 중앙 정렬 및 여백 증가(mt-5) -->
      <div class="text-center mt-5 mb-5">
        <a href="./logout.php" class="btn btn-outline-secondary btn-lg btn-same shadow-sm">로그아웃</a>
      </div>

    </form>
  </div>

  <script>
    const boxes = document.querySelectorAll('input[name="pageSelect"]');
    const items = document.querySelectorAll('.menu-item');

    // 단일 선택 로직 (라디오 버튼처럼 동작)
    items.forEach((item, idx) => {
      item.addEventListener('click', () => {
        // 모든 항목 비활성화
        boxes.forEach((box) => box.checked = false);
        items.forEach((i) => i.classList.remove('active'));

        // 클릭한 항목 활성화
        const checkbox = item.querySelector('input[name="pageSelect"]');
        checkbox.checked = true;
        item.classList.add('active');
      });
    });

    // 선택된 페이지로 이동
    function goNext() {
      const selected = document.querySelector('input[name="pageSelect"]:checked');
      if (!selected) {
        alert("실행할 메뉴를 선택해주세요.");
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
<