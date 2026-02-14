<?php
session_start();

// Cloudinary 설정 (본인 계정 정보 확인 필수)
$cloud_name = "dghx4ciwc";
$api_key = "367476117442322";
$api_secret = "3_1JaaakBOyp7qDkbAjIWbQ6FDE";
$upload_preset = "direct_upload"; // Cloudinary 설정에서 Unsigned Upload Preset 이름 확인

// [중요] 이미지 삭제 로직
if (isset($_POST['delete_selected'])) {
    if (!empty($_POST['selected_data'])) {
        foreach ($_POST['selected_data'] as $data) {
            // 체크박스 값에서 public_id 분리
            $parts = explode('|', $data);
            if (count($parts) < 2)
                continue;
            $public_id = $parts[1];

            $timestamp = time();
            // 삭제 서명 생성
            $signature = sha1("public_id=$public_id&timestamp=$timestamp$api_secret");
            $del_url = "https://api.cloudinary.com/v1_1/{$cloud_name}/image/destroy";

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $del_url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, [
                'public_id' => $public_id,
                'timestamp' => $timestamp,
                'api_key' => $api_key,
                'signature' => $signature
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_exec($ch);
            curl_close($ch);
        }
        header("Location: " . $_SERVER['PHP_SELF']);
        exit;
    } else {
        $error_msg = "삭제할 이미지를 선택해주세요.";
    }
}

// [중요] 내 기기로 다운로드 로직
if (isset($_POST['download_to_device'])) {
    if (!empty($_POST['selected_data'])) {
        $data_list = $_POST['selected_data'];
        if (count($data_list) === 1) {
            $parts = explode('|', $data_list[0]);
            $url = $parts[0];
            $filename = basename(parse_url($url, PHP_URL_PATH));

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $data = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($http_code == 200 && $data) {
                header("Content-Type: application/octet-stream");
                header("Content-Disposition: attachment; filename=\"$filename\"");
                header("Content-Length: " . strlen($data));
                echo $data;
                exit;
            } else {
                $error_msg = "이미지 다운로드 실패 (HTTP Code: $http_code)";
            }
        } else {
            $error_msg = "내 기기로 다운로드는 한 번에 한 장씩만 가능합니다.";
        }
    } else {
        $error_msg = "다운로드할 이미지를 선택해주세요.";
    }
}

// [수정] 이미지 업로드 처리
if (isset($_POST['upload'])) {
    if (!empty($_FILES['image']['tmp_name'])) {
        $image_file = $_FILES['image']['tmp_name'];
        $upload_url = "https://api.cloudinary.com/v1_1/{$cloud_name}/image/upload";

        $cfile = new CURLFile($image_file, $_FILES['image']['type'], $_FILES['image']['name']);

        $post_fields = [
            'file' => $cfile,
            'upload_preset' => $upload_preset,
            'tags' => 'terraone_gallery'
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $upload_url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post_fields);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            $error_msg = "cURL 오류: " . $error;
        } else {
            $uploaded = json_decode($response, true);
            if (isset($uploaded['secure_url'])) {
                header("Location: " . $_SERVER['PHP_SELF']);
                exit;
            } else {
                $api_error = isset($uploaded['error']['message']) ? $uploaded['error']['message'] : "알 수 없는 오류";
                $error_msg = "업로드 실패: " . $api_error . " (Debug: " . $response . ")";
                $error_msg = "업로드 실패: " . $api_error;
            }
        }
    } else {
        $error_msg = "파일을 선택해주세요.";
    }
}

// [수정] 이미지 리스트 가져오기 (Admin API)
$resource_url = "https://api.cloudinary.com/v1_1/{$cloud_name}/resources/image?max_results=30";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $resource_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, "$api_key:$api_secret");
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$list_response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$list = json_decode($list_response, true);

if ($http_code != 200) {
    $error_msg = "이미지 목록 로드 실패 (HTTP $http_code): " . ($list['error']['message'] ?? '권한 또는 설정 오류');
    $images = [];
} else {
    $images = $list['resources'] ?? [];
}
?>

<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloudinary 이미지 업로드 & 관리</title>

    <link rel="icon" href="favicon.png?v=2" />

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
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        h2 {
            color: #2c3e50;
            margin: 20px 0;
            padding-bottom: 10px;
            border-bottom: 3px solid #3498db;
        }

        .upload-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
        }

        .info-box {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            border-left: 4px solid #3498db;
            border-radius: 12px;
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

        input[type="file"] {
            padding: 10px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            width: 100%;
            max-width: 400px;
            margin: 10px 0;
        }

        button {
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        }

        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
        }

        .card-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }

        .card {
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            padding: 15px;
            background: white;
            transition: all 0.3s;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .card:hover {
            border-color: #3498db;
            box-shadow: 0 8px 24px rgba(52, 152, 219, 0.3);
            transform: translateY(-5px);
        }

        .card img {
            width: 100%;
            height: 180px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 10px;
        }

        .card label {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            font-weight: 500;
            color: #2c3e50;
        }

        .card input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
        }

        .link-input-section {
            background: #e3f2fd;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
        }

        #selected_link {
            width: 100%;
            padding: 12px;
            border: 2px solid #2196F3;
            border-radius: 8px;
            font-size: 14px;
            margin: 10px 0;
        }

        .btn-navigation {
            margin-top: 13px;
            width: 100%;
            padding: 14px 20px;
            border-radius: 10px;
            border: none;
            background: #7f8c8d;
            color: white;
            font-weight: 600;
            font-size: 15px;
            text-align: center;
            text-decoration: none;
            transition: all 0.3s;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .btn-navigation:hover {
            background: #95a5a6;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .btn-kakao {
            text-decoration: none !important;
            background-color: #FEE500 !important;
            color: #3C1E1E !important;
            font-weight: bold;
            border: none;
            padding: 10px 18px;
            border-radius: 8px;
            cursor: pointer;
            transition: 0.2s ease;
            text-align: center;
        }

        .btn-kakao:hover {
            background-color: #f5d900 !important;
        }

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

        .btn-delete {
            background: #e74c3c !important;
            /* 빨간색 */
            color: white !important;
            font-weight: bold;
            border: none;
            padding: 10px 18px;
            border-radius: 8px;
            cursor: pointer;
            transition: 0.2s ease;
            text-align: center;
            box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        }

        .btn-delete:hover {
            background: #c0392b !important;
            transform: translateY(-2px);
        }

        .action-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 7px;
            margin-bottom: 10px;
            margin-top: 10px;
            justify-content: center;
        }

        @media (max-width: 768px) {
            .container {
                padding: 20px;
                border-radius: 0;
            }

            .card-container {
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            }

            .card img {
                height: 140px;
            }

            .action-buttons button,
            .action-buttons a {
                flex: 1 1 auto;
                width: 100%;
                margin: 0 !important;
            }
        }
    </style>
</head>

<body>

    <div class="container">
        <?php if (isset($error_msg)): ?>
            <div style="background: #ffebee; color: #c62828; padding: 15px; border-radius: 10px; margin-bottom: 10px;">⚠️
                <?php echo htmlspecialchars($error_msg); ?>
            </div>
        <?php endif; ?>

        <h2>📤 Cloudinary에 업로드</h2>
        <div class="upload-section">
            <div class="info-box">
                <strong>📢 알림</strong>
                (이미지 전송방법) 이곳은 Cloudinary에서 이미지를 업로드/다운로드 관리 서비스해주는곳과 연동되므로
                굳이 이 Cloudinary사이트로 들어가지않아도 된다. 편리하게 여기서 바로 작업할수있게 만든곳이다.
                여기서는 직접 내 웹서버의 DB images테이블의 url칼럼 으로 이미지를 전송시킬수는 없다. 한번을 거쳐서가야한다. 그렇게 작업을
                하려면 "해당이미지의 주소를 복사한후에" 아래에있는 "이미지 DB에 저장" 버튼을 클릭하면
                /images_upload.php페이지(📸 이미지 업로드 페이지) 에서 복사한 주소를 입력해서 "✅ 전송"버튼을 클릭하면 비로소 DB(데이타베이스)로 전송이 가능하다.<br>
                ☞ 나의 웹서버의 DB images 테이블 url칼럼으로 저장된다. Cloudinary사이트에서 업로드된 이미지를 직접확인하려면
                https://console.cloudinary.com/으로 들어가서 좌측메뉴 Assets-Folders로 들어가면
                업로드된 이미지들을 확인할수있다.(Home폴더에 저장되어있다)<br>
                ☞ 실제로 해당 url주소의 이미지 보관 데이타베이스는 Firebase Storage로 업로드 하거나 Cloudinary 서버로 업로드해서 서버에 보관되어 있어야만한다.
            </div>
            <form method="post" enctype="multipart/form-data">
                <input type="file" name="image" accept="image/*" required>
                <button type="submit" name="upload" style="background:#2980b9; color:white;">🚀 업로드 시작</button>
            </form>
        </div>

        <h2>📑 저장된 이미지 목록 (<?php echo count($images); ?>개)</h2>
        <form method="post" id="mainForm">
            <div class="card-container">
                <?php foreach ($images as $img): ?>
                    <?php
                    if (isset($img['resource_type']) && $img['resource_type'] !== 'image')
                        continue;
                    if (empty($img['secure_url']))
                        continue;
                    ?>
                    <div class="card">
                        <img src="<?php echo htmlspecialchars($img['secure_url']); ?>" alt="img"
                            onerror="this.closest('.card').style.display='none';">
                        <label style="display:block; margin-top:5px; cursor:pointer;">
                            <!-- value에 URL과 public_id를 구분자(|)로 같이 저장 -->
                            <input type="checkbox" name="selected_data[]"
                                value="<?php echo htmlspecialchars($img['secure_url'] . '|' . $img['public_id']); ?>"
                                class="img-check"> 선택
                        </label>
                    </div>
                <?php endforeach; ?>
            </div>

            <div class="link-input-section" style="background:#e3f2fd; padding:20px; border-radius:12px;">
                <h3>✔ 선택한 이미지 링크</h3>
                <textarea id="selected_link" rows="3" readonly placeholder="이미지를 선택하면 링크가 표시됩니다"></textarea>

                <div class="action-buttons">
                    <!-- 삭제 버튼 추가 -->
                    <button type="submit" name="delete_selected" class="btn-delete"
                        onclick="return confirm('선택한 이미지를 Cloudinary에서 영구 삭제하시겠습니까?');">🗑️ 선택한 이미지 삭제</button>
                    <button type="submit" name="download_to_device" class="btn-device" style="background:#e67e22;">📱 내
                        기기로 다운로드</button>
                    <button type="button" class="btn-copy" style="background:#9b59b6;" onclick="copyLinks()">📋 링크
                        복사</button>
                    <a href="images_upload.php" class="btn-db-save">🖼️ 이미지 DB에 저장</a>
                    <a href="https://open.kakao.com/o/gWWWIK5h" target="_blank" class="btn-kakao">🔗 카카오톡 공유</a>
                    <a href="images_cloudinary_gallery_1.php" class="btn-navigation" style="background:#6ba067;">⏪
                        Cloudinary 갤러리 가기</a>
                    <a href="images_upload.php" class="btn-navigation">⏪ 돌아가기</a>
                </div>

            </div>
        </form>
    </div>

    <!-- 🔥 [추가] 중요! 유령 서비스 워커(Service Worker) 제거 스크립트 -->
    <script>
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function (registrations) {
                for (let registration of registrations) {
                    // 만약 과거에 manifest.json으로 등록된 워커가 있다면 해제
                    registration.unregister();
                    console.log('Service Worker Unregistered to fix 404 error');
                }
            });
        }
    </script>

    <script>
        const checkboxes = document.querySelectorAll('.img-check');
        const linkInput = document.getElementById('selected_link');

        // 체크박스 변경 시 링크 텍스트 업데이트
        checkboxes.forEach(ch => {
            ch.addEventListener('change', () => {
                // 선택된 항목들의 값 중에서 URL(0번째 인덱스)만 추출하여 표시
                const selected = Array.from(document.querySelectorAll('.img-check:checked')).map(c => c.value.split('|')[0]);
                linkInput.value = selected.join('\n');
            });
        });

        // 링크 복사
        function copyLinks() {
            if (!linkInput.value) {
                alert('⚠️ 선택된 이미지가 없습니다.');
                return;
            }
            const textArea = document.createElement("textarea");
            textArea.value = linkInput.value;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                alert('✅ 클립보드에 복사되었습니다!');
            } catch (err) {
                alert('❌ 복사 실패');
            }
            document.body.removeChild(textArea);
        }
    </script>

</body>

</html>