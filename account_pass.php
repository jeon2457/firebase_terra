<?php
// account_pass.php
// 회원 회비납부 현황표
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';

// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
require_once __DIR__ . '/php/auth_check.php';


// 🔹 [추가] 관리자 보안 로직: Level 10 미만은 접근 차단 및 로그인 유도
if (!isset($_SESSION['user_level']) || $_SESSION['user_level'] < 10) {
  // 현재 접속한 페이지 주소를 세션에 저장 (로그인 성공 후 다시 돌아오기 위함)
  $_SESSION['redirect_url'] = $_SERVER['REQUEST_URI'];

  echo "<script>
        alert('관리자 전용 페이지입니다. 로그인이 필요합니다.');
        location.href = 'login.php';
    </script>";
  exit;
}

require_once __DIR__ . '/php/db-connect-mongo.php';

// 🔹 [추가] 관리자 여부 확인 로직
$admin_id = $_SESSION['user_id'] ?? '손님';
$admin_level = $_SESSION['user_level'] ?? 0;

// 관리자 판별 (Level 10 이상만 관리자로 인정)
$is_admin = (isset($_SESSION['user_level']) && $_SESSION['user_level'] >= 10);

$todayMonth = date('n');
$todayDay = date('j');
$todayYear = date('Y');
$CURRENT_YEAR = date('Y');

// 🔹 선택된 연도 처리
$YEAR = isset($_GET['year']) && is_numeric($_GET['year']) ? (int) $_GET['year'] : (int) $CURRENT_YEAR;
$SELECT_YEAR = $YEAR;

// 🔹 현재 월회비 및 적용 시점 조회
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

// 회원 및 연도 목록
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

// 🔹 회비 조회 함수
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


<!DOCTYPE html>
<html lang="ko">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>회비납부현황</title>

  <!-- 파비콘 아이콘들 -->
  <link rel="icon" href="/favicon.png?v=2" />
  <link rel="icon" type="image/png" sizes="36x36" href="./favicons/2/android-icon-36x36.png" />
  <link rel="icon" type="image/png" sizes="48x48" href="./favicons/2/android-icon-48x48.png" />
  <link rel="icon" type="image/png" sizes="72x72" href="./favicons/2/android-icon-72x72.png" />
  <link rel="apple-touch-icon" sizes="32x32" href="./favicons/2/apple-icon-32x32.png">
  <link rel="apple-touch-icon" sizes="57x57" href="./favicons/2/apple-icon-57x57.png">
  <link rel="apple-touch-icon" sizes="60x60" href="./favicons/2/apple-icon-60x60.png">
  <link rel="apple-touch-icon" sizes="72x72" href="./favicons/2/apple-icon-72x72.png">

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <style>
    body {
      background: #f9f9f9;
      font-family: 'Noto Sans KR', sans-serif;
      margin: 20px 5px 10px 5px;
    }

    .admin-info {
      text-align: right;
      font-size: 15px;
      color: #6c757d;
      margin-bottom: 20px;
    }

    .header-box {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      margin-bottom: 10px;
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

    .fee-btn {
      background: #eee;
      padding: 8px 15px;
      border-radius: 6px;
      white-space: nowrap;
      cursor: pointer;
      transition: background 0.2s;
    }

    .fee-btn:hover {
      background: #ddd;
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
      cursor: pointer;
      font-weight: bold;
      font-size: 18px;
      padding: 8px;
      display: inline-block;
      min-width: 32px;
    }

    .ox.o {
      color: green;
    }

    .ox.x {
      color: red;
    }

    /* 데스크톱 기본 스타일 */
    table {
      width: 100%;
    }

    /* 관리자/일반 구분용 스타일 */
    .ox.no-access {
      cursor: default !important;
    }

    .fee-btn.no-access {
      cursor: default !important;
      background: #f0f0f0 !important;
    }

    .guide-ox {
      font-weight: bold;
    }

    .guide-o {
      color: green;
    }

    .guide-x {
      color: red;
    }

    /* 안내 모달 스타일 */
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

    .guide-table-wrapper {
      width: 100%;
      overflow: hidden;
      border-radius: 8px;
    }

    .fee-notice-box {
      background: #fff5f8;
      border: 1px solid #ffe3e3;
      padding: 12px;
      border-radius: 8px;
      text-align: center;
      margin-top: 15px;
    }

    .fee-notice-text {
      color: #d63384;
      font-weight: 700;
      font-size: 0.95rem;
      margin: 0;
    }

    /* ✅ [추가됨] 터치 시 뜨는 확인 팝업 스타일 */
    #statusPopup {
      display: none;
      position: absolute;
      background: white;
      border: 1px solid #999;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      padding: 12px;
      z-index: 2000;
      text-align: center;
      width: 180px;
    }

    /* 팝업 상단에 뾰족하게 튀어나온 화살표 모양 */
    #statusPopup .arrow {
      position: absolute;
      top: -6px;
      left: 88px;
      width: 10px;
      height: 10px;
      background: white;
      border-left: 1px solid #999;
      border-top: 1px solid #999;
      transform: rotate(45deg);
    }

    /* 팝업 내부 메시지 텍스트 */
    #popupMsg {
      margin-bottom: 10px;
      font-weight: bold;
      font-size: 13px;
      color: #333;
    }

    /* ✅ [추가] 전체 회원 수 표시 영역 스타일 */
    .total-members-info {
      font-size: 14px;
      color: #555;
      font-weight: 700;
      margin-bottom: 8px;
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
   모바일 반응형 CSS
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

      .admin-info {
        text-align: right;
        font-size: 12px;
        color: #6c757d;
        margin-bottom: 20px;
      }

      .help-btn {
        background: #fff3e0;
        text-decoration: none !important;
        color: #f57c00;
        border: 1px solid #ffe0b2;
        padding: 3px 6px;
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
        text-align: center;
      }

      .fee-btn {
        font-size: 13px;
        padding: 6px 12px;
      }

      .right-box {
        justify-self: end;
        gap: 20px;
      }

      /* 테이블 공통 설정 */
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

      .list-table tbody {
        display: block;
      }

      /* 공통 숨김 처리 */
      .list-table thead tr:nth-child(2) {
        display: none;
      }

      /* 월 숫자 숨김 */
      .list-table thead th:nth-last-child(1),
      .list-table thead th:nth-last-child(2) {
        display: none !important;
      }

      /* 합계 헤더 숨김 */

      /* ==================================================
     (A) 관리자 모드 CSS (.mode-admin)
     ================================================== */

      /* 🔹 [수정됨] 관리자 모드에서 헤더의 두 번째 줄(1월, 2월... 숫자)은 무조건 숨김 */
      .list-table.mode-admin thead tr:nth-child(2) {
        display: none !important;
      }

      .list-table.mode-admin thead tr:first-child,
      .list-table.mode-admin tbody tr {
        display: grid;
        grid-template-columns: 35px 70px repeat(6, 1fr);
        grid-template-rows: auto auto;
        gap: 1px;
        background: white;
        /* tbody용 */
      }

      .list-table.mode-admin thead tr:first-child {
        background: #f8f9fa;
      }

      .list-table.mode-admin tbody tr {
        grid-template-rows: auto auto auto auto;
        /* 바디는 4줄 */
        padding: 10px 5px;
        margin-bottom: 12px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        border: 1px solid #e0e0e0;
      }

      /* 관리자용 셀 배치 */
      .list-table.mode-admin thead th:nth-child(1) {
        grid-column: 1;
        grid-row: 1/3;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .list-table.mode-admin thead th:nth-child(2) {
        grid-column: 2;
        grid-row: 1/3;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 700;
      }

      .list-table.mode-admin thead th:nth-child(3) {
        grid-column: 3/9;
        grid-row: 1;
        background: #e3f2fd;
        border-radius: 4px;
        padding: 4px;
        font-size: 12px;
        font-weight: 700;
        color: #1976d2;
      }

      .list-table.mode-admin thead th:nth-child(4) {
        grid-column: 3/9;
        grid-row: 2;
        background: #fff3e0;
        border-radius: 4px;
        padding: 4px;
        font-size: 12px;
        font-weight: 700;
        color: #f57c00;
        display: block !important;
      }

      .list-table.mode-admin tbody td:nth-child(1) {
        grid-column: 1;
        grid-row: 1/5;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .list-table.mode-admin tbody td:nth-child(2) {
        grid-column: 2;
        grid-row: 1/5;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 14px;
        color: #333;
        word-break: keep-all;
      }

      /* 월별 데이터 (관리자용) */
      .list-table.mode-admin tbody td:nth-child(3),
      .list-table.mode-admin tbody td:nth-child(4),
      .list-table.mode-admin tbody td:nth-child(5),
      .list-table.mode-admin tbody td:nth-child(6),
      .list-table.mode-admin tbody td:nth-child(7),
      .list-table.mode-admin tbody td:nth-child(8) {
        grid-row: 1;
        background: #f0f8ff;
        border-radius: 4px;
        padding: 6px 2px;
      }

      .list-table.mode-admin tbody td:nth-child(3) {
        grid-column: 3;
      }

      .list-table.mode-admin tbody td:nth-child(4) {
        grid-column: 4;
      }

      .list-table.mode-admin tbody td:nth-child(5) {
        grid-column: 5;
      }

      .list-table.mode-admin tbody td:nth-child(6) {
        grid-column: 6;
      }

      .list-table.mode-admin tbody td:nth-child(7) {
        grid-column: 7;
      }

      .list-table.mode-admin tbody td:nth-child(8) {
        grid-column: 8;
      }

      .list-table.mode-admin tbody td:nth-child(9),
      .list-table.mode-admin tbody td:nth-child(10),
      .list-table.mode-admin tbody td:nth-child(11),
      .list-table.mode-admin tbody td:nth-child(12),
      .list-table.mode-admin tbody td:nth-child(13),
      .list-table.mode-admin tbody td:nth-child(14) {
        grid-row: 2;
        background: #fff8f0;
        border-radius: 4px;
        padding: 6px 2px;
      }

      .list-table.mode-admin tbody td:nth-child(9) {
        grid-column: 3;
      }

      .list-table.mode-admin tbody td:nth-child(10) {
        grid-column: 4;
      }

      .list-table.mode-admin tbody td:nth-child(11) {
        grid-column: 5;
      }

      .list-table.mode-admin tbody td:nth-child(12) {
        grid-column: 6;
      }

      .list-table.mode-admin tbody td:nth-child(13) {
        grid-column: 7;
      }

      .list-table.mode-admin tbody td:nth-child(14) {
        grid-column: 8;
      }

      /* 관리자 합계/미납 */
      .list-table.mode-admin tbody td:nth-child(15) {
        grid-column: 3/6;
        grid-row: 3;
        background: #e8f5e9;
        border-radius: 4px;
        padding: 8px;
        font-weight: 700;
        font-size: 13px;
        color: #2e7d32;
      }

      .list-table.mode-admin tbody td:nth-child(15)::before {
        content: '입금: ';
        font-weight: 500;
        color: #666;
      }

      .list-table.mode-admin tbody td:nth-child(16) {
        grid-column: 6/9;
        grid-row: 3;
        background: #ffebee;
        border-radius: 4px;
        padding: 8px;
        font-weight: 700;
        font-size: 13px;
        color: #2e7d32;
      }

      .list-table.mode-admin tbody td:nth-child(16)::before {
        content: '미납: ';
        font-weight: 500;
        color: #666;
      }


      /* ==================================================
     (B) 일반(게스트) 모드 CSS (.mode-guest)
     ================================================== */

      /* 일반 모드에서도 두 번째 줄(1월, 2월...)은 숨김 */
      .list-table.mode-guest thead tr:nth-child(2) {
        display: none !important;
      }

      .list-table.mode-guest thead tr:first-child,
      .list-table.mode-guest tbody tr {
        display: grid;
        /* 체크박스(35px) 제거하고 이름칸을 조금 키움 */
        grid-template-columns: 80px repeat(6, 1fr);
        grid-template-rows: auto auto;
        gap: 1px;
        background: white;
      }

      .list-table.mode-guest thead tr:first-child {
        background: #f8f9fa;
      }

      .list-table.mode-guest tbody tr {
        grid-template-rows: auto auto auto auto;
        padding: 10px 5px;
        margin-bottom: 12px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        border: 1px solid #e0e0e0;
      }

      /* 게스트용 헤더 배치 (인덱스 변화 주의: 체크박스 없음) */
      .list-table.mode-guest thead th:nth-child(1) {
        /* 이름 */
        grid-column: 1;
        grid-row: 1/3;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 700;
      }

      .list-table.mode-guest thead th:nth-child(2) {
        /* 상반기 */
        grid-column: 2/8;
        grid-row: 1;
        background: #e3f2fd;
        border-radius: 4px;
        padding: 4px;
        font-size: 12px;
        font-weight: 700;
        color: #1976d2;
      }

      .list-table.mode-guest thead th:nth-child(3) {
        /* 하반기 */
        grid-column: 2/8;
        grid-row: 2;
        background: #fff3e0;
        border-radius: 4px;
        padding: 4px;
        font-size: 12px;
        font-weight: 700;
        color: #f57c00;
        display: block !important;
      }

      /* 게스트용 바디 배치 (인덱스 변화 주의: 체크박스TD 없음) */
      .list-table.mode-guest tbody td:nth-child(1) {
        /* 이름 */
        grid-column: 1;
        grid-row: 1/5;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 14px;
        color: #333;
        word-break: keep-all;
      }

      /* 1~6월 (상단) */
      .list-table.mode-guest tbody td:nth-child(2),
      .list-table.mode-guest tbody td:nth-child(3),
      .list-table.mode-guest tbody td:nth-child(4),
      .list-table.mode-guest tbody td:nth-child(5),
      .list-table.mode-guest tbody td:nth-child(6),
      .list-table.mode-guest tbody td:nth-child(7) {
        grid-row: 1;
        background: #f0f8ff;
        border-radius: 4px;
        padding: 6px 2px;
      }

      /* Guest 모드는 체크박스(1열)이 없으므로 데이터 시작은 2열부터 */
      .list-table.mode-guest tbody td:nth-child(2) {
        grid-column: 2;
      }

      .list-table.mode-guest tbody td:nth-child(3) {
        grid-column: 3;
      }

      .list-table.mode-guest tbody td:nth-child(4) {
        grid-column: 4;
      }

      .list-table.mode-guest tbody td:nth-child(5) {
        grid-column: 5;
      }

      .list-table.mode-guest tbody td:nth-child(6) {
        grid-column: 6;
      }

      .list-table.mode-guest tbody td:nth-child(7) {
        grid-column: 7;
      }

      /* 7~12월 (하단) */
      .list-table.mode-guest tbody td:nth-child(8),
      .list-table.mode-guest tbody td:nth-child(9),
      .list-table.mode-guest tbody td:nth-child(10),
      .list-table.mode-guest tbody td:nth-child(11),
      .list-table.mode-guest tbody td:nth-child(12),
      .list-table.mode-guest tbody td:nth-child(13) {
        grid-row: 2;
        background: #fff8f0;
        border-radius: 4px;
        padding: 6px 2px;
      }

      .list-table.mode-guest tbody td:nth-child(8) {
        grid-column: 2;
      }

      .list-table.mode-guest tbody td:nth-child(9) {
        grid-column: 3;
      }

      .list-table.mode-guest tbody td:nth-child(10) {
        grid-column: 4;
      }

      .list-table.mode-guest tbody td:nth-child(11) {
        grid-column: 5;
      }

      .list-table.mode-guest tbody td:nth-child(12) {
        grid-column: 6;
      }

      .list-table.mode-guest tbody td:nth-child(13) {
        grid-column: 7;
      }

      /* 게스트 합계/미납 */
      .list-table.mode-guest tbody td:nth-child(14) {
        grid-column: 2/5;
        grid-row: 3;
        background: #e8f5e9;
        border-radius: 4px;
        padding: 8px;
        font-weight: 700;
        font-size: 13px;
        color: #2e7d32;
      }

      .list-table.mode-guest tbody td:nth-child(14)::before {
        content: '입금: ';
        font-weight: 500;
        color: #666;
      }

      .list-table.mode-guest tbody td:nth-child(15) {
        grid-column: 5/8;
        grid-row: 3;
        background: #ffebee;
        border-radius: 4px;
        padding: 8px;
        font-weight: 700;
        font-size: 13px;
        color: #2e7d32;
      }

      .list-table.mode-guest tbody td:nth-child(15)::before {
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

      .d-flex.gap-2 {
        gap: 8px !important;
        flex-wrap: wrap;
      }

      /* 모바일에서 위로가기 버튼 위치 조정 */
      #scrollToTopBtn {
        bottom: 70px;
        right: 15px;
      }
    }

    /* 태블릿 크기 */
    @media (min-width: 769px) and (max-width: 1024px) {
      .title-btn {
        font-size: 16px;
        padding: 12px 24px;
      }

      table {
        font-size: 14px;
      }

      .ox {
        font-size: 16px;
      }
    }

    /* 모달 스타일 */
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
    }
  </style>
</head>


<body class="container py-4">

  <div class="admin-info">
    <?php if ($is_admin): ?>
      <span class="badge bg-primary">관리자 모드</span>
      👤 관리자: <strong><?= htmlspecialchars($admin_id) ?></strong> (Level <?= $admin_level ?>)
    <?php else: ?>
      <span class="badge bg-dark">전용 열람 모드</span>
      👤 <strong>회원</strong> (데이터 조회 가능)
    <?php endif; ?>
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
      <div class="<?= $is_admin ? 'fee-btn' : '' ?>" <?php if ($is_admin): ?>onclick="openFeeModal()" <?php endif; ?>
        style="<?= !$is_admin ? 'background:#f1f1f1; padding:8px 15px; border-radius:6px; cursor:default; color:#666;' : '' ?>">
        월회비: <?= number_format($CURRENT_MONTH_FEE) ?>원
      </div>
    </div>
  </div>

  <!-- ✅ [추가] 전체 회원 수 표시 영역 -->
  <div class="total-members-info" id="totalMembersInfo">
    전체 회원 수: <?= count($members) ?>명
  </div>

  <div class="table-responsive">
    <!-- 🔹 [핵심 수정] 관리자 여부에 따라 클래스(mode-admin / mode-guest)를 동적으로 추가 -->
    <table
      class="table table-bordered text-center align-middle list-table <?= $is_admin ? 'mode-admin' : 'mode-guest' ?>">
      <thead>
        <tr>
          <?php if ($is_admin): ?>
            <th rowspan="2" style="width:40px;"><input type="checkbox" id="checkAll"></th>
          <?php endif; ?>

          <th rowspan="2">이름</th>
          <th colspan="6" class="month-group">상반기</th>
          <th colspan="6" class="month-group second-half">하반기</th>
          <th rowspan="2">입금합계</th>
          <th rowspan="2">미납금</th>
        </tr>
        <tr>
          <?php for ($m = 1; $m <= 12; $m++): ?>
            <th class="month-col month-<?= $m ?>"><?= $m ?>월</th>
          <?php endfor; ?>
        </tr>
      </thead>

      <tbody>

        <?php foreach ($members as $mem):
          $mId = (string) $mem['_id'];
          ?>
          <tr data-id="<?= $mId ?>">
            <?php if ($is_admin): ?>
              <td><input type="checkbox" class="member-check" value="<?= $mId ?>"></td>
            <?php endif; ?>

            <td><?= htmlspecialchars($mem['name']) ?></td>

            <?php
            $totalPaid = 0;
            $unpaidTotal = 0;
            $mem_id_str = (string) $mem['_id'];
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
                <!-- ✅ [수정] 클릭 시 showChangePopup 실행 -->
                <span class="ox <?= $paid ? 'o' : 'x' ?> <?= !$is_admin ? 'no-access' : '' ?>" data-month="<?= $m ?>"
                  data-paid="<?= $paid ?>" <?php if ($is_admin): ?>onclick="showChangePopup(this, event)" <?php endif; ?>
                  style="<?= !$is_admin ? 'cursor:default; opacity:0.8;' : '' ?>">
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

  <?php if ($is_admin): ?>
    <div class="d-flex justify-content-center gap-2 mt-4">
      <button class="btn btn-primary btn-lg" onclick="goMemberCheck()">회원 체크하기</button>
    </div>

    <div class="d-flex justify-content-center mt-3 mb-4">
      <a href="select.php" class="btn btn-secondary btn-lg">⏪ 돌아가기</a>
    </div>
  <?php endif; ?>

  <?php if ($is_admin): ?>
    <div id="feeModal" class="modal-overlay">
      <div class="modal-content">
        <h5>💰 월회비 변경</h5>
        <div class="mb-3">
          <label>적용 연도/월</label>
          <div class="d-flex gap-2">
            <input type="number" id="feeYear" class="form-control" value="<?= $CURRENT_YEAR ?>">
            <select id="feeMonth" class="form-select">
              <?php for ($i = 1; $i <= 12; $i++): ?>
                <option value="<?= $i ?>" <?= $i == date('n') ? 'selected' : '' ?>><?= $i ?>월</option>
              <?php endfor; ?>
            </select>
          </div>
        </div>
        <div class="mb-3">
          <label class="small text-secondary mb-1">변경할 월회비 (원)</label>
          <input type="number" id="feeAmount" class="form-control" value="<?= $CURRENT_MONTH_FEE ?>">
        </div>

        <div class="fee-notice-box">
          <p class="fee-notice-text">
            👉 <?= $LAST_APPLY_YEAR ?>년 <?= $LAST_APPLY_MONTH ?>월부터 월회비가 <?= number_format($CURRENT_MONTH_FEE) ?>원으로
            변경되었습니다.
          </p>
        </div>

        <div class="d-flex gap-2 justify-content-end mt-4">
          <button class="btn btn-secondary" onclick="closeFeeModal()">취소</button>
          <button class="btn btn-primary" onclick="saveFee()">저장</button>
        </div>
      </div>
    </div>
  <?php endif; ?>


  <div id="guideModal" class="modal-overlay">
    <div class="modal-content" style="max-width: 450px; width: 95%;">
      <h5 style="font-weight:800; text-align:center; margin-bottom:15px; color:#1976d2;">
        📋 회비납부 현황 보는법 안내
      </h5>

      <p style="font-size:14px; text-align:center; color:#666; margin-bottom:15px;">
        예:)아래 예시와 같이 월별 납부 현황이 표시됩니다.<br> 월회비가 20,000원인 경우로 계산된겁니다.<br>
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

  <!-- ✅ [추가됨] O/X 변경 확인 팝업 (툴팁형) -->
  <div id="statusPopup">
    <div class="arrow"></div>
    <p id="popupMsg">변경하시겠습니까?</p>
    <div class="d-flex justify-content-center gap-2">
      <button class="btn btn-primary btn-sm" onclick="confirmChange()">변경</button>
      <button class="btn btn-secondary btn-sm" onclick="closePopup()">취소</button>
    </div>
  </div>

  <!-- ✅ [추가] 위로 이동 버튼 -->
  <button id="scrollToTopBtn" onclick="scrollToTop()">
    <i class="bi bi-arrow-up"></i>
  </button>

  <script>
    // =================================================================
    // 1. PHP 변수 및 설정값 전달
    // =================================================================
    const IS_ADMIN = <?= json_encode($is_admin) ?>;
    const CURRENT_YEAR = <?= $YEAR ?>;
    const TODAY_MONTH = <?= date('n') ?>;
    const MONTHLY_FEES = <?php
    $fees = [];
    for ($m = 1; $m <= 12; $m++) {
      $fees[$m] = getMonthlyFee($database, $SELECT_YEAR, $m);
    }
    echo json_encode($fees);
    ?>;

    // =================================================================
    // 2. 페이지 이동 및 모달 제어 함수
    // =================================================================
    function changeYear(year) {
      location.href = 'account_pass.php?year=' + year;
    }

    function openGuideModal() { document.getElementById('guideModal').style.display = 'flex'; }
    function closeGuideModal() { document.getElementById('guideModal').style.display = 'none'; }
    function openFeeModal() {
      if (!IS_ADMIN) return;
      document.getElementById('feeModal').style.display = 'flex';
    }
    function closeFeeModal() { document.getElementById('feeModal').style.display = 'none'; }

    // =================================================================
    // 3. 데이터 저장 및 통신 함수
    // =================================================================
    function saveFee() {
      if (!IS_ADMIN) return;
      const year = document.getElementById('feeYear').value;
      const month = document.getElementById('feeMonth').value;
      const amount = document.getElementById('feeAmount').value;

      fetch('account_fee_save.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: parseInt(year),
          month: parseInt(month),
          amount: parseInt(amount)
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert('저장되었습니다.');
            location.reload();
          } else {
            alert('저장에 실패했습니다.');
          }
        })
        .catch(err => alert('오류가 발생했습니다.'));
    }

    // 🔹 [수정됨] 팝업 관리 변수 및 함수
    let currentTargetEl = null;

    function showChangePopup(el, event) {
      if (!IS_ADMIN) return;
      event.stopPropagation(); // 부모 클릭 방지

      currentTargetEl = el;
      const isPaid = el.dataset.paid === '1';
      const month = el.dataset.month;

      // 메시지 설정
      const msg = `${month}월 선택 - ` + (isPaid ? "미납(X)으로 변경?" : "납부(O)로 변경?");
      document.getElementById('popupMsg').innerText = msg;

      // 팝업 위치 설정 (터치한 요소 바로 근처에)
      const popup = document.getElementById('statusPopup');
      const rect = el.getBoundingClientRect();

      // 스크롤 고려
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      // 요소의 아래쪽 중앙에 배치
      popup.style.top = (rect.bottom + scrollTop + 8) + 'px';
      popup.style.left = (rect.left + scrollLeft - 80) + 'px'; // 살짝 왼쪽으로 이동해서 중앙 정렬 느낌

      popup.style.display = 'block';
    }

    function confirmChange() {
      if (currentTargetEl) {
        togglePaidStatus(currentTargetEl); // 실제 변경 함수 호출
        closePopup();
      }
    }

    function closePopup() {
      document.getElementById('statusPopup').style.display = 'none';
      currentTargetEl = null;
    }

    // 기존 변경 로직 (이제 confirmChange에서 호출됨)
    function togglePaidStatus(el) {
      const row = el.closest('tr');
      const memberId = row.dataset.id;
      const month = el.dataset.month;
      const isPaid = el.dataset.paid === '1';
      const newPaid = isPaid ? 0 : 1;

      fetch('account_pass_save.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: memberId,
          year: CURRENT_YEAR,
          month: month,
          paid: newPaid
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            el.dataset.paid = newPaid;
            el.textContent = newPaid ? 'O' : 'X';
            el.classList.remove('o', 'x');
            el.classList.add(newPaid ? 'o' : 'x');
            updateRowTotals(row);
          }
        })
        .catch(err => console.error('Error:', err));
    }

    function updateRowTotals(row) {
      const oxElements = row.querySelectorAll('.ox');
      let totalPaid = 0;
      let totalUnpaid = 0;

      oxElements.forEach(el => {
        const m = parseInt(el.dataset.month);
        const paid = el.dataset.paid === '1';
        const monthFee = parseInt(MONTHLY_FEES[m]) || 0;

        if (paid) {
          totalPaid += monthFee;
        } else if (m <= TODAY_MONTH) {
          totalUnpaid += monthFee;
        }
      });

      const tds = row.querySelectorAll('td');
      tds[tds.length - 2].textContent = totalPaid.toLocaleString();
      tds[tds.length - 1].textContent = totalUnpaid.toLocaleString();
    }

    function goMemberCheck() {
      if (!IS_ADMIN) return;
      const checked = document.querySelectorAll('.member-check:checked');
      if (checked.length === 0) { alert('회원을 선택하세요.'); return; }
      const ids = Array.from(checked).map(ch => ch.value).join(',');
      location.href = 'account_member_check.php?members=' + ids + '&year=' + CURRENT_YEAR;
    }

    // 팝업 외부 클릭 시 닫기(O,X 팝업)
    document.addEventListener('click', function (event) {
      const popup = document.getElementById('statusPopup');
      if (popup.style.display === 'block' && !event.target.closest('#statusPopup')) {
        closePopup();
      }
    });

    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('checkAll')?.addEventListener('change', function () {
        if (!IS_ADMIN) return;
        document.querySelectorAll('.member-check').forEach(ch => { ch.checked = this.checked; });
      });
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