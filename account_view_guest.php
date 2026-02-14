<?php
// account_view.php
require_once __DIR__ . '/php/db-connect-mongo.php';

date_default_timezone_set('Asia/Seoul');

// 연도 + 선택월
$currentYear = isset($_GET['year']) ? intval($_GET['year']) : date('Y');
$currentMonth = isset($_GET['month']) ? intval($_GET['month']) : date('n');

// 날짜 포맷 함수
function formatDateWithWeekday($datetime)
{
    if (!$datetime || $datetime === '0000-00-00 00:00:00')
        return '-';
    $ts = strtotime($datetime);
    if ($ts === false)
        return $datetime;
    $week = mb_substr("일월화수목금토", date('w', $ts), 1);
    return date("Y/m/d", $ts) . "($week) " . date("H:i", $ts);
}

/* ======================================================
    🔹 1) 1~현재월 수입/지출 전체 조회
====================================================== */

// 해당 월의 마지막 날짜 구하기
$lastDay = date('t', strtotime("$currentYear-$currentMonth-01"));
$endOfPeriod = sprintf("%04d-%02d-%02d 23:59:59", $currentYear, $currentMonth, $lastDay);

// 수입
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

// 지출
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

// 월별 합계
$monthlyIncomeTotals = array_fill(1, 12, 0);
$monthlyExpenseTotals = array_fill(1, 12, 0);

foreach ($incomeAll as $tr) {
    $m = (int) date('n', strtotime($tr['date']));
    $monthlyIncomeTotals[$m] += $tr['amount'];
}
foreach ($expenseAll as $tr) {
    $m = (int) date('n', strtotime($tr['date']));
    $monthlyExpenseTotals[$m] += $tr['amount'];
}

// 선택 월 합계
$selectedMonthIncomeTotal = $monthlyIncomeTotals[$currentMonth];
$selectedMonthExpenseTotal = $monthlyExpenseTotals[$currentMonth];

// 월결산액
$monthlyBalance = $selectedMonthIncomeTotal - $selectedMonthExpenseTotal;

// 연간 누계
$yearIncomeTotal = 0;
$yearExpenseTotal = 0;
for ($i = 1; $i <= $currentMonth; $i++) {
    $yearIncomeTotal += $monthlyIncomeTotals[$i];
    $yearExpenseTotal += $monthlyExpenseTotals[$i];
}

// 총잔액
$balance = $yearIncomeTotal - $yearExpenseTotal;


/* ======================================================
    🔹 2) 선택월 상세 조회
====================================================== */
$startOfMonth = sprintf("%04d-%02d-01 00:00:00", $currentYear, $currentMonth);

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
    <title>사용내역서보기</title>

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
        /* 기본 테이블 */
        .table th,
        .table td {
            text-align: center;
            vertical-align: middle;
        }

        .amount-column {
            text-align: right;
        }

        /* 월 선택 버튼 */
        .month-selector a {
            margin: 5px 1px 1px 1px;
        }

        .month-selector a.active {
            background: #007bff;
            color: white;
        }

        /* 안내 박스 - 폰트 크기 12px로 수정 (1번 요구사항) */
        .alert-info {
            background: #d1ecf1;
            font-size: 12px;
        }

        /* 소제목 */
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

        /* 반응형 */
        .table-responsive {
            width: 100%;
            overflow-x: auto;
        }

        /* 하단 결산 영역 - 폰트 크기 2px 축소 (4번 요구사항: 1.3rem -> 1.15rem) */
        .balance-box {
            display: flex;
            justify-content: center;
            gap: 30px;
            font-size: 1.15rem;
            font-weight: 700;
            margin: 25px 0;
            text-align: center;
        }

        /* 하단 결산 영역 숫자 - 폰트 크기 2px 축소 (4번 요구사항: 1.35rem -> 1.25rem) */
        .balance-item span {
            font-size: 1.25rem;
        }

        /* 툴팁을 적용할 텍스트에 커서 스타일 추가 */
        .balance-item [data-bs-toggle="tooltip"] {
            cursor: pointer;
            text-decoration: underline dotted;
        }

        /* 계산기 스타일 */
        .calc-container {
            max-width: 320px;
            margin: 40px auto;
            padding: 15px;
            background: #fff;
            border-radius: 20px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border: 1px solid #eee;
        }

        .calc-display {
            width: 100%;
            height: 60px;
            background: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 12px;
            margin-bottom: 15px;
            text-align: right;
            padding: 10px 15px;
            font-size: 1.6rem;
            font-weight: 700;
            color: #333;
            outline: none;
        }

        .calc-buttons {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
        }

        .calc-btn {
            padding: 15px 0;
            border-radius: 12px;
            border: 1px solid #eee;
            background: #fff;
            font-size: 1.2rem;
            font-weight: 700;
            color: #444;
            transition: all 0.2s;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }

        .calc-btn:active {
            transform: scale(0.95);
            background: #f1f1f1;
        }

        .calc-btn.operator {
            background: #e3f2fd;
            color: #007bff;
            border-color: #bbdefb;
        }

        .calc-btn.equals {
            background: #007bff;
            color: #fff;
            border-color: #007bff;
            grid-column: span 2;
        }

        .calc-btn.clear {
            background: #ffebee;
            color: #f44336;
            border-color: #ffcdd2;
        }

        /* PC 기본 컬럼 너비 */
        .table th:nth-child(1),
        .table td:nth-child(1) {
            width: 50px;
        }

        /* NO */
        .table th:nth-child(2),
        .table td:nth-child(2) {
            width: 180px;
        }

        /* 일자 */
        .table th:nth-child(3),
        .table td:nth-child(3) {
            width: auto;
        }

        /* 항목 */
        .table th:nth-child(4),
        .table td:nth-child(4) {
            width: auto;
        }

        /* 비고 */
        .table th:nth-child(5),
        .table td:nth-child(5) {
            width: 110px;
        }

        /* 금액 */

        @media(max-width:576px) {

            .table th,
            .table td {
                font-size: 0.85rem;
                padding: 0.3rem;
            }

            .section-title {
                font-size: 1rem;
                padding: 8px 0;
            }

            .month-selector a {
                font-size: 0.9rem;
                padding: 0.2rem 0.6rem;
            }

            /* 모바일에서는 세로 배치 및 폰트 축소 (4번 요구사항) */
            .balance-box {
                flex-direction: column;
                gap: 10px;
                font-size: 1.05rem;
            }

            /* 모바일 컬럼 너비 조정 */
            .table th:nth-child(1),
            .table td:nth-child(1) {
                width: 30px;
                /* NO - 최소화 */
                font-size: 0.75rem;
            }

            /* 일자, 항목, 비고 - 폰트 크기 동일하게 0.7rem으로 수정 (2번 요구사항) */
            .table th:nth-child(2),
            .table td:nth-child(2),
            .table th:nth-child(3),
            .table td:nth-child(3),
            .table th:nth-child(4),
            .table td:nth-child(4) {
                font-size: 0.7rem;
                word-break: break-all;
                line-height: 1.2;
            }

            .table th:nth-child(2),
            .table td:nth-child(2) {
                width: 70px;
            }

            .table th:nth-child(3),
            .table td:nth-child(3) {
                width: auto;
                min-width: 60px;
            }

            .table th:nth-child(4),
            .table td:nth-child(4) {
                width: auto;
                min-width: 60px;
            }

            .table th:nth-child(5),
            .table td:nth-child(5) {
                width: 85px;
                /* 금액 - 10,000,000원까지 한줄 */
                white-space: nowrap;
                font-size: 0.8rem;
                padding-left: 2px;
                padding-right: 2px;
            }
        }
    </style>
</head>

<body>
    <div class="container">

        <div class="text-center mt-3 mb-3">
            오늘의 날짜: <?= formatDateWithWeekday(date('Y-m-d H:i:s')) ?>
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
        <div class="month-selector text-center mb-3">
            <?php for ($m = 1; $m <= 12; $m++): ?>
                <a href="?year=<?= $currentYear ?>&month=<?= $m ?>"
                    class="btn <?= ($m == $currentMonth ? 'btn-primary active' : 'btn-secondary') ?>">
                    <?= $m ?>월
                </a>
            <?php endfor; ?>
        </div>

        <div class="alert alert-info text-center mb-3">
            📌 합계가 이상하면 월 버튼을 다시 눌러 갱신하세요!
        </div>

        <span class="section-title mt-4">[수입 목록]</span>
        <div class="table-responsive">
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>NO</th>
                        <th>일자</th>
                        <th>항목</th>
                        <th>비고</th>
                        <th>금액</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (!$incomeTransactions): ?>
                        <tr>
                            <td colspan="5">데이터가 없습니다.</td>
                        </tr>
                    <?php else:
                        $i = 1;
                        foreach ($incomeTransactions as $tr): ?>
                            <tr>
                                <td><?= $i++ ?></td>
                                <td><?= formatDateWithWeekday($tr['date']) ?></td>
                                <td><?= htmlspecialchars($tr['category']) ?></td>
                                <td><?= htmlspecialchars($tr['description']) ?></td>
                                <td class="amount-column"><?= number_format($tr['amount']) ?>원</td>
                            </tr>
                        <?php endforeach; endif; ?>
                </tbody>

                <tfoot>
                    <tr>
                        <td colspan="3" class="text-end"><strong>월수입 합계:</strong></td>
                        <td colspan="2" class="text-end amount-column">
                            <strong><?= number_format($selectedMonthIncomeTotal) ?>원</strong>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3" class="text-end"><strong>월수입 누계(1~<?= $currentMonth ?>월):</strong></td>
                        <td colspan="2" class="text-end amount-column">
                            <strong><?= number_format($yearIncomeTotal) ?>원</strong>
                        </td>
                    </tr>
                </tfoot>


            </table>
        </div>

        <span class="section-title mt-4">[지출 목록]</span>
        <div class="table-responsive">
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>NO</th>
                        <th>일자</th>
                        <th>항목</th>
                        <th>비고</th>
                        <th>금액</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (!$expenseTransactions): ?>
                        <tr>
                            <td colspan="5">데이터가 없습니다.</td>
                        </tr>
                    <?php else:
                        $i = 1;
                        foreach ($expenseTransactions as $tr): ?>
                            <tr>
                                <td><?= $i++ ?></td>
                                <td><?= formatDateWithWeekday($tr['date']) ?></td>
                                <td><?= htmlspecialchars($tr['category']) ?></td>
                                <td><?= htmlspecialchars($tr['description']) ?></td>
                                <td class="amount-column"><?= number_format($tr['amount']) ?>원</td>
                            </tr>
                        <?php endforeach; endif; ?>
                </tbody>

                <tfoot>
                    <tr>
                        <td colspan="3" class="text-end"><strong>월지출 합계:</strong></td>
                        <td colspan="2" class="text-end amount-column">
                            <strong><?= number_format($selectedMonthExpenseTotal) ?>원</strong>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3" class="text-end"><strong>월지출 누계(1~<?= $currentMonth ?>월):</strong></td>
                        <td colspan="2" class="text-end amount-column">
                            <strong><?= number_format($yearExpenseTotal) ?>원</strong>
                        </td>
                    </tr>
                </tfoot>


            </table>
        </div>

        <div class="balance-box">

            <div class="balance-item">
                <span data-bs-toggle="tooltip" data-bs-placement="top" title="월결산액은 해당하는 달의 (월수입합계 - 월지출합계) 의 차액입니다.">
                    월결산액:
                </span>
                <!-- 3번 요구사항: 0 이상은 파란색(text-primary), 마이너스는 빨간색(text-danger) -->
                <span class="<?= ($monthlyBalance >= 0 ? 'text-primary' : 'text-danger') ?>">
                    <?= number_format($monthlyBalance) ?>원
                </span>
            </div>

            <div class="balance-item">
                <span data-bs-toggle="tooltip" data-bs-placement="top"
                    title="총잔액(누적):은 1월달부터 지금 선택한 달까지의 총 남아있는 금액입니다. (1월~해당월 월수입 누계금액 - 1월~해당월 월지출 누계금액)">
                    총잔액(누적):
                </span>
                <span class="<?= ($balance > 0 ? 'text-danger' : 'text-primary') ?>">
                    <?= number_format($balance) ?>원
                </span>
            </div>
        </div>

        <!-- 🧮 심플 계산기 -->
        <div class="calc-container">
            <input type="text" class="calc-display" id="calcDisplay" readonly placeholder="0">
            <div class="calc-buttons">
                <button class="calc-btn clear" onclick="clearCalc()">C</button>
                <button class="calc-btn operator" onclick="appendToCalc('/')">÷</button>
                <button class="calc-btn operator" onclick="appendToCalc('*')">×</button>
                <button class="calc-btn operator" onclick="backspaceCalc()">←</button>

                <button class="calc-btn" onclick="appendToCalc('7')">7</button>
                <button class="calc-btn" onclick="appendToCalc('8')">8</button>
                <button class="calc-btn" onclick="appendToCalc('9')">9</button>
                <button class="calc-btn operator" onclick="appendToCalc('-')">-</button>

                <button class="calc-btn" onclick="appendToCalc('4')">4</button>
                <button class="calc-btn" onclick="appendToCalc('5')">5</button>
                <button class="calc-btn" onclick="appendToCalc('6')">6</button>
                <button class="calc-btn operator" onclick="appendToCalc('+')">+</button>

                <button class="calc-btn" onclick="appendToCalc('1')">1</button>
                <button class="calc-btn" onclick="appendToCalc('2')">2</button>
                <button class="calc-btn" onclick="appendToCalc('3')">3</button>
                <button class="calc-btn" onclick="appendToCalc('0')">0</button>

                <button class="calc-btn" onclick="appendToCalc('.')">.</button>
                <button class="calc-btn equals" onclick="computeCalc()">=</button>
            </div>
        </div>

    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

    <script>
        // 툴팁 초기화
        document.addEventListener('DOMContentLoaded', function () {
            var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        });

        // 계산기 기능
        let calcValue = "";
        const display = document.getElementById('calcDisplay');

        // 숫자에 콤마를 추가하는 헬퍼 함수
        function formatWithCommas(str) {
            // 숫자 부분만 찾아서 콤마를 넣음 (연산자 제외)
            return str.replace(/\d+(\.\d+)?/g, (match) => {
                const parts = match.split(".");
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                return parts.join(".");
            });
        }

        function appendToCalc(val) {
            calcValue += val;
            display.value = formatWithCommas(calcValue);
        }

        function clearCalc() {
            calcValue = "";
            display.value = "0";
        }

        function backspaceCalc() {
            calcValue = calcValue.slice(0, -1);
            display.value = calcValue === "" ? "0" : formatWithCommas(calcValue);
        }

        function computeCalc() {
            try {
                if (!calcValue) return;
                // 사칙연산 계산
                const result = new Function('return ' + calcValue)();

                // 결과값을 문자열로 변환 (다음 연산을 위해)
                calcValue = Number.isInteger(result) ? result.toString() : result.toFixed(2).toString();

                // 화면에 콤마 포맷으로 표시
                display.value = formatWithCommas(calcValue);
            } catch (e) {
                display.value = "Error";
                calcValue = "";
            }
        }
    </script>
</body>

</html>



<!-- 
👉 간편한 이모지 아이콘 모음들

✅ 일반 강조 / 안내용
• 	👉 : 포인트 강조
• 	✅ : 완료, 승인
• 	📌 : 고정, 중요
• 	🔍 : 검색, 확인
• 	📝 : 작성, 기록
• 	📎 : 첨부, 연결

⚠️ 주의 / 경고 / 위험
• 	⚠️ : 일반적인 주의
• 	❗ : 강한 경고
• 	🚫 : 금지
• 	🔒 : 보안, 잠금
• 	🛑 : 정지
• 	🔥 : 긴급, 이슈

🌟 중요 / 추천 / 핵심
- ⭐ : 추천
- 📣 : 알림
- 💡 : 아이디어
- 🎯 : 목표
- 🏆 : 우수, 성과
- 🧭 : 방향, 가이드

🙂 친근함 / 감정 표현
- 🙂 : 기본 미소
- 😄 : 활짝 웃음
- 🤝 : 협력, 약속
- 🙌 : 환영, 축하
- 👋 : 인사
- 💬 : 대화, 코멘트

🎨 디자인 / 창의 / 작업
- 🎨 : 디자인
- 🧑‍💻 : 개발자
- 🛠️ : 설정, 수정
- 🧠 : 아이디어
- 📐 : 설계
- 🖌️ : 꾸미기

필요하신 테마나 상황에 맞춰 더 확장해드릴 수도 있어요.
예를 들어 "모임 공지용", "앱 알림용", "관리자 패널용" 등으로 맞춤 세트도 가능해요.

 -->