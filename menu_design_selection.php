<?php
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';

// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
require_once __DIR__ . '/php/auth_check.php';
require_once __DIR__ . '/php/db-connect-mongo.php';

// 테마 저장 처리
if (isset($_GET['set_theme'])) {
    $theme_value = $_GET['set_theme'];
    $user_id = $_SESSION['user_id'];

    try {
        // [MongoDB 전환] 모든 회원의 테마를 일괄 변경 (filter empty matches all)
        $result = $collection->updateMany(
            [], // 전체 문서 대상
            ['$set' => ['site_theme' => $theme_value]]
        );

        // 2. 쿠키 설정 (현재 로그인한 관리자를 위해 즉시 반영)
        setcookie('user_site_theme', $theme_value, time() + (86400 * 30), "/");
        $_COOKIE['user_site_theme'] = $theme_value;

        // 성공 시 페이지 이동
        header("Location: select.php");
        exit;

    } catch (Exception $e) {
        // DB 에러 발생 시 경고창 띄움
        $error_msg = $e->getMessage();
        echo "<script>
            alert('테마 저장 중 오류가 발생했습니다.\\n에러내용: " . addslashes($error_msg) . "');
            history.back();
        </script>";
        exit;
    }
}

// 현재 설정된 테마 확인 (화면 표시용)
$current_theme = 'book'; // 기본값

// DB에서 현재 설정값 가져오기 (관리자의 현재 설정 기준)
if (isset($_SESSION['user_id'])) {
    try {
        $userDoc = $collection->findOne(['id' => $_SESSION['user_id']]);
        if ($userDoc && !empty($userDoc['site_theme'])) {
            $current_theme = $userDoc['site_theme'];
        } elseif (isset($_COOKIE['user_site_theme'])) {
            $current_theme = $_COOKIE['user_site_theme'];
        }
    } catch (Exception $e) {
        // 무시하고 기본값 사용
    }
}
?>
<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>메뉴 디자인 선택</title>
    <link rel="icon" href="/favicon.png?v=2" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        body {
            background: #f8f9fa;
            font-family: 'Noto Sans KR', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }

        .container {
            max-width: 600px;
            padding: 30px;
        }

        .title-area {
            text-align: center;
            margin-bottom: 40px;
        }

        .theme-card {
            background: white;
            border-radius: 20px;
            padding: 20px;
            margin-bottom: 20px;
            cursor: pointer;
            border: 2px solid transparent;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
        }

        .theme-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .theme-card.active {
            border-color: #0d6efd;
            background-color: #e7f1ff;
        }

        .theme-icon {
            font-size: 2.5rem;
            margin-right: 20px;
            width: 60px;
            text-align: center;
        }

        .theme-info h5 {
            margin: 0 0 5px 0;
            font-weight: 700;
            color: #333;
        }

        .theme-info p {
            margin: 0;
            font-size: 0.9rem;
            color: #666;
        }

        .btn-apply {
            width: 100%;
            padding: 15px;
            margin-top: 20px;
            font-size: 1.1rem;
            font-weight: 700;
            border-radius: 12px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="title-area">
            <h2>🎨 디자인 테마 설정</h2>
            <p class="text-muted">관리자가 선택한 디자인이 <strong>모든 회원</strong>에게 적용됩니다.</p>
        </div>

        <!-- 1. 책장형 -->
        <div class="theme-card <?= $current_theme == 'book' ? 'active' : '' ?>" onclick="selectTheme('book', this)">
            <div class="theme-icon text-primary"><i class="bi bi-bookshelf"></i></div>
            <div class="theme-info">
                <h5>책장형 (Bookshelf)</h5>
                <p>클래식하고 깔끔한 도서관 스타일 디자인</p>
            </div>
        </div>

        <!-- 2. 아이콘형 -->
        <div class="theme-card <?= $current_theme == 'icon' ? 'active' : '' ?>" onclick="selectTheme('icon', this)">
            <div class="theme-icon text-success"><i class="bi bi-grid-fill"></i></div>
            <div class="theme-info">
                <h5>아이콘형 (App Grid)</h5>
                <p>아이폰 스타일의 컬러풀한 앱 아이콘 디자인</p>
            </div>
        </div>

        <!-- 3. 글래스형 -->
        <div class="theme-card <?= $current_theme == 'glass' ? 'active' : '' ?>" onclick="selectTheme('glass', this)">
            <div class="theme-icon text-info"><i class="bi bi-layers-half"></i></div>
            <div class="theme-info">
                <h5>글래스형 (Space Glass)</h5>
                <p>우주 배경의 생동감 넘치는 글래스모피즘 디자인</p>
            </div>
        </div>

        <!-- 4. 목록형 -->
        <div class="theme-card <?= $current_theme == 'list' ? 'active' : '' ?>" onclick="selectTheme('list', this)">
            <div class="theme-icon text-warning"><i class="bi bi-list-task"></i></div>
            <div class="theme-info">
                <h5>목록형 (Classic List)</h5>
                <p>가장 표준적이고 직관적인 리스트 스타일</p>
            </div>
        </div>

        <!-- 5. 모던 테크형 -->
        <div class="theme-card <?= $current_theme == 'tech' ? 'active' : '' ?>" onclick="selectTheme('tech', this)">
            <div class="theme-icon" style="color:#0f172a;"><i class="bi bi-cpu-fill"></i></div>
            <div class="theme-info">
                <h5>모던 테크형 (Modern Tech)</h5>
                <p>어두운 배경의 전문가용 대시보드 스타일</p>
            </div>
        </div>

        <button class="btn btn-primary btn-apply" onclick="applyTheme()">선택한 테마로 전체 적용하기</button>
        <button class="btn btn-outline-secondary btn-apply mt-2" onclick="location.href='select.php'">취소하고 돌아가기</button>
    </div>

    <script>
        let selectedTheme = '<?= $current_theme ?>';

        function selectTheme(theme, element) {
            selectedTheme = theme;
            document.querySelectorAll('.theme-card').forEach(el => el.classList.remove('active'));
            element.classList.add('active');
        }

        function applyTheme() {
            if (confirm("모든 회원의 메뉴 디자인이 변경됩니다.\n진행하시겠습니까?")) {
                window.location.href = 'menu_design_selection.php?set_theme=' + selectedTheme;
            }
        }
    </script>
</body>

</html>