<?php
// send_sms_aligo.php

function send_aligo_sms($receiver, $msg) {
    // ---------------------------------------------------------------------------------
    // [설정 영역] 알리고 사이트에서 확인한 정보를 아래에 입력하세요.
    // ---------------------------------------------------------------------------------
    $sms_config = array(
        'user_id' => '본인의_알리고_아이디',  // [필수] 알리고 아이디
        'key'     => '본인의_API_KEY',       // [필수] API Key (문자API 메뉴에서 확인)
        'sender'  => '01096091688',          // [필수] 알리고에 등록된 발신번호 (- 없이 숫자만 권장)
    );
    // ---------------------------------------------------------------------------------

    $sms_url = "https://apis.aligo.in/send/"; // 알리고 전송 요청 URL

    // 전송 데이터 세팅
    $_POST['user_id'] = $sms_config['user_id'];
    $_POST['key']     = $sms_config['key'];
    $_POST['sender']  = $sms_config['sender'];
    $_POST['receiver'] = $receiver; // 받는 사람 번호
    $_POST['msg']     = $msg;       // 보낼 메시지 내용
    $_POST['testmode_yn'] = 'N';    // Y로 하면 실제 발송은 안되고 테스트만 됨 (돈 안나감), 실전은 N

    // cURL을 이용한 API 호출
    $oCurl = curl_init();
    curl_setopt($oCurl, CURLOPT_URL, $sms_url);
    curl_setopt($oCurl, CURLOPT_POST, 1);
    curl_setopt($oCurl, CURLOPT_POSTFIELDS, http_build_query($_POST));
    curl_setopt($oCurl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($oCurl, CURLOPT_SSL_VERIFYPEER, 0); // SSL 인증서 검증 무시 (필요시)
    
    $ret = curl_exec($oCurl);
    $error_msg = curl_error($oCurl);
    curl_close($oCurl);

    // 결과 확인 (JSON 형태)
    $retArr = json_decode($ret, true);

    // 로그 남기기 (선택사항)
    // if($retArr['result_code'] == 1) { /* 성공 */ } else { /* 실패: $retArr['message'] */ }
    
    return $retArr; // 결과 반환
}
?>
