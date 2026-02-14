<?php
// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
require_once __DIR__ . '/php/db-connect-mongo.php';

date_default_timezone_set('Asia/Seoul');

header("Content-Type: application/octet-stream");

/* ---------------------------
   1) BLOB 다운로드 (id 존재)
---------------------------- */
if (isset($_GET['id'])) {

    $id = $_GET['id'];

    try {
        // ID가 24자리 hex string이면 ObjectId로 변환, 아니면 idx 필드 기준으로 조회
        $filter = preg_match('/^[a-f\d]{24}$/i', $id)
            ? ['_id' => new MongoDB\BSON\ObjectId($id)]
            : ['idx' => (int) $id];

        $row = $database->images->findOne($filter);

        if (!$row || empty($row['photo'])) {
            die("이미지 데이터가 없습니다.");
        }

        $filename = "image_" . $id . ".jpg";

        header("Content-Disposition: attachment; filename=\"$filename\"");
        header("Content-Type: image/jpeg");

        // MongoDB BSON Binary 데이터 처리
        if ($row['photo'] instanceof MongoDB\BSON\Binary) {
            echo $row['photo']->getData();
        } else {
            echo $row['photo'];
        }
        exit;
    } catch (Exception $e) {
        die("에러 발생: " . $e->getMessage());
    }
}

/* ---------------------------
   2) URL 다운로드 (url 존재)
---------------------------- */
if (isset($_GET['url'])) {

    $imgUrl = urldecode($_GET['url']);

    $imgData = @file_get_contents($imgUrl);

    if ($imgData === false) {
        die("이미지를 불러올 수 없습니다.");
    }

    $filename = "downloaded_image.jpg";

    header("Content-Disposition: attachment; filename=\"$filename\"");
    header("Content-Type: image/jpeg");
    echo $imgData;
    exit;
}

echo "잘못된 요청입니다.";
exit;
?>