<?php
if (!isset($_GET['url'])) {
    die("URL이 지정되지 않았습니다.");
}

$url = $_GET['url'];

// ---- cURL로 원본 이미지 가져오기 ----
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // 리다이렉트 허용
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // SSL 인증 무시
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0'); // User-Agent 설정

$imgContent = curl_exec($ch);
$httpCode   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

// ---- 실패 시 ----
if ($imgContent === false || $httpCode !== 200) {
    die("이미지를 불러올 수 없습니다. (HTTP 코드: $httpCode)");
}

// ---- 파일명 생성 ----
$filename = basename(parse_url($url, PHP_URL_PATH));
if (empty($filename) || strpos($filename, '.') === false) {
    // 확장자 추정
    $ext = 'jpg';
    if (strpos($contentType, 'png') !== false) $ext = 'png';
    elseif (strpos($contentType, 'gif') !== false) $ext = 'gif';
    elseif (strpos($contentType, 'webp') !== false) $ext = 'webp';
    
    $filename = 'image_' . date('YmdHis') . '.' . $ext;
}

// ---- 다운로드 헤더 설정 (강제 다운로드) ----
header("Content-Type: application/octet-stream");
header("Content-Disposition: attachment; filename=\"" . $filename . "\"");
header("Content-Length: " . strlen($imgContent));
header("Cache-Control: no-cache, must-revalidate");
header("Pragma: no-cache");

// ---- 이미지 출력 ----
echo $imgContent;
exit;
?>