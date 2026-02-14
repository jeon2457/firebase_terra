require_once __DIR__ . '/php/db-connect-mongo.php';

$memberIds = $_GET['members'] ?? '';
$year = isset($_GET['year']) ? (int) $_GET['year'] : (int)date('Y');
$todayYear = (int) date('Y');
$todayMonth = (int) date('n');

if (!$memberIds) {
die('선택된 회원이 없습니다.');
}

$idArr = explode(',', $memberIds); // MongoDB _id strings
$objectIds = array_map(function($id) { return new MongoDB\BSON\ObjectId($id); }, $idArr);

// 회원 정보 조회
$membersCursor = $database->members->find(
['_id' => ['$in' => $objectIds]],
['sort' => ['name' => 1]]
);
$members = iterator_to_array($membersCursor);

// 월별 회비 조회 함수
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
return $row ? (int)$row['fee_amount'] : 20000;
}

// 납부 데이터 미리 가져오기
$passDataCursor = $database->account_pass->find([
'member_id' => ['$in' => $idArr],
'pay_year' => $year
]);
$passData = [];
foreach ($passDataCursor as $p) {
$passData[(string)$p['member_id']][(int)$p['pay_month']] = (int)$p['paid'];
}
?>

<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>회원납부 상세확인</title>

    <!-- 파비콘 아이콘들 -->
    <link rel="icon" href="/favicon.png?v=2" />
    <link rel="icon" type="image/png" sizes="36x36" href="./favicons/2/android-icon-36x36.png" />
    <link rel="icon" type="image/png" sizes="48x48" href="./favicons/2/android-icon-48x48.png" />
    <link rel="icon" type="image/png" sizes="72x72" href="./favicons/2/android-icon-72x72.png" />
    <link rel="apple-touch-icon" sizes="32x32" href="./favicons/2/apple-icon-32x32.png">
    <link rel="apple-touch-icon" sizes="57x57" href="./favicons/2/apple-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="./favicons/2/apple-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="./favicons/2/apple-icon-72x72.png">

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <!-- ✅ xlsx-js-style 라이브러리 사용 (스타일 적용 가능) -->
    <script src="https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
    <style>
        body {
            background: #f4f6f9;
            padding: 15px 10px;
            font-family: 'Noto Sans KR', sans-serif;
        }

        h4 {
            font-size: 1.3rem;
        }

        .month-card {
            border-radius: 12px;
            padding: 12px;
            color: #fff;
            min-height: 100px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .paid {
            background: linear-gradient(135deg, #2e7d32 0%, #43a047 100%);
            box-shadow: 0 3px 8px rgba(46, 125, 50, 0.2);
        }

        .unpaid {
            background: linear-gradient(135deg, #c62828 0%, #e53935 100%);
            box-shadow: 0 3px 8px rgba(198, 40, 40, 0.2);
        }

        .future {
            background: linear-gradient(135deg, #757575 0%, #9e9e9e 100%);
            box-shadow: 0 3px 8px rgba(117, 117, 117, 0.2);
            opacity: 0.7;
        }

        .month-card h6 {
            font-weight: 700;
            margin-bottom: 5px;
        }

        .month-card p {
            font-size: 0.85rem;
            margin-bottom: 4px;
            opacity: 0.9;
        }

        .month-card small {
            font-weight: 600;
            font-size: 0.9rem;
            border-top: 1px solid rgba(255, 255, 255, 0.3);
            padding-top: 3px;
        }

        .card {
            border: none;
            border-radius: 15px;
            overflow: hidden;
        }

        .card-header {
            background: linear-gradient(135deg, #1976d2 0%, #2196f3 100%);
            color: white;
            padding: 15px 20px;
            font-size: 1.1rem;
        }

        .summary-box {
            background: #f8f9fa;
            border-top: 1px solid #eee;
            padding: 15px;
            border-radius: 0 0 15px 15px;
        }

        .summary-item {
            font-weight: 800;
            font-size: 1rem;
        }

        .text-paid {
            color: #2e7d32;
        }

        .text-unpaid {
            color: #c62828;
        }

        #capturePreview {
            width: 100%;
            height: auto;
            border: 1px solid #ddd;
            border-radius: 8px;
        }

        .modal-body {
            padding: 10px;
            text-align: center;
        }

        @media (max-width: 768px) {
            .month-col {
                width: 50% !important;
            }
        }
    </style>
</head>

<body class="container py-4">

    <div class="text-center mb-4">
        <!-- 년도 선택 (드롭다운) -->
        <div class="dropdown d-inline-block me-3">
            <button class="btn btn-dark btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown"
                aria-expanded="false">
                <?= $year ?>년 선택
            </button>
            <ul class="dropdown-menu dropdown-menu-dark">
                <?php
                $baseYear = date('Y');
                for ($y = $baseYear; $y >= $baseYear - 3; $y--):
                    ?>
                    <li><a class="dropdown-item <?= ($y == $year ? 'active' : '') ?>"
                            href="?members=<?= $memberIds ?>&year=<?= $y ?>"><?= $y ?>년</a></li>
                <?php endfor; ?>
            </ul>
        </div>
    </div>

    <h4 class="mb-4 fw-bold text-center">📋 <?= $year ?>년 회원 회비 납부 상세</h4>

    <div id="captureArea" style="padding: 10px; background: #f4f6f9;">
        <?php foreach ($members as $mem): ?>
            <?php
            $mem_id_str = (string)$mem['_id'];
            $rows = $passData[$mem_id_str] ?? [];
            $totalPaid = 0;
            $totalUnpaid = 0;
            ?>
            <div class="card mb-4 shadow-sm">
                <div class="card-header fw-bold d-flex align-items-center gap-2">
                    <input type="checkbox" class="member-check no-capture" value="<?= $mem_id_str ?>" checked
                        style="width:18px; height:18px;">
                    👤 <?= htmlspecialchars($mem['name']) ?> 님 납부 현황
                </div>

                <div class="card-body">
                    <div class="row g-2">
                        <?php for ($m = 1; $m <= 12; $m++):
                            $isPaid = $rows[$m] ?? 0;
                            $fee = getMonthlyFee($database, $year, $m);

                            $isFuture = false;
                            if ($year > $todayYear) {
                                $isFuture = true;
                            } elseif ($year == $todayYear && $m > $todayMonth) {
                                $isFuture = true;
                            }

                            if ($isPaid) {
                                $totalPaid += $fee;
                            } else {
                                if (!$isFuture) {
                                    $totalUnpaid += $fee;
                                }
                            }

                            $cardClass = $isPaid ? 'paid' : ($isFuture ? 'future' : 'unpaid');
                            $statusText = $isPaid ? '납부완료' : ($isFuture ? '해당 없음' : '미납안내');
                            ?>
                            <div class="col-6 col-md-3 month-col">
                                <div class="month-card <?= $cardClass ?>">
                                    <h6><?= $m ?>월</h6>
                                    <p><?= $statusText ?></p>
                                    <small><?= number_format($fee) ?>원</small>
                                </div>
                            </div>
                        <?php endfor; ?>
                    </div>
                </div>

                <div class="summary-box d-flex justify-content-between align-items-center">
                    <div class="summary-item">
                        <span class="text-secondary small">입금합계:</span>
                        <span class="text-paid"><?= number_format($totalPaid) ?>원</span>
                    </div>
                    <div class="summary-item">
                        <span class="text-secondary small">미납합계:</span>
                        <span class="text-unpaid"><?= number_format($totalUnpaid) ?>원</span>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>

    <div class="d-flex justify-content-center gap-2 my-4 flex-wrap">
        <button onclick="downloadExcel()" class="btn btn-success">📥 엑셀 다운로드</button>
        <button class="btn btn-warning" onclick="sendSMS()">📩 미납자 SMS 발송</button>
    </div>

    <div class="text-center mt-2 mb-5">
        <button onclick="captureToImage()" class="btn btn-primary me-2">🖼️ 데이타 => 이미지화</button>
        <a href="account_pass.php?year=<?= $year ?>" class="btn btn-secondary">⏪ 돌아가기</a>
    </div>

    <!-- 모달: data-bs-backdrop과 data-bs-keyboard 추가 -->
    <div class="modal fade" id="imageModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="true"
        data-bs-keyboard="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">🖼️ 납부현황 이미지 생성</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info py-2 small">
                        💡 <b>아이폰/안드로이드:</b> 이미지를 길게 누르면 저장 가능<br>
                        💡 <b>PC:</b> 마우스 우클릭 후 '이미지를 다른 이름으로 저장'
                    </div>
                    <div id="imageContainer"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary w-100" data-bs-dismiss="modal">닫기</button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

    <script>
        // SMS 발송
        function sendSMS() {
            const checked = document.querySelectorAll('.member-check:checked');
            if (checked.length === 0) { alert('회원을 선택하세요.'); return; }
            const ids = Array.from(checked).map(ch => ch.value).join(',');
            location.href = 'account_sms_send.php?members=' + ids + '&year=<?= $year ?>';
        }

        // PHP 데이터를 JavaScript로 전달
        const year = <?= $year ?>;
        const memberIdsString = "<?= $memberIds ?>";
        const membersData = <?php
            $m_data = [];
            foreach ($members as $m) {
                $m_id = (string)$m['_id'];
                $m_data[$m_id] = [
                    '_id' => $m_id,
                    'name' => $m['name']
                ];
            }
            echo json_encode($m_data);
        ?>;

        // 납부 데이터
        const paymentData = <?= json_encode($passData) ?>;

        // 월별 회비 데이터
        const feeHistory = {};
        <?php
        $feeCursor = $database->monthly_fee_history->find([], ['sort' => ['apply_year' => 1, 'apply_month' => 1]]);
        foreach ($feeCursor as $f) {
            echo "feeHistory['{$f['apply_year']}_{$f['apply_month']}'] = " . (int)$f['fee_amount'] . ";\n";
        }
        ?>

        // 납부 상태 확인
        function getPaymentStatus(memberId, year, month) {
            return paymentData[memberId] && paymentData[memberId][month] == 1;
        }

        // 월별 회비 조회
        function getMonthlyFee(year, month) {
            let applicableFee = 20000;
            let latestYear = 0;
            let latestMonth = 0;

            for (const key in feeHistory) {
                const [y, m] = key.split('_').map(Number);
                if (y < year || (y === year && m <= month)) {
                    if (y > latestYear || (y === latestYear && m > latestMonth)) {
                        latestYear = y;
                        latestMonth = m;
                        applicableFee = feeHistory[key];
                    }
                }
            }
            return applicableFee;
        }



        // ----------------------------------------------------------------------
        // 📥 엑셀 다운로드 (스타일 적용 버전)
        // ----------------------------------------------------------------------
        function downloadExcel() {
            if (typeof XLSX === 'undefined') { alert('엑셀 라이브러리 로드 실패'); return; }
            const checked = document.querySelectorAll('.member-check:checked');
            if (checked.length === 0) { alert('회원을 선택하세요.'); return; }

            const selectedIds = Array.from(checked).map(cb => cb.value);
            const targetMembers = selectedIds.map(id => membersData[id]).filter(m => m && m.name).sort((a, b) => a.name.localeCompare(b.name));

            // 공통 테두리 스타일
            const borderStyle = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

            // 스타일 정의
            const sCenter = { alignment: { horizontal: "center", vertical: "center" }, border: borderStyle };
            const sRight = { alignment: { horizontal: "right", vertical: "center" }, border: borderStyle };

            const sHeader = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "4472C4" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: borderStyle
            };

            const sUnpaid = {
                font: { color: { rgb: "FF0000" }, bold: true },
                alignment: { horizontal: "center", vertical: "center" },
                border: borderStyle
            };

            // 입금합계 스타일 (파란색, 진하게)
            const sTotalPaid = {
                font: { bold: true, color: { rgb: "0000FF" } }, // 파란색
                fill: { fgColor: { rgb: "F2F2F2" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: borderStyle
            };
            const sTotalPaidVal = {
                font: { bold: true, color: { rgb: "0000FF" } }, // 파란색
                fill: { fgColor: { rgb: "F2F2F2" } },
                alignment: { horizontal: "right", vertical: "center" },
                border: borderStyle
            };

            // 미납금 스타일 (빨간색, 진하게)
            const sTotalUnpaid = {
                font: { bold: true, color: { rgb: "FF0000" } }, // 빨간색
                fill: { fgColor: { rgb: "F2F2F2" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: borderStyle
            };
            const sTotalUnpaidVal = {
                font: { bold: true, color: { rgb: "FF0000" } }, // 빨간색
                fill: { fgColor: { rgb: "F2F2F2" } },
                alignment: { horizontal: "right", vertical: "center" },
                border: borderStyle
            };

            const wsData = [];
            const merges = [];

            targetMembers.forEach(member => {
                const startRow = wsData.length;

                // 회원 이름 행 (병합)
                wsData.push([
                    { v: `👤 ${member.name} (${year}년)`, s: { font: { bold: true, sz: 14 }, alignment: { horizontal: "center" }, border: borderStyle } },
                    { v: "", s: { border: borderStyle } }
                ]);
                merges.push({ s: { r: startRow, c: 0 }, e: { r: startRow, c: 1 } });

                // 헤더 행
                wsData.push([
                    { v: "월", s: sHeader },
                    { v: "납부내역", s: sHeader }
                ]);

                let totalPaid = 0, totalUnpaid = 0;

                for (let m = 1; m <= 12; m++) {
                    const isPaid = getPaymentStatus(member.idx, year, m);
                    const fee = getMonthlyFee(year, m);

                    if (isPaid) {
                        totalPaid += fee;
                        wsData.push([
                            { v: `${m}월`, s: sCenter },
                            { v: fee.toLocaleString() + "원", s: sRight }
                        ]);
                    } else {
                        totalUnpaid += fee;
                        wsData.push([
                            { v: `${m}월`, s: sCenter },
                            { v: "미납", s: sUnpaid }
                        ]);
                    }
                }

                // 합계 행 (스타일 적용)
                wsData.push([
                    { v: "입금합계", s: sTotalPaid },
                    { v: totalPaid.toLocaleString() + "원", s: sTotalPaidVal }
                ]);
                wsData.push([
                    { v: "미납금", s: sTotalUnpaid },
                    { v: totalUnpaid.toLocaleString() + "원", s: sTotalUnpaidVal }
                ]);

                // 빈 행 (간격)
                wsData.push([{}, {}]);
            });

            const ws = XLSX.utils.aoa_to_sheet(wsData);
            ws['!merges'] = merges;
            ws['!cols'] = [{ wch: 15 }, { wch: 20 }]; // 너비 조정

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "회비납부내역");
            XLSX.writeFile(wb, `회비납부내역_${year}.xlsx`);
        }



        // 이미지 캡처 (포커스 에러 수정)
        let modalInstance = null;

        function captureToImage() {
            const area = document.getElementById('captureArea');
            if (!area) return;

            const noCaptureElements = document.querySelectorAll('.no-capture');
            noCaptureElements.forEach(el => el.style.opacity = '0');

            html2canvas(area, {
                useCORS: true,
                scale: 2,
                backgroundColor: "#f4f6f9",
                logging: false
            }).then(canvas => {
                const imgData = canvas.toDataURL("image/jpeg", 0.9);
                const container = document.getElementById('imageContainer');
                container.innerHTML = `<img src="${imgData}" id="capturePreview" class="img-fluid">`;

                noCaptureElements.forEach(el => el.style.opacity = '1');

                const modalEl = document.getElementById('imageModal');
                if (!modalInstance) {
                    modalInstance = new bootstrap.Modal(modalEl, {
                        backdrop: true,
                        keyboard: true,
                        focus: true
                    });
                }
                modalInstance.show();

                // 모달이 완전히 닫힌 후 포커스 해제
                modalEl.addEventListener('hidden.bs.modal', function () {
                    document.activeElement.blur();
                }, { once: true });

            }).catch(err => {
                alert("이미지 생성에 실패했습니다.");
                console.error(err);
                noCaptureElements.forEach(el => el.style.opacity = '1');
            });
        }
    </script>

</body>

</html>