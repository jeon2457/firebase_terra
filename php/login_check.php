<?php
// php/login_check.php
// session_start()는 php/session.php에서 수행됨
require_once __DIR__ . '/session.php';
require_once __DIR__ . '/db-connect-mongo.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $id = $_POST['id'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($id) || empty($password)) {
        echo "<script>alert('아이디와 비밀번호를 입력해주세요.'); history.back();</script>";
        exit;
    }

    try {
        // 아이디로 사용자 조회
        $user = $collection->findOne(['id' => $id]);

        if ($user && password_verify($password, $user['password'])) {
            // 로그인 성공 - 세션 변수 설정
            $_SESSION['user_id'] = (string) $user['id'];
            $_SESSION['user_name'] = (string) $user['name'];
            $_SESSION['user_level'] = (int) $user['user_level'];

            // 리다이렉트 URL 확인 (기본값 설정 로직 추가)
            if (!isset($_SESSION['redirect_url'])) {
                $level = (int) $user['user_level'];
                $redirect_url = ($level >= 10) ? 'select.php' : 'guest_menu_book.php';
            } else {
                $redirect_url = $_SESSION['redirect_url'];
                unset($_SESSION['redirect_url']);
            }

            // 경로 계산: REQUEST_URI(절대경로)인지 단순히 파일명(상대경로)인지 확인
            if (strpos($redirect_url, '/') === 0 || strpos($redirect_url, 'http') === 0) {
                $final_url = $redirect_url;
            } else {
                // 이 파일(login_check.php)은 php/ 폴더 안에 있으므로 루트로 가기 위해 ../ 필요
                // 단, redirect_url에 이미 ../가 포함되어 있다면 중복 방지
                $final_url = (strpos($redirect_url, '../') === 0) ? $redirect_url : '../' . $redirect_url;
            }

            echo "<script>alert('{$user['name']}님, 환영합니다!'); location.href='{$final_url}';</script>";
            exit;
        } else {
            // 로그인 실패
            echo "<script>alert('아이디 또는 비밀번호가 일치하지 않습니다.'); history.back();</script>";
            exit;
        }
    } catch (Exception $e) {
        die("로그인 처리 중 오류 발생: " . $e->getMessage());
    }
} else {
    header("Location: ../login.php");
    exit;
}
?>