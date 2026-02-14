<?php
// account_pass_guest.php (회원 전용 조회 페이지 -> 공개 모드로 수정됨)
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';

// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:

require_once __DIR__ . '/php/db-connect-mongo.php';

// 사용자 정보 (로그인 상태면 이름/직책 표시, 아니면 '회원'으로 표시)
$user_id = $_SESSION['user_id'] ?? null;
$user_display_name = '회원';
$user_pos = '';

if ($user_id) {
  try {
    $u_info = $database->members->findOne(['id' => $user_id]);
    if ($u_info) {
      $user_display_name = $u_info['name'];
      $rem = $u_info['remark'] ?? '';
      if (strpos($rem, '회장') !== false) {
        $user_pos = ' 회장';
      } elseif (strpos($rem, '총무') !== false) {
        $user_pos = ' 총무';
      }
    }
  } catch (Exception $e) {
  }
}

// 날짜 설정
$todayMonth = date('n');
$todayYear = date('Y');
$CURRENT_YEAR = date('Y');

// 2. 선택된 연도 처리
$YEAR = isset($_GET['year']) && is_numeric($_GET['year']) ? (int) $_GET['year'] : (int) $CURRENT_YEAR;
$SELECT_YEAR = $YEAR;

// 3. 현재 월회비 및 적용 시점 조회 (모달창 표시용)
$currentFeeRow = $database->monthly_fee_history->findOne(
  [],
  ['sort' => ['apply_year' => -1, 'apply_month' => -1]]
);

if ($currentFeeRow) {
  $CURRENT_MONTH_FEE = $currentFeeRow['fee_amount'];
  $LAST_APPLY_YEAR = $currentFeeRow['apply_year'];
  $LAST_APPLY_MONTH = $currentFeeRow['apply_month'];
} else {
  $CURRENT_MONTH_FEE = 20000;
  $LAST_APPLY_YEAR = $CURRENT_YEAR;
  $LAST_APPLY_MONTH = 1;
}

// 4. 데이터 조회 (회원 목록 및 연도)
// 🔥 [수정] '공용계정' 제외하고 가져오기
$membersCursor = $database->members->find(
  ['name' => ['$ne' => '공용계정']],
  ['sort' => ['name' => 1]]
);
$members = iterator_to_array($membersCursor);

$yearsCursor = $database->account_pass->distinct('pay_year');
$years = iterator_to_array($yearsCursor);
rsort($years);

if (!in_array($CURRENT_YEAR, $years)) {
  array_unshift($years, (int) $CURRENT_YEAR);
}

// 회비 금액 조회 함수
function getMonthlyFee($database, $year, $month)
{
  $row = $database->monthly_fee_history->findOne(
    [
      '$or' => [
        ['apply_year' => ['$lt' => $year]],
        ['apply_year' => $year, 'apply_month' => ['$lte' => $month]]
      ]
    ],
    ['sort' => ['apply_year' => -1, 'apply_month' => -1]]
  );
  return $row ? (int) $row['fee_amount'] : 20000;
}

// 🔹 [추가] 이번 연도 모든 납부 현황 한 번에 가져오기 (성능 향상)
$passCursor = $database->account_pass->find(['pay_year' => (int) $YEAR]);
$passMap = [];
foreach ($passCursor as $p) {
  $p_mid = (string) $p['member_id'];
  $p_month = (int) $p['pay_month'];
  $passMap[$p_mid][$p_month] = (int) $p['paid'];
}
?>
?>

<!DOCTYPE html>
<html lang="ko">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>회비납부현황 (공개용)</title>

  <!-- 파비콘 -->
  <link rel="icon" href="/favicon.png?v=2" />
  <link rel="icon" type="image/png" sizes="36x36" href="./favicons/2/android-icon-36x36.png" />
  <link rel="icon" type="image/png" sizes="48x48" href="./favicons/2/android-icon-48x48.png" />
  <link rel="icon" type="image/png" sizes="72x72" href="./favicons/2/android-icon-72x72.png" />
  <link rel="apple-touch-icon" sizes="32x32" href="./favicons/2/apple-icon-32x32.png">

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <style>
    body {
      background: #f9f9f9;
      font-family: 'Noto Sans KR', sans-serif;
      margin: 20px 5px 10px 5px;
    }

    .user-info {
      text-align: right;
      font-size: 10px;
      color: #6c757d;
      margin-bottom: 20px;
    }

    .header-box {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      margin-bottom: 15px;
      /* 간격 조정 */
      gap: 10px;
    }

    .left-box {
      justify-self: start;
    }

    .center-box {
      justify-self: center;
    }

    .right-box {
      justify-self: end;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* 제목 버튼 */
    .title-btn {
      background: #1976d2;
      color: #fff;
      padding: 14px 28px;
      border-radius: 30px;
      font-weight: 800;
      font-size: 18px;
      white-space: nowrap;
    }

    /* 월회비 버튼 스타일 (클릭 가능하게 변경) */
    .fee-display {
      background: #eee;
      padding: 8px 15px;
      border-radius: 6px;
      white-space: nowrap;
      color: #333;
      font-weight: bold;
      cursor: pointer;
      /* 손가락 모양 커서 */
      transition: background 0.2s;
      border: 1px solid #ddd;
    }

    .fee-display:hover {
      background: #e0e0e0;
    }

    .help-btn {
      background: #fff3e0;
      text-decoration: none !important;
      color: #f57c00;
      border: 1px solid #ffe0b2;
      padding: 8px 15px;
      border-radius: 15px;
      font-weight: bold;
      cursor: pointer;
      white-space: nowrap;
      margin: 0;
      transition: background 0.2s;
    }

    .help-btn:hover {
      background: #ffe0b2;
    }

    .ox {
      font-weight: bold;
      font-size: 18px;
      padding: 8px;
      display: inline-block;
      min-width: 32px;
      cursor: pointer;
      /* 클릭 가능하게 변경 */
    }

    .ox.o {
      color: green;
    }

    .ox.x {
      color: red;
    }

    /* 테이블 기본 스타일 */
    table {
      width: 100%;
    }

    /* 툴팁형 팝업 스타일 */
    #monthPopup {
      display: none;
      position: absolute;
      background: white;
      border: 1px solid #999;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      padding: 12px;
      z-index: 2000;
      text-align: center;
      width: 120px;
    }

    #monthPopup .arrow {
      position: absolute;
      top: -6px;
      left: 55px;
      width: 10px;
      height: 10px;
      background: white;
      border-left: 1px solid #999;
      border-top: 1px solid #999;
      transform: rotate(45deg);
    }

    #monthPopupMsg {
      margin-bottom: 0;
      font-weight: bold;
      font-size: 14px;
      color: #333;
    }

    /* 모달 공통 스타일 */
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 9999;
      align-items: center;
      justify-content: center;
    }

    .modal-content {
      background: #fff;
      padding: 25px;
      border-radius: 12px;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    /* 월회비 안내 박스 스타일 */
    .fee-info-box {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      margin-top: 10px;
      margin-bottom: 20px;
    }

    .fee-highlight {
      color: #1976d2;
      font-weight: 800;
      font-size: 1.2rem;
    }

    .fee-date-text {
      color: #666;
      font-size: 0.95rem;
      margin-bottom: 5px;
    }


    /* 안내 모달 스타일 (반응형 무시 강제 테이블) */
    #guideModal table {
      display: table;
      width: 100%;
      border-collapse: collapse;
      background-color: #fff;
      table-layout: fixed;
    }

    #guideModal thead,
    #guideModal tbody,
    #guideModal tr {
      display: table-row-group;
    }

    #guideModal tr {
      display: table-row;
    }

    #guideModal th,
    #guideModal td {
      display: table-cell;
      border: 1px solid #dee2e6;
      padding: 8px 2px;
      text-align: center;
      vertical-align: middle;
    }

    #guideModal .guide-name-col {
      background-color: #f8f9fa;
      font-weight: bold;
      width: 60px;
    }

    .guide-ox {
      font-weight: bold;
      font-size: 16px;
    }

    .guide-o {
      color: #28a745;
    }

    .guide-x {
      color: #dc3545;
    }

    /* ✅ 전체 회원 수 표시 영역 스타일 */
    .total-members-info {
      font-size: 14px;
      color: #555;
      font-weight: 700;
      margin-bottom: 10px;
      /* 테이블과의 간격 */
      margin-left: 5px;
    }

    /* ✅ [추가] 위로 이동 버튼 (Top Button) 스타일 */
    #scrollToTopBtn {
      display: none;
      /* 기본적으로 숨김 */
      position: fixed;
      bottom: 80px;
      /* 하단에서 띄움 */
      right: 20px;
      /* 우측 벽면 가까이 */
      z-index: 9999;
      border: none;
      outline: none;
      background-color: rgba(0, 0, 0, 0.3);
      /* 반투명 검정 배경 */
      color: white;
      cursor: pointer;
      padding: 10px;
      border-radius: 50%;
      width: 45px;
      height: 45px;
      font-size: 20px;
      transition: background-color 0.3s, transform 0.3s;
      justify-content: center;
      align-items: center;
    }

    #scrollToTopBtn:hover {
      background-color: rgba(0, 0, 0, 0.6);
      /* 호버 시 진하게 */
      transform: translateY(-3px);
    }

    /* =======================================================
   모바일 반응형 (체크박스 제거 버전)
   ======================================================= */
    @media (max-width: 768px) {
      body {
        margin: 10px 3px;
      }

      .header-box {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto;
        row-gap: 12px;
        margin-bottom: 15px;
        /* 간격 조정 */
      }

      .center-box {
        grid-column: 1;
        grid-row: 1;
        justify-self: center;
      }

      .left-box {
        grid-column: 1;
        grid-row: 2;
        justify-self: start;
      }

      .title-btn {
        font-size: 15px;
        padding: 10px 20px;
      }

      .fee-display {
        font-size: 13px;
        padding: 6px 12px;
      }

      .right-box {
        justify-self: end;
        gap: 10px;
      }

      .help-btn {
        padding: 3px 6px;
      }

      /* 테이블 카드 뷰 변환 */
      .table-responsive {
        overflow-x: visible;
      }

      .list-table {
        display: block;
        border: none;
      }

      .list-table thead {
        display: block;
        margin-bottom: 10px;
      }

      /* 헤더 그리드 (체크박스 제거됨 -> 70px + 6fr) */
      .list-table thead tr {
        display: grid;
        /* 이름(80px) + 나머지 6개월 등분 */
        grid-template-columns: 80px repeat(6, 1fr);
        grid-template-rows: auto auto;
        gap: 1px;
        background: #f8f9fa;
        padding: 8px 5px;
        border-radius: 8px;
      }

      /* 합계/미납금 헤더 숨김 */
      .list-table thead th:nth-last-child(1),
      .list-table thead th:nth-last-child(2) {
        display: none !important;
      }

      /* 헤더 배치 재조정 */
      /* 이름 */
      .list-table thead th:nth-child(1) {
        grid-column: 1;
        grid-row: 1 / 3;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 700;
      }

      /* 상반기 */
      .list-table thead th:nth-child(2) {
        grid-column: 2 / 8;
        grid-row: 1;
        background: #e3f2fd;
        border-radius: 4px;
        padding: 4px;
        font-size: 12px;
        font-weight: 700;
        color: #1976d2;
      }

      /* 하반기 */
      .list-table thead th:nth-child(3) {
        grid-column: 2 / 8;
        grid-row: 2;
        background: #fff3e0;
        border-radius: 4px;
        padding: 4px;
        font-size: 12px;
        font-weight: 700;
        color: #f57c00;
        display: block !important;
      }

      .list-table thead tr:nth-child(2) {
        display: none;
      }

      /* 월 숫자 숨김 */

      /* 바디 설정 */
      .list-table tbody {
        display: block;
      }

      .list-table tbody tr {
        display: grid;
        grid-template-columns: 80px repeat(6, 1fr);
        grid-template-rows: auto auto auto auto;
        gap: 2px;
        background: white;
        padding: 10px 5px;
        margin-bottom: 12px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        border: 1px solid #e0e0e0;
      }

      /* 바디 셀 배치 (인덱스 주의: 체크박스 없음) */
      /* 이름: 1번 컬럼 */
      .list-table tbody td:nth-child(1) {
        grid-column: 1;
        grid-row: 1 / 5;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 14px;
        color: #333;
        word-break: keep-all;
      }

      /* 1~6월 (상단) */
      .list-table tbody td:nth-child(2),
      .list-table tbody td:nth-child(3),
      .list-table tbody td:nth-child(4),
      .list-table tbody td:nth-child(5),
      .list-table tbody td:nth-child(6),
      .list-table tbody td:nth-child(7) {
        grid-row: 1;
        background: #f0f8ff;
        border-radius: 4px;
        padding: 6px 2px;
      }

      .list-table tbody td:nth-child(2) {
        grid-column: 2;
      }

      .list-table tbody td:nth-child(3) {
        grid-column: 3;
      }

      .list-table tbody td:nth-child(4) {
        grid-column: 4;
      }

      .list-table tbody td:nth-child(5) {
        grid-column: 5;
      }

      .list-table tbody td:nth-child(6) {
        grid-column: 6;
      }

      .list-table tbody td:nth-child(7) {
        grid-column: 7;
      }

      /* 7~12월 (하단) */
      .list-table tbody td:nth-child(8),
      .list-table tbody td:nth-child(9),
      .list-table tbody td:nth-child(10),
      .list-table tbody td:nth-child(11),
      .list-table tbody td:nth-child(12),
      .list-table tbody td:nth-child(13) {
        grid-row: 2;
        background: #fff8f0;
        border-radius: 4px;
        padding: 6px 2px;
      }

      .list-table tbody td:nth-child(8) {
        grid-column: 2;
      }

      .list-table tbody td:nth-child(9) {
        grid-column: 3;
      }

      .list-table tbody td:nth-child(10) {
        grid-column: 4;
      }

      .list-table tbody td:nth-child(11) {
        grid-column: 5;
      }

      .list-table tbody td:nth-child(12) {
        grid-column: 6;
      }

      .list-table tbody td:nth-child(13) {
        grid-column: 7;
      }

      /* 입금합계 (3행 좌측) */
      .list-table tbody td:nth-child(14) {
        grid-column: 2 / 5;
        grid-row: 3;
        background: #e8f5e9;
        border-radius: 4px;
        padding: 8px;
        font-weight: 700;
        font-size: 13px;
        color: #2e7d32;
      }

      .list-table tbody td:nth-child(14)::before {
        content: '입금: ';
        font-weight: 500;
        color: #666;
      }

      /* 미납금 (3행 우측) */
      .list-table tbody td:nth-child(15) {
        grid-column: 5 / 8;
        grid-row: 3;
        background: #ffebee;
        border-radius: 4px;
        padding: 8px;
        font-weight: 700;
        font-size: 13px;
        color: #c62828;
      }

      .list-table tbody td:nth-child(15)::before {
        content: '미납: ';
        font-weight: 500;
        color: #666;
      }

      .ox {
        font-size: 15px;
        padding: 4px;
        min-width: 28px;
      }

      .btn-sm {
        font-size: 13px;
        padding: 6px 12px;
      }

      /* 모바일에서 위로가기 버튼 위치 조정 */
      #scrollToTopBtn {
        bottom: 70px;
        right: 15px;
      }
    }
  </style>
</head>

<body class="container py-4">

  <div class="user-info">
    👤 회원: <strong><?= htmlspecialchars($user_display_name) ?><?= $user_pos ?></strong> 님
  </div>

  <div class="header-box">
    <div class="left-box">
      <!-- 년도 선택 (드롭다운) -->
      <div class="dropdown">
        <button class="btn btn-dark btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown"
          aria-expanded="false">
          <?= $YEAR ?>년 선택
        </button>
        <ul class="dropdown-menu dropdown-menu-dark">
          <?php
          $baseYear = date('Y');
          for ($y = $baseYear; $y >= $baseYear - 3; $y--):
            ?>
            <li><a class="dropdown-item <?= ($y == $YEAR ? 'active' : '') ?>" href="?year=<?= $y ?>"><?= $y ?>년</a></li>
          <?php endfor; ?>
        </ul>
      </div>
    </div>
    <div class="center-box">
      <div class="title-btn"><?= $YEAR ?>년도 회비납부 현황</div>
    </div>
    <div class="right-box">
      <button class="help-btn" onclick="openGuideModal()">❓ 보는법</button>
      <!-- 클릭 시 openFeeInfoModal() 실행 -->
      <div class="fee-display" onclick="openFeeInfoModal()">
        월회비: <?= number_format($CURRENT_MONTH_FEE) ?>원
      </div>
    </div>
  </div>

  <!-- ✅ [추가] 전체 회원 수 표시 영역 -->
  <div class="total-members-info" id="totalMembersInfo">
    전체 회원 수: <?= count($members) ?>명
  </div>

  <div class="table-responsive">
    <table class="table table-bordered text-center align-middle list-table">
      <thead>
        <tr>
          <th rowspan="2">이름</th>
          <th colspan="6" class="month-group">상반기</th>
          <th colspan="6" class="month-group second-half">하반기</th>
          <th rowspan="2">입금합계</th>
          <th rowspan="2">미납금</th>
        </tr>
        <tr>
          <?php for ($m = 1; $m <= 12; $m++): ?>
            <th class="month-col"><?= $m ?>월</th>
          <?php endfor; ?>
        </tr>
      </thead>

      <tbody>
        <?php foreach ($members as $mem): ?>
          <tr>
            <td><?= htmlspecialchars($mem['name']) ?></td>

            <?php
            $totalPaid = 0;
            $unpaidTotal = 0;
            $mem_id_str = (string)$mem['_id'];
            for ($m = 1; $m <= 12; $m++):
              $paid = $passMap[$mem_id_str][$m] ?? 0;
              $monthFee = getMonthlyFee($database, $SELECT_YEAR, $m);

              if ($paid) {
                $totalPaid += $monthFee;
              } else {
                if ($SELECT_YEAR < $todayYear) {
                  $unpaidTotal += $monthFee;
                } elseif ($SELECT_YEAR == $todayYear && $m <= $todayMonth) {
                  $unpaidTotal += $monthFee;
                }
              }
              ?>
              <td>
                <span class="ox <?= $paid ? 'o' : 'x' ?>" data-month="<?= $m ?>" onclick="showMonthPopup(this, event)">
                  <?= $paid ? 'O' : 'X' ?>
                </span>
              </td>
            <?php endfor; ?>

            <td><?= number_format($totalPaid) ?></td>
            <td><?= number_format($unpaidTotal) ?></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>

  <!-- 1. 월회비 안내 모달 (열람 전용) -->
  <div id="feeInfoModal" class="modal-overlay">
    <div class="modal-content">
      <h5 style="font-weight:700; color:#333; text-align:center;">ℹ️ 월회비 안내</h5>

      <div class="fee-info-box">
        <p class="fee-date-text">
          👉 <strong><?= $LAST_APPLY_YEAR ?>년 <?= $LAST_APPLY_MONTH ?>월</strong> 부터
        </p>
        <p style="margin:0;">
          월회비가 <span class="fee-highlight"><?= number_format($CURRENT_MONTH_FEE) ?>원</span>으로<br>
          변경(적용) 되었습니다.
        </p>
      </div>

      <div class="text-center">
        <button class="btn btn-dark w-100" onclick="closeFeeInfoModal()">닫기</button>
      </div>
    </div>
  </div>


  <!-- 2. 보는법 안내 모달 -->
  <div id="guideModal" class="modal-overlay">
    <div class="modal-content" style="max-width: 450px; width: 95%;">
      <h5 style="font-weight:800; text-align:center; margin-bottom:15px; color:#1976d2;">
        📋 회비납부 현황 보는법 안내
      </h5>

      <p style="font-size:14px; text-align:center; color:#666; margin-bottom:15px;">
        예:)아래 예시와 같이 월별 납부 현황이 표시됩니다.<br>
        월회비가 20,000원인 경우로 계산된겁니다.<br>
        1월~12월까지 납부 여부가 O/X로 표시되고,<br>
        하단에는 입금 합계와 미납 합계가 표시됩니다.<br>
        <span class="guide-o">O (납부)</span> / <span class="guide-x">X (미납)</span>
      </p>

      <div class="guide-table-wrapper">
        <table class="guide-table">
          <thead>
            <tr>
              <th colspan="7" style="background:#e3f2fd !important; color:#1976d2 !important;">상반기 (1~6월)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowspan="2" class="guide-name-col">홍길동</td>
              <td>1월</td>
              <td>2월</td>
              <td>3월</td>
              <td>4월</td>
              <td>5월</td>
              <td>6월</td>
            </tr>
            <tr>
              <td class="guide-ox guide-o">O</td>
              <td class="guide-ox guide-o">O</td>
              <td class="guide-ox guide-o">O</td>
              <td class="guide-ox guide-o">O</td>
              <td class="guide-ox guide-o">O</td>
              <td class="guide-ox guide-o">O</td>
            </tr>
          </tbody>

          <thead>
            <tr>
              <th colspan="7"
                style="background:#fff3e0 !important; color:#e65100 !important; border-top: 2px solid #dee2e6 !important;">
                하반기 (7~12월)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowspan="2" class="guide-name-col">홍길동</td>
              <td>7월</td>
              <td>8월</td>
              <td>9월</td>
              <td>10월</td>
              <td>11월</td>
              <td>12월</td>
            </tr>
            <tr>
              <td class="guide-ox guide-o">O</td>
              <td class="guide-ox guide-o">O</td>
              <td class="guide-ox guide-o">O</td>
              <td class="guide-ox guide-o">O</td>
              <td class="guide-ox guide-x">X</td>
              <td class="guide-ox guide-x">X</td>
            </tr>
          </tbody>

          <tfoot>
            <tr>
              <td colspan="7" style="background:#f1f3f5 !important; padding:15px 5px !important;">
                <div style="font-weight:bold; color:#2e7d32; margin-bottom:5px;">
                  ✅ 입금 합계: 200,000원
                </div>
                <div style="font-weight:bold; color:#c62828;">
                  ❌ 미납 합계: 40,000원
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="text-center mt-4">
        <button class="btn btn-dark w-100" onclick="closeGuideModal()">확인 및 닫기</button>
      </div>
    </div>
  </div>


  <!-- 3. 월별 툴팁형 팝업 (O/X 클릭 시) -->
  <div id="monthPopup">
    <div class="arrow"></div>
    <p id="monthPopupMsg"></p>
  </div>

  <!-- ✅ [추가] 위로 이동 버튼 -->
  <button id="scrollToTopBtn" onclick="scrollToTop()">
    <i class="bi bi-arrow-up"></i>
  </button>

  <script>
    // 연도 변경
    function changeYear(year) {
      location.href = '?year=' + year;
    }

    // 도움말 모달 제어
    function openGuideModal() { document.getElementById('guideModal').style.display = 'flex'; }
    function closeGuideModal() { document.getElementById('guideModal').style.display = 'none'; }

    // 월회비 정보 모달 제어 (추가됨)
    function openFeeInfoModal() { document.getElementById('feeInfoModal').style.display = 'flex'; }
    function closeFeeInfoModal() { document.getElementById('feeInfoModal').style.display = 'none'; }

    // 툴팁형 팝업 제어
    function showMonthPopup(el, event) {
      event.stopPropagation();
      const month = el.dataset.month;
      const msg = month + '월';
      document.getElementById('monthPopupMsg').innerText = msg;

      const popup = document.getElementById('monthPopup');
      const rect = el.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      popup.style.top = (rect.bottom + scrollTop + 8) + 'px';
      popup.style.left = (rect.left + scrollLeft - 50) + 'px';
      popup.style.display = 'block';
    }

    function closeMonthPopup() {
      document.getElementById('monthPopup').style.display = 'none';
    }

    // 외부 클릭 시 팝업 닫기
    document.addEventListener('click', function (event) {
      const popup = document.getElementById('monthPopup');
      if (popup.style.display === 'block' && !event.target.closest('#monthPopup')) {
        closeMonthPopup();
      }
    });

    /* ✅ [추가] 위로 이동 스크립트 */
    window.scrollToTop = function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 스크롤 감지하여 버튼 표시/숨김
    window.addEventListener('scroll', function () {
      const btn = document.getElementById('scrollToTopBtn');
      if (window.scrollY > 300) {
        btn.style.display = 'flex';
      } else {
        btn.style.display = 'none';
      }
    });
  </script>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

</body>

</html>