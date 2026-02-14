<?php
// send_email_gmail.php

// PHPMailer 클래스 파일 불러오기 (경로 확인 필수!)
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

function send_gmail_alert($to_email, $subject, $body_content) {
    $mail = new PHPMailer(true);

    try {
        // 1. 서버 설정 (구글 SMTP)
        $mail->isSMTP();                                            
        $mail->Host       = 'smtp.gmail.com';                     
        $mail->SMTPAuth   = true;                                   
        
        // ★ 중요: 여기를 본인 정보로 수정하세요
        $mail->Username   = 'jeon2457@gmail.com';    // 보내는 사람(본인) 구글 이메일
        $mail->Password   = 'hbbs xbma zjmk xexj';    // 아까 발급받은 16자리 앱 비밀번호 (공백없이)

        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // TLS 암호화
        $mail->Port       = 587;                            // TCP 포트

        // 한글 깨짐 방지
        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';

        // 2. 받는 사람 설정
        $mail->setFrom('jeon2457@gmail.com', '투표관리자'); // 보내는 사람 표시
        $mail->addAddress($to_email);                      // 받는 사람 이메일

        // 3. 콘텐츠 설정
        $mail->isHTML(true);                                  
        $mail->Subject = $subject;
        $mail->Body    = $body_content; // HTML 태그 사용 가능
        $mail->AltBody = strip_tags($body_content); // HTML 못 보는 경우를 위한 텍스트

        $mail->send();
        return true; // 전송 성공

    } catch (Exception $e) {
        // 전송 실패 시 에러 로그 (필요시 주석 해제)
        // echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
        return false;
    }
}
?>