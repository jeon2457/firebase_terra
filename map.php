<?php
// map.php : 장소검색 및 입력 (관리자 전용)
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';


// 🔹 [추가] 관리자 보안 로직: Level 10 미만은 접근 차단 및 로그인 유도
if (!isset($_SESSION['user_level']) || $_SESSION['user_level'] < 10) {
    // 현재 접속한 페이지 주소를 세션에 저장 (로그인 성공 후 다시 돌아오기 위함)
    $_SESSION['redirect_url'] = $_SERVER['REQUEST_URI']; 

    echo "<script>
        alert('관리자 전용 페이지입니다. 로그인이 필요합니다.');
        location.href = 'login.php';
    </script>";
    exit;
}
?>
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>장소검색 및 입력</title>

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
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

<!-- ✅ [수정됨] autoload=false 파라미터 추가 (에러 방지) -->
<script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=3409644aa1cb50eb41430562f5df97d2&libraries=services&autoload=false"></script>

<style>
/* ... (기존 스타일 동일 유지) ... */
* { box-sizing: border-box; }
body { margin: 0; padding: 0; font-family: 'Noto Sans KR', sans-serif; background: #f0f2f5; color: #333; }
.container { max-width: 600px; margin: 0 auto; padding: 20px; display: flex; flex-direction: column; min-height: 100vh; }
h2 { text-align: center; margin-bottom: 15px; color: #2c3e50; font-size: 1.5rem; }
.search-form { display: flex; gap: 10px; margin-bottom: 10px; }
input[type="text"] { flex: 1; padding: 15px; font-size: 16px; border-radius: 12px; border: 1px solid #ccc; outline: none; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
input[type="text"]:focus { border-color: #4a90e2; }
.btn-search { background-color: #4a90e2; color: white; border: none; border-radius: 12px; width: 55px; cursor: pointer; font-size: 1.2rem; box-shadow: 0 2px 5px rgba(0,0,0,0.1); transition: background 0.2s; }
.btn-search:active { background-color: #357abd; }
#placesList { list-style: none; padding: 0; margin: 0 0 20px 0; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); max-height: 200px; overflow-y: auto; display: none; position: relative; z-index: 100; }
#placesList li { padding: 15px; border-bottom: 1px solid #eee; cursor: pointer; }
#placesList li:last-child { border-bottom: none; }
#placesList li:hover { background-color: #f9f9f9; }
#placesList .place-name { font-weight: bold; font-size: 16px; color: #333; margin-bottom: 5px; }
#placesList .place-addr { font-size: 13px; color: #777; }
#placesList li.on { background-color: #e3f2fd; border-left: 5px solid #4a90e2; }
.map-box { background: white; padding: 5px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); min-height: 300px; margin-top: 20px; margin-bottom: 20px; position: relative; display: none; }
.map-box.show { display: block; }
#map { width: 100%; height: 300px; border-radius: 10px; }
.map-placeholder { display: flex; align-items: center; justify-content: center; min-height: 300px; color: #999; font-size: 1.1rem; text-align: center; padding: 40px; line-height: 1.8; }
.button-group { 
  display: flex; 
  flex-direction: column; 
  align-items: center;      /* 가로 중앙정렬 */
  justify-content: center;  /* 세로 중앙정렬 (필요시) */
  gap: 10px; 
  margin-top: auto; 
  padding-top: 20px; 
}
.btn-link { 
  display: block; 
  width: 100%; 
  text-align: center; 
  margin-top: 15px;
  padding: 16px; 
  font-size: 18px; 
  font-weight: bold; 
  border-radius: 12px; 
  text-decoration: none; 
  box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
  transition: all 0.2s; 
  border: none; 
  cursor: pointer; 
}
.btn-preview { background-color: #34c759; color: white; }
.btn-preview:active { background-color: #2da94b; transform: translateY(2px); }
.btn-preview:disabled { background-color: #ccc; cursor: not-allowed; opacity: 0.6; }
.btn-send { background-color: #4a90e2; color: white; margin-top: 15px; }
.btn-send:active { background-color: #357abd; transform: translateY(2px); }
.btn-send:disabled { background-color: #ccc; cursor: not-allowed; opacity: 0.6; }

/* 버튼 영역 */
.btn-area {
    margin-top: 30px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
}

.btn-same {
    width: 100%;
    max-width: 300px;
    padding: 14px 34px !important;
    font-size: 1.15rem !important;
}
</style>
</head>

<body>
<div class="container">
  
  <h2>
    <img src="image/location-30.png" alt="📍" width="30" height="30" style="vertical-align: middle;">
    장소/주소 검색
  </h2>

  <form class="search-form" id="searchForm">
    <input type="text" id="keyword" placeholder="주소(지번/도로명) 또는 건물명 입력" autocomplete="off">
    <button type="submit" class="btn-search">🔍</button>
  </form>

  <div style="margin-bottom:10px;">
    <div style="font-weight:bold;margin-bottom:5px;">모달창 생성 안내문</div>
    <textarea
      id="modalNotice"
      maxlength="500"
      rows="10"
      style="width:100%;padding:15px;font-size:16px;border-radius:12px;border:1px solid #ccc;resize:none;box-shadow:0 2px 5px rgba(0,0,0,0.05);text-align: left;white-space: pre-line;"
    >📖 모임제목:
📅 모임날짜:
⏰ 시간:
📍 장소:
📢 전달사항:

📝 안내사항: 아래의 '카카오맵' / 'TMAP실행' 버튼을 클릭하면 네비게이션이 장소로 안내합니다.

앱이 설치되어있지 않으면 설치 후 이용해주세요.</textarea>
  </div>

  <ul id="placesList"></ul>

  <div class="map-box" id="mapBox">
    <div id="map"></div>
  </div>

  <div class="map-placeholder" id="mapPlaceholder">
    📍 위의 검색창에서 장소(주소)를 검색하고<br>
    목록에서 선택한 후<br>
    "🗺️ 지도 미리보기" 버튼을 눌러주세요
  </div>

  <div class="button-group">
    <button class="btn-link btn-preview" id="btnPreview" onclick="showMapPreview()" disabled
            style="width: 100%; max-width: 350px;">
      🗺️ 지도 미리보기
    </button>

    <button class="btn-link btn-send" id="btnSend" onclick="goToMapView()" disabled
            style="width: 100%; max-width: 350px;">
      📤 이 위치로 지도 보내기
    </button>

    <button class="btn-link btn-secondary" 
            style="width: 100%; max-width: 350px;" 
            onclick="location.href='map_view.php'">
      🔎 지도 보기
    </button>

    <div class="btn-area text-center mt-5">
      <a href="./select.php" class="btn btn-secondary btn-sm btn-same mt-2">⏪ 돌아가기</a>
    </div>  
  </div>

</div>

<script>
// 전역 변수 선언
let mapContainer, mapOption, map, marker, ps, geocoder;
let selectedAddress = "";
let selectedCoords = null;
let isMapPreviewed = false;

// ✅ [수정됨] 카카오맵 로드 후 실행 (에러 방지 핵심)
kakao.maps.load(function() {
    mapContainer = document.getElementById('map');
    mapOption = {
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level: 3
    };

    map = new kakao.maps.Map(mapContainer, mapOption);
    marker = new kakao.maps.Marker({ map: map });

    // 장소 검색 객체 & 주소-좌표 변환 객체 생성
    ps = new kakao.maps.services.Places();
    geocoder = new kakao.maps.services.Geocoder();
});

// 폼 제출 이벤트
document.getElementById('searchForm').addEventListener('submit', function(e) {
  e.preventDefault();
  searchPlaces();
  document.getElementById('keyword').blur(); 
});

// 엔터키 처리
document.getElementById('keyword').addEventListener('keypress', function(e) {
  if (e.key === 'Enter' || e.keyCode === 13) {
    e.preventDefault();
    searchPlaces();
    this.blur();
  }
});

// 통합 검색 함수 (키워드 + 주소)
function searchPlaces() {
  const keyword = document.getElementById('keyword').value.trim();

  if (!keyword) {
    alert('검색어를 입력해주세요!');
    return false;
  }

  // 검색 결과 초기화
  document.getElementById('placesList').style.display = 'none';
  document.getElementById('placesList').innerHTML = "";

  // 1. 키워드 검색 시도
  ps.keywordSearch(keyword, function(data, status) {
    if (status === kakao.maps.services.Status.OK) {
      // 키워드 결과가 있으면 바로 표시
      displayPlaces(data);
    } else {
      // 2. 키워드 결과가 없으면(ZERO_RESULT) -> 주소 검색 시도
      geocoder.addressSearch(keyword, function(result, addrStatus) {
        if (addrStatus === kakao.maps.services.Status.OK) {
          // 주소 검색 결과 포맷을 키워드 결과와 맞춤
          const addrData = result.map(item => ({
            place_name: item.road_address ? item.road_address.address_name : item.address.address_name,
            address_name: item.address_name,
            road_address_name: item.road_address ? item.road_address.address_name : '',
            x: item.x,
            y: item.y
          }));
          displayPlaces(addrData);
        } else {
          // 둘 다 실패 시
          alert('검색 결과가 존재하지 않습니다.');
        }
      });
    }
  });
}

// 검색 결과 목록 표출 (공통)
function displayPlaces(places) {
  const listEl = document.getElementById('placesList');
  listEl.innerHTML = "";
  listEl.style.display = 'block';

  for (let i = 0; i < places.length; i++) {
    const itemEl = document.createElement('li');
    
    const addressName = places[i].road_address_name ? places[i].road_address_name : places[i].address_name;
    const placeName = places[i].place_name;

    itemEl.innerHTML = `
      <div class="place-name">${placeName}</div>
      <div class="place-addr">${addressName}</div>
    `;

    itemEl.onclick = function() {
      selectedCoords = new kakao.maps.LatLng(places[i].y, places[i].x);
      
      const children = listEl.children;
      for(let j=0; j<children.length; j++) children[j].classList.remove('on');
      this.classList.add('on');

      // 선택된 주소 또는 장소명 저장
      selectedAddress = placeName;
      
      document.getElementById('keyword').value = placeName;
      document.getElementById('btnPreview').disabled = false;
      isMapPreviewed = false;
      document.getElementById('btnSend').disabled = true;
    };

    listEl.appendChild(itemEl);
  }

  setTimeout(() => {
    listEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function showMapPreview() {
  if (!selectedCoords) {
    alert("목록에서 장소를 먼저 선택해주세요!");
    return;
  }

  document.getElementById('mapBox').classList.add('show');
  document.getElementById('mapPlaceholder').style.display = 'none';
  
  map.setCenter(selectedCoords);
  marker.setPosition(selectedCoords);
  
  // 기존 인포윈도우 닫기 기능은 없으므로 새로 생성
  new kakao.maps.InfoWindow({
    content: `<div style="width:150px;text-align:center;padding:6px 0;font-size:14px;">${selectedAddress}</div>`
  }).open(map, marker);
  
  setTimeout(() => {
    map.relayout();
    map.setCenter(selectedCoords);
  }, 100);
  
  isMapPreviewed = true;
  document.getElementById('btnSend').disabled = false;
  
  setTimeout(() => {
    document.getElementById('mapBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 200);
}

// ✅ 데이터를 DB에 저장한 후 이동하도록 변경
async function goToMapView() {
  if (!isMapPreviewed) {
    alert("먼저 '지도 미리보기' 버튼을 눌러 지도를 확인해주세요!");
    return;
  }

  if (!selectedAddress) {
    alert("장소를 선택해주세요!");
    return;
  }

  const lat = selectedCoords.getLat();
  const lng = selectedCoords.getLng();
  const noticeText = document.getElementById('modalNotice').value.trim();

  // 1. DB 저장을 위한 FormData 생성
  const formData = new FormData();
  formData.append('addr', selectedAddress);
  formData.append('lat', lat);
  formData.append('lng', lng);
  formData.append('notice', noticeText);

  try {
    // 2. map_save.php를 통해 서버 DB에 저장 요청
    const response = await fetch('map_save.php', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      // 3. 저장 성공 시 이동
      const url = `map_view.php?addr=${encodeURIComponent(selectedAddress)}&lat=${lat}&lng=${lng}`;
      localStorage.setItem('modalNoticeText', noticeText);
      location.href = url;
    } else {
      alert("DB 저장에 실패했습니다: " + result.message);
    }
  } catch (error) {
    console.error('저장 오류:', error);
    alert("서버 통신 중 오류가 발생했습니다.");
  }
}
</script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>