require_once __DIR__ . '/php/auth_check.php';
require_once __DIR__ . '/php/db-connect-mongo.php';

date_default_timezone_set('Asia/Seoul');

if (!isset($_GET['id']) || !isset($_GET['type'])) {
header("Location: account_edit.php");
exit;
}

$id = $_GET['id'];
$type = $_GET['type'];

$col_name = ($type === '수입') ? 'income_table' : 'expense_table';
$target_col = $database->$col_name;

// 기존 데이터 가져오기
try {
$tr = $target_col->findOne(['_id' => new MongoDB\BSON\ObjectId($id)]);
} catch (Exception $e) {
echo "<p>데이터 조회 중 오류 발생: " . $e->getMessage() . "</p>";
exit;
}

if (!$tr) {
echo "<p>데이터가 존재하지 않습니다.</p>";
exit;
}

// 수정 처리
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
$date = $_POST['date'];
$time = $_POST['time'] ?? '00:00';
$category = $_POST['category'];
$description = $_POST['description'];
$amount = intval($_POST['amount']);

$datetime = $date . ' ' . $time . ':00';

try {
$target_col->updateOne(
['_id' => new MongoDB\BSON\ObjectId($id)],
['$set' => [
'date' => $datetime,
'category' => $category,
'description' => $description,
'amount' => $amount,
'updated_at' => new MongoDB\BSON\UTCDateTime()
]]
);
header("Location: account_edit.php");
exit;
} catch (Exception $e) {
echo "<p>수정 중 오류 발생: " . $e->getMessage() . "</p>";
}
}

// 날짜와 시간 분리
$dt = strtotime($tr['date']);
$default_date = date('Y-m-d', $dt);
$default_time = date('H:i', $dt);
?>

<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>사용내역서 수정</title>

    <!-- 파비콘 아이콘들 -->
    <link rel="icon" href="/favicon.png?v=2" />
    <link rel="icon" type="image/png" sizes="36x36" href="/favicons/android-icon-36x36.png" />
    <link rel="icon" type="image/png" sizes="48x48" href="/favicons/android-icon-48x48.png" />
    <link rel="icon" type="image/png" sizes="72x72" href="/favicons/android-icon-72x72.png" />
    <link rel="apple-touch-icon" sizes="32x32" href="/favicons/apple-icon-32x32.png">
    <link rel="apple-touch-icon" sizes="57x57" href="/favicons/apple-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="/favicons/apple-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="/favicons/apple-icon-72x72.png">

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        /* 기존 account_input.php 디자인 그대로 가져오기 */
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px 0;
            min-height: 100vh;
        }

        .form-container {
            max-width: 600px;
            margin: 30px auto;
            background: #fff;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
            padding: 40px;
        }

        .form-container h1 {
            text-align: center;
            color: #333;
            font-weight: 700;
            margin-bottom: 30px;
            font-size: 28px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            font-weight: 600;
            color: #555;
            margin-bottom: 8px;
            display: block;
        }

        .form-control,
        .form-select {
            border-radius: 12px;
            border: 2px solid #e0e0e0;
            padding: 12px 16px;
            font-size: 15px;
            transition: all 0.3s ease;
        }

        .form-control:focus,
        .form-select:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        .btn-submit {
            width: 100%;
            padding: 14px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            margin-top: 10px;
        }

        .btn-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-back {
            display: block;
            margin: 20px auto 0;
            padding: 10px 30px;
            border-radius: 12px;
            background: #6c757d;
            color: white;
            text-decoration: none;
            text-align: center;
            font-weight: 600;
            max-width: 200px;
        }

        .btn-back:hover {
            background: #5a6268;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(108, 117, 125, 0.3);
            color: white;
        }
    </style>
</head>

<body>
    <div class="form-container">
        <h1>💰 사용내역서 수정</h1>
        <form method="POST" action="">
            <div class="form-group">
                <label for="date">📅 일자</label>
                <input type="date" class="form-control" id="date" name="date" value="<?= $default_date ?>" required>
            </div>
            <div class="form-group">
                <label for="time">🕐 시간</label>
                <input type="time" class="form-control" id="time" name="time" value="<?= $default_time ?>" required>
            </div>
            <div class="form-group">
                <label for="category">📝 항목</label>
                <input type="text" class="form-control" id="category" name="category"
                    value="<?= htmlspecialchars($tr['category']) ?>" required>
            </div>
            <div class="form-group">
                <label for="description">📌 비고</label>
                <input type="text" class="form-control" id="description" name="description"
                    value="<?= htmlspecialchars($tr['description']) ?>">
            </div>
            <div class="form-group">
                <label for="amount">💵 금액</label>
                <input type="number" class="form-control" id="amount" name="amount" value="<?= $tr['amount'] ?>"
                    required>
            </div>
            <button type="submit" class="btn-submit">수정 완료</button>
        </form>
        <a href="account_edit.php" class="btn-back">⏪ 되돌아가기</a>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>