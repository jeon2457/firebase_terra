<?php
// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
require_once __DIR__ . '/php/db-connect-mongo.php';

$id = $_POST['imageId'] ?? null;
if ($id) {
    try {
        // ID가 24자리 hex string이면 ObjectId로 변환, 아니면 idx 필드 기준으로 삭제
        $filter = preg_match('/^[a-f\d]{24}$/i', $id)
            ? ['_id' => new MongoDB\BSON\ObjectId($id)]
            : ['idx' => (int) $id];

        $result = $database->images->deleteOne($filter);

        if ($result->getDeletedCount() > 0) {
            echo "ok";
        } else {
            echo "not_found";
        }
    } catch (Exception $e) {
        echo "error: " . $e->getMessage();
    }
} else {
    echo "error: missing_id";
}
?>