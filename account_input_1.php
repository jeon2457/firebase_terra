<?php
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';

// ⭐ 맨 위에 반드시 이 코드가 있어야 합니다!
// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:

require_once __DIR__ . '/php/auth_check.php';


?>
<!-- ✅1. 이페이지는 계모임에서 총무담당 사용지출내역을 관리하고, account_input.php 에서 관리자페이지로 사용내역서를 입력할수있다.
2. account_edit.php 에서는 관리자페이지로 편집(수정/삭제)을 한다.
3. account_view.php 에서는 회원들에게 공개적으로 보여주는 페이지이다.
4. 영수증 사진보기를 클릭하면 /images_view.php 페이지를 회원들에게 보여준다. ===> images_upload.php(사진입력) ==> images_edit.php(사진편집) ==> images_view.php(사진공개 열람)
5. 데이타베이스의 사용내역서는 수입관련 테이블(income_table)/지출관련 테이블(expense_table)을 사용하고있고, 영수증사진 관련테이블은 images 이다. -->

<!DOCTYPE html>
<html lang="ko">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="J.S.J" />
  <title>사용내역서입력</title>
  <link rel="manifest" href="manifest.json">
  <meta name="msapplication-config" content="/browserconfig.xml">
  <meta name="msapplication-TileColor" content="#ffffff">
  <meta name="theme-color" content="#ffffff">

  <!-- 부트스트랩 CDN 링크 (에러 수정됨: 올바른 integrity 값 적용) -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous" />

  <!-- 파비콘 아이콘들 -->
  <link rel="icon" href="/favicon.png?v=2" />
  <link rel="icon" type="image/png" sizes="36x36" href="./favicons/2/android-icon-36x36.png" />
  <link rel="icon" type="image/png" sizes="48x48" href="./favicons/2/android-icon-48x48.png" />
  <link rel="icon" type="image/png" sizes="72x72" href="./favicons/2/android-icon-72x72.png" />
  <link rel="apple-touch-icon" sizes="32x32" href="./favicons/2/apple-icon-32x32.png">
  <link rel="apple-touch-icon" sizes="57x57" href="./favicons/2/apple-icon-57x57.png">
  <link rel="apple-touch-icon" sizes="60x60" href="./favicons/2/apple-icon-60x60.png">
  <link rel="apple-touch-icon" sizes="72x72" href="./favicons/2/apple-icon-72x72.png">


  <style>
    :root {
      --bg: #e0e5ec;
      --shadow: #a3b1c6;
      --light: #ffffff;
      --primary: #4A90E2;
    }

    * {
      box-sizing: border-box;
    }

    body {
      background-color: var(--bg);
      font-family: 'Pretendard', sans-serif;
      min-height: 100vh;
      padding: 20px 0;
      color: #444;
    }

    /* 사용자 정보 상단바 */
    .user-info {
      max-width: 600px;
      margin: 0 auto 20px;
      padding: 15px 25px;
      background: var(--bg);
      border-radius: 15px;
      box-shadow: 6px 6px 12px var(--shadow), -6px -6px 12px var(--light);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .user-info span {
      color: #555;
      font-weight: 600;
    }

    .btn-logout {
      border-radius: 10px;
      text-decoration: none;
      padding: 5px 15px;
      font-size: 14px;
      border: none;
      background: var(--bg);
      box-shadow: 4px 4px 8px var(--shadow), -4px -4px 8px var(--light);
      color: #e74c3c;
      font-weight: bold;
      transition: all 0.2s;
    }

    .btn-logout:active {
      box-shadow: inset 3px 3px 6px var(--shadow), inset -3px -3px 6px var(--light);
    }

    /* 메인 폼 컨테이너 */
    .form-container {
      max-width: 600px;
      margin: 30px auto;
      background: var(--bg);
      border-radius: 30px;
      box-shadow: 15px 15px 30px var(--shadow), -15px -15px 30px var(--light);
      padding: 40px;
      animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* 🔹 공통 제목 스타일 */
    .section-title {
      text-align: center;
      color: var(--primary);
      font-weight: 700;
      margin-bottom: 35px;
      padding: 15px;
      background: var(--bg);
      border-radius: 15px;
      box-shadow: inset 6px 6px 12px var(--shadow), inset -6px -6px 12px var(--light);
      font-size: 24px;
    }

    .form-group {
      margin-bottom: 25px;
    }

    .form-group label {
      font-weight: 700;
      color: #555;
      margin-bottom: 10px;
      display: block;
      padding-left: 10px;
    }

    /* 입력창 및 선택창 */
    .form-control,
    .form-select {
      width: 100%;
      border: none;
      padding: 15px 20px;
      font-size: 16px;
      border-radius: 15px;
      background: var(--bg);
      box-shadow: 5px 5px 10px var(--shadow), -5px -5px 10px var(--light);
      outline: none;
      color: #333;
      transition: all 0.3s ease;
    }

    .form-control:focus,
    .form-select:focus {
      box-shadow: inset 5px 5px 10px var(--shadow), inset -5px -5px 10px var(--light);
      color: var(--primary);
    }

    /* 안내문 박스 */
    .info-box {
      margin: 30px 0;
      padding: 18px;
      background: var(--bg);
      box-shadow: inset 4px 4px 8px var(--shadow), inset -4px -4px 8px var(--light);
      border-radius: 15px;
      font-size: 14px;
      line-height: 1.6;
      color: #666;
      word-break: break-all;
      /* 모바일 글자 박스 벗어남 방지 수정 */
    }

    .info-box strong {
      color: var(--primary);
      font-weight: bold;
    }

    /* ⭐ 버튼 그룹 */
    .button-group {
      text-align: center;
      margin-top: 30px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .btn-submit,
    .btn-back {
      display: block;
      width: 100%;
      padding: 18px;
      border-radius: 15px;
      text-align: center;
      text-decoration: none;
      font-size: 18px;
      font-weight: bold;
      border: none;
      transition: all 0.2s;
    }

    /* 저장하기 버튼 */
    .btn-submit {
      background: var(--primary);
      color: #fff;
      box-shadow: 6px 6px 12px var(--shadow), -6px -6px 12px var(--light);
    }

    .btn-submit:active {
      box-shadow: inset 6px 6px 12px #3a72b3, inset -6px -6px 12px #5aaeff;
      transform: scale(0.98);
    }

    /* 되돌아가기 버튼 */
    .btn-back {
      background: var(--bg);
      color: #777;
      box-shadow: 6px 6px 12px var(--shadow), -6px -6px 12px var(--light);
    }

    .btn-back:hover {
      color: var(--primary);
    }

    .btn-back:active {
      box-shadow: inset 6px 6px 12px var(--shadow), inset -6px -6px 12px var(--light);
      transform: scale(0.98);
    }

    /* 성공 메시지 팝업 */
    .success-message {
      display: none;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--bg);
      padding: 40px;
      border-radius: 25px;
      box-shadow: 20px 20px 40px var(--shadow), -20px -20px 40px var(--light);
      text-align: center;
      z-index: 9999;
      width: 85%;
      max-width: 400px;
    }

    .success-message p {
      font-size: 18px;
      font-weight: 700;
      color: #333;
      margin-bottom: 25px;
    }

    .btn-modal-ok {
      padding: 12px 40px;
      border-radius: 12px;
      background: var(--primary);
      color: white;
      border: none;
      font-weight: bold;
      box-shadow: 4px 4px 8px var(--shadow), -4px -4px 8px var(--light);
    }

    .modal-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(224, 229, 236, 0.7);
      backdrop-filter: blur(4px);
      z-index: 9998;
    }

    @media (max-width: 576px) {
      .form-container {
        padding: 25px;
        margin: 15px;
      }

      .section-title {
        font-size: 20px;
      }

      .user-info {
        margin: 0 15px 15px;
      }
    }
  </style>
</head>

<body>

  <?php
  require 'php/db-connect-mongo.php';
  date_default_timezone_set('Asia/Seoul');

  $showSuccess = false;

  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $date = $_POST['date'];
    $time = $_POST['time'] ?? '00:00';
    $type = $_POST['type'];
    $category = $_POST['category'];
    $description = $_POST['description'];
    $amount = $_POST['amount'];

    $datetime = $date . ' ' . $time . ':00';

    if (empty($date) || empty($type) || empty($category) || empty($amount)) {
      echo '<p style="text-align: center; color: #e74c3c; font-weight:bold;">일자, Type, 항목, 금액은 필수 입력 사항입니다.</p>';
    } else {
      // 컬렉션 이름 결정
      $col_name = ($type === '수입') ? 'income_table' : 'expense_table';
      $target_col = $database->$col_name;

      try {
        $result = $target_col->insertOne([
          'date' => $datetime,
          'category' => $category,
          'description' => $description,
          'amount' => (int) $amount,
          'created_at' => new MongoDB\BSON\UTCDateTime()
        ]);

        if ($result->getInsertedCount() > 0) {
          $showSuccess = true;
        }
      } catch (Exception $e) {
        echo '<p style="text-align: center; color: #e74c3c; font-weight:bold;">데이터 저장 중 오류가 발생했습니다: ' . $e->getMessage() . '</p>';
      }
    }
  }
  ?>

  <div class="container">
    <!-- 사용자 정보 바 -->
    <div class="user-info">
      <span>👤 <?php echo htmlspecialchars($_SESSION['user_name']); ?> 관리자</span>
      <a href="./logout.php" class="btn-logout">로그아웃</a>
    </div>

    <!-- 입력 폼 카드 -->
    <div class="form-container">
      <h1 class="section-title">📊 사용내역서 입력</h1>

      <form method="POST" action="">
        <div class="form-group">
          <label for="date">📅 날짜</label>
          <input type="date" class="form-control" id="date" name="date" required>
        </div>

        <div class="form-group">
          <label for="time">🕐 시간</label>
          <input type="time" class="form-control" id="time" name="time" value="00:00" required>
        </div>

        <div class="form-group">
          <label for="type">📈 유형 (Type)</label>
          <select class="form-select" id="type" name="type" required>
            <option value="지출">💸 지출</option>
            <option value="수입">💰 수입(월회비)</option>
          </select>
        </div>

        <div class="form-group">
          <label for="category">📂 항목</label>
          <input type="text" class="form-control" id="category" name="category" required
            placeholder="예: 월회비, 회식비, 식사비 등">
        </div>

        <div class="form-group">
          <label for="description">📝 상세 내용 (비고)</label>
          <input type="text" class="form-control" id="description" name="description" placeholder="상세 설명을 입력하세요">
        </div>

        <div class="form-group">
          <label for="amount">💵 금액 (원)</label>
          <input type="number" class="form-control" id="amount" name="amount" required placeholder="숫자만 입력하세요">
        </div>

        <div class="info-box">
          <strong>📢 안내:</strong><br>
          모임 사용내역서 작성은 여기뿐만 아니라
          /new_terraone_php/1/account_input.php,
          /new_terraone_php/2/account_input.php,
          Google의 스프레드시트 에서도 gagebu, 황악회원 입금현황
          파일로 만들어져있는데 이것을 활용할 수도있다.(html book폴더안 index.html 참조)
        </div>

        <div class="button-group">
          <button type="submit" class="btn-submit" id="saveBtn">저장하기</button>
          <a href="account_main_1.php" class="btn-back">⏪ 돌아가기</a>
        </div>
      </form>
    </div>
  </div>

  <!-- 성공 알림 모달 -->
  <div class="modal-overlay" id="modalOverlay"></div>
  <div class="success-message" id="successMessage">
    <p>✨ 데이터 전송이 완료되었습니다!</p>
    <button class="btn-modal-ok" onclick="reloadPage()">확인</button>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
    crossorigin="anonymous"></script>

  <script>
    window.addEventListener('DOMContentLoaded', function () {
      const today = new Date();

      const dateInput = document.getElementById('date');
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      dateInput.value = `${year}-${month}-${day}`;

      const timeInput = document.getElementById('time');
      const hours = String(today.getHours()).padStart(2, '0');
      const minutes = String(today.getMinutes()).padStart(2, '0');
      timeInput.value = `${hours}:${minutes}`;
    });

    <?php if ($showSuccess): ?>
      document.getElementById('successMessage').style.display = 'block';
      document.getElementById('modalOverlay').style.display = 'block';
    <?php endif; ?>

    function reloadPage() {
      window.location.href = 'account_input.php';
    }
  </script>

</body>

</html>




<!-- 
뉴모피즘 디자인 핵심 분석
A. 빛과 그림자의 조화 (이중 그림자)
뉴모피즘의 입체감은 한쪽에는 밝은 빛(Highlight), 반대쪽에는 **어두운 그림자(Shadow)**를 동시에 주어 완성합니다.
밝은 쪽 (왼쪽 상단): -8px -8px 15px #ffffff (흰색 빛)
어두운 쪽 (오른쪽 하단): 8px 8px 15px #a3b1c6 (회색 그림자)
B. 볼록한 모양 (Raised State) - 기본 상태
버튼이나 카드가 배경 위로 튀어나와 보이는 효과입니다.
공식: 배경색과 요소의 색상을 동일하게 맞추고 일반 box-shadow를 사용합니다.
CSS 예시: box-shadow: 8px 8px 15px #a3b1c6, -8px -8px 15px #ffffff;
C. 오목한 모양 (Sunken/Inset State) - 클릭/활성 상태
버튼이 안으로 꾹 눌린 듯한 효과입니다.
공식: 그림자 속성에 inset 키워드를 추가합니다.
CSS 예시: box-shadow: inset 6px 6px 10px #a3b1c6, inset -6px -6px 10px #ffffff; 
-->