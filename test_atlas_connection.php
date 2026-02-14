<?php
// test_atlas_connection.php
require_once __DIR__ . '/php/db-connect-mongo.php';

echo "<h3>MongoDB Atlas 연결 테스트</h3>";

try {
    // 1. 서버 응답 확인 (ping)
    $admin = $client->admin;
    $response = $admin->command(['ping' => 1]);
    echo "✅ [성공] Atlas 서버와 통신이 가능합니다.<br>";

    // 2. 데이터베이스 목록 확인
    echo "📂 [데이터베이스 목록]:<br>";
    $dbs = $client->listDatabases();
    foreach ($dbs as $db) {
        echo "- " . $db->getName() . "<br>";
    }

    // 3. 특정 콜렉션 레코드 수 확인
    $count = $collection->countDocuments();
    echo "👥 [members 콜렉션 데이터 수]: " . $count . "개<br>";

    echo "<br><b style='color:green;'>결과: Atlas 연동 설정에 이상이 없습니다.</b>";

} catch (Exception $e) {
    echo "<b style='color:red;'>❌ [실패] 연결 중 오류가 발생했습니다.</b><br>";
    echo "에러 메시지: " . $e->getMessage();

    // 비밀번호 특수문자 관련 힌트
    if (strpos($e->getMessage(), 'Authentication failed') !== false) {
        echo "<br><br>💡 <b>Tip</b>: 비밀번호의 '#' 문자를 '%23'으로 바꿔보세요.<br>";
        echo "예: ...:jsj84325285%23@cluster0...";
    }
}
?>