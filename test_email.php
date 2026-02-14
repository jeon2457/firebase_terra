<?php
// test_email.php

// 에러가 나면 화면에 바로 보여주도록 설정 (디버깅용)
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h3>📧 이메일 발송 테스트를 시작합니다...</h3>";

// 1. 이메일 함수 파일 불러오기
// 파일 경로가 맞는지 꼭 확인하세요!
if (!file_exists('send_email_gmail.php')) {
    die("<font color='red'>[에러] send_email_gmail.php 파일을 찾을 수 없습니다.</font>");
}
include 'send_email_gmail.php';


// 2. 테스트 정보 설정
$to_email = "jeon2457@gmail.com"; // 받는 사람 (본인 이메일)
$subject  = "[테스트] PHP 이메일 발송 테스트입니다.";
$content  = "
    <h2>메일 발송 성공! 🎉</h2>
    <p>이 메일이 도착했다면 <strong>구글 앱 비밀번호</strong>와 <strong>PHPMailer</strong> 설정이 완벽한 것입니다.</p>
    <p>발송 시간: " . date("Y-m-d H:i:s") . "</p>
";

// 3. 발송 시도
echo "Google SMTP 서버에 접속 중...<br>";

// send_email_gmail.php 안에 있는 함수 호출
$result = send_gmail_alert($to_email, $subject, $content);

// 4. 결과 출력
if ($result) {
    echo "<h2 style='color:green;'>✅ 성공! 이메일이 전송되었습니다.</h2>";
    echo "<p>Gmail 보낸편지함 또는 받은편지함을 확인해보세요.<br>(안 보이면 스팸메일함도 확인해주세요)</p>";
} else {
    echo "<h2 style='color:red;'>❌ 실패! 이메일을 보내지 못했습니다.</h2>";
    echo "<p>send_email_gmail.php 파일 안의 <strong>앱 비밀번호</strong>를 다시 확인해주세요.</p>";
}
?>