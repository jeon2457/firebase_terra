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
if ($current_theme !== 'glass') {
  $mapping = [
    'book' => 'select.php',
    'icon' => 'select_menu_1.php',
    'list' => 'select_menu_3.php',
    'tech' => 'select_menu_4.php'
  ];
  if (isset($mapping[$current_theme])) {
    header("Location: " . $mapping[$current_theme]);
    exit;
  }
}

// 관리자 정보
$admin_id = htmlspecialchars($_SESSION['user_id']);
$admin_level = htmlspecialchars($_SESSION['user_level']);

?>

<!DOCTYPE html>
<html lang="ko">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>회원관리선택</title>

  <link rel="manifest" href="manifest.json">
  <meta name="msapplication-config" content="/browserconfig.xml">

  <!-- 파비콘 아이콘들 -->
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
  <!-- 📗 xlsx-js-style로 교체 (스타일 지원) -->
  <script src="https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js"></script>

  <style>
    /* 🌌 우주 배경 캔버스 */
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
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      min-height: 100vh;
    }

    .container {
      max-width: 650px;
      margin: 40px auto;
      padding: 30px 20px;
      /* ✨ 박스 안의 별들이 유리알처럼 선명하게 보이도록 블러를 제거하고 투명도 조정 */
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(0px);
      /* 블러 제거로 선명도 확보 */
      -webkit-backdrop-filter: blur(0px);
      border-radius: 40px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
    }

    /* 🔹 타이틀 스타일 */
    .section-title {
      text-align: center;
      color: #fff;
      font-weight: 900;
      margin-bottom: 20px;
      font-size: 1.8rem;
      letter-spacing: 2px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }

    .admin-info {
      text-align: center;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 35px;
      background: rgba(0, 0, 0, 0.5);
      padding: 10px;
      border-radius: 50px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* 🔹 그리드 레이아웃 */
    .option-box {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px 10px;
      justify-items: center;
    }

    /* 🔹 아이폰 앱 아이콘 스타일 */
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
      transform: scale(1.15) translateY(-5px);
    }

    .select-card input[type="checkbox"] {
      position: absolute;
      opacity: 0;
    }

    .app-icon {
      width: 65px;
      height: 65px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: white;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
      margin-bottom: 4px;
      position: relative;
      overflow: hidden;
    }

    /* 아이콘 배경색 그라데이션 */
    .bg-input {
      background: linear-gradient(180deg, #5AC8FA, #007AFF);
    }

    .bg-edit {
      background: linear-gradient(180deg, #FF9500, #FF5E00);
    }

    .bg-view {
      background: linear-gradient(180deg, #4CD964, #28A745);
    }

    .bg-upload {
      background: linear-gradient(180deg, #FF2D55, #D81B60);
    }

    .bg-scissors {
      background: linear-gradient(180deg, #AF52DE, #8E24AA);
    }

    .bg-image {
      background: linear-gradient(180deg, #5856D6, #3F51B5);
    }

    .bg-tel {
      background: linear-gradient(180deg, #34AADC, #0076FF);
    }

    .bg-card {
      background: linear-gradient(180deg, #FFCC00, #FBC02D);
    }

    .bg-manual {
      background: linear-gradient(180deg, #8E8E93, #636366);
    }

    .bg-map {
      background: linear-gradient(180deg, #00D2FF, #3A7BD5);
    }

    .bg-activities {
      background: linear-gradient(180deg, #FF3B30, #E63946);
    }

    /* 💰 추가: 재무 대시보드 */
    .bg-financial {
      background: linear-gradient(180deg, #FFD700, #FFA000);
    }

    /* 📗 추가: 엑셀 리포트 */
    .bg-excel {
      background: linear-gradient(180deg, #1D6F42, #43A047);
    }

    /* 선택 시 활성화 효과 */
    .select-card.active .app-icon {
      box-shadow: 0 0 0 3px #fff, 0 0 25px #007AFF;
      transform: scale(0.9);
    }

    .app-label {
      font-size: 11px;
      font-weight: 600;
      color: #fff;
      text-align: center;
      word-break: keep-all;
      line-height: 1.2;
      text-shadow: 0 2px 5px rgba(0, 0, 0, 1);
    }

    .btn-area {
      margin-top: 28px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
    }

    .btn-same {
      width: 100%;
      max-width: 300px;
      padding: 14px 0 !important;
      border-radius: 20px;
      font-weight: 800 !important;
      letter-spacing: 1px;
      transition: 0.3s;
    }

    .btn-primary {
      background: #007AFF;
      border: none;
      box-shadow: 0 10px 20px rgba(0, 122, 255, 0.4);
    }

    .btn-primary:hover {
      background: #0063ce;
      transform: translateY(-2px);
    }

    .btn-outline-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .btn-outline-secondary:hover {
      background: rgba(255, 60, 60, 0.3);
      border-color: #ff3b30;
      color: #fff;
    }

    .btn-theme-change {
      width: 100%;
      max-width: 300px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.7);
      padding: 14px 0;
      border-radius: 20px;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .btn-theme-change:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.5);
      color: #fff;
      transform: translateY(-2px);
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

    /* 📱 모바일 최적화 (정확한 중앙 정렬) */
    @media (max-width: 480px) {
      .container {
        width: calc(100% - 30px);
        margin: 20px auto;
        padding: 25px 10px;
        border-radius: 35px;
      }

      .option-box {
        grid-template-columns: repeat(3, 1fr);
        /* 모바일 3열 */
        gap: 8px 10px;
      }

      .app-icon {
        width: 60px;
        height: 60px;
        font-size: 1.8rem;
      }

      .section-title {
        font-size: 1.6rem;
      }

      /* 📊 대시보드 모달 스타일 */
      .dashboard-modal-body {
        padding: 20px;
        background: #f8f9fa;
        color: #333;
        /* 글래스모피즘 오버라이드 */
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
    }
  </style>
</head>

<body>
  <!-- 🌠 역동적인 우주 배경 -->
  <canvas id="space-canvas"></canvas>

  <div class="container">
    <h2 class="section-title">ADMIN PANEL</h2>

    <div class="admin-info">
      <i class="bi bi-person-circle"></i> ID: <strong><?= $admin_id ?></strong> &nbsp; | &nbsp; <i
        class="bi bi-shield-shaded"></i> LV: <strong><?= $admin_level ?></strong>
    </div>

    <form id="selectForm" onsubmit="return false;">
      <div class="option-box">

        <!-- 사용내역서 입력 -->
        <label class="select-card" for="opt_input">
          <input type="checkbox" id="opt_input" name="pageSelect" value="account_input.php">
          <div class="app-icon bg-input">
            <i class="bi bi-pencil-square"></i>
          </div>
          <div class="app-label">내역 입력</div>
        </label>

        <!-- 사용내역서 편집 -->
        <label class="select-card" for="opt_edit">
          <input type="checkbox" id="opt_edit" name="pageSelect" value="account_edit.php">
          <div class="app-icon bg-edit">
            <i class="bi bi-pencil"></i>
          </div>
          <div class="app-label">내역 편집</div>
        </label>

        <!-- 사용내역서 열람 -->
        <label class="select-card" for="opt_edit1">
          <input type="checkbox" id="opt_edit1" name="pageSelect" value="account_view.php">
          <div class="app-icon bg-view">
            <i class="bi bi-eye"></i>
          </div>
          <div class="app-label">내역 열람</div>
        </label>

        <!-- 영수증사진 업로드 -->
        <label class="select-card" for="opt_view">
          <input type="checkbox" id="opt_view" name="pageSelect" value="images_upload.php">
          <div class="app-icon bg-upload">
            <i class="bi bi-upload"></i>
          </div>
          <div class="app-label">영수증 업로드</div>
        </label>

        <!-- 영수증사진 편집 -->
        <label class="select-card" for="opt_account">
          <input type="checkbox" id="opt_account" name="pageSelect" value="images_edit.php">
          <div class="app-icon bg-scissors">
            <i class="bi bi-scissors"></i>
          </div>
          <div class="app-label">영수증 편집</div>
        </label>

        <!-- 영수증사진 열람 -->
        <label class="select-card" for="opt_images">
          <input type="checkbox" id="opt_images" name="pageSelect" value="images_view.php">
          <div class="app-icon bg-image">
            <i class="bi bi-image"></i>
          </div>
          <div class="app-label">영수증 열람</div>
        </label>

        <!-- 회원 전화연락망 관리 -->
        <label class="select-card" for="opt_tel">
          <input type="checkbox" id="opt_tel" name="pageSelect" value="./tel_select_1.php">
          <div class="app-icon bg-tel">
            <i class="bi bi-telephone"></i>
          </div>
          <div class="app-label">연락망 관리</div>
        </label>

        <!-- 회원 월회비 입금현황 보기 -->
        <label class="select-card" for="opt_account_pass">
          <input type="checkbox" id="opt_account_pass" name="pageSelect" value="account_pass.php">
          <div class="app-icon bg-card">
            <i class="bi bi-credit-card"></i>
          </div>
          <div class="app-label">월회비 입금현황</div>
        </label>

        <!-- 재무 대시보드 -->
        <label class="select-card" for="opt_financial">
          <input type="checkbox" id="opt_financial" name="pageSelect" value="#financialDashboard">
          <div class="app-icon bg-financial">
            <i class="bi bi-pie-chart-fill"></i>
          </div>
          <div class="app-label">재무 대시보드</div>
        </label>

        <!-- 엑셀 리포트 -->
        <label class="select-card" for="opt_excel">
          <input type="checkbox" id="opt_excel" name="pageSelect" value="#excelDownload">
          <div class="app-icon bg-excel">
            <i class="bi bi-file-earmark-excel-fill"></i>
          </div>
          <div class="app-label">엑셀 리포트</div>
        </label>

        <!-- 다음 지도 만들기 -->
        <label class="select-card" for="opt_map">
          <input type="checkbox" id="opt_map" name="pageSelect" value="map.php">
          <div class="app-icon bg-map">
            <i class="bi bi-map"></i>
          </div>
          <div class="app-label">지도 만들기</div>
        </label>

        <!-- 각종 모임 활동 -->
        <label class="select-card" for="opt_select1">
          <input type="checkbox" id="opt_select1" name="pageSelect" value="select_1.php">
          <div class="app-icon bg-activities">
            <i class="bi bi-people-fill"></i>
          </div>
          <div class="app-label">모임 활동</div>
        </label>


        <!-- 데이타베이스 백업 및 복원 -->
        <label class="select-card" for="opt_database">
          <input type="checkbox" id="opt_database" name="pageSelect" value="database_backup_restore.php">
          <div class="app-icon bg-activities">
            <i class="bi bi-database-fill-gear book-icon"></i>
          </div>
          <div class="app-label">데이타베이스 백업</div>
        </label>

        <!-- 📌 실시간 위치공유 (현재 닷홈은 https://를 사용하지 않으므로 이것을 사용할 수 없으므로 주석처리한다. -->
        <!-- <label class="select-card">
          <input type="checkbox" name="pageSelect" value="location_share.php">
          <div class="book-spine bg-danger"> <i class="bi bi-geo-alt-fill book-icon"></i> <div class="book-title">실시간 위치공유</div>
          </div>
        </label> -->

        <!-- Firebase 시스템 메뉴얼 -->
        <label class="select-card" for="opt_manual">
          <input type="checkbox" id="opt_manual" name="pageSelect" value="firebase_system_manual.html">
          <div class="app-icon bg-manual">
            <i class="bi bi-journal-code"></i>
          </div>
          <div class="app-label">시스템 메뉴얼</div>
        </label>

      </div>

      <div class="btn-area">
        <button type="button" class="btn btn-primary btn-lg btn-same shadow" onclick="goNext()">앱 실행하기</button>

        <button type="button" class="btn-theme-change shadow-sm" onclick="location.href='menu_design_selection.php'">🎨
          디자인 변경 / 테마 설정</button>

        <a href="./logout.php" class="btn btn-outline-secondary btn-lg btn-same shadow-sm">LOGOUT</a>
      </div>
    </form>
  </div>

  <script>
    /* 🌠 우주 비행 애니메이션 (선명도 최적화 버전) */
    const canvas = document.getElementById('space-canvas');
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

    /* --- 기존 메뉴 선택 로직 --- */
    const boxes = document.querySelectorAll('input[name="pageSelect"]');
    const cards = document.querySelectorAll('.select-card');

    boxes.forEach((box, idx) => {
      box.addEventListener('change', () => {
        boxes.forEach((other, j) => {
          if (j !== idx) {
            other.checked = false;
            cards[j].classList.remove('active');
          }
        });
        cards[idx].classList.toggle('active', box.checked);
      });
    });

    function goNext() {
      const selected = document.querySelector('input[name="pageSelect"]:checked');
      if (!selected) {
        alert("메뉴를 선택해주세요.");
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