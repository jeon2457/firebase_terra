<?php
// robot_menu.php
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';

// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
require_once __DIR__ . '/php/auth_check.php';
require_once __DIR__ . '/php/db-connect-mongo.php';

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
  <title>로봇 시스템 메뉴</title>

  <link rel="manifest" href="manifest.json">
  <meta name="msapplication-config" content="/browserconfig.xml">

  <link rel="icon" href="/favicon.png?v=2" />
  <link rel="icon" type="image/png" sizes="36x36" href="./favicons/2/android-icon-36x36.png" />

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js"></script>

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%);
      font-family: 'Noto Sans KR', -apple-system, sans-serif;
      color: #fff;
      overflow-x: hidden;
      min-height: 100vh;
    }

    /* 배경 애니메이션 */
    .bg-animation {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .circuit-line {
      position: absolute;
      background: linear-gradient(90deg, transparent, #00d4ff, transparent);
      height: 1px;
      width: 100%;
      animation: circuit 8s linear infinite;
      opacity: 0.3;
    }

    .circuit-line:nth-child(1) {
      top: 20%;
      animation-delay: 0s;
    }

    .circuit-line:nth-child(2) {
      top: 40%;
      animation-delay: 2s;
    }

    .circuit-line:nth-child(3) {
      top: 60%;
      animation-delay: 4s;
    }

    .circuit-line:nth-child(4) {
      top: 80%;
      animation-delay: 6s;
    }

    @keyframes circuit {
      0% {
        transform: translateX(-100%);
      }

      100% {
        transform: translateX(100%);
      }
    }

    .container {
      position: relative;
      z-index: 1;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    /* 헤더 */
    .admin-header {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 15px 25px;
      border-radius: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      box-shadow: 0 8px 32px rgba(0, 212, 255, 0.1);
    }

    .admin-info {
      display: flex;
      align-items: center;
      gap: 15px;
      font-size: 1.1rem;
    }

    .admin-badge {
      background: linear-gradient(135deg, #00d4ff, #0099ff);
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 0.95rem;
    }

    .btn-logout-sm {
      background: linear-gradient(135deg, #ff4d4d, #ff0066);
      color: white;
      border: none;
      padding: 8px 20px;
      border-radius: 25px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(255, 0, 102, 0.3);
    }

    .btn-logout-sm:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 0, 102, 0.5);
    }

    /* 메인 타이틀 */
    .main-title {
      text-align: center;
      margin: 30px 0 50px;
    }

    .main-title h1 {
      font-size: 2.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #00d4ff, #0099ff, #00ffcc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 10px;
      text-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
    }

    .main-title p {
      color: rgba(255, 255, 255, 0.6);
      font-size: 1.1rem;
    }

    /* 로봇 섹션 */
    .robot-section {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 80px;
      margin: 50px 0;
      flex-wrap: wrap;
    }

    /* 로봇 컨테이너 */
    .robot-container {
      position: relative;
      width: 500px;
      height: 700px;
    }

    .robot-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 0 30px rgba(0, 212, 255, 0.4));
    }

    /* 메뉴 포인트 */
    .menu-point {
      position: absolute;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: radial-gradient(circle, #00d4ff, #0066ff);
      border: 3px solid rgba(255, 255, 255, 0.8);
      cursor: pointer;
      transition: all 0.3s;
      animation: pulse 2s ease-in-out infinite;
      box-shadow: 0 0 20px rgba(0, 212, 255, 0.8),
        0 0 40px rgba(0, 212, 255, 0.4);
    }

    .menu-point:hover {
      transform: scale(1.3);
      box-shadow: 0 0 30px rgba(0, 212, 255, 1),
        0 0 60px rgba(0, 212, 255, 0.6);
      animation: none;
    }

    @keyframes pulse {

      0%,
      100% {
        transform: scale(1);
        opacity: 1;
      }

      50% {
        transform: scale(1.1);
        opacity: 0.8;
      }
    }

    /* 메뉴 라벨 */
    .menu-label {
      position: absolute;
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 212, 255, 0.5);
      padding: 8px 15px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: all 0.3s;
      color: #00d4ff;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
    }

    .menu-point:hover .menu-label {
      opacity: 1;
    }

    /* 연결선 */
    .menu-line {
      position: absolute;
      height: 2px;
      background: linear-gradient(90deg, #00d4ff, transparent);
      transform-origin: left center;
      pointer-events: none;
      opacity: 0;
      transition: all 0.3s;
    }

    .menu-point:hover .menu-line {
      opacity: 0.6;
    }

    /* 메뉴 위치 */
    /* 머리 */
    .point-head {
      top: 5%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .point-head .menu-label {
      top: -45px;
      left: 50%;
      transform: translateX(-50%);
    }

    /* 목 */
    .point-neck {
      top: 15%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .point-neck .menu-label {
      top: -45px;
      left: 50%;
      transform: translateX(-50%);
    }

    /* 어깨(좌) */
    .point-shoulder-l {
      top: 20%;
      left: 20%;
      transform: translate(-50%, -50%);
    }

    .point-shoulder-l .menu-label {
      top: 50%;
      right: 55px;
      transform: translateY(-50%);
    }

    /* 어깨(우) */
    .point-shoulder-r {
      top: 20%;
      right: 20%;
      transform: translate(50%, -50%);
    }

    .point-shoulder-r .menu-label {
      top: 50%;
      left: 55px;
      transform: translateY(-50%);
    }

    /* 가슴 */
    .point-chest {
      top: 32%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .point-chest .menu-label {
      top: -45px;
      left: 50%;
      transform: translateX(-50%);
    }

    /* 배 */
    .point-belly {
      top: 45%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .point-belly .menu-label {
      top: -45px;
      left: 50%;
      transform: translateX(-50%);
    }

    /* 팔(좌) */
    .point-arm-l {
      top: 38%;
      left: 12%;
      transform: translate(-50%, -50%);
    }

    .point-arm-l .menu-label {
      top: 50%;
      right: 55px;
      transform: translateY(-50%);
    }

    /* 팔(우) */
    .point-arm-r {
      top: 38%;
      right: 12%;
      transform: translate(50%, -50%);
    }

    .point-arm-r .menu-label {
      top: 50%;
      left: 55px;
      transform: translateY(-50%);
    }

    /* 허리 */
    .point-waist {
      top: 55%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .point-waist .menu-label {
      bottom: -45px;
      left: 50%;
      transform: translateX(-50%);
    }

    /* 무릎 */
    .point-knee {
      top: 75%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .point-knee .menu-label {
      bottom: -45px;
      left: 50%;
      transform: translateX(-50%);
    }

    /* 발 */
    .point-foot {
      top: 92%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .point-foot .menu-label {
      bottom: -45px;
      left: 50%;
      transform: translateX(-50%);
    }

    /* 사이드 메뉴 패널 */
    .side-menu {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 30px;
      width: 400px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .side-menu h3 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 25px;
      background: linear-gradient(135deg, #00d4ff, #00ffcc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .menu-item-side {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .menu-item-side:hover {
      background: rgba(0, 212, 255, 0.1);
      border-color: rgba(0, 212, 255, 0.5);
      transform: translateX(5px);
      box-shadow: 0 4px 15px rgba(0, 212, 255, 0.2);
    }

    .menu-item-side i {
      font-size: 1.5rem;
      color: #00d4ff;
      width: 30px;
      text-align: center;
    }

    .menu-item-side .menu-text {
      flex: 1;
    }

    .menu-item-side .menu-name {
      font-weight: 600;
      font-size: 1.05rem;
      color: #fff;
      margin-bottom: 3px;
    }

    .menu-item-side .menu-desc {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.6);
    }

    /* 하단 버튼 */
    .bottom-actions {
      text-align: center;
      margin-top: 50px;
      display: flex;
      gap: 20px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn-action {
      background: linear-gradient(135deg, #00d4ff, #0099ff);
      border: none;
      color: white;
      padding: 15px 40px;
      border-radius: 30px;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 6px 25px rgba(0, 212, 255, 0.4);
      text-decoration: none;
      display: inline-block;
    }

    .btn-action:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 35px rgba(0, 212, 255, 0.6);
      color: white;
    }

    .btn-action.secondary {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
    }

    .btn-action.secondary:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
      box-shadow: 0 10px 35px rgba(255, 255, 255, 0.1);
    }

    /* 반응형 */
    @media (max-width: 1200px) {
      .robot-section {
        flex-direction: column;
        gap: 40px;
      }

      .side-menu {
        width: 100%;
        max-width: 500px;
      }
    }

    @media (max-width: 768px) {
      .robot-container {
        width: 100%;
        max-width: 400px;
        height: 560px;
      }

      .main-title h1 {
        font-size: 2rem;
      }

      .menu-point {
        width: 35px;
        height: 35px;
      }

      .admin-header {
        flex-direction: column;
        gap: 15px;
      }

      .admin-header {
        flex-direction: column;
        gap: 15px;
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
  <!-- 배경 애니메이션 -->
  <div class="bg-animation">
    <div class="circuit-line"></div>
    <div class="circuit-line"></div>
    <div class="circuit-line"></div>
    <div class="circuit-line"></div>
  </div>

  <div class="container">
    <!-- 헤더 -->
    <div class="admin-header">
      <div class="admin-info">
        <span>👤 관리자</span>
        <span class="admin-badge"><?= $admin_name ?></span>
      </div>
      <a href="./logout.php" class="btn-logout-sm">로그아웃</a>
    </div>

    <!-- 메인 타이틀 -->
    <div class="main-title">
      <h1>🤖 로봇 시스템 메뉴</h1>
      <p>로봇의 각 부위를 클릭하여 시스템 메뉴에 접근하세요</p>
    </div>

    <!-- 로봇 섹션 -->
    <div class="robot-section">
      <!-- 로봇 이미지 및 포인트 -->
      <div class="robot-container">
        <img src="./image/robot.png" alt="Boston Dynamics Robot" class="robot-image">

        <!-- 머리 - 시스템 메뉴얼 -->
        <div class="menu-point point-head" onclick="location.href='firebase_system_manual.html'">
          <div class="menu-label">📚 시스템 메뉴얼</div>
        </div>

        <!-- 목 - 회원 명부 -->
        <div class="menu-point point-neck" onclick="location.href='./tel_select_1.php'">
          <div class="menu-label">👥 회원 명부</div>
        </div>

        <!-- 좌측 어깨 - 회계 관리 -->
        <div class="menu-point point-shoulder-l" onclick="location.href='account_main.php'">
          <div class="menu-label">💰 회계 관리</div>
        </div>

        <!-- 우측 어깨 - 영수증 관리 -->
        <div class="menu-point point-shoulder-r" onclick="location.href='images_main.php'">
          <div class="menu-label">🧾 영수증 관리</div>
        </div>

        <!-- 가슴 - 회비 현황 -->
        <div class="menu-point point-chest" onclick="location.href='account_pass.php'">
          <div class="menu-label">💳 회비 현황</div>
        </div>

        <!-- 좌측 팔 - 지도 제작 -->
        <div class="menu-point point-arm-l" onclick="location.href='map.php'">
          <div class="menu-label">🗺️ 지도 제작</div>
        </div>

        <!-- 우측 팔 - 모임 활동 -->
        <div class="menu-point point-arm-r" onclick="location.href='select_1.php'">
          <div class="menu-label">📅 모임 활동</div>
        </div>

        <!-- 배 - 테마 설정 -->
        <div class="menu-point point-belly" onclick="location.href='menu_design_selection.php'">
          <div class="menu-label">🎨 테마 설정</div>
        </div>

        <!-- 허리 - 재무 대시보드 (수정됨) -->
        <div class="menu-point point-waist" onclick="openDashboardModal()">
          <div class="menu-label">📊 재무 대시보드</div>
        </div>

        <!-- 무릎 - 엑셀 리포트 (수정됨) -->
        <div class="menu-point point-knee" onclick="openExcelModal()">
          <div class="menu-label">💾 엑셀 리포트</div>
        </div>


        <!-- 허벅지 - 백업 및 복원 -->
        <div class="menu-point" style="top: 65%; left: 50%; transform: translate(-50%, -50%);"
          onclick="location.href='database_backup_restore.php'">
          <div class="menu-label">💾 백업 및 복원</div>
        </div>

        <!-- 발 - 설정 -->
        <div class="menu-point point-foot" onclick="alert('시스템 설정 준비중')">
          <div class="menu-label">⚙️ 시스템 설정</div>
        </div>
      </div>

      <!-- 사이드 메뉴 리스트 -->
      <div class="side-menu">
        <h3>📋 전체 메뉴</h3>

        <div class="menu-item-side" onclick="location.href='./tel_select_1.php'">
          <i class="bi bi-person-vcard"></i>
          <div class="menu-text">
            <div class="menu-name">회원 명부</div>
            <div class="menu-desc">전체 회원 정보 열람 및 관리</div>
          </div>
        </div>

        <div class="menu-item-side" onclick="location.href='account_main_1.php'">
          <i class="bi bi-graph-up-arrow"></i>
          <div class="menu-text">
            <div class="menu-name">회계 관리</div>
            <div class="menu-desc">수입/지출 내역 및 장부 관리</div>
          </div>
        </div>

        <div class="menu-item-side" onclick="location.href='images_main_1.php'">
          <i class="bi bi-receipt"></i>
          <div class="menu-text">
            <div class="menu-name">영수증 관리</div>
            <div class="menu-desc">영수증 이미지 업로드 및 확인</div>
          </div>
        </div>

        <div class="menu-item-side" onclick="location.href='account_pass.php'">
          <i class="bi bi-credit-card-2-front"></i>
          <div class="menu-text">
            <div class="menu-name">월회비 입금현황</div>
            <div class="menu-desc">개별 회원 월회비 납부 현황</div>
          </div>
        </div>

        <div class="menu-item-side" onclick="openDashboardModal()">
          <i class="bi bi-pie-chart-fill" style="color: #FFD700;"></i>
          <div class="menu-text">
            <div class="menu-name">재무 대시보드</div>
            <div class="menu-desc">실시간 수입/지출 차트 및 분석</div>
          </div>
        </div>

        <div class="menu-item-side" onclick="openExcelModal()">
          <i class="bi bi-file-earmark-excel-fill" style="color: #4ade80;"></i>
          <div class="menu-text">
            <div class="menu-name">엑셀 리포트</div>
            <div class="menu-desc">회계 장부 엑셀 다운로드</div>
          </div>
        </div>

        <div class="menu-item-side" onclick="location.href='map.php'">
          <i class="bi bi-map"></i>
          <div class="menu-text">
            <div class="menu-name">지도 제작</div>
            <div class="menu-desc">모임 장소 지도 생성 도구</div>
          </div>
        </div>

        <div class="menu-item-side" onclick="location.href='select_1.php'">
          <i class="bi bi-calendar-check"></i>
          <div class="menu-text">
            <div class="menu-name">모임 활동</div>
            <div class="menu-desc">경조사 및 모임 안내 문자</div>
          </div>
        </div>


        <div class="menu-item-side" onclick="location.href='database_backup_restore.php'">
          <i class="bi bi-database-fill-gear"></i>
          <div class="menu-text">
            <div class="menu-name">데이타베이스 백업</div>
            <div class="menu-desc">시스템 데이터 백업 및 복구</div>
          </div>
        </div>


        <div class="menu-item-side" onclick="location.href='firebase_system_manual.html'">
          <i class="bi bi-gear-wide-connected"></i>
          <div class="menu-text">
            <div class="menu-name">시스템 메뉴얼</div>
            <div class="menu-desc">시스템 운영 및 관리 메뉴얼</div>
          </div>
        </div>

        <div class="menu-item-side" onclick="location.href='menu_design_selection.php'">
          <i class="bi bi-palette"></i>
          <div class="menu-text">
            <div class="menu-name">테마 설정</div>
            <div class="menu-desc">디자인 변경 및 테마 커스터마이징</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 액션 버튼 -->
    <div class="bottom-actions">
      <a href="menu_design_selection.php" class="btn-action secondary">
        🎨 테마 변경
      </a>
      <a href="./logout.php" class="btn-action secondary">
        🚪 로그아웃
      </a>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

  <script>
    // 페이지 로드 애니메이션
    document.addEventListener('DOMContentLoaded', function () {
      const points = document.querySelectorAll('.menu-point');
      points.forEach((point, index) => {
        point.style.opacity = '0';
        point.style.transform = 'scale(0)';
        setTimeout(() => {
          point.style.transition = 'all 0.5s ease';
          point.style.opacity = '1';
          point.style.transform = 'scale(1)';
        }, index * 100);
      });
    });

    // 포인트 클릭 효과
    document.querySelectorAll('.menu-point').forEach(point => {
      point.addEventListener('click', function (e) {
        // 클릭 이펙트
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.width = '100px';
        ripple.style.height = '100px';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(0, 212, 255, 0.5)';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.transform = 'translate(-50%, -50%) scale(0)';
        ripple.style.pointerEvents = 'none';
        ripple.style.transition = 'all 0.6s ease';

        this.appendChild(ripple);

        setTimeout(() => {
          ripple.style.transform = 'translate(-50%, -50%) scale(3)';
          ripple.style.opacity = '0';
        }, 10);

        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });

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
</body>

</html>