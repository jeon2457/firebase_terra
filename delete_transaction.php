<?php
// delete_transaction.php - MongoDB 버전
require_once __DIR__ . '/php/session.php';
require_once __DIR__ . '/php/db-connect-mongo.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';
    $type = $_POST['type'] ?? '';

    if (empty($id)) {
        die("삭제할 ID가 없습니다.");
    }

    // 유형에 따라 컬렉션 결정
    $col_name = ($type === '수입') ? 'income_table' : 'expense_table';
    $target_col = $database->$col_name;

    try {
        // MongoDB ObjectId로 변환
        $objectId = new MongoDB\BSON\ObjectId($id);

        // 데이터 삭제
        $target_col->deleteOne(['_id' => $objectId]);

        header("Location: account_view.php");
        exit;
    } catch (Exception $e) {
        die("삭제 오류: " . $e->getMessage());
    }
} else {
    header("Location: account_view.php");
    exit;
}
?>