require_once __DIR__ . '/php/db-connect-mongo.php';

header('Content-Type: application/json');

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$year = (int)($data['year'] ?? 0);
$month = (int)($data['month'] ?? 0);
$amount = (int)($data['amount'] ?? 0);

if (!$year || !$month || $amount === 0) {
echo json_encode(['success' => false, 'message' => '필수 항목 누락']);
exit;
}

try {
/* ✅ MongoDB UPSERT (updateOne + upsert: true) */
$result = $database->monthly_fee_history->updateOne(
[
'apply_year' => $year,
'apply_month' => $month
],
[
'$set' => [
'fee_amount' => $amount,
'updated_at' => new MongoDB\BSON\UTCDateTime()
]
],
['upsert' => true]
);

echo json_encode(['success' => true]);
} catch (Exception $e) {
echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}