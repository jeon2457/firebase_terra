<?php
session_start();
// Cloudinary 설정
$cloud_name = "dghx4ciwc";
$api_key = "367476117442322";
$api_secret = "3_1JaaakBOyp7qDkbAjIWbQ6FDE";

// 이미지 전체 불러오기 함수
function getAllCloudinaryImages($cloud_name, $api_key, $api_secret)
{
    $all_images = [];
    $next_cursor = null;

    do {
        $url = "https://api.cloudinary.com/v1_1/{$cloud_name}/resources/image";
        $url .= "?max_results=500"; // 한 번에 최대 500개

        if ($next_cursor) {
            $url .= "&next_cursor=" . urlencode($next_cursor);
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERPWD, "$api_key:$api_secret");

        $response = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($response, true);

        if (!empty($data['resources'])) {
            // ✅ 이미지 데이타를 가져올때 .json파일을 안가져오게 필터링 추가
            $filtered_resources = array_filter($data['resources'], function ($resource) {
                return (isset($resource['format']) && strtolower($resource['format']) !== 'json');
            });
            $all_images = array_merge($all_images, $filtered_resources);
        }

        $next_cursor = $data['next_cursor'] ?? null;

    } while ($next_cursor);

    return $all_images;
}


// 이미지 삭제 처리 부분을 다음과 같이 수정
if (isset($_POST['delete_image'])) {
    $public_id = $_POST['public_id'] ?? '';

    if ($public_id) {
        $timestamp = time();
        $signature = sha1("public_id={$public_id}&timestamp={$timestamp}{$api_secret}");

        $delete_url = "https://api.cloudinary.com/v1_1/{$cloud_name}/image/destroy";

        $post_data = [
            'public_id' => $public_id,
            'timestamp' => $timestamp,
            'api_key' => $api_key,
            'signature' => $signature
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $delete_url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        curl_close($ch);

        $result = json_decode($response, true);

        // ✅ header redirect 사용 (JavaScript alert 제거)
        if ($result['result'] === 'ok') {
            header('Location: ' . $_SERVER['PHP_SELF'] . '?deleted=1');
            exit;
        } else {
            $error_msg = urlencode($result['error']['message'] ?? '알 수 없는 오류');
            header('Location: ' . $_SERVER['PHP_SELF'] . '?error=' . $error_msg);
            exit;
        }
    }
}

// ✅ GET 파라미터로 메시지 표시
$alert_message = '';
if (isset($_GET['deleted'])) {
    $alert_message = "✅ 이미지가 삭제되었습니다!";
} elseif (isset($_GET['error'])) {
    $alert_message = "❌ 삭제 실패: " . htmlspecialchars($_GET['error']);
}



// 선택한 이미지 다운로드
if (isset($_POST['download_selected']) && !empty($_POST['selected_images'])) {
    $download_dir = __DIR__ . "/cloudinary_downloads/";

    if (!is_dir($download_dir)) {
        mkdir($download_dir, 0755, true);
    }

    $downloaded_count = 0;
    foreach ($_POST['selected_images'] as $url) {
        $filename = basename(parse_url($url, PHP_URL_PATH));
        if (file_put_contents($download_dir . $filename, file_get_contents($url))) {
            $downloaded_count++;
        }
    }

    echo "<script>alert('✅ {$downloaded_count}개 이미지 다운로드 완료! (cloudinary_downloads 폴더)');</script>";
}

// 전체 이미지 불러오기
$images = getAllCloudinaryImages($cloud_name, $api_key, $api_secret);
$total_count = count($images);
?>

<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloudinary 이미지 갤러리</title>

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
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        min-height: 100vh;
    }

    .container {
        max-width: 1400px;
        margin: 0 auto;
        background: white;
        border-radius: 20px;
        padding: 40px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        flex-wrap: wrap;
        gap: 20px;
    }

    h1 {
        color: #2c3e50;
        font-size: 2rem;
        display: flex;
        align-items: center;
        gap: 15px;
    }


    .info-box {
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        border-left: 4px solid var(--accent-color);
        border-radius: var(--border-radius);
        padding: 15px 20px;
        margin: 15px 0;
        font-size: 0.9rem;
        line-height: 1.6;
        color: #1565c0;
        box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
    }

    .info-box strong {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
    }

    .stats {
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        padding: 15px 25px;
        border-radius: 12px;
        font-weight: 600;
        color: #1565c0;
        font-size: 1.1rem;
        box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
    }

    .toolbar {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 30px;
        display: flex;
        gap: 15px;
        align-items: center;
        flex-wrap: wrap;
        border: 2px solid #e0e0e0;
    }

    .search-box {
        flex: 1;
        min-width: 250px;
        position: relative;
    }

    .search-box input {
        width: 100%;
        padding: 12px 45px 12px 15px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 15px;
        transition: all 0.3s;
    }

    .search-box input:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }

    .search-box::after {
        content: '🔍';
        position: absolute;
        right: 15px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 18px;
    }

    .filter-buttons {
        display: flex;
        gap: 2px;
    }

    .filter-btn {
        padding: 6px 12px;
        border: 2px solid #e0e0e0;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        font-size: 13px;
        transition: all 0.3s;
    }

    .filter-btn:hover,
    .filter-btn.active {
        background: #3498db;
        color: white;
        border-color: #3498db;
    }

    button {
        background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
        color: white;
        border: none;
        padding: 12px 25px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.3s;
        box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
    }

    button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(52, 152, 219, 0.5);
    }

    .btn-success {
        background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
    }

    .btn-danger {
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
        padding: 8px 16px;
        font-size: 12px;
    }

    .action-bar {
        background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 30px;
        border-left: 4px solid #ff9800;
    }

    .action-bar h3 {
        color: #e65100;
        margin-bottom: 15px;
        font-size: 1.1rem;
    }

    .action-buttons {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }

    .gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 25px;
        margin-top: 30px;
    }

    .image-card {
        border: 2px solid #e0e0e0;
        border-radius: 15px;
        padding: 15px;
        background: white;
        transition: all 0.3s;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        position: relative;
    }

    .image-card:hover {
        border-color: #3498db;
        box-shadow: 0 12px 32px rgba(52, 152, 219, 0.3);
        transform: translateY(-8px);
    }

    .image-card.selected {
        border-color: #27ae60;
        background: #e8f5e9;
    }

    .checkbox-wrapper {
        position: absolute;
        top: 20px;
        left: 20px;
        z-index: 10;
    }

    .checkbox-wrapper input[type="checkbox"] {
        width: 24px;
        height: 24px;
        cursor: pointer;
        accent-color: #27ae60;
    }

    .image-wrapper {
        width: 100%;
        height: 250px;
        overflow: hidden;
        border-radius: 10px;
        margin-bottom: 15px;
        position: relative;
        background: #f5f5f5;
    }

    .image-wrapper img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
    }

    .image-card:hover .image-wrapper img {
        transform: scale(1.1);
    }

    .image-info {
        margin-top: 12px;
    }

    .image-name {
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 8px;
        word-break: break-all;
        font-size: 14px;
    }

    .image-meta {
        display: flex;
        gap: 10px;
        margin-bottom: 12px;
        flex-wrap: wrap;
    }

    .badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
    }

    .badge-format {
        background: #e3f2fd;
        color: #1976d2;
    }

    .badge-size {
        background: #f3e5f5;
        color: #7b1fa2;
    }

    .badge-date {
        background: #fff3e0;
        color: #e65100;
    }

    .image-url {
        background: #f5f5f5;
        padding: 8px;
        border-radius: 6px;
        font-size: 11px;
        word-break: break-all;
        margin-bottom: 10px;
        font-family: 'Courier New', monospace;
        color: #666;
    }

    .card-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
    }

    .btn-small {
        flex: 1;
        padding: 8px 12px;
        font-size: 12px;
    }

    .empty-state {
        text-align: center;
        padding: 80px 20px;
        color: #95a5a6;
    }

    .empty-state svg {
        font-size: 100px;
        margin-bottom: 20px;
    }

    .loading {
        text-align: center;
        padding: 60px;
        font-size: 1.2rem;
        color: #7f8c8d;
    }

    .btn-nav {
        flex: 1;
        padding: 15px;
        border-radius: 12px;
        border: none;
        background: linear-gradient(135deg, #5B7FFF 0%, #4A6DE8 100%);
        color: white;
        font-weight: 700;
        text-align: center;
        transition: all .3s;
        box-shadow: 0 4px 12px rgba(74, 116, 255, 0.3);
    }

    .btn-nav:hover {
        background: linear-gradient(135deg, #4A6DE8 0%, #3956D1 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(74, 116, 255, 0.5);
    }

    .btn-nav a {
        color: white;
        text-decoration: none;
        display: block;
    }

    .btn-common {
        padding: 10px 18px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
    }

    .btn-upload {
        background: #4A74FF;
        color: white;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }

    .btn-upload:hover {
        background: #335DFF;
    }

    .btn-selected-count {
        background: #6C8CFF;
        color: white;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        height: 42px;
        min-width: 110px;
    }

    .btn-selected-count:hover {
        background: #5A79E8;
    }

    /* 네비게이션 버튼 박스 스타일 */
    .navigation-box {
        background: #f8f9fa;
        border: 2px solid #e0e0e0;
        border-radius: 15px;
        padding: 25px;
        margin-top: 40px;
    }

    .nav-button-item {
        margin-bottom: 15px;
    }

    .nav-button-item:last-child {
        margin-bottom: 0;
    }


    .navigation-box .nav-button-item:nth-child(1) .btn-navigation {
        /* 첫 번째 버튼에만 적용할 스타일 */
        background-color: #6ba067ff;
        /* 예시: 녹색 배경 */
        color: black;
        /* ... 다른 스타일 */
    }

    .navigation-box .nav-button-item:nth-child(1) .btn-navigation:hover {
        background: #45a04dff;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }


    .btn-navigation {
        width: 100%;
        padding: 14px 20px;
        border-radius: 10px;
        border: none;
        background: #7f8c8d;
        color: white;
        font-weight: 600;
        font-size: 15px;
        text-align: center;
        transition: all 0.3s;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .btn-navigation:hover {
        background: #95a5a6;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .btn-navigation a {
        color: white;
        text-decoration: none;
        display: block;
    }



    /* 새롭게 추가된 DB 저장 버튼 스타일 */
    .btn-db-save {
        text-decoration: none !important;
        text-align: center;
        background-color: #FEE500 !important;
        color: #f75a2aff !important;
        font-weight: bold;
        border: none;
        padding: 10px 18px;
        border-radius: 8px;
        cursor: pointer;
        transition: 0.2s ease;
    }

    .btn-db-save:hover {
        background-color: #facd07ff !important;
    }




    /* "돌아가기" 버튼 스타일 */
    .return-btn {
        text-decoration: none;
        margin-top: 15px;
        background-color: #5d5c6dff;
        /* ✅ 요청하신 배경색 */

        /* ✅ 중앙 정렬을 위한 코드 */
        display: block;
        margin-left: auto;
        margin-right: auto;

        /* 버튼 모양 예쁘게 다듬기 */
        color: white;
        /* 글자색 흰색 */
        border: none;
        /* 테두리 없음 */
        padding: 12px 30px;
        /* 내부 여백 */
        border-radius: 10px;
        /* 모서리 둥글게 */
        font-weight: 600;
        /* 글자 굵게 */
        cursor: pointer;
        /* 마우스 커서 손가락 모양 */
        width: fit-content;
        /* 내용물 크기에 맞게 너비 조절 (필요시 제거하면 꽉 참) */
    }

    .return-btn a {
        text-decoration: none;
        color: white;
        /* 링크 글자색 흰색 고정 */
        display: block;
    }

    .return-btn:hover {
        background-color: #4b4a58;
        /* 마우스 올렸을 때 살짝 어둡게 */
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    /* 모바일 반응형 버튼 정렬 */
    @media (max-width: 768px) {
        .container {
            padding: 25px;
        }

        .header {
            flex-direction: column;
            align-items: flex-start;
        }

        .toolbar {
            flex-direction: column;
            align-items: stretch;
        }

        .search-box {
            flex-basis: 100%;
            min-width: unset;
        }

        .filter-buttons {
            flex-basis: 100%;
            gap: 1px;
        }

        .filter-btn {
            flex: 1;
            padding: 6px 8px;
            font-size: 12px;
            border-radius: 5px;
        }

        .gallery {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
        }

        .image-wrapper {
            height: 200px;
        }

        h1 {
            font-size: 1.5rem;
        }

        .btn-upload,
        .btn-selected-count {
            width: 100%;
            margin-bottom: 8px;
        }

        .navigation-box {
            padding: 20px;
        }
    }
</style>
</head>

<body>

    <div class="container">
        <div class="header">
            <h1>🖼️ Cloudinary 이미지 갤러리</h1>
            <div class="stats">
                📊 총 <span style="font-size:1.3rem;"><?= $total_count ?></span>개 이미지
            </div>
        </div>

        <div class="info-box">
            <strong>📢 알림</strong>
            (이미지 전송방법) 이곳은 Cloudinary에서 이미지를 업로드/다운로드 관리 서비스해주는곳과 연동되므로
            굳이 이 Cloudinary사이트로 들어가지않아도 된다. 편리하게 여기서 바로 작업할수있게 만든곳이다.
            여기서는 직접 내 웹서버의 DB images테이블의 url칼럼 으로 이미지를 전송시킬수는 없다. 그렇게 작업을
            하려면 "해당이미지의 주소를 복사한후에" 아래에있는 "🖼️ 이미지 DB에 저장" 버튼을 클릭하면
            /images_cloudinary_upload.php페이지(📸 이미지 업로드 페이지) 에서 복사한주소를 입력하고 아래에있는
            "✅ 전송" 버튼을 클릭하면 DB(데이타베이스)로 전송이 가능하다.<br>
            ☞ 나의 웹서버의 DB images 테이블 url칼럼으로 저장된다. 웹페이지 images_view.php(열람) /
            images_edit.php(편집) 열면 DB에서는 url정보를 가져와서 페이지에 뿌려진다.
            ☞ 실제로 해당 url주소의 이미지는 ImageBB, Firebase Storage, Cloudinary...
            서버에 보관되어 있어야만한다.
        </div>

        <div class="toolbar">
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="이미지 이름으로 검색...">
            </div>
            <div class="filter-buttons">
                <button class="filter-btn active" onclick="filterImages('all')">전체</button>
                <button class="filter-btn" onclick="filterImages('jpg')">JPG</button>
                <button class="filter-btn" onclick="filterImages('png')">PNG</button>
                <button class="filter-btn" onclick="filterImages('gif')">GIF</button>
            </div>
        </div>

        <?php if ($total_count > 0): ?>
            <form method="post" id="galleryForm">
                <div class="action-bar">
                    <h3>✅ 선택한 이미지 작업</h3>
                    <div class="action-buttons">
                        <button type="button" onclick="selectAll()">📌 전체 선택</button>
                        <button type="button" onclick="deselectAll()">🔄 선택 해제</button>
                        <button type="submit" name="download_selected" class="btn-success">💾 선택 다운로드</button>
                        <button type="button" onclick="copySelectedURLs()">📋 URL 복사</button>
                        <button type="button" onclick="showSelectedCount()">🔢 선택 개수</button>
                        <a class="btn-db-save" href="images_upload.php" target="_blank">
                            🖼️ 이미지 DB에 저장
                        </a>

                    </div>
                </div>

                <div class="gallery" id="gallery">
                    <?php foreach ($images as $img):
                        $format = strtoupper($img['format'] ?? 'unknown');
                        $size_kb = round(($img['bytes'] ?? 0) / 1024, 1);
                        $created_date = date('Y-m-d', strtotime($img['created_at'] ?? ''));
                        $public_id = $img['public_id'] ?? '';
                        $filename = basename($public_id);
                        ?>
                        <div class="image-card" data-format="<?= strtolower($format) ?>"
                            data-name="<?= strtolower($filename) ?>">
                            <div class="checkbox-wrapper">
                                <input type="checkbox" name="selected_images[]" value="<?= $img['secure_url'] ?>"
                                    onchange="toggleCardSelection(this)">
                            </div>

                            <div class="image-wrapper">
                                <img src="<?= $img['secure_url'] ?>" alt="<?= $filename ?>" loading="lazy">
                            </div>

                            <div class="image-info">
                                <div class="image-name">📁 <?= $filename ?></div>

                                <div class="image-meta">
                                    <span class="badge badge-format"><?= $format ?></span>
                                    <span class="badge badge-size">💾 <?= $size_kb ?> KB</span>
                                    <span class="badge badge-date">📅 <?= $created_date ?></span>
                                </div>

                                <div class="image-url" onclick="copyToClipboard(this.textContent)">
                                    <?= $img['secure_url'] ?>
                                </div>

                                <div class="card-actions">
                                    <button type="button" class="btn-small" onclick="openImage('<?= $img['secure_url'] ?>')">
                                        👁️ 보기
                                    </button>
                                    <button type="button" class="btn-small btn-danger"
                                        onclick="deleteImage('<?= $public_id ?>', '<?= $filename ?>')">
                                        🗑️ 삭제
                                    </button>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </form>
        <?php else: ?>
            <div class="empty-state">
                <div style="font-size:100px;">📭</div>
                <p style="font-size:1.3rem; margin-top:20px;">Cloudinary에 저장된 이미지가 없습니다</p>
                <p style="color:#95a5a6; margin-top:10px;">먼저 이미지를 업로드해주세요.</p>
            </div>
        <?php endif; ?>

        <div class="navigation-box">
            <div class="nav-button-item">
                <button type="button" class="btn-navigation">
                    <a href="images_cloudinary_upload_1.php">⏪ Cloudinary up/down room 으로 가기(전용방)</a>
                </button>
            </div>

            <button type="button" class="return-btn">
                <a href="images_upload.php">⏪ 돌아가기</a>
            </button>
        </div>

    </div>

    <script>
        function toggleCardSelection(checkbox) {
            const card = checkbox.closest('.image-card');
            if (checkbox.checked) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        }

        function selectAll() {
            const checkboxes = document.querySelectorAll('.image-card:not([style*="display: none"]) input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = true;
                toggleCardSelection(cb);
            });
        }

        function deselectAll() {
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = false;
                toggleCardSelection(cb);
            });
        }

        function showSelectedCount() {
            const count = document.querySelectorAll('input[type="checkbox"]:checked').length;
            alert(`✅ 선택된 이미지: ${count}개`);
        }

        function copySelectedURLs() {
            const selected = [];
            document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
                selected.push(cb.value);
            });

            if (selected.length === 0) {
                alert('⚠️ 선택된 이미지가 없습니다.');
                return;
            }

            const text = selected.join('\n');
            navigator.clipboard.writeText(text).then(() => {
                alert(`✅ ${selected.length}개 이미지 URL이 복사되었습니다!`);
            });
        }

        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                alert('✅ URL이 복사되었습니다!');
            });
        }

        function openImage(url) {
            window.open(url, '_blank');
        }

        function deleteImage(publicId, filename) {
            if (!confirm(`정말로 "${filename}" 이미지를 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다!`)) {
                return;
            }

            const form = document.createElement('form');
            form.method = 'POST';
            form.innerHTML = `
        <input type="hidden" name="delete_image" value="1">
        <input type="hidden" name="public_id" value="${publicId}">
    `;
            document.body.appendChild(form);
            form.submit();
        }

        document.getElementById('searchInput').addEventListener('input', function (e) {
            const searchTerm = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.image-card');

            cards.forEach(card => {
                const name = card.dataset.name;
                if (name.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });

        function filterImages(format) {
            const cards = document.querySelectorAll('.image-card');
            const buttons = document.querySelectorAll('.filter-btn');

            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            cards.forEach(card => {
                if (format === 'all') {
                    card.style.display = '';
                } else {
                    const cardFormat = card.dataset.format;
                    card.style.display = cardFormat === format ? '' : 'none';
                }
            });
        }
    </script>

    <body>
        <?php if ($alert_message): ?>
            <script>
                alert('<?= addslashes($alert_message) ?>');
                // URL에서 파라미터 제거
                history.replaceState(null, '', '<?= $_SERVER['PHP_SELF'] ?>');
            </script>
        <?php endif; ?>


    </body>

</html>