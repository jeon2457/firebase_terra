<?php
// edit_transaction.php - MongoDB 버전
require_once __DIR__ . '/php/session.php';
require_once __DIR__ . '/php/db-connect-mongo.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';
    $date = $_POST['date'] ?? '';
    $type = $_POST['type'] ?? '';
    $category = $_POST['category'] ?? '';
    $description = $_POST['description'] ?? '';
    $amount = $_POST['amount'] ?? 0;

    if (empty($id)) {
        die("수정할 ID가 없습니다.");
    }

    // 유형에 따라 컬렉션 결정
    $col_name = ($type === '수입') ? 'income_table' : 'expense_table';
    $target_col = $database->$col_name;

    try {
        // MongoDB ObjectId로 변환
        $objectId = new MongoDB\BSON\ObjectId($id);

        // 데이터 업데이트
        $target_col->updateOne(
            ['_id' => $objectId],
            [
                '$set' => [
                    'date' => $date, // 'YYYY-MM-DD HH:MM:SS' 형식 권장
                    'category' => $category,
                    'description' => $description,
                    'amount' => (int) $amount,
                    'updated_at' => new MongoDB\BSON\UTCDateTime()
                ]
            ]
        );

        header("Location: account_view.php");
        exit;
    } catch (Exception $e) {
        die("수정 오류: " . $e->getMessage());
    }
} else {
    header("Location: account_view.php");
    exit;
}
?>