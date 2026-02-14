<?php
// ✅ MongoDB DB 연결
require_once __DIR__ . '/php/db-connect-mongo.php';

$id = $_POST['imageId'] ?? null;
$summary = $_POST['summary'] ?? null;

if ($id && $summary !== null) {
    try {
        $images_col = $database->images;

        // ID가 24자리 hex string이면 ObjectId로 변환, 아니면 문자열 그대로 사용
        $filter = preg_match('/^[a-f\d]{24}$/i', $id)
            ? ['_id' => new MongoDB\BSON\ObjectId($id)]
            : ['id' => $id];

        $result = $images_col->updateOne(
            $filter,
            [
                '$set' => [
                    'notice' => $summary,
                    'updated_at' => new MongoDB\BSON\UTCDateTime()
                ]
            ]
        );

        if ($result->getModifiedCount() > 0 || $result->getMatchedCount() > 0) {
            echo "ok";
        } else {
            echo "no_change";
        }
    } catch (Exception $e) {
        echo "error: " . $e->getMessage();
    }
} else {
    echo "error: missing_params";
}
?>