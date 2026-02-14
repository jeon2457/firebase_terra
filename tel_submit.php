<?php
// tel_submit.php
// ✅ 관리자 인증
require_once __DIR__ . '/php/auth_check.php';

// ✅ MongoDB DB 연결
require_once __DIR__ . '/php/db-connect-mongo.php';

// POST 데이터 받기
$id = trim($_POST['id'] ?? '');
$password = trim($_POST['password'] ?? '');
$password2 = trim($_POST['password2'] ?? '');
$name = trim($_POST['name'] ?? '');
$tel = trim($_POST['tel'] ?? '');
$addr = trim($_POST['addr'] ?? '');
$remark = trim($_POST['remark'] ?? '');
$sms = trim($_POST['sms'] ?? '');
$sms_2 = trim($_POST['sms_2'] ?? '');
$user_level = (int) ($_POST['user_level'] ?? 1);

// 입력값 검증
if (empty($id) || empty($password) || empty($name) || empty($tel)) {
    echo "<script>alert('필수 입력값이 누락되었습니다.'); history.back();</script>";
    exit;
}

if ($password !== $password2) {
    echo "<script>alert('비밀번호가 일치하지 않습니다.'); history.back();</script>";
    exit;
}

try {
    // 아이디 중복 확인
    $exists = $collection->findOne(['id' => $id]);

    if ($exists) {
        echo "<script>alert('이미 사용 중인 아이디입니다.'); history.back();</script>";
        exit;
    }

    // 비밀번호 암호화
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // 새 회원 등록
    $result = $collection->insertOne([
        'id' => $id,
        'password' => $hashed_password,
        'name' => $name,
        'tel' => $tel,
        'addr' => $addr,
        'remark' => $remark,
        'sms' => $sms,
        'sms_2' => $sms_2,
        'user_level' => $user_level,
        'created_at' => new MongoDB\BSON\UTCDateTime()
    ]);

    if ($result->getInsertedCount() > 0) {
        echo "<script>
                alert('회원 정보가 성공적으로 등록되었습니다!');
                location.href='tel_view.php';
              </script>";
        exit;
    } else {
        throw new Exception("데이터 저장에 실패했습니다.");
    }

} catch (Exception $e) {
    echo "데이터 처리 오류: " . $e->getMessage();
}
?>