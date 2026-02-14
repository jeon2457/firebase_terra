<?php
ob_start();
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';


// ❌ 기존의 require './php/auth_check.php'; 제거
// (이 파일 안에 관리자 레벨 체크 기능이 들어있어서 일반 회원이 막힌 것입니다.)

// ✅ [수정] 오직 "로그인 상태"인지만 확인
if (!isset($_SESSION['user_id'])) {
    echo "<script>alert('로그인이 필요합니다.'); location.href='login.php';</script>";
    exit;
}

// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
require_once __DIR__ . '/php/db-connect-mongo.php';

// [중요] 통합 테마 로직: 1순위 DB, 2순위 쿠키, 3순위 기본값
$current_theme = 'book';

// 1. DB에서 테마 설정 확인 (일반 회원도 본인의 테마 설정을 가져와야 함)
if (isset($_SESSION['user_id'])) {
    try {
        // [MongoDB 전환] members 컬렉션에서 site_theme 조회
        $userDoc = $collection->findOne(['id' => $_SESSION['user_id']]);

        if ($userDoc && !empty($userDoc['site_theme'])) {
            $current_theme = (string) $userDoc['site_theme'];

            // DB값이 있다면 쿠키도 동기화
            setcookie('user_site_theme', $current_theme, time() + (86400 * 30), "/");
        } else {
            // DB에 값이 없으면 쿠키 확인
            if (isset($_COOKIE['user_site_theme'])) {
                $current_theme = $_COOKIE['user_site_theme'];
            }
        }
    } catch (Exception $e) {
        // 오류 시 쿠키값 사용
        if (isset($_COOKIE['user_site_theme'])) {
            $current_theme = $_COOKIE['user_site_theme'];
        }
    }
}

// 2. 테마 라우팅 (일반 회원 전용 페이지로 이동)
if ($current_theme !== 'book') {
    $mapping = [
        'icon' => 'guest_menu_1.php',
        'glass' => 'guest_menu_2.php',
        'list' => 'guest_menu_3.php',
        'tech' => 'guest_menu_4.php'
    ];
    if (isset($mapping[$current_theme])) {
        header("Location: " . $mapping[$current_theme]);
        exit;
    }
}

// 3. 기본값(book)일 경우 책장형 게스트 페이지로 이동
header("Location: guest_menu_book.php");
exit;
?>