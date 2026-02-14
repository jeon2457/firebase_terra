<?php
// tel_update_action.php - MongoDB 버전 (실제 수정 처리)
session_start();
require './php/auth_check.php';
require './php/db-connect-mongo.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $edit_id = $_POST['edit_id'] ?? '';
    $id = $_POST['id'] ?? ''; // 로그인 아이디
    $name = $_POST['name'] ?? '';
    $tel = $_POST['tel'] ?? '';
    $addr = $_POST['addr'] ?? '';
    $remark = $_POST['remark'] ?? '';
    $sms = $_POST['sms'] ?? '';
    $sms_2 = $_POST['sms_2'] ?? ''; // 다중 발송용
    $user_level = (int) ($_POST['user_level'] ?? 1);
    $password = $_POST['password'] ?? '';

    if (empty($edit_id)) {
        echo "<script>alert('잘못된 요청입니다.'); history.back();</script>";
        exit;
    }

    try {
        // MongoDB ObjectId로 변환
        $objectId = new MongoDB\BSON\ObjectId($edit_id);

        // 업데이트 데이터 구성
        $update_data = [
            'id' => $id,
            'name' => $name,
            'tel' => $tel,
            'addr' => $addr,
            'remark' => $remark,
            'sms' => $sms,
            'sms_2' => $sms_2,
            'user_level' => $user_level,
            'updated_at' => new MongoDB\BSON\UTCDateTime()
        ];

        // 비밀번호가 입력된 경우에만 해싱하여 추가
        if (!empty($password)) {
            $update_data['password'] = password_hash($password, PASSWORD_DEFAULT);
        }

        // 회원 정보 업데이트
        $result = $collection->updateOne(
            ['_id' => $objectId],
            ['$set' => $update_data]
        );

        // 수정 내역이 있거나(getModifiedCount) 데이터가 일치하는 경우(getMatchedCount) 모두 성공으로 간주
        if ($result->getMatchedCount() > 0) {
            echo "<script>alert('회원 정보가 수정되었습니다.'); location.href='tel_edit.php';</script>";
        } else {
            echo "<script>alert('회원을 찾을 수 없습니다.'); history.back();</script>";
        }

    } catch (Exception $e) {
        die("수정 오류: " . $e->getMessage());
    }
} else {
    echo "<script>alert('잘못된 접근입니다.'); location.href='tel_edit.php';</script>";
    exit;
}
?>