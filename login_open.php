<?php
// login_open.php - MongoDB 버전
session_start();
require_once __DIR__ . '/php/db-connect-mongo.php';

$errorMessage = "";

// 1. 이미 로그인이 되어 있다면 레벨에 맞게 바로 이동시킴
if (isset($_SESSION['user_id'])) {
    $level = $_SESSION['user_level'] ?? 0;
    if ($level >= 10) {
        header("Location: select.php");
    } else {
        header("Location: guest.php");
    }
    exit;
}

// 2. 로그인 버튼을 눌렀을 때 (POST 방식)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';
    $password = $_POST['password'] ?? '';

    if (!empty($id) && !empty($password)) {
        try {
            // DB에서 해당 아이디 정보 가져오기 (members 컬렉션 사용)
            $user = $database->members->findOne(['id' => $id]);

            // 3. 비밀번호 비교 (암호화 및 일반 텍스트 비교 지원)
            if ($user) {
                $isMatch = false;
                $storedPassword = $user['password'] ?? '';

                if (password_verify($password, $storedPassword)) {
                    $isMatch = true;
                } else if ($password === $storedPassword) {
                    $isMatch = true;
                }

                if ($isMatch) {
                    // 세션에 정보 저장
                    $_SESSION['user_id'] = (string) $user['id'];
                    $_SESSION['user_name'] = (string) $user['name'];
                    $_SESSION['user_level'] = (int) ($user['user_level'] ?? 1);

                    // 4. 관리자 레벨(10) 체크 및 리다이렉트
                    if ($_SESSION['user_level'] >= 10) {
                        header("Location: select.php");
                    } else {
                        header("Location: guest.php");
                    }
                    exit;
                } else {
                    $errorMessage = "아이디 또는 비밀번호가 틀렸습니다.";
                }
            } else {
                $errorMessage = "아이디 또는 비밀번호가 틀렸습니다.";
            }
        } catch (Exception $e) {
            $errorMessage = "데이터베이스 오류: " . $e->getMessage();
        }
    } else {
        $errorMessage = "아이디와 비밀번호를 모두 입력해주세요.";
    }
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
    <link rel="icon" href="./favicon.png?v=2" />
    <link rel="icon" type="image/png" sizes="36x36" href="./favicons/android-icon-36x36.png" />
    <link rel="icon" type="image/png" sizes="48x48" href="./favicons/android-icon-48x48.png" />
    <link rel="icon" type="image/png" sizes="72x72" href="./favicons/android-icon-72x72.png" />
    <link rel="apple-touch-icon" sizes="32x32" href="./favicons/apple-icon-32x32.png">
    <link rel="apple-touch-icon" sizes="57x57" href="./favicons/apple-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="./favicons/apple-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="./favicons/apple-icon-72x72.png">


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

        /* ===== 애니메이션 정의 ===== */
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

        <div class="login-icon" id="logo-icon">
            <img src="./images/clova.png" alt="로그인 아이콘">
        </div>

        <!-- 오류 메시지 출력 -->
        <?php if ($errorMessage): ?>
            <div class="alert alert-danger py-2" style="font-size: 14px;">
                <?= $errorMessage ?>
            </div>
        <?php endif; ?>

        <form action="login_open.php" method="post">
            <div class="mb-3 text-start">
                <label for="id" class="form-label">아이디</label>
                <input type="text" class="form-control" id="id" name="id" placeholder="아이디를 입력하세요" required autofocus>
            </div>

            <div class="mb-4 text-start">
                <label for="password" class="form-label">비밀번호</label>
                <input type="password" class="form-control" id="password" name="password" placeholder="비밀번호를 입력하세요"
                    required>
            </div>

            <div class="d-grid">
                <button type="submit" class="btn btn-primary">로그인</button>
            </div>
        </form>
    </div>

    <script>
        // 로고 애니메이션 제어
        function startShakeAnimation() {
            const logoIcon = document.getElementById('logo-icon');
            if (logoIcon) {
                logoIcon.classList.add('shake-animation');
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
                setTimeout(() => {
                    logoIcon.classList.remove('rotate-animation');
                }, 1500);
            }
        }

        document.addEventListener('DOMContentLoaded', startShakeAnimation);
    </script>

</body>

</html>