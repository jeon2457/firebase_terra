<?php
// (tel_input.php)

//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';


// ✅ 관리자 인증
// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
require_once __DIR__ . '/php/auth_check.php';

// 세션값을 지역 변수로 세팅
$admin_id = $_SESSION['user_id'] ?? '';
$user_level = $_SESSION['user_level'] ?? '';

// ✅ MongoDB DB 연결
require './php/db-connect-mongo.php';

// MongoDB 연결 확인 (db-connect-mongo.php에서 이미 예외 처리가 되어 있지만 추가 확인)
if (!$collection) {
  die("MongoDB 컬렉션 로드 실패");
}

// 데이터 입력 처리
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  // 1. 입력값 받기
  $id = $_POST['id'] ?? '';
  $password = $_POST['password'] ?? '';
  $name = $_POST['name'] ?? '';
  $tel = $_POST['tel'] ?? '';
  $addr = $_POST['addr'] ?? '';
  $remark = $_POST['remark'] ?? '';
  $sms = $_POST['sms'] ?? '';
  $sms_2 = $_POST['sms_2'] ?? '';
  $email = $_POST['email'] ?? '';
  $user_level = (int) ($_POST['user_level'] ?? 1);

  // 2. 비밀번호 해싱
  $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

  // ----------------------------------------------------
  // ① remark에 "회장" 또는 "총무" 포함 시,
  //    기존 회원 전체 전화번호를 취합하여 SMS_2에 자동 저장
  // ----------------------------------------------------
  $is_leader = (mb_strpos($remark, '회장') !== false || mb_strpos($remark, '총무') !== false);
  if ($is_leader) {
    $cursor_tel = $collection->find(['tel' => ['$ne' => '']], ['projection' => ['tel' => 1], 'sort' => ['name' => 1]]);
    $numbers = [];
    foreach ($cursor_tel as $doc) {
      $numbers[] = $doc['tel'];
    }
    if (!empty($numbers))
      $sms_2 = implode(",", $numbers);
  }

  try {
    // 3. 신규 회원 삽입
    $result = $collection->insertOne([
      'id' => $id,
      'password' => $hashedPassword,
      'name' => $name,
      'tel' => $tel,
      'addr' => $addr,
      'remark' => $remark,
      'sms' => $sms,
      'sms_2' => $sms_2,
      'email' => $email,
      'user_level' => $user_level,
      'created_at' => new MongoDB\BSON\UTCDateTime()
    ]);

    if ($result->getInsertedCount() > 0) {
      echo "<script>alert('데이터가 저장되었습니다.'); location.href='tel_view.php';</script>";
      exit;
    } else {
      throw new Exception("데이터 저장에 실패했습니다.");
    }

  } catch (Exception $e) {
    die("데이터 삽입 오류: " . $e->getMessage());
  }
}
?>


<!DOCTYPE html>
<html lang="ko">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>직지35 회원등록</title>

  <!-- 앱 관련 설정 -->
  <link rel="manifest" href="manifest.json" />
  <meta name="msapplication-config" content="/browserconfig.xml">
  <meta name="msapplication-TileColor" content="#ffffff">
  <meta name="theme-color" content="#ffffff" />

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

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

    body {
      background-color: var(--bg);
      font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
      margin: 0;
      padding: 20px;
      color: #444;
    }

    .container {
      max-width: 650px;
      margin: 40px auto;
      padding: 40px;
      background: var(--bg);
      border-radius: 30px;
      box-shadow: 15px 15px 30px var(--shadow), -15px -15px 30px var(--light);
    }

    /* 🔹 입체 섹션 타이틀 */
    .section-title {
      text-align: center;
      color: #115ef7;
      font-weight: 700;
      margin-bottom: 40px;
      padding: 15px;
      background: var(--bg);
      border-radius: 20px;
      box-shadow: inset 6px 6px 12px var(--shadow), inset -6px -6px 12px var(--light);
      font-size: 1.6rem;
      letter-spacing: 1px;
    }

    label {
      display: block;
      margin: 12px 0 8px 10px;
      font-size: 16px;
      font-weight: bold;
      color: #555;
    }

    .asterisk::after {
      content: " *";
      color: #e74c3c;
    }

    /* 입력창 및 선택창 뉴모피즘 스타일 */
    .form-control,
    .form-select {
      width: 100%;
      border: none;
      padding: 15px 20px;
      font-size: 17px;
      border-radius: 15px;
      background: var(--bg);
      box-shadow: 6px 6px 12px var(--shadow), -6px -6px 12px var(--light);
      outline: none;
      color: #333;
      transition: all 0.3s ease;
      margin-bottom: 5px;
    }

    .form-control:focus,
    .form-select:focus {
      box-shadow: inset 5px 5px 10px var(--shadow), inset -5px -5px 10px var(--light);
      color: var(--primary);
    }

    .info-badge {
      font-size: 0.8rem;
      margin-left: 8px;
      border-radius: 10px;
      padding: 5px 10px;
      background: var(--bg);
      box-shadow: 2px 2px 5px var(--shadow), -2px -2px 5px var(--light);
      background-color: #4984f8 !important;
      color: #f9fafc;
    }

    #sms_2.auto-generated {
      background-color: var(--bg);
      box-shadow: inset 4px 4px 8px var(--shadow), inset -4px -4px 8px var(--light);
      cursor: not-allowed;
      color: #888;
    }

    hr {
      margin: 35px 0;
      border: none;
      height: 4px;
      border-radius: 2px;
      background: var(--bg);
      box-shadow: inset 2px 2px 4px var(--shadow), inset -2px -2px 4px var(--light);
    }

    /* 버튼 스타일 */
    .btn-submit-wrap {
      margin-top: 40px;
      display: flex;
      justify-content: center;
      gap: 20px;
    }

    .btn-main {
      padding: 15px 40px;
      border: none;
      border-radius: 20px;
      font-size: 20px;
      font-weight: bold;
      transition: all 0.2s;
      cursor: pointer;
    }

    .btn-success-custom {
      background: var(--primary);
      color: white;
      box-shadow: 6px 6px 12px var(--shadow), -6px -6px 12px var(--light);
    }

    .btn-success-custom:active {
      box-shadow: inset 6px 6px 12px #3a72b3, inset -6px -6px 12px #5aaeff;
      transform: scale(0.98);
    }

    .btn-secondary-custom {
      background: var(--bg);
      color: #666;
      box-shadow: 6px 6px 12px var(--shadow), -6px -6px 12px var(--light);
    }

    .btn-secondary-custom:active {
      box-shadow: inset 6px 6px 12px var(--shadow), inset -6px -6px 12px var(--light);
      transform: scale(0.98);
    }

    @media (max-width: 576px) {
      .container {
        padding: 25px;
        margin: 20px auto;
      }

      /* margin: 10px를 auto로 수정하여 중앙정렬 교정 */
      .section-title {
        font-size: 1.3rem;
      }

      .btn-main {
        padding: 12px 25px;
        font-size: 16px;
      }
    }
  </style>
</head>

<body>
  <div class="container">
    <h2 class="section-title">모임회원 신규등록</h2>
    <form method="POST" onsubmit="return checkForm(this);">

      <div class="mb-4">
        <label for="f_id" class="form-label asterisk">아이디</label>
        <input type="text" id="f_id" name="id" class="form-control" required placeholder="영문, 숫자 조합으로 입력">
      </div>

      <div class="mb-4">
        <label for="f_password" class="form-label asterisk">비밀번호</label>
        <input type="password" id="f_password" name="password" class="form-control" required
          placeholder="영문, 숫자, 특수문자 조합으로 입력">
      </div>

      <div class="row">
        <div class="col-md-6 mb-4">
          <label for="f_name" class="form-label asterisk">이름</label>
          <input type="text" id="f_name" name="name" class="form-control" required>
        </div>

        <div class="col-md-6 mb-4">
          <label for="f_tel" class="form-label asterisk">전화번호</label>
          <input type="text" id="f_tel" name="tel" class="form-control" placeholder="숫자로만 입력" maxlength="13" required
            oninput="autoHyphen(this)">
        </div>
      </div>

      <div class="mb-4">
        <label for="addr" class="form-label asterisk">거주지</label>
        <input type="text" id="addr" name="addr" class="form-control" required
          placeholder="간략하게만 입력 예) 서울, 김천, 대구 등...">
      </div>

      <div class="mb-4">
        <label for="remark" class="form-label">
          비고(직책)
          <span class="info-badge">회장/총무 입력 시 SMS_2 자동생성</span>
        </label>
        <input type="text" id="remark" name="remark" class="form-control" placeholder="예) 회원, 총무, 회장 등...">
      </div>

      <hr>

      <div class="mb-4">
        <label for="sms" class="form-label asterisk">SMS(Tel)</label>
        <input type="text" id="sms" name="sms" class="form-control" maxlength="13" required oninput="autoHyphen(this)">
      </div>

      <div class="mb-4">
        <label for="sms_2" class="form-label">
          SMS-2 단체
          <span id="auto_badge" style="display:none; color: var(--primary); font-size: 0.8rem; margin-left: 10px;">[자동생성
            예정]</span>
        </label>
        <input type="text" id="sms_2" name="sms_2" class="form-control">
        <small class="text-muted ms-2" style="font-size: 0.8rem;">회장/총무가 아닌 경우 수동입력 가능</small>
      </div>

      <!-- [추가] 이메일 입력란 -->
      <div class="mb-4">
        <label for="email" class="form-label">이메일</label>
        <input type="email" id="email" name="email" class="form-control" placeholder="이메일 주소 (선택 사항)">
      </div>

      <hr>

      <div class="mb-4">
        <label for="f_level" class="form-label asterisk">회원 레벨</label>
        <select id="f_level" name="user_level" class="form-select" required>
          <option value="">레벨 선택</option>
          <option value="1">게스트 (1)</option>
          <option value="2">정회원 (2)</option>
          <option value="5">Premium Member (5)</option>
          <option value="10">관리자 (10)</option>
        </select>
      </div>

      <div class="btn-submit-wrap">
        <button type="submit" class="btn-main btn-success-custom">입력하기</button>
        <a href="tel_select_1.php"
          class="btn-main btn-secondary-custom text-decoration-none d-flex align-items-center">돌아가기</a>
      </div>

    </form>
  </div>

  <script>
    function checkForm(form) {
      return confirm("회원 정보를 등록하시겠습니까?");
    }

    function autoHyphen(target) {
      target.value = target.value.replace(/[^0-9]/g, '')
        .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
    }

    // SMS 자동 동기화
    const telInput = document.getElementById('f_tel');
    const smsInput = document.getElementById('sms');
    telInput.addEventListener('input', () => {
      const telValue = telInput.value.replace(/[^0-9]/g, '');
      smsInput.value = telValue.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
    });

    // 비고(직책) 입력 시 SMS_2 자동생성 안내
    const remarkInput = document.getElementById('remark');
    const sms2Input = document.getElementById('sms_2');
    const autoBadge = document.getElementById('auto_badge');

    remarkInput.addEventListener('input', () => {
      const remarkValue = remarkInput.value.trim();

      if (remarkValue.includes('회장') || remarkValue.includes('총무')) {
        sms2Input.value = '저장 시 자동생성됩니다';
        sms2Input.classList.add('auto-generated');
        sms2Input.readOnly = true;
        autoBadge.style.display = 'inline-block';
      } else {
        if (sms2Input.classList.contains('auto-generated')) {
          sms2Input.value = '';
        }
        sms2Input.classList.remove('auto-generated');
        sms2Input.readOnly = false;
        autoBadge.style.display = 'none';
      }
    });
  </script>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
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