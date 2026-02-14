<?php
session_start();

// 타임아웃 시간 (초 단위) → 5분 = 300초
// 페이지 진입후부터 5분간 활동이 없으면 자동 로그아웃 처리!
$timeout_duration = 300;

// 마지막 활동 시간이 기록되어 있으면 확인
if (isset($_SESSION['LAST_ACTIVITY']) && 
    (time() - $_SESSION['LAST_ACTIVITY']) > $timeout_duration) {
    
    // 세션 파괴 (자동 로그아웃)
    session_unset();
    session_destroy();
    
    // 로그인 페이지로 리다이렉트
    header("Location: login.php");
    exit();
}

// 현재 활동 시간 갱신
$_SESSION['LAST_ACTIVITY'] = time();
?>