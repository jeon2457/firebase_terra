<?php
// download.php
if (!isset($_GET['file']) || empty($_GET['file'])) {
    die("파일이 지정되지 않았습니다.");
}

$filepath = $_GET['file'];

// 보안: 상대경로 ../ 방지
$filepath = str_replace('..', '', $filepath);

if (!file_exists($filepath)) {
    die("파일이 존재하지 않습니다.");
}

$filename = basename($filepath);

// 헤더 설정 → 강제 다운로드
header('Content-Description: File Transfer');
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: ' . filesize($filepath));

// 파일 전달
readfile($filepath);
exit;
