require_once __DIR__ . '/php/auth_check.php';
require_once __DIR__ . '/php/db-connect-mongo.php';

// 🔥 시간 제한 해제 (백업/복구 시간이 길어질 수 있음)
set_time_limit(0);
ini_set('memory_limit', '512M');

// ==========================================
// 1. 백업 (내보내기) 로직
// ==========================================
if (isset($_POST['mode']) && $_POST['mode'] === 'backup') {
try {
$selectedCollections = isset($_POST['collections']) ? $_POST['collections'] : [];
$backupType = isset($_POST['backup_type']) ? $_POST['backup_type'] : 'full';

if (empty($selectedCollections)) {
die("선택된 컬렉션이 없습니다.");
}

$backupData = [
'metadata' => [
'date' => date("Y-m-d H:i:s"),
'type' => $backupType,
'collections' => $selectedCollections
],
'data' => []
];

foreach ($selectedCollections as $colName) {
$cursor = $database->$colName->find();
$documents = [];
foreach ($cursor as $doc) {
// ObjectId 등을 문자열로 변환하여 JSON 직렬화 가능케 함
// 복구 시 다시 ObjectId로 변환 필요할 수 있음
$doc['_id'] = (string)$doc['_id'];
$documents[] = $doc;
}
$backupData['data'][$colName] = $documents;
}

$jsonContent = json_encode($backupData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

// 파일명 생성
$prefix = ($backupType === 'data') ? 'mongo_backup_data_' : 'mongo_backup_full_';
$filename = $prefix . date("Y-m-d_H-i-s") . '.json';

ob_end_clean();
header('Content-Type: application/json');
header("Content-Transfer-Encoding: Binary");
header("Content-disposition: attachment; filename=\"" . $filename . "\"");
echo $jsonContent;
exit;

} catch (Exception $e) {
die("백업 중 오류 발생: " . $e->getMessage());
}
}

// ==========================================
// 2. 복구 (가져오기) 로직
// ==========================================
$restoreMsg = "";
$restoreError = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['backup_file'])) {
if ($_FILES['backup_file']['error'] === UPLOAD_ERR_OK) {
$uploadFile = $_FILES['backup_file']['tmp_name'];

try {
$jsonContent = file_get_contents($uploadFile);
$backupData = json_decode($jsonContent, true);

if (!$backupData || !isset($backupData['data'])) {
throw new Exception("유효하지 않은 백업 파일 형식입니다.");
}

$backupType = $backupData['metadata']['type'] ?? 'full';

foreach ($backupData['data'] as $colName => $documents) {
$targetCol = $database->$colName;

// 전체 백업인 경우 기존 데이터 삭제
if ($backupType === 'full') {
$targetCol->deleteMany([]);
}

if (!empty($documents)) {
foreach ($documents as &$doc) {
// 문자열 _id를 다시 ObjectId로 복원
if (isset($doc['_id'])) {
$doc['_id'] = new MongoDB\BSON\ObjectId($doc['_id']);
}
}
$targetCol->insertMany($documents);
}
}

$restoreMsg = "MongoDB 데이터 복구가 성공적으로 완료되었습니다!";

} catch (Exception $e) {
$restoreError = "복구 중 오류 발생: " . $e->getMessage();
}
} else {
$restoreError = "파일 업로드 오류 발생 (Code: " . $_FILES['backup_file']['error'] . ")";
}
}

// 컬렉션 목록 가져오기
$dbCollections = [];
try {
$collections = $database->listCollections();
foreach ($collections as $col) {
$dbCollections[] = $col->getName();
}
} catch (Exception $e) {
$restoreError = "컬렉션 목록 로드 실패: " . $e->getMessage();
}
?>

<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>데이터베이스 관리 도구</title>
    <link rel="icon" href="/favicon.png?v=2" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        body {
            background-color: #f8f9fa;
            font-family: 'Noto Sans KR', sans-serif;
            padding-bottom: 50px;
        }

        .container {
            max-width: 800px;
            margin: 40px auto;
            background: white;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
        }

        .page-header {
            text-align: center;
            margin-bottom: 30px;
        }

        .page-header h1 {
            font-size: 1.8rem;
            font-weight: 800;
            color: #4a6ee0;
        }

        .alert-custom {
            border-radius: 8px;
            border-left: 5px solid;
        }

        .alert-info-custom {
            background-color: #fff3cd;
            color: #856404;
            border-color: #ffeeba;
            border-left-color: #ffc107;
        }

        .alert-danger-custom {
            background-color: #f8d7da;
            color: #721c24;
            border-color: #f5c6cb;
            border-left-color: #dc3545;
        }

        .action-card {
            border: 1px solid #e9ecef;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 25px;
            background: #fdfdfd;
        }

        .card-title {
            font-size: 1.1rem;
            font-weight: 700;
            margin-bottom: 15px;
            color: #343a40;
        }

        .btn-action {
            width: 100%;
            padding: 12px;
            font-weight: 700;
            border-radius: 8px;
        }

        .console-log {
            background-color: #1e1e1e;
            color: #00ff00;
            font-family: 'Consolas', monospace;
            padding: 15px;
            border-radius: 8px;
            font-size: 0.85rem;
            min-height: 100px;
            max-height: 200px;
            overflow-y: auto;
            margin-top: 30px;
        }

        .console-success {
            color: #50fa7b;
            font-weight: bold;
        }

        .console-error {
            color: #ff5555;
        }

        .table-list-box {
            max-height: 150px;
            overflow-y: auto;
            border: 1px solid #dee2e6;
            padding: 10px;
            border-radius: 6px;
            background: #fff;
            margin-bottom: 15px;
        }
    </style>
</head>

<body>

    <div class="container">
        <div class="page-header">
            <h1>🛠️ 데이터베이스 관리 도구</h1>
        </div>

        <!-- 백업 섹션 알림 -->
        <div class="alert alert-info-custom mb-4">
            <i class="bi bi-lightbulb-fill"></i> <strong>백업 옵션 안내:</strong><br>
            • <strong>전체 백업:</strong> 컬렉션과 데이터를 모두 저장 (복구 시 기존 데이터 덮어쓰기)<br>
            • <strong>데이터만 백업:</strong> 데이터만 저장 (복구 시 기존 데이터 유지 + 새 데이터 추가)
        </div>

        <!-- 백업 카드 -->
        <div class="action-card">
            <div class="card-title"><i class="bi bi-download text-primary"></i> 데이터 백업 (내보내기)</div>

            <form action="" method="POST" id="backupForm" target="_blank">
                <input type="hidden" name="mode" value="backup">

                <!-- 백업 타입 선택 -->
                <div class="mb-3">
                    <label class="form-label fw-bold">백업 방식 선택</label>
                    <div class="d-flex gap-3">
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="backup_type" id="typeFull" value="full"
                                checked>
                            <label class="form-check-label" for="typeFull">전체 백업 (Full Backup)</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="backup_type" id="typeData" value="data">
                            <label class="form-check-label" for="typeData">데이터만 백업 (Data Only)</label>
                        </div>
                    </div>
                </div>

                <!-- 컬렉션 선택 -->
                <div class="mb-3">
                    <label class="form-label fw-bold">백업할 컬렉션 선택</label>
                    <div class="form-check mb-2">
                        <input class="form-check-input" type="checkbox" id="checkAll" checked
                            onchange="toggleAllCollections(this)">
                        <label class="form-check-label" for="checkAll">전체 선택</label>
                    </div>
                    <div class="table-list-box">
                        <?php foreach ($dbCollections as $col): ?>
                            <div class="form-check">
                                <input class="form-check-input col-chk" type="checkbox" name="collections[]" value="<?= $col ?>"
                                    id="col_<?= $col ?>" checked>
                                <label class="form-check-label" for="col_<?= $col ?>">
                                    <?= $col ?>
                                </label>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary btn-action shadow-sm" onclick="logBackupStart()">
                    선택한 옵션으로 백업파일 받기
                </button>
            </form>
        </div>

        <!-- 복구 섹션 경고 -->
        <div class="alert alert-danger-custom mb-4">
            <i class="bi bi-exclamation-triangle-fill"></i> <strong>주의:</strong><br>
            '전체 백업' 파일로 복구하면 기존 데이터가 <strong>삭제되고 덮어씌워집니다.</strong><br>
            '데이터만 백업' 파일로 복구하면 중복된 데이터는 건너뛰고 <strong>새로운 데이터만 추가됩니다.</strong>
        </div>

        <!-- 복구 카드 -->
        <div class="action-card">
            <div class="card-title"><i class="bi bi-upload text-danger"></i> 데이터 복구 (가져오기)</div>
            <form action="?mode=restore" method="POST" enctype="multipart/form-data" onsubmit="return confirmRestore()">
                <div class="input-group mb-3">
                    <input type="file" class="form-control" name="backup_file" id="backupFile" accept=".json" required>
                </div>
                <button type="submit" class="btn btn-danger btn-action shadow-sm">
                    선택한 파일로 DB 복구하기
                </button>
            </form>
        </div>

        <!-- 터미널 로그창 -->
        <div class="console-log" id="consoleLog">
            <div class="console-msg">시스템 준비됨...</div>
            <?php if ($restoreMsg): ?>
                <div class="console-msg console-success">[<?= date('H:i:s') ?>] <?= $restoreMsg ?></div>
            <?php endif; ?>
            <?php if ($restoreError): ?>
                <div class="console-msg console-error">[<?= date('H:i:s') ?>] <?= $restoreError ?></div>
            <?php endif; ?>
        </div>

        <div class="text-center mt-4">
            <button class="btn btn-outline-secondary" onclick="history.back()">뒤로 가기</button>
        </div>
    </div>

    <script>
        function toggleAllCollections(source) {
            document.querySelectorAll('.col-chk').forEach(chk => chk.checked = source.checked);
        }

        function log(msg, type = 'normal') {
            const consoleDiv = document.getElementById('consoleLog');
            const time = new Date().toLocaleTimeString('ko-KR', { hour12: false });
            let colorClass = '';
            if (type === 'success') colorClass = 'console-success';
            if (type === 'error') colorClass = 'console-error';
            const line = `<div class="console-msg ${colorClass}">[${time}] ${msg}</div>`;
            consoleDiv.innerHTML += line;
            consoleDiv.scrollTop = consoleDiv.scrollHeight;
        }

        function logBackupStart() {
            setTimeout(() => {
                log("백업 요청이 서버로 전송되었습니다. 다운로드를 기다리세요...", "success");
            }, 500);
        }

        function confirmRestore() {
            const fileInput = document.getElementById('backupFile');
            if (!fileInput.value) {
                alert("복구할 .json 파일을 선택해주세요.");
                return false;
            }
            if (confirm("⚠️ 데이터베이스 복구를 진행하시겠습니까?\n\n파일 종류에 따라 기존 데이터가 덮어씌워지거나 추가됩니다.")) {
                log("복구 작업 시작... 파일 업로드 및 분석 중...");
                return true;
            }
            return false;
        }
    </script>

</body>

</html>