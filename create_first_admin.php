<?php
// create_first_admin.php
require_once './php/db-connect-mongo.php';

try {
    // 이미 admin 계정이 있는지 확인
    $exists = $collection->findOne(['id' => 'admin']);

    if ($exists) {
        die("이미 'admin' 계정이 존재합니다. 로그인 페이지에서 로그인해 주세요.");
    }

    // 관리자 계정 생성 (아이디: admin / 비밀번호: 1234)
    $hashedPassword = password_hash('1234', PASSWORD_DEFAULT);

    $result = $collection->insertOne([
        'id' => 'admin',
        'password' => $hashedPassword,
        'name' => '최고관리자',
        'tel' => '010-0000-0000',
        'addr' => '본사',
        'remark' => '관리자',
        'sms' => '010-0000-0000',
        'sms_2' => '',
        'email' => 'admin@example.com',
        'user_level' => 10, // 관리자 레벨
        'created_at' => new MongoDB\BSON\UTCDateTime()
    ]);

    if ($result->getInsertedCount() > 0) {
        echo "<h3>✅ 관리자 계정 생성 성공!</h3>";
        echo "<p>아이디: <strong>admin</strong></p>";
        echo "<p>비밀번호: <strong>1234</strong></p>";
        echo "<br><a href='login.php'>로그인하러 가기</a>";
    }
} catch (Exception $e) {
    echo "오류 발생: " . $e->getMessage();
}
?>