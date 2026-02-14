<?php
// map_load.php
header('Content-Type: application/json');
require_once __DIR__ . '/php/db-connect-mongo.php';

try {
    // id=1인 문서를 조회 (모임 장소 데이터)
    $data = $database->map_data->findOne(['_id' => 1]);

    if ($data) {
        // BSON Array/Document를 연관 배열로 변환
        $result = iterator_to_array($data);
        $result['id'] = 1; // 하위 호환성 유지
        echo json_encode(['success' => true, 'data' => $result]);
    } else {
        echo json_encode(['success' => false, 'message' => '저장된 데이터가 없습니다.']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>