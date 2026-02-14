<?php
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';

// ⭐ 관리자 인증
// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:

require_once __DIR__ . '/php/auth_check.php';
require_once __DIR__ . '/php/db-connect-mongo.php';

date_default_timezone_set('Asia/Seoul');

ob_start();

// ⭐⭐⭐ MongoDB 처리 (삭제) ⭐⭐⭐
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['delete'])) {
        $id = $_POST['delete'];
        $type = $_POST['type'];

        try {
            $col_name = ($type === '수입') ? 'income_table' : 'expense_table';
            $database->$col_name->deleteOne(['_id' => new MongoDB\BSON\ObjectId($id)]);

            // 현재 월 유지
            $redirectMonth = isset($_GET['month']) ? $_GET['month'] : date('n');
            header("Location: " . $_SERVER['PHP_SELF'] . "?month=" . $redirectMonth);
            exit;
        } catch (Exception $e) {
            echo "삭제 중 오류 발생: " . $e->getMessage();
        }
    }
}

// 현재 연도 + 선택월
$currentYear = isset($_GET['year']) ? intval($_GET['year']) : date('Y');
$currentMonth = isset($_GET['month']) ? intval($_GET['month']) : date('n');

// 날짜 포맷
function formatDateWithWeekday($datetime)
{
    if (empty($datetime) || $datetime === '0000-00-00 00:00:00')
        return '-';
    $ts = strtotime($datetime);
    if ($ts === false)
        return $datetime;

    $week = mb_substr("일월화수목금토", date('w', $ts), 1);
    // 모바일 등 좁은 화면을 위해 <br> 태그로 줄바꿈 처리 고려
    return date("y/m/d", $ts) . "<br>(" . $week . ") " . date("H:i", $ts);
}

/*  
======================================================
  🔹 [1] 1월~선택월까지 월별 누계 계산
======================================================
*/

// 해당 월의 마지막 날짜 구하기
$lastDay = date('t', strtotime("$currentYear-$currentMonth-01"));
$endOfPeriod = sprintf("%04d-%02d-%02d 23:59:59", $currentYear, $currentMonth, $lastDay);

// 수입 조회
$incomeAllCursor = $database->income_table->find(
    [
        'date' => [
            '$gte' => "$currentYear-01-01 00:00:00",
            '$lte' => $endOfPeriod
        ]
    ],
    ['projection' => ['date' => 1, 'amount' => 1], 'sort' => ['date' => 1]]
);
$incomeAll = iterator_to_array($incomeAllCursor);

// 지출 조회
$expenseAllCursor = $database->expense_table->find(
    [
        'date' => [
            '$gte' => "$currentYear-01-01 00:00:00",
            '$lte' => $endOfPeriod
        ]
    ],
    ['projection' => ['date' => 1, 'amount' => 1], 'sort' => ['date' => 1]]
);
$expenseAll = iterator_to_array($expenseAllCursor);

// 월별 배열 초기화
$monthlyIncomeTotals = array_fill(1, 12, 0);
$monthlyExpenseTotals = array_fill(1, 12, 0);

// 누계 저장
foreach ($incomeAll as $tr) {
    $m = (int) date('n', strtotime($tr['date']));
    $monthlyIncomeTotals[$m] += $tr['amount'];
}
foreach ($expenseAll as $tr) {
    $m = (int) date('n', strtotime($tr['date']));
    $monthlyExpenseTotals[$m] += $tr['amount'];
}

// 선택월 합계
$selectedMonthIncomeTotal = $monthlyIncomeTotals[$currentMonth];
$selectedMonthExpenseTotal = $monthlyExpenseTotals[$currentMonth];

// 선택월 월 결산
$monthlyBalance = $selectedMonthIncomeTotal - $selectedMonthExpenseTotal;

// 1~현재월까지 누계 합산
$yearIncomeTotal = 0;
$yearExpenseTotal = 0;

for ($i = 1; $i <= $currentMonth; $i++) {
    $yearIncomeTotal += $monthlyIncomeTotals[$i];
    $yearExpenseTotal += $monthlyExpenseTotals[$i];
}

$balance = $yearIncomeTotal - $yearExpenseTotal;

/*  
======================================================
  🔹 [2] 선택월 수입 / 지출 상세 조회
======================================================
*/
$startOfMonth = sprintf("%04d-%02d-01 00:00:00", $currentYear, $currentMonth);

// 수입
$incomeTransactionsCursor = $database->income_table->find(
    [
        'date' => [
            '$gte' => $startOfMonth,
            '$lte' => $endOfPeriod
        ]
    ],
    ['sort' => ['date' => 1]]
);
$incomeTransactions = iterator_to_array($incomeTransactionsCursor);

// 지출
$expenseTransactionsCursor = $database->expense_table->find(
    [
        'date' => [
            '$gte' => $startOfMonth,
            '$lte' => $endOfPeriod
        ]
    ],
    ['sort' => ['date' => 1]]
);
$expenseTransactions = iterator_to_array($expenseTransactionsCursor);
?>
<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>사용내역서편집</title>

    <!-- 파비콘 아이콘들 -->
    <link rel="icon" href="/favicon.png?v=2" />
    <link rel="icon" type="image/png" sizes="36x36" href="./favicons/2/android-icon-36x36.png" />
    <link rel="icon" type="image/png" sizes="48x48" href="./favicons/2/android-icon-48x48.png" />
    <link rel="icon" type="image/png" sizes="72x72" href="./favicons/2/android-icon-72x72.png" />
    <link rel="apple-touch-icon" sizes="32x32" href="./favicons/2/apple-icon-32x32.png">
    <link rel="apple-touch-icon" sizes="57x57" href="./favicons/2/apple-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="./favicons/2/apple-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="./favicons/2/apple-icon-72x72.png">


    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

    <style>
        /* 테이블 기본 설정 */
        .table th,
        .table td {
            text-align: center;
            vertical-align: middle;
            padding: 0.4rem;
            /* 패딩 축소 */
            font-size: 0.9rem;
            /* 글자 크기 약간 축소 */
        }

        /* 칼럼 너비 조정 (데스크탑/모바일 공통 최적화) */
        .col-no {
            width: 32px;
        }

        /* NO: 최소 폭 */
        .col-date {
            width: 75px;
        }

        /* 일자: 줄바꿈 허용으로 폭 줄임 */
        .col-manage {
            width: 70px;
        }

        /* 관리: 버튼 들어갈 최소 폭 */
        .col-amount {
            width: 88px;
            /* 금액: 10,000,000원 기준 최소 폭 */
            text-align: right !important;
            white-space: nowrap;
            /* 금액 줄바꿈 방지 */
            font-weight: 600;
        }

        /* 항목, 비고는 남은 공간 자동 차지 */
        .col-category,
        .col-desc {
            width: auto;
        }

        /* 버튼 간격 조정 */
        .btn-sm {
            padding: 0.2rem 0.4rem;
            font-size: 0.75rem;
            margin: 1px;
        }

        .month-selector a {
            margin: 5px 1px 3px 1px;
        }

        .month-selector a.active {
            background: #007bff;
            color: #fff;
        }

        /* 소제목 버튼형태 */
        .section-title {
            display: block;
            width: 100%;
            padding: 10px 0;
            margin: 20px 0 10px 0;
            border-radius: 12px;
            background-color: #e3f2fd;
            color: #333;
            font-weight: 600;
            text-align: center;
            font-size: 1.1rem;
        }

        /* 하단 결산 폰트 크기 조정 (3번 요구사항: 기존 h5 대비 2px 축소) */
        .balance-box-text {
            font-size: 1.1rem !important;
            font-weight: 700;
        }

        /* 하단 버튼 커스텀 (4번 요구사항: 크기 키움, 폰트 +3px) */
        .btn-custom-lg {
            padding: 10px 5px !important;
            font-size: 0.8rem !important;
            /* 기존 btn-sm 대비 대폭 확대 */
            font-weight: 600;
        }

        /* 모바일 반응형 미세 조정 */
        @media(max-width:576px) {

            .table th,
            .table td {
                font-size: 0.8rem;
                padding: 0.2rem;
            }

            .col-no {
                width: 26px;
            }

            .col-date {
                width: 62px;
            }

            .col-manage {
                width: 65px;
            }

            .col-amount {
                width: 78px;
                font-size: 0.8rem;
                white-space: nowrap;
            }

            /* 관리 버튼 세로 배치 */
            .col-manage form {
                display: block !important;
                margin: 2px 0;
            }

            .section-title {
                font-size: 1rem;
                padding: 8px 0;
            }

            .month-selector a {
                font-size: 0.9rem;
                padding: 0.2rem 0.6rem;
            }
        }
    </style>
</head>

<body>
    <div class="container-fluid p-2"> <!-- 좌우 여백 최소화 -->

        <!-- 오늘 날짜 -->
        <div class="text-center mt-3 mb-3">
            오늘의 날짜: <?= date("Y/m/d H:i") ?>
        </div>

        <!-- 년도 선택 (드롭다운) -->
        <div class="dropdown text-center mb-2">
            <button class="btn btn-dark btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown"
                aria-expanded="false">
                <?= $currentYear ?>년 선택
            </button>
            <ul class="dropdown-menu dropdown-menu-dark">
                <?php
                $baseYear = date('Y');
                for ($y = $baseYear; $y >= $baseYear - 3; $y--):
                    ?>
                    <li><a class="dropdown-item <?= ($y == $currentYear ? 'active' : '') ?>"
                            href="?year=<?= $y ?>&month=1"><?= $y ?>년</a></li>
                <?php endfor; ?>
            </ul>
        </div>

        <!-- 월 선택 -->
        <div class="month-selector text-center mb-2">
            <?php for ($m = 1; $m <= 12; $m++): ?>
                <a class="btn <?= ($m == $currentMonth ? 'btn-primary active' : 'btn-secondary') ?>"
                    href="?year=<?= $currentYear ?>&month=<?= $m ?>"><?= $m ?>월</a>
            <?php endfor; ?>
        </div>

        <!-- 안내문구 (1번 요구사항: 12px) -->
        <div class="alert alert-info text-center mb-3" style="font-size: 12px;">
            📌 합계가 이상하면 월 버튼을 다시 눌러 갱신하세요!
        </div>

        <!-- ✔ 수입 목록 -->
        <span class="section-title mt-4">[수입 목록]</span>

        <div class="table-responsive">
            <table class="table table-bordered table-striped mb-0">
                <thead class="table-light">
                    <tr>
                        <th class="col-no">NO</th>
                        <th class="col-date">일자</th>
                        <th class="col-category">항목</th>
                        <th class="col-desc">비고</th>
                        <th class="col-amount">금액</th>
                        <th class="col-manage">관리</th>
                    </tr>
                </thead>

                <tbody>
                    <?php if (empty($incomeTransactions)): ?>
                        <tr>
                            <td colspan="6">데이터가 없습니다.</td>
                        </tr>
                    <?php else:
                        $cnt = 1; ?>
                        <?php foreach ($incomeTransactions as $tr): ?>
                            <tr>
                                <td><?= $cnt++ ?></td>
                                <td><?= formatDateWithWeekday($tr['date']) ?></td>
                                <td><?= htmlspecialchars($tr['category']) ?></td>
                                <td class="text-start"><?= htmlspecialchars($tr['description']) ?></td>
                                <td class="col-amount"><?= number_format($tr['amount']) ?>원</td>
                                <td class="col-manage">
                                    <form method="GET" action="account_edit_form.php" style="display:inline;">
                                        <input type="hidden" name="id" value="<?= (string) $tr['_id'] ?>">
                                        <input type="hidden" name="type" value="수입">
                                        <button class="btn btn-primary btn-sm">수정</button>
                                    </form>

                                    <form method="POST" style="display:inline;" onsubmit="return confirm('삭제하시겠습니까?');">
                                        <input type="hidden" name="type" value="수입">
                                        <button name="delete" value="<?= (string) $tr['_id'] ?>"
                                            class="btn btn-danger btn-sm">삭제</button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>

                <tfoot>
                    <tr>
                        <td colspan="4" class="text-end"><strong>월수입 합계:</strong></td>
                        <td colspan="2" class="col-amount text-end">
                            <strong><?= number_format($selectedMonthIncomeTotal) ?>원</strong>
                        </td>
                    </tr>

                    <tr>
                        <td colspan="4" class="text-end"><strong>월수입 누계(1~<?= $currentMonth ?>월):</strong></td>
                        <td colspan="2" class="col-amount text-end">
                            <strong><?= number_format($yearIncomeTotal) ?>원</strong>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- ✔ 지출 목록 -->
        <span class="section-title mt-4">[지출 목록]</span>

        <div class="table-responsive">
            <table class="table table-bordered table-striped mb-0">
                <thead class="table-light">
                    <tr>
                        <th class="col-no">NO</th>
                        <th class="col-date">일자</th>
                        <th class="col-category">항목</th>
                        <th class="col-desc">비고</th>
                        <th class="col-amount">금액</th>
                        <th class="col-manage">관리</th>
                    </tr>
                </thead>

                <tbody>
                    <?php if (empty($expenseTransactions)): ?>
                        <tr>
                            <td colspan="6">데이터가 없습니다.</td>
                        </tr>
                    <?php else:
                        $cnt = 1; ?>
                        <?php foreach ($expenseTransactions as $tr): ?>
                            <tr>
                                <td><?= $cnt++ ?></td>
                                <td><?= formatDateWithWeekday($tr['date']) ?></td>
                                <td><?= htmlspecialchars($tr['category']) ?></td>
                                <td class="text-start"><?= htmlspecialchars($tr['description']) ?></td>
                                <td class="col-amount"><?= number_format($tr['amount']) ?>원</td>
                                <td class="col-manage">
                                    <form method="GET" action="account_edit_form.php" style="display:inline;">
                                        <input type="hidden" name="id" value="<?= (string) $tr['_id'] ?>">
                                        <input type="hidden" name="type" value="지출">
                                        <button class="btn btn-primary btn-sm">수정</button>
                                    </form>

                                    <form method="POST" style="display:inline;" onsubmit="return confirm('삭제하시겠습니까?');">
                                        <input type="hidden" name="type" value="지출">
                                        <button name="delete" value="<?= (string) $tr['_id'] ?>"
                                            class="btn btn-danger btn-sm">삭제</button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>

                <tfoot>
                    <tr>
                        <td colspan="4" class="text-end"><strong>월지출 합계:</strong></td>
                        <td colspan="2" class="col-amount text-end">
                            <strong><?= number_format($selectedMonthExpenseTotal) ?>원</strong>
                        </td>
                    </tr>

                    <tr>
                        <td colspan="4" class="text-end"><strong>월지출 누계(1~<?= $currentMonth ?>월):</strong></td>
                        <td colspan="2" class="col-amount text-end">
                            <strong><?= number_format($yearExpenseTotal) ?>원</strong>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- ✔ 월 결산 + 총잔액 (2번, 3번 요구사항 반영) -->
        <div class="text-end mt-4 mb-4">
            <div class="balance-box-text">
                월결산액:
                <!-- 0 이상 파랑, 마이너스 빨강 -->
                <span class="<?= ($monthlyBalance >= 0 ? 'text-primary' : 'text-danger') ?>">
                    <?= number_format($monthlyBalance) ?>원
                </span>
                &nbsp;&nbsp;

                총잔액(누적):
                <span class="<?php
                echo ($balance > 0 ? 'text-danger' : ($balance < 0 ? 'text-primary' : 'text-secondary'));
                ?>">
                    <?= number_format($balance) ?>원
                </span>
            </div>
        </div>

        <!-- 버튼 (4번 요구사항: 2행 배치, 크기 확대) -->
        <div class="d-flex flex-column align-items-center gap-3 mb-5">
            <!-- 1행: 영수증 버튼 2개 -->
            <div class="d-flex justify-content-center gap-2 w-100">
                <a href="./images_view.php" class="btn btn-success btn-custom-lg flex-fill text-center">영수증 사진보기</a>
                <a href="./images_upload.php" class="btn btn-success btn-custom-lg flex-fill text-center">영수증 입력하기</a>
            </div>
            <!-- 2행: 돌아가기 버튼 -->
            <div class="w-100 text-center">
                <a href="./select.php" class="btn btn-secondary btn-custom-lg w-100">⏪ 돌아가기</a>
            </div>
        </div>

    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>

<?php ob_end_flush(); ?>