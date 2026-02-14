<?php
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';


// 모든 세션 변수 해제
$_SESSION = array();

// 세션 쿠키가 존재한다면 삭제
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// 세션 완전히 종료
session_destroy();

// 로그인 페이지로 이동
echo "<script>
        alert('로그아웃 되었습니다.');
        location.href = 'login.php';
      </script>";
exit;
?>
