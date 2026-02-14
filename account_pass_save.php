require_once __DIR__ . '/php/db-connect-mongo.php';

header('Content-Type: application/json; charset=utf-8');
$data = json_decode(file_get_contents('php://input'), true);

$memberId = (string)($data['memberId'] ?? ''); // MongoDB _id (string)
$year = (int)($data['year'] ?? 0);
$month = (int)($data['month'] ?? 0);
$paid = (int)($data['paid'] ?? 0);

$FEE = 20000;
$amount = $paid ? $FEE : 0;

if (empty($memberId) || !$month || !$year) {
echo json_encode(['success'=>false, 'msg'=>'잘못된 요청']);
exit;
}

try {
/* ✅ MongoDB UPSERT (updateOne + upsert: true) */
$result = $database->account_pass->updateOne(
[
'member_id' => $memberId,
'pay_year' => $year,
'pay_month' => $month
],
[
'$set' => [
'paid' => $paid,
'amount' => $amount,
'updated_at' => new MongoDB\BSON\UTCDateTime()
]
],
['upsert' => true]
);

echo json_encode([
'success' => true,
'memberId'=> $memberId,
'year' => $year,
'month' => $month,
'paid' => $paid
]);
} catch (Exception $e) {
echo json_encode(['success' => false, 'msg' => $e->getMessage()]);
}