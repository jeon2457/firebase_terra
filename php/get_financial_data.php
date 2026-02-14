<?php
// php/get_financial_data.php
// 수입/지출 데이터를 JSON 형태로 반환하는 통합 API입니다.
header('Content-Type: application/json; charset=utf-8');

// MongoDB DB 연결
require_once __DIR__ . '/db-connect-mongo.php';

try {
    // 1. 수입 데이터 가져오기
    $incomeCursor = $database->income_table->find([], ['sort' => ['date' => 1]]);
    $incomeData = $incomeCursor->toArray();

    // 2. 지출 데이터 가져오기
    $expenseCursor = $database->expense_table->find([], ['sort' => ['date' => 1]]);
    $expenseData = $expenseCursor->toArray();

    // ObjectId 등을 문자열로 변환 (JSON 인코딩 위해)
    foreach ($incomeData as &$item) {
        $item['_id'] = (string) $item['_id'];
    }
    foreach ($expenseData as &$item) {
        $item['_id'] = (string) $item['_id'];
    }

    // 3. 결과 반환
    echo json_encode([
        'success' => true,
        'income' => $incomeData,
        'expense' => $expenseData
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>