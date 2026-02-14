<?php
// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:

require_once __DIR__ . '/php/db-connect-mongo.php';

$memberIds = $_GET['members'] ?? '';
$year = isset($_GET['year']) ? (int) $_GET['year'] : (int) date('Y');

if (!$memberIds) {
    die("<script>alert('선택된 회원이 없습니다.'); history.back();</script>");
}

$idArr = explode(',', $memberIds); // MongoDB _id strings
$objectIds = array_map(function ($id) {
    return new MongoDB\BSON\ObjectId($id); }, $idArr);

// 1. 회원 정보 가져오기
$membersCursor = $database->members->find(['_id' => ['$in' => $objectIds]], ['sort' => ['name' => 1]]);
$members = iterator_to_array($membersCursor);

// 납부 데이터 미리 가져오기
$passDataCursor = $database->account_pass->find([
    'member_id' => ['$in' => $idArr],
    'pay_year' => $year
]);
$passDataMap = [];
foreach ($passDataCursor as $p) {
    $passDataMap[(string) $p['member_id']][(int) $p['pay_month']] = (int) $p['paid'];
}

// 2. 납부 데이터 및 월회비 설정값 가져오기 (배열로 정리)
$excelData = [];
foreach ($members as $mem) {
    $m_id_str = (string) $mem['_id'];
    $excelData[] = [
        'name' => $mem['name'],
        'payments' => $passDataMap[$m_id_str] ?? []
    ];
}

// 회비 금액 설정 (필요시 DB에서 가져오도록 수정 가능)
$defaultFee = 20000;
?>

<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <title>엑셀 생성 중...</title>
    <script src="https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.min.js"></script>
</head>

<body>
    <div style="text-align:center; margin-top:50px;">
        <h3>📊 엑셀 파일을 생성하고 있습니다...</h3>
        <p>잠시만 기다려 주세요.</p>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const year = <?= $year ?>;
            const members = <?= json_encode($excelData) ?>;
            const defaultFee = <?= $defaultFee ?>;

            if (members.length === 0) {
                alert('데이터가 없습니다.');
                history.back();
                return;
            }

            // 스타일 정의
            const styleHeader = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "4472C4" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
            };
            const styleCenter = {
                alignment: { horizontal: "center", vertical: "center" },
                border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
            };
            const styleRight = {
                alignment: { horizontal: "right", vertical: "center" },
                border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
            };
            const styleUnpaid = {
                font: { color: { rgb: "FF0000" }, bold: true },
                alignment: { horizontal: "center", vertical: "center" },
                border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
            };
            const styleTotalLabel = {
                font: { bold: true },
                fill: { fgColor: { rgb: "E7E6E6" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
            };

            const wsData = [];
            const merges = [];

            members.forEach((member, index) => {
                const startRowIndex = wsData.length;

                // [1] 회원 이름 행 (병합)
                wsData.push([
                    { v: `👤 ${member.name} (${year}년)`, s: { font: { bold: true, sz: 14 }, alignment: { horizontal: "center" } } },
                    { v: "" }
                ]);
                merges.push({ s: { r: startRowIndex, c: 0 }, e: { r: startRowIndex, c: 1 } });

                // [2] 헤더 행
                wsData.push([
                    { v: "월", s: styleHeader },
                    { v: "납부내역", s: styleHeader }
                ]);

                let totalPaid = 0;
                let totalUnpaid = 0;

                // [3] 1~12월 데이터
                for (let m = 1; m <= 12; m++) {
                    const isPaid = member.payments[m] == 1; // PHP에서 넘어온 값 체크

                    if (isPaid) {
                        wsData.push([
                            { v: m + "월", s: styleCenter },
                            { v: defaultFee.toLocaleString() + "원", s: styleRight }
                        ]);
                        totalPaid += defaultFee;
                    } else {
                        wsData.push([
                            { v: m + "월", s: styleCenter },
                            { v: "미납", s: styleUnpaid }
                        ]);
                        totalUnpaid += defaultFee;
                    }
                }

                // [4] 합계 행
                wsData.push([
                    { v: "입금합계", s: styleTotalLabel },
                    { v: totalPaid.toLocaleString() + "원", s: { ...styleRight, font: { bold: true, color: { rgb: "0000FF" } }, fill: { fgColor: { rgb: "E7E6E6" } } } }
                ]);
                wsData.push([
                    { v: "미납금", s: styleTotalLabel },
                    { v: totalUnpaid.toLocaleString() + "원", s: { ...styleRight, font: { bold: true, color: { rgb: "FF0000" } }, fill: { fgColor: { rgb: "E7E6E6" } } } }
                ]);

                // [5] 빈 줄 (회원 간 간격)
                wsData.push([{}, {}]);
            });

            // 워크시트 및 통합문서 생성
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            ws['!merges'] = merges;
            ws['!cols'] = [{ wch: 15 }, { wch: 25 }]; // 열 너비

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "회비납부내역");

            // 파일 저장 후 이전 페이지로 돌아가기
            XLSX.writeFile(wb, `회비납부내역_${year}.xlsx`);



            setTimeout(() => {
                window.close(); // 새창으로 띄웠을 경우 닫기
                // history.back(); // 현재창일 경우 뒤로가기
            }, 1000);
        });
    </script>
</body>

</html>