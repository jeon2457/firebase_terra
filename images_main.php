<?php
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';


// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
require_once __DIR__ . '/php/auth_check.php';


// 관리자 정보
$admin_id = htmlspecialchars($_SESSION['user_id']);
$admin_level = htmlspecialchars($_SESSION['user_level']);
?>
<!DOCTYPE html>
<html lang="ko">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>영수증관리</title>

  <!-- 파비콘 -->
  <link rel="icon" href="./favicon.png?v=2" />
  <link rel="icon" type="image/png" sizes="36x36" href="./favicons/2/android-icon-36x36.png" />
  <link rel="icon" type="image/png" sizes="48x48" href="./favicons/2/android-icon-48x48.png" />
  <link rel="icon" type="image/png" sizes="72x72" href="./favicons/2/android-icon-72x72.png" />
  <link rel="apple-touch-icon" sizes="32x32" href="./favicons/2/apple-icon-32x32.png">
  <link rel="apple-touch-icon" sizes="57x57" href="./favicons/2/apple-icon-57x57.png">
  <link rel="apple-touch-icon" sizes="60x60" href="./favicons/2/apple-icon-60x60.png">
  <link rel="apple-touch-icon" sizes="72x72" href="./favicons/2/apple-icon-72x72.png">

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .main-wrapper {
      width: 100%;
      max-width: 1000px;
      margin: 0 auto;
    }

    /* 관리자 정보 (수정됨: 너비 100%) */
    .admin-info {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 8px 16px;
      border-radius: 10px;
      text-align: right;
      font-size: 13px;
      color: #495057;
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      width: 100%;
      /* ✅ 전체 너비로 변경 */
    }

    .admin-info span {
      color: #667eea;
      font-weight: 700;
    }

    .btn-logout-small {
      padding: 3px 8px;
      font-size: 11px;
      border-radius: 6px;
      border: 1px solid #ff4444;
      background: rgba(255, 255, 255, 0.9);
      color: #ff4444;
      cursor: pointer;
      font-weight: 700;
      transition: all 0.2s;
      white-space: nowrap;
      margin-left: 10px;
      text-decoration: none;
    }

    .btn-logout-small:hover {
      background: #ff4444;
      color: white;
      box-shadow: 0 4px 10px rgba(255, 68, 68, 0.2);
    }

    /* 페이지 헤더 */
    .page-header {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(10px);
      padding: 40px 28px;
      border-radius: 24px;
      text-align: center;
      margin-bottom: 56px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .page-header h1 {
      font-size: clamp(26px, 5vw, 36px);
      font-weight: 800;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
      letter-spacing: -1px;
    }

    /* 버튼 그리드 */
    .btn-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 60px;
    }

    /* 버튼 카드 */
    .btn-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 28px 24px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      position: relative;
      overflow: hidden;
    }

    .btn-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    .btn-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 16px 48px rgba(102, 126, 234, 0.25);
    }

    .btn-card:hover::before {
      opacity: 1;
    }

    .btn-card .btn {
      width: 100%;
      padding: 18px 28px;
      font-size: 17px;
      font-weight: 700;
      border: none;
      border-radius: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transition: all 0.3s ease;
      letter-spacing: -0.3px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      position: relative;
      z-index: 1;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .btn-card .btn:hover {
      background: linear-gradient(135deg, #5568d3 0%, #6a3f8e 100%);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      transform: scale(1.03);
    }

    .btn-card .btn:active {
      transform: scale(0.97);
    }

    /* 되돌아가기 버튼 */
    .btn-back {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 16px 40px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      color: #667eea;
      border-radius: 14px;
      text-decoration: none;
      font-weight: 700;
      font-size: 16px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      margin: 20px auto 0;
      display: flex;
      width: 100%;
      max-width: 400px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .btn-back:hover {
      background: #667eea;
      color: #fff;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
    }

    .btn-back::before {
      content: none;
      font-size: 20px;
      font-weight: 700;
    }

    /* 모바일 최적화 */
    @media (max-width: 768px) {
      body {
        padding: 16px;
      }

      .page-header {
        padding: 32px 24px;
        margin-bottom: 28px;
        border-radius: 20px;
      }

      .page-header h1 {
        font-size: 26px;
      }

      .btn-grid {
        grid-template-columns: 1fr;
        gap: 18px;
      }

      .btn-card {
        padding: 24px 20px;
      }

      .btn-card .btn {
        padding: 16px 24px;
        font-size: 16px;
      }

      .admin-info {
        padding: 12px 18px;
        font-size: 13px;
        margin-bottom: 47px;
        text-align: center;
      }

      .btn-back {
        padding: 14px 32px;
        font-size: 15px;
      }
    }

    @media (max-width: 480px) {
      .page-header {
        padding: 28px 20px;
      }

      .page-header h1 {
        font-size: 24px;
      }

      .btn-grid {
        gap: 14px;
      }

      .btn-card {
        padding: 20px 16px;
        border-radius: 16px;
      }

      .btn-card .btn {
        padding: 14px 20px;
        font-size: 15px;
      }
    }

    /* 애니메이션 */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }

      to {
        opacity: 1;
      }
    }

    .admin-info {
      animation: fadeIn 0.6s ease-out;
    }

    .page-header {
      animation: fadeInUp 0.8s ease-out 0.1s backwards;
    }

    .btn-card {
      animation: fadeInUp 0.8s ease-out backwards;
    }

    .btn-card:nth-child(1) {
      animation-delay: 0.2s;
    }

    .btn-card:nth-child(2) {
      animation-delay: 0.3s;
    }

    .btn-card:nth-child(3) {
      animation-delay: 0.4s;
    }

    .btn-back {
      animation: fadeInUp 0.8s ease-out 0.5s backwards;
    }

    /* 배경 장식 */
    body::before {
      content: '';
      position: fixed;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px);
      background-size: 50px 50px;
      animation: moveBackground 20s linear infinite;
      pointer-events: none;
      z-index: 0;
    }

    @keyframes moveBackground {
      0% {
        transform: translate(0, 0);
      }

      100% {
        transform: translate(50px, 50px);
      }
    }

    .main-wrapper {
      position: relative;
      z-index: 1;
    }

    /* 따뜻한 빛 효과 */
    body::after {
      content: '';
      position: fixed;
      top: 50%;
      left: 50%;
      width: 800px;
      height: 800px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 0;
      animation: pulse 4s ease-in-out infinite;
    }

    @keyframes pulse {

      0%,
      100% {
        opacity: 0.5;
        transform: translate(-50%, -50%) scale(1);
      }

      50% {
        opacity: 0.8;
        transform: translate(-50%, -50%) scale(1.1);
      }
    }
  </style>
</head>

<body>

  <div class="main-wrapper">

    <!-- 관리자 표시 -->
    <div class="admin-info" id="adminInfo">
      👤 관리자: <span><?= $admin_id ?> (Level <?= $admin_level ?>)</span>
      <a href="./logout.php" class="btn-logout-small" onclick="return confirm('정말 로그아웃 하시겠습니까?')">로그아웃</a>
    </div>

    <!-- 페이지 헤더 -->
    <div class="page-header">
      <h1>모임 영수증관리</h1>
    </div>

    <!-- 버튼 그리드 -->
    <div class="btn-grid">

      <div class="btn-card">
        <button class="btn" onclick="location.href='images_upload.php'">
          영수증사진 업로드
        </button>
      </div>

      <div class="btn-card">
        <button class="btn" onclick="location.href='images_edit.php'">
          영수증사진 편집
        </button>
      </div>

      <div class="btn-card">
        <button class="btn" onclick="location.href='images_view.php'">
          영수증사진 보기
        </button>
      </div>

    </div>

    <!-- 되돌아가기 -->
    <a href="select.php" class="btn-back">⏪ 돌아가기</a>

  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

</body>

</html>
