<?php
// login.php
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';


// 이미 로그인이 되어 있다면 레벨에 맞게 바로 이동시킴
if (isset($_SESSION['user_id'])) {
    $level = $_SESSION['user_level'] ?? 0;
    if ($level >= 10) {
        echo "<script>location.href='select.php';</script>";
    } else {
        echo "<script>location.href='guest.php';</script>";
    }
    exit;
}
?>
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>로그인</title>

<!-- 앱 관련 설정 -->
<link rel="manifest" href="manifest.json" />
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

<!-- Bootstrap 5 CDN -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

<style>
html, body {
    height: 100%;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f4f6f9;
}
.login-container {
    width: 500px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 12px;
    text-align: center;
    background-color: #fff;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
p.login_text {
    font-size: 22px;
    color: #6c757d;
    margin-bottom: 20px;
}


/* ✅ 브라우저(Edge, Chrome 등) 자체 비밀번호 표시 아이콘 숨기기 */
input::-ms-reveal,
input::-ms-clear {
    display: none;
}


.login-icon {
    width: 60px;
    height: 60px;
    margin: 0 auto 20px;
    border-radius: 50%;
    overflow: hidden;
}
.login-icon img {
    width: 100%;
    height: auto;
    display: block;
}
@media (max-width: 480px) {
    .login-container { width: 95%; }
}
</style>
</head>
<body>
<div class="login-container">
    <p class="login_text">회원 로그인</p>
    <div class="login-icon">
        <!-- 이미지 경로가 맞는지 확인하세요 -->
        <!-- <img src="./images/clova.jpg" alt="로그인 아이콘"> -->
        <img src="./images/clova.png" alt="로그인 아이콘">
    </div>

    <!-- action 경로 확인: 이 파일이 root에 있고 login_check.php가 php폴더 안에 있다면 아래가 맞습니다 -->
    <form action="./php/login_check.php" method="post">
        <div class="mb-3 text-start">
            <label for="id" class="form-label">아이디:</label>
            <input type="text" class="form-control" id="id" name="id"  placeholder="아이디 또는 이메일을 입력하세요" required autofocus>
        </div>

        <!-- Bootstrap Icons CDN 추가 -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">

        <div class="mb-3 text-start">
            <label for="password" class="form-label">비밀번호:</label>
            <div class="input-group">
            <input type="password" class="form-control" id="password" name="password" 
                    placeholder="비밀번호를 입력하세요" required autocomplete="new-password">
            <button class="btn btn-outline-secondary" type="button" id="togglePassword">
                <i class="bi bi-eye"></i>
            </button>
            </div>
        </div>

        <div class="text-start mb-3">
            <p style="font-size: 13px; margin: 0; text-align: left;">
                 🔔<span style="color: red;"> 알림 </span>
              http://jikji35.dothome.co.kr/terraone_php/에서 운영 가동중인 서버입니다.<br>
              DB명: jikji35 / 총괄 메인페이지: http://jikji35.dothome.co.kr/terraone_php/select.php<br>
              전화관련,내역서/영수증: <span style="background-color: black; color: orange;">db-connect-pdo.php</span>
               사용하였음! <br>테이블명: expense_table, income_table, images, tel
              데이타베이스를 가동합니다.<br>
              이곳에서 모든 회비사용내역서, 영수증사진, 회원연락망을 편집/열람할 수 있습니다.<br>
              전화연락망 관련 테이블은 <span style="background-color: black; color: orange;">tel</span>
              로 사용하였습니다. 
        </div>

        <div class="d-grid gap-3 mt-4">
            <button type="submit" class="btn btn-primary">로그인</button>
        </div>
    </form>
</div>


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

</body>
</html>