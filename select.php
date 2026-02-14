<?php
ob_start();
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';

// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
require_once __DIR__ . '/php/auth_check.php';
// ✅ MongoDB DB 연결
require_once __DIR__ . '/php/db-connect-mongo.php';

// [중요] 통합 테마 로직: 1순위 DB, 2순위 쿠키, 3순위 기본값
$current_theme = 'book';

// 1. DB에서 테마 설정 확인 (로그인 상태일 때만)
if (isset($_SESSION['user_id'])) {
  try {
    // MongoDB에서 사용자 정보(테마 포함) 조회
    $user_doc = $collection->findOne(['id' => $_SESSION['user_id']]);

    if ($user_doc && !empty($user_doc['site_theme'])) {
      $current_theme = (string) $user_doc['site_theme'];

      // DB값이 있다면 쿠키도 강제로 동기화 (다음 접속을 위해)
      setcookie('user_site_theme', $current_theme, time() + (86400 * 30), "/");
    } else {
      // DB에 값이 없으면 쿠키 확인
      if (isset($_COOKIE['user_site_theme'])) {
        $current_theme = $_COOKIE['user_site_theme'];
      }
    }
  } catch (Exception $e) {
    // 에러 시 쿠키값 사용
    if (isset($_COOKIE['user_site_theme'])) {
      $current_theme = $_COOKIE['user_site_theme'];
    }
  }
} else {
  // 비로그인 상태면 쿠키 의존
  if (isset($_COOKIE['user_site_theme'])) {
    $current_theme = $_COOKIE['user_site_theme'];
  }
}

// 2. 테마 라우팅 (책장형이 기본값이고 현재 총5가지 디자인을 활용중!)
// 테마를 추가할 경우 반드시 여기에 매핑 추가 필요!
if ($current_theme !== 'book') {
  $mapping = [
    'icon' => 'select_menu_1.php',
    'glass' => 'select_menu_2.php',
    'list' => 'select_menu_3.php',
    'tech' => 'select_menu_4.php'
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
  <title>회원관리선택 - 책장형</title>

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
  <style>
    body {
      background-color: #f0f2f5;
      font-size: 16px;
      font-family: 'Noto Sans KR', sans-serif;
    }

    .container {
      max-width: 800px;
      margin: 30px auto;
      padding: 25px;
    }

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

    .select-card input[type="checkbox"] {
      position: absolute;
      opacity: 0;
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

    .book-icon {
      font-size: 1.4rem;
      margin-bottom: 5px;
    }

    .bg-tel {
      background: #d35400;
      border-left: 5px solid #a04000;
    }

    .bg-input {
      background: #2c3e50;
      border-left: 5px solid #1a252f;
    }

    .bg-edit {
      background: #c0392b;
      border-left: 5px solid #962d22;
    }

    .bg-view {
      background: #27ae60;
      border-left: 5px solid #1e8449;
    }

    .bg-upload {
      background: #2980b9;
      border-left: 5px solid #1f6391;
    }

    .bg-scissors {
      background: #8e44ad;
      border-left: 5px solid #6c3483;
    }

    .bg-image {
      background: #2c3e50;
      border-left: 5px solid #1a252f;
    }

    .bg-card {
      background: #16a085;
      border-left: 5px solid #117a65;
    }

    .bg-map {
      background: #2980b9;
      border-left: 5px solid #1f6391;
    }

    .bg-activities {
      background: #e67e22;
      border-left: 5px solid #d35400;
    }

    .bg-manual {
      background: #7f8c8d;
      border-left: 5px solid #626567;
    }

    /* 💰 추가: 재무 대시보드 (Gold) */
    .bg-financial {
      background: #FFB300;
      border-left: 5px solid #FF6F00;
      color: #333 !important;
    }

    .bg-financial .book-title,
    .bg-financial i {
      color: #333 !important;
    }

    /* 📗 추가: 엑셀 리포트 (Excel Green) */
    .bg-excel {
      background: #1D6F42;
      border-left: 5px solid #0f4c2c;
    }

    /* 📊 대시보드 모달 스타일 */
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

    @media (max-width: 768px) {
      .summary-card-row {
        grid-template-columns: 1fr;
      }
    }

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

    .btn-area {
      margin-top: 30px;
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .btn-same {
      width: 220px !important;
      height: 50px !important;
      font-weight: 700 !important;
      border-radius: 30px !important;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-theme-change {
      background: transparent;
      border: 2px solid #aaa;
      color: #555;
      padding: 8px 20px;
      border-radius: 30px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 700;
    }

    .btn-theme-change:hover {
      background: #eee;
      border-color: #0d6efd;
      color: #0d6efd;
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
  </style>
</head>

<body>
  <div class="container">
    <h2 class="section-title">회원관리 도서관</h2>
    <div class="admin-info">👤 관리자: <strong><?= $admin_id ?></strong> (Level <?= $admin_level ?>)</div>
    <form id="selectForm" onsubmit="return false;">
      <div class="option-box">
        <label class="select-card" for="opt_tel"><input type="checkbox" id="opt_tel" name="pageSelect"
            value="./tel_select_1.php">
          <div class="book-spine bg-tel"><i class="bi bi-telephone book-icon"></i>
            <div class="book-title">전화연락망 관리</div>
          </div>
        </label>
        <label class="select-card" for="opt_input"><input type="checkbox" id="opt_input" name="pageSelect"
            value="account_input.php">
          <div class="book-spine bg-input"><i class="bi bi-pencil-square book-icon"></i>
            <div class="book-title">사용내역 입력</div>
          </div>
        </label>
        <label class="select-card" for="opt_edit"><input type="checkbox" id="opt_edit" name="pageSelect"
            value="account_edit.php">
          <div class="book-spine bg-edit"><i class="bi bi-pencil book-icon"></i>
            <div class="book-title">사용내역 편집</div>
          </div>
        </label>
        <label class="select-card" for="opt_edit1"><input type="checkbox" id="opt_edit1" name="pageSelect"
            value="account_view.php">
          <div class="book-spine bg-view"><i class="bi bi-eye book-icon"></i>
            <div class="book-title">사용내역 열람</div>
          </div>
        </label>
        <label class="select-card" for="opt_view"><input type="checkbox" id="opt_view" name="pageSelect"
            value="images_upload.php">
          <div class="book-spine bg-upload"><i class="bi bi-upload book-icon"></i>
            <div class="book-title">영수증 업로드</div>
          </div>
        </label>
        <label class="select-card" for="opt_account"><input type="checkbox" id="opt_account" name="pageSelect"
            value="images_edit.php">
          <div class="book-spine bg-scissors"><i class="bi bi-scissors book-icon"></i>
            <div class="book-title">영수증 편집</div>
          </div>
        </label>
        <label class="select-card" for="opt_images"><input type="checkbox" id="opt_images" name="pageSelect"
            value="images_view.php">
          <div class="book-spine bg-image"><i class="bi bi-image book-icon"></i>
            <div class="book-title">영수증 열람</div>
          </div>
        </label>
        <label class="select-card" for="opt_account_pass"><input type="checkbox" id="opt_account_pass" name="pageSelect"
            value="account_pass.php">
          <div class="book-spine bg-card"><i class="bi bi-credit-card book-icon"></i>
            <div class="book-title">월회비 입금현황</div>
          </div>
        </label>
        <label class="select-card" for="opt_financial"><input type="checkbox" id="opt_financial" name="pageSelect"
            value="#financialDashboard">
          <div class="book-spine bg-financial"><i class="bi bi-pie-chart-fill book-icon"></i>
            <div class="book-title">재무 대시보드</div>
          </div>
        </label>
        <label class="select-card" for="opt_excel"><input type="checkbox" id="opt_excel" name="pageSelect"
            value="#excelDownload">
          <div class="book-spine bg-excel"><i class="bi bi-file-earmark-excel-fill book-icon"></i>
            <div class="book-title">엑셀 리포트</div>
          </div>
        </label>
        <label class="select-card"><input type="checkbox" name="pageSelect" value="map.php">
          <div class="book-spine bg-map"><i class="bi bi-map book-icon"></i>
            <div class="book-title">다음 지도 만들기</div>
          </div>
        </label>
        <label class="select-card"><input type="checkbox" name="pageSelect" value="select_1.php">
          <div class="book-spine bg-activities"><i class="bi bi-people-fill book-icon"></i>
            <div class="book-title">각종 모임 활동</div>
          </div>
        </label>



        </label>
        <label class="select-card"><input type="checkbox" name="pageSelect" value="database_backup_restore.php">
          <div class="book-spine bg-activities"><i class="bi bi-database-fill-gear book-icon"></i>
            <div class="book-title">데이타베이스 백업</div>
          </div>
        </label>

        <!-- 📌 실시간 위치공유 (현재 닷홈은 https://를 사용하지 않으므로 이것을 사용할 수 없으므로 주석처리한다. -->
        <!-- <label class="select-card">
          <input type="checkbox" name="pageSelect" value="location_share.php">
          <div class="book-spine bg-danger"> <i class="bi bi-geo-alt-fill book-icon"></i> <div class="book-title">실시간 위치공유</div>
          </div>
        </label> -->

        <label class="select-card"><input type="checkbox" name="pageSelect" value="firebase_system_manual.html">
          <div class="book-spine bg-manual"><i class="bi bi-journal-code book-icon"></i>
            <div class="book-title">시스템 매뉴얼</div>
          </div>
        </label>


      </div>
      <div class="btn-area">
        <button type="button" class="btn-theme-change" onclick="location.href='menu_design_selection.php'">🎨 디자인 변경 /
          테마 설정</button>
      </div>
      <div class="btn-area">
        <button type="button" class="btn btn-primary btn-lg btn-same shadow-lg" onclick="goNext()">책 펼쳐보기</button>
        <a href="./logout.php" class="btn btn-outline-danger btn-lg btn-same shadow-sm text-decoration-none">서재 나가기</a>
      </div>
    </form>
  </div>

  <!-- 💰 재무 대시보드 모달 -->
  <!-- ✅ [수정] 모달에 tabindex="-1"과 함께 포커스 관리 로직 추가 -->
  <div class="modal fade" id="financialModal" tabindex="-1" aria-labelledby="financialModalLabel">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title" id="financialModalLabel"><i class="bi bi-pie-chart-fill"></i> 재무 대시보드</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body dashboard-modal-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="m-0 fw-bold text-secondary">연도 선택</h6>
            <select id="dashYearSelect" class="form-select form-select-sm" style="width: 100px;"
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
              <div class="summary-title">순 이익 (총 잔액)</div>
              <div class="summary-amount text-balance" id="dashTotalBalance">0원</div>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-8">
              <div class="chart-container" style="height: 400px;"><canvas id="yearlyChart"></canvas></div>
            </div>
            <div class="col-lg-4">
              <div class="chart-container" style="height: 400px;"><canvas id="incomeChart"></canvas></div>
            </div>
          </div>
        </div>
        <div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 📗 엑셀 다운로드 설정 모달 -->
  <!-- ✅ [수정] 모달 접근성 속성 추가 -->
  <div class="modal fade" id="excelModal" tabindex="-1" aria-labelledby="excelModalLabel">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header bg-success text-white" style="background-color: #1D6F42 !important;">
          <h5 class="modal-title" id="excelModalLabel"><i class="bi bi-file-earmark-excel-fill"></i> 엑셀 리포트 설정</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
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
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js"></script>
  <script>
    const boxes = document.querySelectorAll('input[name="pageSelect"]');
    const cards = document.querySelectorAll('.select-card');
    let lastFocusedElement = null; // ✅ [추가] 모달 열기 전 포커스 요소 저장용

    boxes.forEach((box, idx) => { box.addEventListener('change', () => { boxes.forEach((other, j) => { if (j !== idx) other.checked = false; }); updateActive(); }); });
    function updateActive() { cards.forEach((card, idx) => { card.classList.toggle('active', boxes[idx].checked); }); }
    function goNext() {
      const selected = document.querySelector('input[name="pageSelect"]:checked');
      if (!selected) { alert("펼쳐볼 책을 선택해주세요."); return; }

      // ✅ [추가] 모달 열기 전 현재 포커스 저장
      lastFocusedElement = document.activeElement;

      if (selected.value === '#financialDashboard') {
        openDashboardModal();
        return;
      }
      if (selected.value === '#excelDownload') {
        openExcelModal();
        return;
      }
      location.href = selected.value;
    }

    // --- Financial Dashboard & Excel Logic ---
    let incomeDataCache = [];
    let expenseDataCache = [];
    let selectedYear = new Date().getFullYear();
    let incomeChart, yearChart;

    async function loadFinancialData() {
      if (incomeDataCache.length > 0) return true;
      try {
        const res = await fetch('./php/get_financial_data.php');
        const data = await res.json();
        if (data.success) {
          incomeDataCache = data.income;
          expenseDataCache = data.expense;
          return true;
        }
      } catch (e) {
        console.error("Data Load Error:", e);
      }
      return false;
    }

    window.openDashboardModal = async function () {
      if (await loadFinancialData()) {
        const modalElement = document.getElementById('financialModal');
        const modal = new bootstrap.Modal(modalElement);

        // ✅ [추가] 모달 닫힐 때 포커스 복귀 이벤트 등록
        modalElement.addEventListener('hide.bs.modal', function () {
          if (lastFocusedElement) lastFocusedElement.focus();
        }, { once: true });

        modal.show();
        updateDashboard();
      } else {
        alert("데이터를 불러오는데 실패했습니다.");
      }
    };

    window.updateDashboard = function () {
      const select = document.getElementById('dashYearSelect');
      if (select.options.length === 0) {
        const currentY = new Date().getFullYear();
        for (let y = currentY; y >= currentY - 3; y--) {
          const opt = document.createElement('option');
          opt.value = y; opt.text = y + "년";
          if (y === selectedYear) opt.selected = true;
          select.appendChild(opt);
        }
      }

      const sumYear = (data, year) => data.reduce((sum, item) => {
        const d = new Date(item.date);
        return d.getFullYear() === year ? sum + Number(item.amount) : sum;
      }, 0);

      const totalInc = sumYear(incomeDataCache, selectedYear);
      const totalExp = sumYear(expenseDataCache, selectedYear);

      document.getElementById('dashTotalIncome').innerText = totalInc.toLocaleString() + '원';
      document.getElementById('dashTotalExpense').innerText = totalExp.toLocaleString() + '원';
      document.getElementById('dashTotalBalance').innerText = (totalInc - totalExp).toLocaleString() + '원';

      renderCharts();
    };

    window.changeDashYear = function (el) {
      selectedYear = parseInt(el.value);
      updateDashboard();
    };

    function renderCharts() {
      const months = Array.from({ length: 12 }, (_, i) => (i + 1) + "월");
      const mInc = new Array(12).fill(0);
      const mExp = new Array(12).fill(0);

      incomeDataCache.forEach(item => {
        const d = new Date(item.date);
        if (d.getFullYear() === selectedYear) mInc[d.getMonth()] += Number(item.amount);
      });
      expenseDataCache.forEach(item => {
        const d = new Date(item.date);
        if (d.getFullYear() === selectedYear) mExp[d.getMonth()] += Number(item.amount);
      });

      if (yearChart) yearChart.destroy();
      yearChart = new Chart(document.getElementById('yearlyChart'), {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            { label: '수입', data: mInc, backgroundColor: '#4CAF50' },
            { label: '지출', data: mExp, backgroundColor: '#f44336' }
          ]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });

      if (incomeChart) incomeChart.destroy();
      incomeChart = new Chart(document.getElementById('incomeChart'), {
        type: 'doughnut',
        data: {
          labels: ['총 수입', '총 지출'],
          datasets: [{ data: [mInc.reduce((a, b) => a + b, 0), mExp.reduce((a, b) => a + b, 0)], backgroundColor: ['#4CAF50', '#f44336'] }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    window.openExcelModal = async function () {
      const select = document.getElementById('excelYearSelect');
      if (select.options.length === 0) {
        const currentY = new Date().getFullYear();
        for (let y = currentY; y >= currentY - 3; y--) {
          const opt = document.createElement('option');
          opt.value = y; opt.text = y + "년";
          select.appendChild(opt);
        }
      }

      const modalElement = document.getElementById('excelModal');
      const modal = new bootstrap.Modal(modalElement);

      // ✅ [추가] 모달 닫힐 때 포커스 복귀 이벤트 등록
      modalElement.addEventListener('hide.bs.modal', function () {
        if (lastFocusedElement) lastFocusedElement.focus();
      }, { once: true });

      modal.show();
    };

    window.downloadExcelReport = async function () {
      if (!(await loadFinancialData())) { alert("데이터 로드 실패"); return; }
      const year = parseInt(document.getElementById('excelYearSelect').value);
      const type = document.getElementById('excelTypeSelect').value;
      const wb = XLSX.utils.book_new();

      if (type === 'all' || type === 'income') {
        XLSX.utils.book_append_sheet(wb, createSheet(incomeDataCache, year, '수입'), "수입내역");
      }
      if (type === 'all' || type === 'expense') {
        XLSX.utils.book_append_sheet(wb, createSheet(expenseDataCache, year, '지출'), "지출내역");
      }
      XLSX.writeFile(wb, `TerraOne_회계장부_${year}년.xlsx`);
    };

    function createSheet(data, year, title) {
      const filtered = data.filter(item => new Date(item.date).getFullYear() === year)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      const rows = [[`${year}년 ${title} 내역`], ["NO", "날짜", "항목", "비고", "금액"]];
      let total = 0;
      filtered.forEach((item, idx) => {
        const amt = Number(item.amount);
        rows.push([idx + 1, item.date.split(' ')[0], item.category, item.description, amt]);
        total += amt;
      });
      rows.push(["", "", "", "합계", total]);

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];

      // 스타일에 필요한 xlsx-js-style 전용 속성들을 생략하고 최소화함 (데이터 정확성이 우선)
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const ref = XLSX.utils.encode_cell({ c: C, r: R });
          if (!ws[ref]) continue;
          ws[ref].s = {
            alignment: { horizontal: (C === 4 ? "right" : "center"), vertical: "center" },
            border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
          };
          if (R === 1) ws[ref].s.fill = { fgColor: { rgb: "1D6F42" } }, ws[ref].s.font = { color: { rgb: "FFFFFF" }, bold: true };
          if (R === 0) ws[ref].s.font = { bold: true, sz: 16 };
        }
      }
      ws['!cols'] = [{ wch: 6 }, { wch: 12 }, { wch: 15 }, { wch: 35 }, { wch: 12 }];
      return ws;
    }
  </script>
</body>

</html>