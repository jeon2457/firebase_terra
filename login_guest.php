<?php
// (login.php)
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';

// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
require_once __DIR__ . '/php/db-connect-mongo.php';


$errorMessage = ""; // 에러 메시지 초기화

// 로그인 폼 제출 시 실행
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // 입력값 받기
  $id = $_POST['id'] ?? '';
  $password = $_POST['password'] ?? '';

  try {
    // 1. DB에서 사용자 정보 조회 (members 컬렉션)
    $user = $collection->findOne(['id' => $id]);

    // 2. 사용자가 존재하면 비밀번호 검사
    if ($user) {
      $passwordMatch = false;

      // 암호화된 비밀번호와 일반 텍스트 비밀번호 모두 지원
      if (isset($user['password'])) {
        if (strlen($user['password']) >= 60 && strpos($user['password'], '$2y$') === 0) {
          $passwordMatch = password_verify($password, $user['password']);
        } else {
          $passwordMatch = ($password === $user['password']);
        }
      }

      // 3. 비밀번호가 일치하면 로그인 성공 처리
      if ($passwordMatch) {

        // 세션 생성 (방문증 발급)
        $_SESSION['user_id'] = (string) $user['id'];
        $_SESSION['user_name'] = (string) $user['name'];
        $_SESSION['user_level'] = (int) $user['user_level'];
        $_SESSION['user_key'] = (string) $user['id'];
        $_SESSION['user_remark'] = (string) ($user['remark'] ?? ''); // 직책 정보 저장

        // [중요] 레벨에 따른 페이지 이동 분기 (라우팅)
        if ($_SESSION['user_level'] >= 10) {
          // 관리자일 경우
          if (isset($_SESSION['redirect_url'])) {
            $redirectUrl = $_SESSION['redirect_url'];
            unset($_SESSION['redirect_url']);
            header("Location: $redirectUrl");
          } else {
            header("Location: select.php");
          }
        } else {
          // 일반 회원일 경우 (guest.php로 이동)
          header("Location: guest.php");
        }
        exit;

      } else {
        $errorMessage = '아이디 또는 비밀번호가 올바르지 않습니다.';
      }
    } else {
      $errorMessage = '아이디 또는 비밀번호가 올바르지 않습니다.';
    }
  } catch (Exception $e) {
    $errorMessage = "DB 오류: " . $e->getMessage();
  }
}
?>

<!DOCTYPE html>
<html lang="ko">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>회원 로그인</title>
  <link rel="manifest" href="./manifest.json" />
  <meta name="theme-color" content="#ffffff" />

  <!-- 파비콘 아이콘들 -->
  <link rel="icon" href="/favicon.png?v=2" />
  <link rel="icon" type="image/png" sizes="36x36" href="/favicons/android-icon-36x36.png" />
  <link rel="icon" type="image/png" sizes="48x48" href="/favicons/android-icon-48x48.png" />
  <link rel="icon" type="image/png" sizes="72x72" href="/favicons/android-icon-72x72.png" />
  <link rel="apple-touch-icon" sizes="32x32" href="/favicons/apple-icon-32x32.png">
  <link rel="apple-touch-icon" sizes="57x57" href="/favicons/apple-icon-57x57.png">
  <link rel="apple-touch-icon" sizes="60x60" href="/favicons/apple-icon-60x60.png">
  <link rel="apple-touch-icon" sizes="72x72" href="/favicons/apple-icon-72x72.png">

  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- 사용자 정의 CSS -->
  <link rel="stylesheet" href="./css/login.css">
  <style>
    /* ✅ 브라우저(Edge, Chrome 등) 자체 비밀번호 표시 아이콘 숨기기 */
    input::-ms-reveal,
    input::-ms-clear {
      display: none;
    }


    .login-icon {
      width: 72px;
      height: 72px;
      margin: 0 auto 25px;
      border-radius: 50%;
      background: #f1f4ff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 0 6px #ffffff;
    }

    .login-icon img {
      width: 75%;
      height: auto;
      display: block;
    }

    /* 🥰로고(logo) 흔들림 애니메이션 */
    @keyframes shake {

      0%,
      100% {
        transform: rotate(0deg);
      }

      10%,
      30%,
      50%,
      70%,
      90% {
        transform: rotate(-5deg);
      }

      20%,
      40%,
      60%,
      80% {
        transform: rotate(5deg);
      }
    }

    .shake-animation {
      animation: shake 1.5s ease-in-out;
    }

    /* 🥰회전 애니메이션 */
    @keyframes rotate {
      from {
        transform: rotate(0deg);
      }

      to {
        transform: rotate(360deg);
      }
    }

    .rotate-animation {
      animation: rotate 1.5s linear;
    }
  </style>
</head>

<body>
  <div class="container mt-5">
    <div class="row justify-content-center">

      <div class="col-md-6 col-lg-5">

        <!-- 상단 안내 메시지 (수정됨: 모든 회원용 문구로 변경) -->
        <div class="text-left mb-3 py-4"
          style="color: #fff; background-color: #333; border-radius: 12px; padding-left: 20px; padding-right: 20px;">
          <strong>🔒 회원 로그인</strong><br>
          서비스 이용을 위해 로그인이 필요합니다.<br>
          <small>관리자 및 일반 회원 모두 로그인 가능합니다.</small>
        </div>

        <!-- 로그인 카드 -->
        <div class="card shadow-lg p-4">

          <div class="login-icon" id="logo-icon">
            <img src="./images/clova.png" alt="로그인 아이콘">
          </div>

          <h2 class="card-title text-center mb-2">로그인</h2>

          <!-- 로그인 오류 메시지 -->
          <?php if (!empty($errorMessage)): ?>
            <div class="alert alert-danger text-center"><?= htmlspecialchars($errorMessage) ?></div>
          <?php endif; ?>

          <form method="POST" class="needs-validation" novalidate>
            <div class="mb-3 text-start">
              <label for="id" class="form-label">아이디:</label>
              <input type="text" class="form-control" id="id" name="id" placeholder="아이디를 입력하세요" required autofocus>
            </div>

            <!-- Bootstrap Icons CDN 추가 -->
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">

            <div class="mb-3 text-start">
              <label for="password" class="form-label">비밀번호:</label>
              <div class="input-group">
                <input type="password" class="form-control" id="password" name="password" placeholder="비밀번호를 입력하세요"
                  required autocomplete="new-password">
                <button class="btn btn-outline-secondary" type="button" id="togglePassword">
                  <i class="bi bi-eye"></i>
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn-primary w-100 mt-4">로그인</button>
          </form>

          <div id="message" class="mt-3 text-center"></div>
        </div>

      </div>
    </div>
  </div>

  <script>
    // 🥰로고 애니메이션 함수들
    function startShakeAnimation() {
      const logoIcon = document.getElementById('logo-icon');
      logoIcon.classList.add('shake-animation');

      // 🥰흔들림 애니메이션이 끝난 후 회전 애니메이션 시작
      setTimeout(() => {
        logoIcon.classList.remove('shake-animation');
        startRotateAnimation();
      }, 1500); // 1.5초 (흔들림 지속 시간)
    }

    function startRotateAnimation() {
      const logoIcon = document.getElementById('logo-icon');
      logoIcon.classList.add('rotate-animation');

      // 🥰회전 애니메이션이 끝난 후 클래스 제거
      setTimeout(() => {
        logoIcon.classList.remove('rotate-animation');
      }, 1500); // 1.5초 (회전 지속 시간)
    }

    // 페이지 로드 시 흔들림 애니메이션 시작
    document.addEventListener('DOMContentLoaded', startShakeAnimation);
  </script>

  <!-- 패스워드 표시/숨김 Bootstrap JS -->
  <script>
    const togglePassword = document.querySelector("#togglePassword");
    const password = document.querySelector("#password");
    const icon = togglePassword.querySelector("i");

    togglePassword.addEventListener("click", function () {
      const type = password.getAttribute("type") === "password" ? "text" : "password";
      password.setAttribute("type", type);

      // 아이콘 전환
      icon.classList.toggle("bi-eye");
      icon.classList.toggle("bi-eye-slash");
    });
  </script>

  <!-- Bootstrap JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>