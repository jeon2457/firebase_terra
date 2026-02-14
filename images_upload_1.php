<?php
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';


// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
require_once __DIR__ . '/php/auth_check.php';
require_once __DIR__ . '/php/db-connect-mongo.php';

date_default_timezone_set('Asia/Seoul');

// ==========================
//  URL 업로드 방식 전용 처리
// ==========================

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['upload_type']) && $_POST['upload_type'] === 'url') {

    $photo_url = trim($_POST['photo_url'] ?? '');
    $notice = trim($_POST['notice'] ?? '');

    $datetime = date('Y-m-d H:i:s');

    if ($photo_url === '') {
        echo "<script>alert('이미지 URL을 입력해주세요.'); history.back();</script>";
        exit;
    }

    if (!filter_var($photo_url, FILTER_VALIDATE_URL)) {
        echo "<script>alert('올바른 URL 형식이 아닙니다.'); history.back();</script>";
        exit;
    }

    try {
        // [MongoDB 전환] images 컬렉션에 새 문서 삽입
        $result = $database->images->insertOne([
            'url' => $photo_url,
            'date' => $datetime,
            'notice' => $notice
        ]);

        echo "<script>alert('전송 성공 완료!'); location.href='images_view.php';</script>";
    } catch (Exception $e) {
        echo "<script>alert('전송 실패: " . addslashes($e->getMessage()) . "'); history.back();</script>";
    }
    exit;
}
?>

<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>이미지 URL 업로드</title>

    <!-- 앱 관련 설정 -->
    <link rel="manifest" href="manifest.json" />
    <meta name="msapplication-config" content="/browserconfig.xml">
    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="theme-color" content="#ffffff" />


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
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap"
        rel="stylesheet">

    <script src="https://developers.kakao.com/sdk/js/kakao.min.js"></script>

    <script>
        // 여기에 카카오 앱키 입력해야함!! (JavaScript 키)
        Kakao.init("여기에_카카오_JAVASCRIPT_KEY");
    </script>


    <style>
        :root {
            --primary-color: #2c3e50;
            --secondary-color: #34495e;
            --accent-color: #3498db;
            --success-color: #27ae60;
            --danger-color: #e74c3c;
            --warning-color: #f39c12;
            --light-bg: #ecf0f1;
            --border-radius: 12px;
            --box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Noto Sans KR', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: var(--primary-color);
        }

        .wrapper {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }

        .page-header {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .page-header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            animation: pulse 15s ease-in-out infinite;
        }

        .btn-kakao {
            background: #FEE500;
            border: none;
            padding: 10px 16px;
            border-radius: 8px;
            font-weight: bold;
            color: #3A1D1D;
            cursor: pointer;
        }

        @keyframes pulse {

            0%,
            100% {
                transform: translate(0, 0) scale(1);
            }

            50% {
                transform: translate(-10%, -10%) scale(1.1);
            }
        }

        .page-header h1 {
            font-size: 2rem;
            font-weight: 700;
            margin: 0;
            position: relative;
            z-index: 1;
            letter-spacing: -0.5px;
        }

        .page-header .subtitle {
            font-size: 0.95rem;
            opacity: 0.9;
            margin-top: 8px;
            font-weight: 300;
        }

        .content-wrapper {
            padding: 40px 30px;
        }

        .section-title {
            font-weight: 600;
            font-size: 1.1rem;
            margin: 0 0;
            color: var(--primary-color);
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .section-title::before {
            content: '';
            width: 4px;
            height: 24px;
            background: var(--accent-color);
            border-radius: 2px;
        }

        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #ddd, transparent);
            margin: 40px 0;
        }

        .upload-box {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: var(--border-radius);
            padding: 25px;
            margin-top: 30px;
            margin-bottom: 20px;
            transition: var(--transition);
        }

        .upload-box:hover {
            border-color: var(--accent-color);
            box-shadow: 0 4px 12px rgba(52, 152, 219, 0.15);
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

        input[type="url"],
        input[type="text"],
        input[type="file"] {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e9ecef;
            border-radius: var(--border-radius);
            font-size: 0.95rem;
            transition: var(--transition);
            font-family: 'Noto Sans KR', sans-serif;
        }

        input[type="url"]:focus,
        input[type="text"]:focus {
            outline: none;
            border-color: var(--accent-color);
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        input[type="file"] {
            padding: 10px;
            cursor: pointer;
        }

        input[type="file"]::file-selector-button {
            padding: 8px 16px;
            background: var(--secondary-color);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            margin-right: 12px;
            transition: var(--transition);
        }

        input[type="file"]::file-selector-button:hover {
            background: var(--primary-color);
            transform: translateY(-1px);
        }

        .btn-group {
            display: flex;
            gap: 10px;
            margin-top: 15px;
            flex-wrap: wrap;
        }

        button,
        .btn-link {
            padding: 12px 24px;
            border: none;
            border-radius: var(--border-radius);
            font-weight: 500;
            cursor: pointer;
            transition: var(--transition);
            font-size: 0.95rem;
            font-family: 'Noto Sans KR', sans-serif;
            text-decoration: none;
            display: inline-block;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        button:hover,
        .btn-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        button:active,
        .btn-link:active {
            transform: translateY(0);
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--accent-color) 0%, #2980b9 100%);
            color: white;
        }

        .btn-success {
            background: linear-gradient(135deg, var(--success-color) 0%, #229954 100%);
            color: white;
        }

        .btn-secondary {
            background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
            color: white;
        }

        .btn-firebase {
            background: linear-gradient(135deg, #FFA000 0%, #FF6F00 100%);
            color: white;
            font-weight: 600;
        }

        /* Firebase 이미지보기 전용 스타일 */
        .btn-firebase-gallery {
            background: #006400;
            /* 짙은 녹색 */
            color: white;
            font-weight: 600;
        }

        .btn-danger {
            background: linear-gradient(135deg, var(--danger-color) 0%, #c0392b 100%);
            color: white;
        }


        .kakao-buttons {
            display: flex;
            gap: 10px;
            padding: 20px;
            justify-content: center;
        }

        /* 카카오 고유 색상 및 아이콘 스타일링 */
        .btn-kakao-chat {
            background-color: #FEE500;
            color: #3C1E1E;
            font-weight: bold;
            border: none;
            display: flex;
            align-items: center;
        }

        .btn-kakao-chat:hover {
            background-color: #f7d200;
        }

        .kakao-icon {
            margin-right: 5px;
            font-size: 1.2em;
            /* 아이콘 크기 조정 */
        }

        .btn-warning {
            background: linear-gradient(135deg, #d4b498ff 0%, #e7af81ff 100%);
            color: white;
        }

        #firebaseResultBox {
            margin-top: 20px;
            padding: 20px;
            background: white;
            border-radius: var(--border-radius);
            border: 2px solid #e9ecef;
            max-height: 500px;
            overflow-y: auto;
        }

        #firebaseResultBox::-webkit-scrollbar {
            width: 8px;
        }

        #firebaseResultBox::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }

        #firebaseResultBox::-webkit-scrollbar-thumb {
            background: var(--accent-color);
            border-radius: 4px;
        }

        .upload-history-item {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 15px;
            margin: 10px 0;
            border-radius: var(--border-radius);
            border: 2px solid #dee2e6;
            transition: var(--transition);
        }

        .upload-history-item:hover {
            border-color: var(--accent-color);
            transform: translateX(5px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .upload-history-item textarea {
            width: 100%;
            font-size: 0.85em;
            padding: 10px;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            resize: vertical;
            min-height: 60px;
            margin: 8px 0;
            font-family: 'Courier New', monospace;
            background: white;
        }

        .upload-history-item button {
            padding: 8px 16px;
            font-size: 0.9rem;
            margin-right: 5px;
            margin-top: 8px;
        }

        .upload-time {
            font-size: 0.85em;
            color: #6c757d;
            margin-bottom: 8px;
            font-weight: 500;
        }

        .preview-box {
            margin-top: 20px;
            padding: 20px;
            background: white;
            border: 2px dashed var(--accent-color);
            border-radius: var(--border-radius);
            display: none;
            text-align: center;
        }

        .preview-box img {
            max-width: 100%;
            max-height: 400px;
            display: block;
            margin: 15px auto;
            border-radius: var(--border-radius);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .preview-box strong {
            display: block;
            margin-bottom: 10px;
            color: var(--accent-color);
            font-size: 1.1rem;
        }

        .clear-history-btn {
            width: 100%;
            margin-bottom: 15px;
        }

        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #95a5a6;
        }

        .empty-state svg {
            width: 80px;
            height: 80px;
            opacity: 0.3;
            margin-bottom: 15px;
        }

        .nav-buttons {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }

        .btn-nav {
            flex: 1;
            padding: 15px;
            border-radius: 12px;
            border: 2px solid #667eea;
            background: white;
            color: #667eea;
            font-weight: 700;
            text-decoration: none;
            text-align: center;
            display: block;
        }

        .btn-nav:hover {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }


        @media (max-width: 768px) {
            .wrapper {
                border-radius: 0;
                margin: -20px;
            }

            .page-header {
                padding: 30px 20px;
            }

            .page-header h1 {
                font-size: 1.5rem;
            }

            .content-wrapper {
                padding: 30px 20px;
            }

            .upload-box {
                padding: 20px 15px;
            }

            .btn-group {
                flex-direction: column;
            }

            button,
            .btn-link {
                width: 100%;
                text-align: center;
            }

            .upload-history-item button {
                width: calc(33.33% - 5px);
                margin-right: 5px;
                font-size: 0.85rem;
                padding: 8px 4px;
            }
        }
    </style>



    <!-- Firebase SDK -->
    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
        import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

        const firebaseConfig = {
            apiKey: "AIzaSyBOw6XYXDGgXNf9a5hcJZhMnj_g6ng0314",
            authDomain: "terraone-images.firebaseapp.com",
            projectId: "terraone-images",
            storageBucket: "terraone-images.firebasestorage.app",
            messagingSenderId: "1055181841490",
            appId: "1:1055181841490:web:a994d25bf50aea653fab8b",
            measurementId: "G-71JG2JTSN2"
        };

        const app = initializeApp(firebaseConfig);
        const storage = getStorage(app);

        let uploadHistory = [];

        window.addEventListener('DOMContentLoaded', () => {
            loadUploadHistory();
        });

        function loadUploadHistory() {
            const saved = localStorage.getItem('firebaseUploadHistory');
            if (saved) {
                uploadHistory = JSON.parse(saved);
                displayUploadHistory();
            }
        }

        function saveUploadHistory() {
            localStorage.setItem('firebaseUploadHistory', JSON.stringify(uploadHistory));
        }

        function displayUploadHistory() {
            const resultBox = document.getElementById('firebaseResultBox');

            if (uploadHistory.length === 0) {
                resultBox.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                <div>업로드 이력이 없습니다</div>
            </div>
        `;
                return;
            }

            let html = '<button class="btn-danger clear-history-btn" onclick="clearAllHistory()">🗑️ 전체 이력 삭제</button>';

            uploadHistory.forEach((item, index) => {
                html += `
            <div class="upload-history-item">
                <div class="upload-time">⏰ ${item.time}</div>
                <strong>📁 ${item.filename}</strong>
                <textarea id="url_${index}" readonly>${item.url}</textarea>
                <button class="btn-secondary" onclick="copyURL(${index})">📋 복사</button>
                <button class="btn-success" onclick="useURL(${index})">✅ 사용</button>
                <button class="btn-danger" onclick="deleteHistoryItem(${index})">🗑️ 삭제</button>
            </div>
        `;
            });

            resultBox.innerHTML = html;
        }

        function addToHistory(filename, url) {
            const now = new Date();
            const timeStr = now.toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            uploadHistory.unshift({
                filename: filename,
                url: url,
                time: timeStr
            });

            if (uploadHistory.length > 20) {
                uploadHistory = uploadHistory.slice(0, 20);
            }

            saveUploadHistory();
            displayUploadHistory();
        }

        window.uploadToFirebase = async function () {
            const fileInput = document.getElementById('firebase_file');
            const resultBox = document.getElementById('firebaseResultBox');
            const externalUrl = document.getElementById('image_url');

            if (!fileInput.files.length) {
                alert("업로드할 파일을 선택하세요!");
                return;
            }

            const file = fileInput.files[0];

            if (!file.type.startsWith('image/')) {
                alert("이미지 파일만 업로드 가능합니다!");
                return;
            }

            const fileName = Date.now() + "_" + file.name;
            const storageRef = ref(storage, "uploads/" + fileName);

            resultBox.innerHTML = "<div style='text-align:center; padding:30px;'><div style='font-size:2rem;'>⏳</div><div style='margin-top:10px;'>업로드 중입니다...</div></div>";

            try {
                await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(storageRef);

                externalUrl.value = downloadURL;

                document.getElementById('preview_box').style.display = 'block';
                document.getElementById('preview_img').src = downloadURL;

                addToHistory(file.name, downloadURL);

                alert("✅ Firebase 업로드 완료!");

            } catch (error) {
                console.error(error);
                alert("업로드 실패: " + error.message);
                resultBox.innerHTML = "<div style='text-align:center; padding:30px; color:#e74c3c;'><div style='font-size:2rem;'>❌</div><div style='margin-top:10px;'>업로드 실패</div></div>";
            }
        };

        window.copyURL = function (index) {
            const textarea = document.getElementById('url_' + index);
            textarea.select();
            document.execCommand("copy");
            alert("URL이 복사되었습니다!");
        };

        window.useURL = function (index) {
            const url = uploadHistory[index].url;
            document.getElementById('image_url').value = url;

            document.getElementById('preview_box').style.display = 'block';
            document.getElementById('preview_img').src = url;

            alert("URL이 적용되었습니다! 이제 '전송' 버튼을 눌러주세요.");
        };

        window.deleteHistoryItem = function (index) {
            if (confirm("이 항목을 삭제하시겠습니까?")) {
                uploadHistory.splice(index, 1);
                saveUploadHistory();
                displayUploadHistory();
            }
        };

        window.clearAllHistory = function () {
            if (confirm("모든 업로드 이력을 삭제하시겠습니까?")) {
                uploadHistory = [];
                localStorage.removeItem('firebaseUploadHistory');
                displayUploadHistory();
                alert("모든 이력이 삭제되었습니다.");
            }
        };

        window.openFirebaseStorage = function () {
            const projectId = "terraone-images";
            const bucketName = "terraone-images.firebasestorage.app";
            const url = `https://console.firebase.google.com/project/${projectId}/storage/${bucketName}/files/~2Fuploads`;
            window.open(url, '_blank');
        };
    </script>
</head>

<body>
    <div class="wrapper">

        <div class="page-header">
            <h1>📸 이미지 업로드 페이지</h1>
            <div class="subtitle">Firebase Storage/Cloudinary를 활용한 이미지 관리시스템</div>
        </div>

        <div class="content-wrapper">

            <!-- ① 외부 URL 업로드 -->
            <div class="section-title">① 외부 이미지 주소(URL)</div>
            <div style="margin-left:37px; color:red;">↳ DB로 업로드</div>
            <div class="upload-box">
                <form id="urlForm" method="POST" action="">
                    <input type="hidden" name="upload_type" value="url">

                    <label style="display:block; margin-bottom:8px; font-weight:500; color:#495057;">
                        이미지 파일 주소(URL)
                    </label>
                    <input type="url" id="image_url" name="photo_url"
                        placeholder="앱 Cloudinary or Firebase Storage 주소입력" required>

                    <!-- 요약 입력 -->
                    <label for="notice"
                        style="display:block; margin-top:20px; margin-bottom:8px; font-weight:500; color:#495057;">
                        요약 입력
                    </label>
                    <input type="text" id="notice" name="notice" placeholder="이미지 설명을 기입하세요">

                    <div class="info-box">
                        <strong>📢 알림</strong>
                        (
                        <span style="font-weight: bold; color: darkblue;">나의 웹서버에 업로드</span>
                        ) 앱 Cloudinary 또는, Firebase Storage 외부 이미지 호스팅업체의 저장소에서 보관중인
                        링크주소를 복사해서 가져와 위 입력칸에 붙여넣기해서 전송하면 링크주소가 나의 웹서버의
                        DB images 테이블 url칼럼으로 저장된다. 웹페이지 images_view.php(열람) /
                        images_edit.php(편집) 열면 DB에서는 url정보를 가져와서 페이지에 뿌려진다.
                        ☞ 실제로 해당 url주소의 이미지 보관 데이타베이스는 Firebase Storage로 업로드 하거나 Cloudinary 서버로 업로드해서 서버에 보관되어 있어야만한다.
                    </div>

                    <!-- 미리보기 영역 -->
                    <div id="preview_box" class="preview-box">
                        <strong>📷 미리보기</strong>
                        <img id="preview_img" src="" alt="이미지 미리보기">
                    </div>


                    <div class="d-flex justify-content-center">
                        <div class="btn-group">
                            <button type="submit" class="btn-success">✅ 전송</button>
                            <button type="button" class="btn-primary" onclick="previewImage()">👁️ 미리보기</button>
                        </div>
                    </div>
                    <div class="d-flex justify-content-center mt-4 gap-3">
                        <a href="https://open.kakao.com/o/gWWWIK5h" target="_blank" class="btn btn-kakao-chat btn-sm">
                            <span class="kakao-icon">🔗</span> 카카오톡 공유방
                        </a>
                    </div>

                    <div class="d-flex justify-content-center">
                        <button type="button" class="btn-warning mt-3"
                            onclick="location.href='images_cloudinary_upload_1.php'">
                            <span style="color: blue; font-weight: bold;">[방법-1]</span> ☁️ Cloudinary에 이미지 업로드
                        </button>
                    </div>

                </form>
            </div>

            <div class="divider"></div>

            <!-- ② Firebase 업로드 -->
            <div class="section-title">② <span style="color: blue; font-weight: bold;">[방법-2]</span> Firebase에 이미지 업로드
            </div>
            <div class="upload-box">
                <label style="display:block; margin-bottom:8px; font-weight:500; color:#495057;">
                    이미지 파일 선택
                </label>
                <input type="file" id="firebase_file" accept="image/*">
                <div class="info-box">
                    <strong>📢 알림</strong>
                    (이미지 전송방법) 이곳에서 파일선택으로 전송되는<br> 이미지 파일은 먼저 Google Firebase Storage<br> 나의 공간인
                    저장소로만 보내진다.(이미지 보관용)<br>
                    <strong>프로젝트명: terraone-images</strong>
                    <strong>폴더명: uploads</strong>
                    올린 이미지를 나의 웹서버에서 사용하려면 다시 해당 이미지의 주소링크를 복사해서 상단의
                    ① 외부 이미지 주소(URL) 입력창에서 주소를 붙여넣기하고 전송시키면 나의 웹서버의
                    DB images 테이블 url칼럼으로 저장된다.
                </div>

                <div class="d-flex justify-content-center">
                    <div class="btn-group">
                        <!-- Firebase 이미지보기 버튼 (모바일에서 위로 가도록 배치) -->
                        <button class="btn-firebase-gallery" onclick="location.href='images_firebase_gallery.php'">
                            🖼️ Firebase 이미지보기
                        </button>
                        <button class="btn-primary btn-lg" onclick="uploadToFirebase()">🚀 Firebase로 업로드</button>
                        <button class="btn-firebase" onclick="openFirebaseStorage()">
                            🔥 My Firebase Images Room
                        </button>
                    </div>
                </div>


                <div id="firebaseResultBox">
                    <div class="empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                        <div>업로드 이력이 없습니다</div>
                    </div>
                </div>
            </div>

            <div class="nav-buttons">
                <a href="images_main_1.php" class="btn-nav">⏪ 돌아가기</a>
            </div>

        </div>

    </div>

    <script>

        function previewImage() {
            const url = document.getElementById('image_url').value.trim();
            if (!url) {
                alert("URL을 먼저 입력하세요!");
                return;
            }

            const previewBox = document.getElementById('preview_box');
            const previewImg = document.getElementById('preview_img');

            previewImg.src = url;
            previewBox.style.display = 'block';

            previewImg.onerror = function () {
                alert("이미지를 불러올 수 없습니다. URL을 확인해주세요.");
                previewBox.style.display = 'none';
            };
        }
    </script>

</body>

</html>