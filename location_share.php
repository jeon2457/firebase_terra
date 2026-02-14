<?php
// location_share.php
//session_start(); // 아래코드로 대체
require_once __DIR__ . '/php/session.php';

?>
<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>실시간 위치 공유</title>

    <!-- HTTPS 강제 리다이렉트 (선택 사항: SSL 설치된 경우 주석 해제) -->
    <!-- 
    <script>
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        location.replace(`https:${location.href.substring(location.protocol.length)}`);
    }
    </script> 
    -->

    <link rel="manifest" href="/manifest.json">
    <!-- 경로 수정: 절대 경로 대신 상대 경로 사용 -->
    <link rel="icon" href="./favicon.png?v=2" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap"
        rel="stylesheet">

    <script
        src="//dapi.kakao.com/v2/maps/sdk.js?appkey=3409644aa1cb50eb41430562f5df97d2&libraries=services&autoload=false"></script>

    <style>
        body {
            font-family: 'Noto Sans KR', sans-serif;
            background: #f0f2f5;
            height: 100vh;
            display: flex;
            flex-direction: column;
            margin: 0; /* body 마진 제거 */
        }

        .header-bar {
            background: #00897B;
            /* Teal */
            color: white;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 100;
        }

        .control-panel {
            background: white;
            padding: 15px;
            border-radius: 0 0 15px 15px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
            z-index: 90;
        }

        .map-container {
            flex: 1;
            position: relative;
            width: 100%;
            height: 100%;
        }

        .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.8rem;
            background: #eee;
            color: #666;
            margin-top: 5px;
        }

        .status-badge.active {
            background: #e0f2f1;
            color: #00695c;
            border: 1px solid #00897B;
        }
    </style>
</head>

<body>

    <div class="header-bar">
        <div class="d-flex align-items-center">
            <!-- 뒤로가기 버튼 링크 수정 -->
            <a href="javascript:history.back()" class="text-white me-3 fs-4"><i class="bi bi-arrow-left"></i></a>
            <h5 class="m-0 fw-bold">실시간 위치 공유</h5>
        </div>
        <div>
            <i class="bi bi-geo-alt-fill fs-4"></i>
        </div>
    </div>

    <div class="control-panel">
        <div class="mb-3">
            <div style="font-size: 11px; color: #d32f2f; margin-bottom: 2px;">
                ※ 주의: 이 기능은 <strong>HTTPS 보안 연결</strong> 환경에서만 작동합니다.
            </div>
            <label class="form-label small text-muted">닉네임 (필수)</label>
            <div class="input-group">
                <input type="text" class="form-control" id="nickname" placeholder="이름을 입력하세요">
                <button class="btn btn-outline-secondary" type="button" onclick="copyLink()">
                    <i class="bi bi-share-fill"></i> 링크복사
                </button>
            </div>
        </div>

        <div class="d-flex justify-content-between align-items-center">
            <div>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="shareToggle">
                    <label class="form-check-label fw-bold" for="shareToggle">위치 공유 시작</label>
                </div>
                <div id="statusText" class="status-badge">공유 중지됨</div>
            </div>
            <div class="text-end small text-muted" id="lastUpdate">
                -
            </div>
        </div>
    </div>

    <div id="map" class="map-container"></div>

    <!-- Firebase SDK -->
    <script type="module">
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
        import { getDatabase, ref, set, onValue, remove, onDisconnect } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
        import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

        const firebaseConfig = {
            apiKey: "AIzaSyAF7AD1d54k21-stmb0Hpg9OMEECvzFHpQ",
            authDomain: "terraone-d0318.firebaseapp.com",
            databaseURL: "https://terraone-d0318-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "terraone-d0318",
            storageBucket: "terraone-d0318.firebasestorage.app",
            messagingSenderId: "1082807340877",
            appId: "1:1082807340877:web:6e2b49c04562d800e87104",
            measurementId: "G-7HMJEV832S"
        };

        const app = initializeApp(firebaseConfig);
        const database = getDatabase(app);
        const auth = getAuth(app);

        let map = null;
        let myMarker = null;
        let otherMarkers = {};
        let sendInterval = null;
        let userId = localStorage.getItem('terra_uid');

        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('terra_uid', userId);
        }

        // Firebase 익명 로그인 시도
        signInAnonymously(auth).then(() => {
            console.log("Firebase 로그인 성공:", userId);
            
            // 지도 초기화
            kakao.maps.load(function () {
                const container = document.getElementById('map');
                const options = {
                    center: new kakao.maps.LatLng(36.5, 127.5),
                    level: 3
                };
                map = new kakao.maps.Map(container, options);

                // 다른 사용자 위치 수신 대기
                listenForLocations();
            });
        }).catch((error) => {
            console.error("인증 실패 (도메인 등록 확인 필요):", error);
            alert("서버 인증에 실패했습니다.\nFirebase 콘솔에서 도메인을 등록해주세요.");
        });

        const nickInput = document.getElementById('nickname');
        const toggle = document.getElementById('shareToggle');
        const statusText = document.getElementById('statusText');
        const lastUpdateEl = document.getElementById('lastUpdate');

        const savedNick = localStorage.getItem('terra_nickname');
        if (savedNick) nickInput.value = savedNick;

        nickInput.addEventListener('change', () => {
            localStorage.setItem('terra_nickname', nickInput.value);
        });

        toggle.addEventListener('change', (e) => {
            if (!nickInput.value) {
                alert("공유를 시작하려면 닉네임을 입력해주세요.");
                toggle.checked = false;
                return;
            }

            if (e.target.checked) {
                startSharing();
            } else {
                stopSharing();
            }
        });

        function startSharing() {
            // HTTPS 확인
            if (!navigator.geolocation) {
                alert("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
                toggle.checked = false;
                return;
            }

            statusText.innerText = "위치 확인 중...";
            statusText.classList.add('active');

            sendLocation(); // 즉시 1회 실행
            sendInterval = setInterval(sendLocation, 10000); // 10초마다 갱신

            // 연결 끊기면 자동 삭제
            const myRef = ref(database, 'locations/' + userId);
            onDisconnect(myRef).remove();
        }

        function stopSharing() {
            if (sendInterval) clearInterval(sendInterval);
            statusText.innerText = "공유 중지됨";
            statusText.classList.remove('active');
            remove(ref(database, 'locations/' + userId));
        }

        function sendLocation() {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    const name = nickInput.value || "익명";
                    const now = Date.now();

                    const data = {
                        lat: lat,
                        lng: lng,
                        name: name,
                        timestamp: now,
                        userId: userId
                    };

                    set(ref(database, 'locations/' + userId), data)
                        .then(() => {
                            const timeStr = new Date(now).toTimeString().split(' ')[0];
                            lastUpdateEl.innerText = `전송됨: ${timeStr}`;
                            statusText.innerText = `공유 중 (${name})`;
                            
                            // 내 위치로 지도 이동 (처음에만 혹은 필요시)
                            // map.setCenter(new kakao.maps.LatLng(lat, lng));
                        })
                        .catch(err => console.error("전송 실패:", err));
                },
                (err) => {
                    console.error("GPS 오류:", err);
                    let msg = "위치 오류";
                    if(err.code === 1) msg = "위치 권한 거부됨 (HTTPS 확인)";
                    else if(err.code === 2) msg = "위치 확인 불가";
                    else if(err.code === 3) msg = "시간 초과";
                    
                    statusText.innerText = msg;
                    // 치명적 오류 시 공유 중단
                    if(err.code === 1) {
                        alert("보안 연결(HTTPS)이 아니거나 권한이 거부되어 위치를 공유할 수 없습니다.");
                        toggle.checked = false;
                        stopSharing();
                    }
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        }

        function listenForLocations() {
            const locationsRef = ref(database, 'locations');
            onValue(locationsRef, (snapshot) => {
                const data = snapshot.val() || {};
                const now = Date.now();
                const activeIds = new Set();

                Object.values(data).forEach(userLoc => {
                    // 5분 이상 지난 데이터 무시
                    if (now - userLoc.timestamp > 5 * 60 * 1000) return;

                    activeIds.add(userLoc.userId);
                    updateMarker(userLoc);
                });

                // 없어진 사용자 마커 제거
                Object.keys(otherMarkers).forEach(oid => {
                    if (!activeIds.has(oid)) {
                        otherMarkers[oid].marker.setMap(null);
                        otherMarkers[oid].infowindow.close();
                        delete otherMarkers[oid];
                    }
                });
            });
        }

        function updateMarker(userLoc) {
            const position = new kakao.maps.LatLng(userLoc.lat, userLoc.lng);

            if (otherMarkers[userLoc.userId]) {
                otherMarkers[userLoc.userId].marker.setPosition(position);
                otherMarkers[userLoc.userId].infowindow.setContent(getInfoWindowContent(userLoc));
            } else {
                const marker = new kakao.maps.Marker({
                    position: position,
                    map: map
                });

                const infowindow = new kakao.maps.InfoWindow({
                    position: position,
                    content: getInfoWindowContent(userLoc)
                });
                infowindow.open(map, marker);

                otherMarkers[userLoc.userId] = { marker, infowindow };
            }
        }

        function getInfoWindowContent(userLoc) {
            const isMe = userLoc.userId === userId;
            const color = isMe ? "color:blue;" : "color:black;";
            const label = isMe ? "나 (" + userLoc.name + ")" : userLoc.name;

            return `<div style="padding:5px; text-align:center; font-size:12px; font-weight:bold; ${color}">${label}</div>`;
        }

        window.copyLink = function () {
            const url = window.location.href;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(url).then(() => {
                    alert("링크가 복사되었습니다!");
                });
            } else {
                const ta = document.createElement('textarea');
                ta.value = url;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                alert("링크가 복사되었습니다!");
            }
        }
    </script>
</body>

</html>