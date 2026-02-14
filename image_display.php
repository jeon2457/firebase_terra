<?php
// image_display.php - MongoDB 버전
require_once __DIR__ . '/php/db-connect-mongo.php';

header("Content-Type: image/jpeg");

$id = $_GET['id'] ?? '';

try {
    if (empty($id)) {
        readfile("./images/clova.png");
        exit;
    }

    // ID 형식 확인 (24자리 hex string)
    if (preg_match('/^[a-f\d]{24}$/i', $id)) {
        $objectId = new MongoDB\BSON\ObjectId($id);
        $doc = $database->images->findOne(['_id' => $objectId]);
    } else {
        // 하위 호환성 (정수 idx 기반 조회)
        $doc = $database->images->findOne(['idx' => (int) $id]);
    }

    if ($doc && isset($doc['photo'])) {
        // MongoDB BSON Binary 데이터 처리
        if ($doc['photo'] instanceof MongoDB\BSON\Binary) {
            echo $doc['photo']->getData();
        } else {
            // 일반 문자열/바이너리 형태
            echo $doc['photo'];
        }
    } else {
        readfile("./images/clova.png");
    }

} catch (Exception $e) {
    // 에러 발생 시 기본 이미지 출력
    readfile("./images/clova.png");
}
?>