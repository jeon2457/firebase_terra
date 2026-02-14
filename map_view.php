<?php
// map_view.php
// __DIR__는 현재 파일의 디렉터리 경로를 반환하므로, php 앞에 반드시 /를 붙여야 합니다:
require_once __DIR__ . '/php/db-connect-mongo.php';

// 1. URL 파라미터 확인
$addr = $_GET['addr'] ?? '';
$lat = $_GET['lat'] ?? '';
$lng = $_GET['lng'] ?? '';

// 2. 파라미터가 없으면 DB에서 최신 정보 가져오기 (미리보기용)
if (!$addr) {
  try {
    // [MongoDB 전환] map_data 컬렉션에서 id=1인 문서 조회
    $dbData = $database->map_data->findOne(['id' => 1]);
    if ($dbData) {
      $addr = $dbData['addr'];
      $lat = $dbData['lat'];
      $lng = $dbData['lng'];
    }
  } catch (Exception $e) {
  }
}

// 미리보기 제목 및 설명 설정
$ogTitle = $addr ? "🚗 [직지35] " . $addr . " 찾아오는 길 안내입니다." : " 아래의 주소를 클릭! ";
$ogDesc = "클릭하면 해당장소로 네비게이션(카카오맵/TMAP)이 길을 안내합니다.";

// ✅ [자동 경로 계산 로직 추가] 
// 어떤 폴더(/terraone_php/, /new_terraone_php/1/ 등)에서도 별도 수정 없이 이미지 주소를 생성합니다.
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
$host = $_SERVER['HTTP_HOST'];
$currentPath = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');
$ogImage = $protocol . $host . $currentPath . "/image/map_icon_1.png";

?>
<!DOCTYPE html>
<html lang="ko">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

  <!-- 카카오톡 공유 시 보여질 메타 태그 (Open Graph) -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="<?= htmlspecialchars($ogTitle) ?>">
  <meta property="og:description" content="<?= htmlspecialchars($ogDesc) ?>">
  <meta property="og:image" content="<?= $ogImage ?>">
  <meta property="og:url" content="<?= $protocol . $host . $_SERVER['REQUEST_URI'] ?>">

  <title><?= $ogTitle ?></title>

  <link rel="icon" href="/favicon.png?v=2" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

  <!-- ✅ [수정됨] autoload=false 파라미터 추가 -->
  <script
    src="//dapi.kakao.com/v2/maps/sdk.js?appkey=3409644aa1cb50eb41430562f5df97d2&libraries=services&autoload=false"></script>

  <style>
    /* 기본 스타일 (원본 보존) */
    body {
      margin: 0;
      padding: 0;
      font-family: 'Noto Sans KR', sans-serif;
      background: #f9f9f9;
      color: #333;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 1px 8px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      position: relative;
    }

    h2 {
      text-align: center;
      margin-top: 0;
      margin-bottom: 4px;
      font-size: 1.4rem;
      color: #2c3e50;
    }

    .map-container {
      width: 100%;
      height: 350px;
      border-radius: 15px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      margin-bottom: 20px;
      background: #eee;
    }

    .info-box {
      background: white;
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      margin-bottom: 150px;
      text-align: center;
    }

    .place-name {
      font-size: 1.3rem;
      font-weight: bold;
      color: #1976d2;
      margin-bottom: 10px;
    }

    .notice-text {
      font-size: 0.95rem;
      line-height: 1.6;
      white-space: pre-line;
      text-align: left;
      color: #555;
      background: #f8f9fa;
      padding: 15px;
      border-radius: 10px;
    }

    .navi-buttons {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 400px;
      z-index: 9999;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .btn-navi {
      padding: 14px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
    }

    .btn-navi:active {
      transform: scale(0.96);
    }

    .btn-icon {
      width: 24px;
      height: 24px;
      object-fit: contain;
      border-radius: 4px;
    }

    .btn-kakao {
      background-color: #FEE500;
      color: #3C1E1E;
    }

    .btn-tmap {
      background-color: #004c97;
      color: #ffffff;
    }

    .btn-share {
      background: #34c759;
      color: white;
      grid-column: 1 / -1;
    }
  </style>
</head>

<body>
  <div class="container">

    <h2>📍 모임 장소 안내</h2>

    <div class="map-container" id="map"></div>

    <div class="info-box">
      <div class="place-name" id="placeName">로딩 중...</div>
      <div class="notice-text" id="noticeText"></div>
    </div>

    <div class="navi-buttons" id="naviBox">
      <a href="#" id="kakaoLink" class="btn-navi btn-kakao" target="_blank">
        <img src="image/kakao_map.png" alt="kakao" class="btn-icon">
        카카오맵
      </a>

      <div id="tmapLink" class="btn-navi btn-tmap" onclick="tryRunTmap()">
        <img src="image/t_map.jpg" alt="tmap" class="btn-icon">
        TMAP 실행
      </div>

      <button class="btn-navi btn-share" onclick="shareUrl()">
        <i class="bi bi-share-fill"></i> 링크 공유하기
      </button>
    </div>
  </div>

  <script>
    function getQueryParam(name) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name);
    }

    (async function init() {
      let addr = getQueryParam('addr');
      let lat = parseFloat(getQueryParam('lat'));
      let lng = parseFloat(getQueryParam('lng'));
      let notice = null;

      // 🔹 [로직 수정] 관리자 본인이 방금 생성해서 들어온 경우 (localStorage 활용)
      if (addr && !isNaN(lat) && !isNaN(lng)) {
        notice = localStorage.getItem('modalNoticeText');
      }

      // 🔹 [보완] 공유받은 사람이거나, 위 정보가 불완전하면 무조건 DB에서 최신 데이터 로드
      if (!notice) {
        try {
          const response = await fetch('map_load.php');
          const result = await response.json();
          if (result.success) {
            addr = result.data.addr;
            lat = parseFloat(result.data.lat);
            lng = parseFloat(result.data.lng);
            notice = result.data.notice;
          }
        } catch (error) {
          console.error('DB 로드 오류:', error);
        }
      }

      if (addr && !isNaN(lat) && !isNaN(lng)) {
        document.getElementById('placeName').innerText = addr;
        document.getElementById('noticeText').innerText = notice ? notice : "별도 전달사항이 없습니다.";

        kakao.maps.load(function () {
          const mapContainer = document.getElementById('map');
          const mapOption = {
            center: new kakao.maps.LatLng(lat, lng),
            level: 3
          };
          const map = new kakao.maps.Map(mapContainer, mapOption);
          const marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(lat, lng),
            map: map
          });
          new kakao.maps.InfoWindow({
            content: `<div style="padding:5px;text-align:center;width:150px;">${addr}</div>`
          }).open(map, marker);
        });

        document.getElementById('kakaoLink').href = `https://map.kakao.com/link/to/${addr},${lat},${lng}`;

        window.currentAddr = addr;
        window.currentLat = lat;
        window.currentLng = lng;

      } else {
        alert("저장된 장소 정보가 없습니다.");
        document.getElementById('placeName').innerText = "장소 정보 없음";
        document.getElementById('naviBox').style.display = 'none';
      }
    })();

    function tryRunTmap() {
      if (!window.currentAddr || isNaN(window.currentLat) || isNaN(window.currentLng)) {
        alert("위치 정보가 없습니다.");
        return;
      }
      location.href = `tmap://route?goalname=${window.currentAddr}&goalx=${window.currentLng}&goaly=${window.currentLat}`;
    }

    function shareUrl() {
      if (!window.currentAddr) {
        alert("공유할 위치 정보가 없습니다.");
        return;
      }

      // 🔹 공유 링크에서 파라미터를 제거하여 받는 사람이 무조건 DB 데이터를 읽게 함
      const shareLink = `${window.location.origin}${window.location.pathname}`;

      if (navigator.share) {
        navigator.share({
          title: '🚗 [직지35] 모임장소 안내',
          text: `[모임장소] ${window.currentAddr}\n아래 링크를 눌러 확인하세요!`,
          url: shareLink,
        })
          .catch((error) => console.log('공유 실패', error));
      } else {
        const dummy = document.createElement("textarea");
        document.body.appendChild(dummy);
        dummy.value = shareLink;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
        alert("URL이 복사되었습니다. 카톡 등에 붙여넣기 하세요!");
      }
    }
  </script>
</body>

</html>