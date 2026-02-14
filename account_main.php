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
  <title>회계관리</title>

  <!-- 파비콘 -->
  <link rel="icon" href="./favicon.png?v=2" />
  <link rel="icon" type="image/png" sizes="36x36" href="./favicons/android-icon-36x36.png" />
  <link rel="icon" type="image/png" sizes="48x48" href="./favicons/android-icon-48x48.png" />
  <link rel="icon" type="image/png" sizes="72x72" href="./favicons/android-icon-72x72.png" />
  <link rel="apple-touch-icon" sizes="32x32" href="./favicons/apple-icon-32x32.png">
  <link rel="apple-touch-icon" sizes="57x57" href="./favicons/apple-icon-57x57.png">
  <link rel="apple-touch-icon" sizes="60x60" href="./favicons/apple-icon-60x60.png">
  <link rel="apple-touch-icon" sizes="72x72" href="./favicons/apple-icon-72x72.png">

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      min-height: 100vh;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .main-container {
      width: 100%;
      max-width: 900px;
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
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      width: 100%;
      /* ✅ 전체 너비로 변경 */
    }

    .admin-info span {
      color: #2a5298;
      font-weight: 600;
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
      padding: 32px 24px;
      border-radius: 20px;
      text-align: center;
      margin-top: 97px;
      margin-bottom: 107px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    }

    .page-header h1 {
      font-size: clamp(24px, 5vw, 32px);
      font-weight: 700;
      color: #1e3c72;
      margin: 0;
      letter-spacing: -0.5px;
    }

    /* 버튼 카드 그리드 */
    .btn-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 52px;
    }

    /* 버튼 카드 */
    .btn-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
    }

    .btn-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }

    .btn-card:active {
      transform: translateY(-2px);
    }

    .btn-card .btn {
      width: 100%;
      padding: 16px 24px;
      font-size: 16px;
      font-weight: 600;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transition: all 0.3s ease;
      letter-spacing: -0.3px;
    }

    .btn-card .btn:hover {
      background: linear-gradient(135deg, #5568d3 0%, #6a3f8e 100%);
      transform: scale(1.02);
    }

    .btn-card .btn:active {
      transform: scale(0.98);
    }

    /* 되돌아가기 버튼 */
    .btn-back {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 32px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      color: #1e3c72;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      margin: 20px auto 0;
      display: flex;
      width: 100%;
      max-width: 400px;
    }

    .btn-back:hover {
      background: #1e3c72;
      color: #fff;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }

    .btn-back::before {
      content: none;
      font-size: 18px;
    }

    /* 모바일 최적화 */
    @media (max-width: 768px) {
      body {
        padding: 16px;
      }

      .page-header {
        padding: 24px 20px;
        margin-bottom: 24px;
      }

      .page-header h1 {
        font-size: 24px;
      }

      .btn-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .btn-card {
        padding: 20px;
      }

      .btn-card .btn {
        padding: 14px 20px;
        font-size: 15px;
      }

      .admin-info {
        padding: 10px 16px;
        font-size: 13px;
        margin-bottom: 20px;
      }

      .btn-back {
        padding: 12px 24px;
        font-size: 14px;
      }
    }

    @media (max-width: 480px) {
      .page-header h1 {
        font-size: 22px;
      }

      .btn-grid {
        gap: 12px;
      }

      .btn-card {
        padding: 16px;
      }
    }

    /* 애니메이션 */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .admin-info,
    .page-header,
    .btn-card,
    .btn-back {
      animation: fadeInUp 0.6s ease-out backwards;
    }

    .admin-info {
      animation-delay: 0.1s;
    }

    .page-header {
      animation-delay: 0.2s;
    }

    .btn-card:nth-child(1) {
      animation-delay: 0.3s;
    }

    .btn-card:nth-child(2) {
      animation-delay: 0.4s;
    }

    .btn-card:nth-child(3) {
      animation-delay: 0.5s;
    }

    .btn-back {
      animation-delay: 0.6s;
    }
  </style>
</head>

<body>

  <div class="main-container">

    <!-- 관리자 표시 -->
    <div class="admin-info" id="adminInfo">
      👤 관리자: <span>
        <?= $admin_id ?> (Level
        <?= $admin_level ?>)
      </span>
      <a href="./logout.php" class="btn-logout-small" onclick="return confirm('정말 로그아웃 하시겠습니까?')">로그아웃</a>
    </div>

    <!-- 페이지 헤더 -->
    <div class="page-header">
      <h1>모임 회계관리</h1>
    </div>

    <!-- 버튼 그리드 -->
    <div class="btn-grid">

      <div class="btn-card">
        <button class="btn" onclick="location.href='account_input.php'">
          거래명세서 입력
        </button>
      </div>

      <div class="btn-card">
        <button class="btn" onclick="location.href='account_edit.php'">
          거래명세서 편집
        </button>
      </div>

      <div class="btn-card">
        <button class="btn" onclick="location.href='account_view.php'">
          거래명세서 보기
        </button>
      </div>

    </div>

    <!-- 되돌아가기 -->
    <a href="select.php" class="btn-back">⏪ 돌아가기</a>

  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

</body>

</html>