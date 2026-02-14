<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
// 🔥[중요!] 이 파일은 관리자 페이지의 최상단에 include 되어야 합니다.

// 1. 로그인 여부 확인
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    // 로그인 안 된 상태면 현재 주소 저장 후 로그인 페이지로 이동
    $_SESSION['redirect_url'] = $_SERVER['REQUEST_URI'];
    echo "<script>alert('로그인이 필요합니다.'); location.href='login.php';</script>";
    exit;
}

// 2. 관리자 권한 체크 (레벨 10 미만인 경우)
// 관리자 페이지에 일반 회원이 접근했다면 -> guest_menu_book.php로 강제 이동
$user_level = $_SESSION['user_level'] ?? 0;
if ($user_level < 10) {
    echo "<script>
        alert('관리자 권한이 필요합니다. 일반 회원 메뉴로 이동합니다.');
        location.href = 'guest_menu_book.php';
    </script>";
    exit;
}
?>