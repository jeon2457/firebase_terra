<?php
// map_save.php
header('Content-Type: application/json');
require_once __DIR__ . '/php/db-connect-mongo.php';

$addr = $_POST['addr'] ?? '';
$lat = $_POST['lat'] ?? '';
$lng = $_POST['lng'] ?? '';
$notice = $_POST['notice'] ?? '';

if (!$addr || !$lat || !$lng) {
    echo json_encode(['success' => false, 'message' => '필수 데이터가 누락되었습니다.']);
    exit;
}

try {
    // id=1인 행을 계속 업데이트하는 방식 (모임 장소는 하나이므로)
    // MongoDB에서는 updateOne + upsert: true를 사용하여 구현
    $database->map_data->updateOne(
        ['_id' => 1],
        [
            '$set' => [
                'addr' => $addr,
                'lat' => $lat,
                'lng' => $lng,
                'notice' => $notice,
                'updated_at' => new MongoDB\BSON\UTCDateTime()
            ]
        ],
        ['upsert' => true]
    );

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>