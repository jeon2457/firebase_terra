<?php
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';

// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
require_once __DIR__ . '/php/auth_check.php';
require_once __DIR__ . '/php/db-connect-mongo.php';

$exclude_id = $_GET['exclude_id'] ?? ($_GET['exclude_idx'] ?? ''); // 하위 호환성 위해 둘 다 체크
header('Content-Type: application/json; charset=utf-8');

try {
    $query = [
        'tel' => ['$ne' => ''],
        'name' => ['$ne' => '공용계정']
    ];

    if (!empty($exclude_id)) {
        try {
            $objectId = new MongoDB\BSON\ObjectId($exclude_id);
            $query['_id'] = ['$ne' => $objectId];
        } catch (Exception $e) {
            // ObjectId 형식이 아니면 문자열 비교 (혹은 무시)
            $query['_id'] = ['$ne' => $exclude_id];
        }
    }

    $cursor = $collection->find($query, ['projection' => ['tel' => 1], 'sort' => ['name' => 1]]);

    $phones = [];
    foreach ($cursor as $doc) {
        if (!empty($doc['tel'])) {
            $phones[] = (string) $doc['tel'];
        }
    }

    echo json_encode(['success' => true, 'phones' => $phones], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>