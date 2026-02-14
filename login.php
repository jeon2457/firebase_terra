<?php
// login.php
require_once './php/session.php';

// 이미 로그인이 되어 있다면 레벨에 맞게 바로 이동시킴
if (isset($_SESSION['user_id'])) {
    $level = $_SESSION['user_level'] ?? 0;
    if ($level >= 10) {
        echo "<script>location.href='select.php';</script>";
    } else {
        echo "<script>location.href='guest_menu_book.php';</script>";
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

    <!-- 파비콘 -->
    <link rel="icon" href="/favicon.png?v=2" />
    <link rel="icon" type="image/png" sizes="36x36" href="/favicons/android-icon-36x36.png" />
    <link rel="icon" type="image/png" sizes="48x48" href="/favicons/android-icon-48x48.png" />
    <link rel="icon" type="image/png" sizes="72x72" href="/favicons/android-icon-72x72.png" />
    <link rel="apple-touch-icon" sizes="32x32" href="/favicons/apple-icon-32x32.png">
    <link rel="apple-touch-icon" sizes="57x57" href="/favicons/apple-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="/favicons/apple-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="/favicons/apple-icon-72x72.png">

    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

    <style>
        /* ===== 전체 배경 ===== */
        html,
        body {
            height: 100%;
            margin: 0;
            font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
            background: linear-gradient(135deg, #e9efff, #f7f9fc);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* ===== 로그인 카드 ===== */
        .login-container {
            width: 520px;
            padding: 40px 35px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 18px;
            box-shadow:
                0 20px 40px rgba(0, 0, 0, 0.08),
                0 4px 10px rgba(0, 0, 0, 0.04);
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        /* 상단 은은한 포인트 */
        .login-container::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 6px;
            background: linear-gradient(90deg, #3f6ad8, #6f9cff);
        }

        /* ===== 타이틀 ===== */
        p.login_text {
            font-size: 24px;
            font-weight: 600;
            color: #2f3a4f;
            margin-bottom: 25px;
        }


        /* ✅ 브라우저(Edge, Chrome 등) 자체 비밀번호 표시 아이콘 숨기기 */
        input::-ms-reveal,
        input::-ms-clear {
            display: none;
        }


        /* ===== 로고 영역 ===== */
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
        }

        /* ===== 애니메이션 정의 추가 ===== */
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

        /* ===== 입력 필드 ===== */
        .form-label {
            font-size: 14px;
            font-weight: 600;
            color: #4a5568;
        }

        .form-control {
            height: 52px;
            border-radius: 12px;
            border: 1px solid #dbe1f1;
            padding: 0 15px;
            font-size: 15px;
            transition: all 0.25s ease;
        }

        .form-control:focus {
            border-color: #4c6fff;
            box-shadow: 0 0 0 0.15rem rgba(76, 111, 255, 0.15);
        }

        /* ===== 로그인 버튼 ===== */
        .btn-primary {
            height: 54px;
            border-radius: 14px;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 0.3px;
            background: linear-gradient(135deg, #4c6fff, #6f8dff);
            border: none;
            box-shadow: 0 10px 20px rgba(76, 111, 255, 0.3);
            transition: all 0.3s ease;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(76, 111, 255, 0.4);
        }

        /* ===== 모바일 ===== */
        @media (max-width: 480px) {
            .login-container {
                width: 95%;
                padding: 30px 22px;
            }
        }
    </style>
</head>

<body>

    <div class="login-container">
        <p class="login_text">회원 로그인</p>

        <!-- id="logo-icon" 추가 -->
        <div class="login-icon" id="logo-icon">
            <img src="./images/clova.png" alt="로그인 아이콘">
        </div>

        <form action="./php/login_check.php" method="post">
            <div class="mb-3 text-start">
                <label for="id" class="form-label">아이디</label>
                <input type="text" class="form-control" id="id" name="id" placeholder="아이디 또는 이메일을 입력하세요" required
                    autofocus>
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

            <div class="d-grid">
                <button type="submit" class="btn btn-primary">로그인</button>
            </div>
        </form>
    </div>

    <!-- 애니메이션 제어 스크립트 추가 -->
    <script>
        function startShakeAnimation() {
            const logoIcon = document.getElementById('logo-icon');
            if (logoIcon) {
                logoIcon.classList.add('shake-animation');

                // 1.5초 후 흔들림 멈추고 회전 시작
                setTimeout(() => {
                    logoIcon.classList.remove('shake-animation');
                    startRotateAnimation();
                }, 1500);
            }
        }

        function startRotateAnimation() {
            const logoIcon = document.getElementById('logo-icon');
            if (logoIcon) {
                logoIcon.classList.add('rotate-animation');

                // 1.5초 후 회전 멈춤
                setTimeout(() => {
                    logoIcon.classList.remove('rotate-animation');
                }, 1500);
            }
        }

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


</body>

</html>