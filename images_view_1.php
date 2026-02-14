<?php
// images_view_1.php - MongoDB 버전
require_once __DIR__ . '/php/auth_check.php';
require_once __DIR__ . '/php/db-connect-mongo.php';

date_default_timezone_set('Asia/Seoul');

$today = date('Y/m/d') . '(' . mb_substr('일월화수목금토', date('w'), 1) . ') ' . date('H:i');

$currentYear = isset($_GET['year']) ? (int) $_GET['year'] : (int) date('Y');
$currentMonth = isset($_GET['month']) ? (int) $_GET['month'] : (int) date('n');
$months = range(1, 12);

try {
    // 날짜 기반 검색 (YYYY/MM/DD 형식 또는 UTCDateTime에 따라 정규식 처리)
    // 원본 SQL: WHERE YEAR(date)=? AND MONTH(date)=?
    // MongoDB에서는 'date' 필드가 문자열 "2024/02/13..." 형식이므로 정규식으로 매칭
    $searchPattern = sprintf("^%04d/%02d", $currentYear, $currentMonth);

    $cursor = $database->images->find(
        ['date' => ['$regex' => $searchPattern]],
        ['sort' => ['date' => -1]]
    );
    $images = iterator_to_array($cursor);

} catch (Exception $e) {
    $images = [];
}
?>

<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>영수증 보기</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">

    <!-- 파비콘 아이콘들 -->
    <link rel="icon" href="/favicon.png?v=2" />
    <link rel="icon" type="image/png" sizes="36x36" href="./favicons/2/android-icon-36x36.png" />
    <link rel="icon" type="image/png" sizes="48x48" href="./favicons/2/android-icon-48x48.png" />
    <link rel="icon" type="image/png" sizes="72x72" href="./favicons/2/android-icon-72x72.png" />
    <link rel="apple-touch-icon" sizes="32x32" href="./favicons/2/apple-icon-32x32.png">
    <link rel="apple-touch-icon" sizes="57x57" href="./favicons/2/apple-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="./favicons/2/apple-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="./favicons/2/apple-icon-72x72.png">

    <style>
        img.thumbnail {
            width: 100px;
            height: auto;
            cursor: pointer;
            border: 2px solid #ddd;
            border-radius: 8px;
            transition: transform 0.2s;
        }

        img.thumbnail:hover {
            transform: scale(1.05);
            border-color: #007bff;
        }

        .section-title {
            text-align: center;
            color: #007bff;
            font-weight: 700;
            margin-bottom: 30px;
            padding: 10px;
            background: #e9f3ff;
            border-radius: 10px;
            border: 1px solid #c9e3ff;
        }

        .month-selector {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 6px 4px;
            margin: 12px 0;
        }

        .month-selector a {
            padding: 5px 10px;
            border-radius: 5px;
            text-decoration: none;
            background: #f0f0f0;
            margin: 4px;
            display: inline-block;
        }

        .month-selector a.active {
            background: #007bff;
            color: #fff;
        }

        table td {
            vertical-align: middle;
        }

        /* 모달 */
        .modal {
            display: none;
            position: fixed;
            z-index: 1050;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            overflow: auto;
            padding-top: 50px;
        }

        .modal-content {
            margin: auto;
            display: block;
            max-width: 90%;
            max-height: 95%;
        }

        .close-modal {
            position: fixed;
            top: 20px;
            right: 30px;
            color: #fff;
            font-size: 55px;
            font-weight: bold;
            cursor: pointer;
            z-index: 2000;
            text-shadow: 0 0 10px rgba(0, 0, 0, 0.6);
        }

        .close-modal:hover {
            color: #ff6666;
            transform: scale(1.1);
        }

        @media(max-width: 768px) {
            .month-selector {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                gap: 5px;
                padding: 0 5px;
            }

            .month-selector a {
                font-size: 0.75rem;
                padding: 6px 0;
                margin: 0;
                text-align: center;
            }

            table.table thead {
                display: none;
            }

            table.table tbody tr {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: auto auto auto;
                gap: 10px;
                margin-bottom: 20px;
                padding: 15px;
                border: 2px solid #ddd;
                border-radius: 12px;
                background: #f9f9f9;
            }

            table.table tbody td {
                border: none;
                padding: 8px;
                text-align: left;
            }

            table.table tbody td:nth-child(1) {
                grid-column: 1;
                grid-row: 1;
                font-weight: bold;
                color: #007bff;
            }

            table.table tbody td:nth-child(2) {
                grid-column: 2;
                grid-row: 1;
                text-align: right;
                font-size: 0.9rem;
            }

            table.table tbody td:nth-child(3) {
                grid-column: 1;
                grid-row: 2 / 4;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            table.table tbody td:nth-child(3) img.thumbnail {
                width: 120px;
                height: auto;
            }

            table.table tbody td:nth-child(4) {
                grid-column: 2;
                grid-row: 2;
                display: flex;
                align-items: center;
                word-break: break-word;
            }

            table.table tbody td:nth-child(4)::before {
                content: "📝 ";
                margin-right: 5px;
            }

            table.table tbody td:nth-child(5) {
                grid-column: 2;
                grid-row: 3;
                display: flex;
                align-items: flex-end;
            }

            table.table tbody td:nth-child(5) .btn {
                width: 100%;
            }

            .modal-content {
                width: 100%;
                max-height: 95%;
            }
        }
    </style>
</head>

<body>

    <div class="text-center section-title mt-3 font-weight-bold">
        오늘의 날짜: <?= $today ?>
    </div>

    <!-- 년도 선택 -->
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

    <div class="month-selector text-center mt-2 mb-2">
        <?php foreach ($months as $month): ?>
            <a href="?year=<?= $currentYear ?>&month=<?= $month ?>"
                class="<?= ($month == $currentMonth) ? 'active' : '' ?>"><?= $month ?>월</a>
        <?php endforeach; ?>
    </div>

    <table class="table table-bordered text-center">
        <thead>
            <tr>
                <th>No</th>
                <th>날짜</th>
                <th>이미지</th>
                <th>비고</th>
                <th>다운로드</th>
            </tr>
        </thead>

        <tbody>
            <?php
            $counter = 1;
            foreach ($images as $img):
                $imgId = (string) $img['_id']; // MongoDB _id
                $dateStr = $img['date']; // "YYYY/MM/DD..." 형태
                $notice = htmlspecialchars($img['notice'] ?? '');

                $isURL = !empty($img['url']);
                $isBLOB = !empty($img['photo']);

                if ($isBLOB) {
                    $imgSrc = "image_display.php?id=$imgId";
                    $downloadLink = "download_image.php?id=$imgId";
                } elseif ($isURL) {
                    $imgSrc = $img['url'];
                    $downloadLink = "download_url.php?url=" . urlencode($img['url']);
                } else {
                    $imgSrc = "./images/clova.png";
                    $downloadLink = "./images/clova.png";
                }
                ?>
                <tr>
                    <td><?= $counter ?></td>
                    <td><?= htmlspecialchars($dateStr) ?></td>
                    <td>
                        <img class="thumbnail" src="<?= htmlspecialchars($imgSrc, ENT_QUOTES) ?>"
                            onclick="openModal('<?= htmlspecialchars($imgSrc, ENT_QUOTES) ?>')"
                            onerror="this.onerror=null;this.src='./images/clova.png';" alt="IMAGE" title="클릭하면 확대됩니다">
                    </td>
                    <td><?= $notice ?></td>
                    <td>
                        <a href="<?= htmlspecialchars($downloadLink, ENT_QUOTES) ?>" class="btn btn-primary btn-sm">⬇️
                            다운로드</a>
                    </td>
                </tr>
                <?php
                $counter++;
            endforeach;
            ?>
        </tbody>
    </table>

    <div class="text-center mb-3">
        <a href="images_main_1.php" class="btn btn-dark btn-lg mt-5">⬅ 돌아가기</a>
    </div>

    <!-- 모달 -->
    <div id="imageModal" class="modal">
        <span class="close-modal" onclick="closeModal()">&times;</span>
        <img class="modal-content" id="modalImage">
    </div>

    <script>
        function openModal(src) {
            const modal = document.getElementById('imageModal');
            const modalImg = document.getElementById('modalImage');
            modal.style.display = "block";
            modalImg.src = src;
        }
        function closeModal() {
            document.getElementById('imageModal').style.display = "none";
        }
        document.addEventListener('keydown', function (e) {
            if (e.key === "Escape") closeModal();
        });
    </script>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>