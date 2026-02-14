<?php
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';


// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
require_once __DIR__ . '/php/auth_check.php';
require_once __DIR__ . '/php/db-connect-mongo.php';

date_default_timezone_set('Asia/Seoul');

$currentYear = isset($_GET['year']) ? intval($_GET['year']) : date('Y');
$currentMonth = isset($_GET['month']) ? intval($_GET['month']) : date('n');
$months = range(1, 12);

// MongoDB 날짜 필터링 (date가 'YYYY-MM-DD HH:MM:SS' 형식이라고 가정)
$monthStr = str_pad($currentMonth, 2, '0', STR_PAD_LEFT);
$datePattern = "^$currentYear-$monthStr"; // 시작 부분 매칭

$images = $database->images->find(
    ['date' => ['$regex' => $datePattern]],
    ['sort' => ['date' => -1]]
)->toArray();
?>
<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>영수증 편집</title>

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
        /* 모달 닫기 버튼(X) 크게 + 우측 상단 배치 */
        .close-modal {
            position: fixed;
            top: 5px;
            right: 30px;
            color: #fff;
            font-size: 55px;
            /* 크기 크게 */
            font-weight: bold;
            cursor: pointer;
            z-index: 2000;
            /* 이미지보다 항상 위로 */
            text-shadow: 0 0 10px rgba(0, 0, 0, 0.6);
            /* 더 잘 보이도록 효과 */
        }

        .close-modal:hover {
            color: #ff6666;
            /* 호버 시 강조 */
            transform: scale(1.1);
        }


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

        textarea.summary-input {
            width: 100%;
            height: 100px;
            border-radius: 8px;
            padding: 5px;
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

        table td {
            vertical-align: middle;
        }

        /* ---- 월 선택 버튼 (2줄 그리드 적용) ---- */
        .month-selector {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            /* 한 줄에 6개씩 */
            gap: 5px;
            margin: 10px 0 20px 0;
        }

        .month-selector a {
            padding: 6px 0;
            border-radius: 5px;
            text-decoration: none !important;
            /* 밑줄 제거 */
            background: #f0f0f0;
            color: #333;
            font-size: 13px;
            /* 크기 줄임 */
            font-weight: 600;
            text-align: center;
            /* 중앙 정렬 */
            display: block;
        }

        .month-selector a.active {
            background: #007bff;
            color: #fff;
        }



        /* ----------------------------- */
        /* ⭐ 모바일에서 테이블을 카드형으로 변경 */
        /* ----------------------------- */
        @media(max-width: 768px) {

            table.table thead {
                display: none;
            }

            table.table tr {
                display: block;
                margin-bottom: 20px;
                background-color: #dad7d7ff;
                border: 2px solid #ad9898;
                padding: 15px;
                border-radius: 12px;
            }

            table.table td {
                display: flex;
                justify-content: space-between;
                text-align: left !important;
                padding: 10px 5px;
                border: none !important;
            }

            table.table td::before {
                content: attr(data-label);
                font-weight: bold;
                color: #007bff;
                margin-right: 10px;
                flex-shrink: 0;
            }

            /* 요약 textarea는 모바일에서 100% 넓게 */
            textarea.summary-input {
                width: 100%;
                height: 120px;
            }

            /* 썸네일 이미지 크게 */
            img.thumbnail {
                width: 120px;
            }
        }

        /* 반응형 월 버튼 조정 */
        @media (max-width: 480px) {
            .month-selector {
                grid-template-columns: repeat(6, 1fr);
                /* 480px 이하에서도 6개 유지 */
            }

            .month-selector a {
                font-size: 11px;
                /* 모바일에서 더 작게 */
            }
        }
    </style>

    <script>
        document.addEventListener("DOMContentLoaded", function () {

            document.querySelectorAll(".btn-send").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    let id = this.dataset.idx;
                    let val = document.querySelector("#summary-" + id).value;

                    fetch("update_notice.php", {
                        method: "POST",
                        headers: { "Content-type": "application/x-www-form-urlencoded" },
                        body: "imageId=" + id + "&summary=" + encodeURIComponent(val)
                    }).then(r => r.text()).then(t => {
                        alert("전송되었습니다.");
                        location.reload();
                    });
                });
            });

            document.querySelectorAll(".btn-delete").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    let id = this.dataset.idx;

                    if (confirm("삭제하시겠습니까?")) {
                        fetch("delete_image.php", {
                            method: "POST",
                            headers: { "Content-type": "application/x-www-form-urlencoded" },
                            body: "imageId=" + id
                        }).then(r => r.text()).then(t => {
                            location.reload();
                        });
                    }
                });
            });
        });

        function openModal(src) {
            document.getElementById('imageModal').style.display = "block";
            document.getElementById('modalImage').src = src;
        }
        function closeModal() {
            document.getElementById('imageModal').style.display = "none";
        }
        document.addEventListener('keydown', function (e) {
            if (e.key === "Escape") closeModal();
        });
    </script>

</head>

<body>

    <div class="container mt-4">

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

        <!-- ⭐ 월 선택 UI (6열 2줄 그리드 구성) -->
        <div class="month-selector text-center mt-2 mb-3">
            <?php foreach ($months as $month): ?>
                <a href="?year=<?= $currentYear ?>&month=<?= $month ?>"
                    class="<?= ($month == $currentMonth) ? 'active' : '' ?>">
                    <?= $month ?>월
                </a>
            <?php endforeach; ?>
        </div>
        <!-- ⭐ 여기까지 월 선택 -->

        <h2 class="section-title">영수증 편집</h2>

        <table class="table table-bordered text-center">
            <tr>
                <th>No</th>
                <th>날짜</th>
                <th>이미지</th>
                <th>요약</th>
                <th>전송</th>
                <th>삭제</th>

            </tr>

            <?php $counter = 1;
            foreach ($images as $img):
                $id = (string) $img['_id'];

                $timestamp = strtotime($img['date']);
                $date = date('Y/m/d', $timestamp) . '(' . mb_substr('일월화수목금토', date('w'), 1) . ') ' . date('H:i', $timestamp);

                $notice = htmlspecialchars($img['notice']);
                $isURL = !empty($img['url']);
                $isBLOB = !empty($img['photo']);

                if ($isBLOB) {
                    $imgSrc = "download_image.php?id=$id";
                    $downloadLink = "download_image.php?id=$id";
                } elseif ($isURL) {
                    $imgSrc = $img['url'];
                    $downloadLink = "download_url.php?url=" . urlencode($img['url']);
                } else {
                    $imgSrc = "./images/clova.png";
                    $downloadLink = "./images/clova.png";
                }
                ?>
                <tr>



                    <td data-label="번호"><?= $counter ?></td>

                    <td data-label="날짜"><?= $date ?></td>

                    <td data-label="이미지">
                        <img class="thumbnail" src="<?= htmlspecialchars($imgSrc) ?>"
                            onclick="openModal('<?= htmlspecialchars($imgSrc) ?>')">
                    </td>

                    <td data-label="요약">
                        <textarea id="summary-<?= $id ?>" class="summary-input"><?= $notice ?></textarea>
                    </td>

                    <td data-label="전송">
                        <button class="btn btn-success btn-send" data-idx="<?= $id ?>">전송</button>
                    </td>

                    <td data-label="삭제">
                        <button class="btn btn-danger btn-delete" data-idx="<?= $id ?>">삭제</button>
                    </td>


                </tr>

                <?php $counter++; endforeach; ?>
        </table>

        <div class="text-center mb-3">
            <a href="images_main_1.php" class="btn btn-dark">⬅ 되돌아가기</a>
        </div>

    </div>

    <!-- 모달 -->
    <div id="imageModal" class="modal">
        <span class="close-modal" onclick="closeModal()">&times;</span>
        <img class="modal-content" id="modalImage">
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>