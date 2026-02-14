<?php
// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
require_once __DIR__ . '/php/db-connect-mongo.php';

$memberIds = $_GET['members'] ?? '';
$year = isset($_GET['year']) ? (int) $_GET['year'] : (int) date('Y');
$todayYear = (int) date('Y');
$todayMonth = (int) date('n');

if (!$memberIds) {
  die('선택된 회원이 없습니다.');
}

// 1. 선택된 회원 정보 가져오기
$idArr = explode(',', $memberIds); // MongoDB _id strings
$objectIds = array_map(function ($id) {
  return new MongoDB\BSON\ObjectId($id); }, $idArr);

$membersCursor = $database->members->find(['_id' => ['$in' => $objectIds]], ['sort' => ['name' => 1]]);
$members = iterator_to_array($membersCursor);

// 2. 월회비 이력 가져오기 (PHP 함수)
function getMonthlyFee($database, $year, $month)
{
  $row = $database->monthly_fee_history->findOne(
    [
      '$or' => [
        ['apply_year' => ['$lt' => $year]],
        ['apply_year' => $year, 'apply_month' => ['$lte' => $month]]
      ]
    ],
    ['sort' => ['apply_year' => -1, 'apply_month' => -1]]
  );
  return $row ? (int) $row['fee_amount'] : 20000;
}

// 납부 데이터 미리 가져오기
$passDataCursor = $database->account_pass->find([
  'member_id' => ['$in' => $idArr],
  'pay_year' => $year
]);
$passDataMap = [];
foreach ($passDataCursor as $p) {
  $passDataMap[(string) $p['member_id']][(int) $p['pay_month']] = (int) $p['paid'];
}

// 3. 회원별 미납 내역 계산
$memberUnpaidInfo = []; // [회원ID => ['months'=>"1월,3월", 'total'=>50000]]

foreach ($members as $mem) {
  $m_id_str = (string) $mem['_id'];
  $unpaidMonths = [];
  $unpaidTotal = 0;

  $paidData = $passDataMap[$m_id_str] ?? [];

  for ($m = 1; $m <= 12; $m++) {
    // 미래 월은 제외 (현재 연도일 경우)
    if ($year == $todayYear && $m > $todayMonth)
      continue;
    if ($year > $todayYear)
      continue;

    // 해당 월에 데이터가 있고, paid가 1이면 납부 완료
    $isPaid = isset($paidData[$m]) && $paidData[$m] == 1;

    if (!$isPaid) {
      $fee = getMonthlyFee($database, $year, $m);
      $unpaidMonths[] = "{$m}월";
      $unpaidTotal += $fee;
    }
  }

  // 결과 저장
  $memberUnpaidInfo[$m_id_str] = [
    'name' => $mem['name'],
    'tel' => $mem['tel'] ?? '',
    'months' => !empty($unpaidMonths) ? implode(',', $unpaidMonths) : '없음',
    'total' => $unpaidTotal
  ];
}
?>

  <!DOCTYPE html>
  <html lang="ko">

  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>미납자 문자 발송</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <style>
      /* 기존 스타일 유지 */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        font-family: 'Noto Sans KR', sans-serif;
      }

      .main-container {
        max-width: 900px;
        margin: 0 auto;
      }

      .header-section {
        background: white;
        padding: 40px 20px 30px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .header-section h4 {
        font-size: 1.8rem;
        font-weight: 800;
        color: #667eea;
        margin: 0;
      }

      .content-section {
        padding: 20px 15px;
      }

      .card {
        border-radius: 16px;
        border: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        margin-bottom: 20px;
        overflow: hidden;
      }

      .card-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: 700;
        font-size: 1.1rem;
        padding: 15px 20px;
      }

      .card-body {
        padding: 20px;
        background: white;
      }

      .form-check {
        padding: 12px 15px;
        background: #f8f9fa;
        border-radius: 10px;
        margin-bottom: 10px !important;
      }

      .form-check-input {
        width: 22px;
        height: 22px;
        margin-top: 0;
        cursor: pointer;
        border: 2px solid #667eea;
      }

      .form-check-input:checked {
        background-color: #667eea;
        border-color: #667eea;
      }

      .form-check-label {
        cursor: pointer;
        font-size: 1rem;
        font-weight: 500;
        color: #333;
        margin-left: 8px;
      }

      textarea.form-control {
        border: 2px solid #e0e0e0;
        border-radius: 12px;
        padding: 15px;
        font-size: 1rem;
        line-height: 1.7;
        min-height: 280px;
      }

      textarea.form-control:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
      }

      .button-section {
        padding: 20px 15px 30px;
        text-align: center;
      }

      .btn {
        border-radius: 12px;
        padding: 14px 32px;
        font-size: 1.05rem;
        font-weight: 700;
        margin: 5px;
      }

      .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
      }

      .btn-secondary {
        background: #6c757d;
        color: white;
        border: none;
      }

      @media (max-width: 768px) {
        .header-section {
          padding: 35px 15px 25px;
        }

        .btn {
          width: 100%;
          max-width: 300px;
          margin: 5px 0;
        }
      }
    </style>
  </head>

  <body>

    <div class="main-container">
      <div class="header-section">
        <h4>📩 미납자 문자 발송</h4>
      </div>

      <div class="content-section">
        <form id="smsForm">
          <!-- 회원 선택 -->
          <div class="card">
            <div class="card-header">문자 발송 대상 선택</div>
            <div class="card-body">
          <?php foreach ($members as $m):
            $m_id_str = (string) $m['_id'];
            $info = $memberUnpaidInfo[$m_id_str];
            ?>
              <div class="form-check">
                  <input class="form-check-input sms-check" type="checkbox" value="<?= htmlspecialchars($m['tel'] ?? '') ?>"
                    data-name="<?= htmlspecialchars($m['name']) ?>" data-months="<?= $info['months'] ?>"
                    data-total="<?= $info['total'] ?>" id="m<?= $m_id_str ?>" checked>
                  <label class="form-check-label" for="m<?= $m_id_str ?>">
                  <?= htmlspecialchars($m['name']) ?> (<?= htmlspecialchars($m['tel'] ?? '') ?>)
                  <br><small class="text-danger">미납: <?= number_format($info['total']) ?>원 (<?= $info['months'] ?>)</small>
                </label>
              </div>
          <?php endforeach; ?>
        </div>
      </div>

      <!-- 문자 내용 -->
      <div class="card">
        <div class="card-header">문자 내용</div>
        <div class="card-body">
          <textarea id="smsMessage" class="form-control" placeholder="내용이 자동으로 생성됩니다."></textarea>
        </div>
      </div>
    </form>
  </div>

  <div class="button-section">
    <button type="button" class="btn btn-primary" onclick="sendSMS()">📤 문자 보내기</button>
    <a href="account_pass.php?year=<?= $year ?>" class="btn btn-secondary">⏪ 돌아가기</a>
  </div>
</div>

<script>
// 📝 메시지 자동 업데이트 (원하시는 포맷 적용)
function updateMessage() {
    const checked = document.querySelectorAll('.sms-check:checked');
    const textArea = document.getElementById('smsMessage');

    if (checked.length === 0) {
        textArea.value = '';
        return;
    }

    // 선택된 회원들의 메시지 생성
    const memberDetails = Array.from(checked).map(el => {
        const name = el.dataset.name;
        const months = el.dataset.months;
        const total = parseInt(el.dataset.total).toLocaleString();
        
        // 미납이 없는 경우 (0원)
        if (el.dataset.total == 0) return null;

        // 🔥 요청하신 포맷 (대괄호, 줄바꿈 등 정확히 적용)
        return `[📩 직지황악회 발송] 미납금 안내문자 입니다.\n\n 💞[${name}]님이 <?= $year ?>년도 [${months}]분\n월회비(합계:${total}원)를 아직 미납중입니다.`;
    }).filter(msg => msg !== null);

    if (memberDetails.length === 0) {
        textArea.value = "선택하신 회원들은 미납 내역이 없습니다.";
        return;
    }

    const messageBody = memberDetails.join('\n\n'); // 회원 간 두 줄 띄움
    
    const footer = `
이른 시일 내에 입금해주시면 감사하겠습니다.

입금은행: ㅇㅇ은행
예금주: ㅇㅇㅇ
계좌번호: xxx-xxxx-xxxx-xxx`;

    textArea.value = messageBody + "\n" + footer;
}

// 체크박스 변경 시 업데이트 연결
document.querySelectorAll('.sms-check').forEach(ch => {
    ch.addEventListener('change', updateMessage);
});

// 초기 실행
updateMessage();

// 📤 SMS 발송
function sendSMS() {
    const checked = document.querySelectorAll('.sms-check:checked');
    
    if (checked.length === 0) { alert('문자를 보낼 회원을 선택하세요.'); return; }

    const msg = document.getElementById('smsMessage').value.trim();
    if (!msg) { alert('문자 내용을 입력하세요.'); return; }

    const numbers = Array.from(checked)
        .map(el => el.value.replace(/[^0-9]/g, ''))
        .filter(num => num.length > 0)
        .join(',');

    if (!numbers) { alert('유효한 전화번호가 없습니다.'); return; }

    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    let smsLink = isIOS 
        ? `sms:${numbers}&body=${encodeURIComponent(msg)}` 
        : `sms:${numbers}?body=${encodeURIComponent(msg)}`;

    window.location.href = smsLink;
}
</script>

</body>
</html>