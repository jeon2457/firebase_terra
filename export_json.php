require_once __DIR__ . '/php/db-connect-mongo.php';

try {
// 1. 회원 정보 가져오기 (members 컬렉션)
$membersCursor = $database->members->find();
$members = iterator_to_array($membersCursor);

// 2. Firebase 형식으로 변환
$firebaseData = [];

foreach ($members as $row) {
// MongoDB _id를 문자열로 변환하여 포함 (식별용)
$row['mongo_id'] = (string)$row['_id'];
unset($row['_id']); // JSON 출력 시 _id 객체 형태 방지 (필요 시 유지)

// 전화번호를 키로 사용 (기존 로직 유지)
$tel = $row['tel'] ?? '';
$key = str_replace([' ', '.', '#', '$', '[', ']'], '', $tel);

if(empty($key)) {
$key = "user_" . ($row['no'] ?? (string)$row['mongo_id']);
}

$firebaseData['tel'][$key] = $row;
}

// 3. 투표 데이터 포함
try {
$pollsCursor = $database->polls->find();
foreach ($pollsCursor as $poll) {
$pollId = "poll_" . ($poll['id'] ?? (string)$poll['_id']);
$firebaseData['polls'][$pollId] = [
"title" => $poll['title'] ?? '',
"email_sent" => $poll['email_sent'] ?? false
];
}

$optionsCursor = $database->poll_options->find();
foreach ($optionsCursor as $opt) {
$optId = "opt_" . ($opt['id'] ?? (string)$opt['_id']);
$firebaseData['poll_options'][$optId] = [
"poll_id" => "poll_" . ($opt['poll_id'] ?? ''),
"text" => $opt['option_text'] ?? ($opt['text'] ?? ''),
"votes" => $opt['votes'] ?? 0
];
}
} catch (Exception $e) {
// 투표 데이터 로드 실패 시 무시하거나 에러 기록
}

// 4. JSON 출력
echo json_encode($firebaseData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
echo json_encode(["error" => $e->getMessage()]);
}
?>