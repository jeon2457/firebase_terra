<?php
/**
 * migrate_local_to_atlas.php
 * 로컬 MongoDB의 데이터를 Atlas 클라우드로 복사하는 스크립트입니다.
 */

require_once __DIR__ . '/vendor/autoload.php';

// 1. 소스 (Local) - db-connect-mongo.php의 이전 주소를 수동으로 기입하거나 직접 지정
$localUri = 'mongodb://localhost:27017';
$localClient = new MongoDB\Client($localUri);
$localDb = $localClient->terraone_mongo;

// 2. 대상 (Atlas) - 현재 db-connect-mongo.php에 설정된 주소 사용
require_once __DIR__ . '/php/db-connect-mongo.php';
// 여기서 $client, $database는 이미 Atlas를 가리키고 있음

echo "<h3>🚚 데이터 마이그레이션 시작 (Local -> Atlas)</h3>";

try {
    // 복사할 컬렉션 목록
    $collections = ['members', 'income_table', 'expense_table', 'vote_table'];

    foreach ($collections as $colName) {
        echo "📦 <b>$colName</b> 처리 중... ";

        // 로컬에서 데이터 읽기
        $localCol = $localDb->$colName;
        $documents = $localCol->find()->toArray();

        if (empty($documents)) {
            echo "<span style='color:orange;'>데이터 없음 (skip)</span><br>";
            continue;
        }

        // Atlas에 데이터 쓰기
        $atlasCol = $database->$colName;

        // 기존 데이터 중복 방지를 원한다면 삭제 후 삽입 (주의 필요)
        // $atlasCol->deleteMany([]); 

        $result = $atlasCol->insertMany($documents);
        echo "<span style='color:green;'>성공 (" . $result->getInsertedCount() . "개 삽입됨)</span><br>";
    }

    echo "<br><h4 style='color:blue;'>🎉 모든 데이터가 Atlas로 성공적으로 복사되었습니다!</h4>";
    echo "이제 Atlas UI(Browse Collections)에서 확인해 보세요.";

} catch (Exception $e) {
    echo "<br><b style='color:red;'>❌ 오류 발생:</b> " . $e->getMessage();
}
?>