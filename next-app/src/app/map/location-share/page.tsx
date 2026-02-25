"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Script from "next/script";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, remove, onDisconnect } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";

declare global {
    interface Window {
        kakao: any;
    }
}

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

export default function LocationSharePage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [kakaoLoaded, setKakaoLoaded] = useState(false);
    const [nickname, setNickname] = useState("");
    const [isSharing, setIsSharing] = useState(false);
    const [statusText, setStatusText] = useState("공유 중지됨");
    const [lastUpdate, setLastUpdate] = useState("-");
    const [userId, setUserId] = useState("");

    const mapRef = useRef<any>(null);
    const otherMarkersRef = useRef<{ [key: string]: { marker: any, infowindow: any } }>({});
    const sendIntervalRef = useRef<any>(null);
    const autoStopTimerRef = useRef<any>(null);

    useEffect(() => {
        // 모바일 "홈 화면에 추가"를 위한 제목 설정
        document.title = "실시간위치공유";

        let uid = localStorage.getItem('terra_uid');
        if (!uid) {
            uid = 'user_' + Math.random().toString(36).substring(2, 11);
            localStorage.setItem('terra_uid', uid);
        }
        setUserId(uid);

        const savedNick = localStorage.getItem('terra_nickname') || session?.user?.name || "";
        setNickname(savedNick);

        signInAnonymously(auth).then(() => {
            console.log("Joined anonymously as", uid);
        }).catch((error) => {
            console.error("Auth failed:", error);
        });

        return () => {
            if (sendIntervalRef.current) clearInterval(sendIntervalRef.current);
            if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
            if (uid) {
                remove(ref(database, 'locations/' + uid));
            }
        };
    }, [session]);

    const handleKakaoLoad = () => {
        if (window.kakao && window.kakao.maps) {
            window.kakao.maps.load(() => {
                const container = document.getElementById('map');
                const options = {
                    center: new window.kakao.maps.LatLng(36.5, 127.5),
                    level: 3
                };
                mapRef.current = new window.kakao.maps.Map(container, options);
                setKakaoLoaded(true);
                listenForLocations();
            });
        }
    };

    const listenForLocations = () => {
        const locationsRef = ref(database, 'locations');
        onValue(locationsRef, (snapshot) => {
            const data = snapshot.val() || {};
            const now = Date.now();
            const activeIds = new Set<string>();

            Object.values(data).forEach((userLoc: any) => {
                if (now - userLoc.timestamp > 5 * 60 * 1000) return;
                activeIds.add(userLoc.userId);
                updateMarker(userLoc);
            });

            Object.keys(otherMarkersRef.current).forEach(oid => {
                if (!activeIds.has(oid)) {
                    otherMarkersRef.current[oid].marker.setMap(null);
                    otherMarkersRef.current[oid].infowindow.close();
                    delete otherMarkersRef.current[oid];
                }
            });
        });
    };

    const getInfoWindowContent = (userLoc: any) => {
        const isMe = userLoc.userId === userId;
        const color = isMe ? "color:blue;" : "color:black;";
        const label = isMe ? "나 (" + userLoc.name + ")" : userLoc.name;
        return `<div style="padding:5px; text-align:center; font-size:12px; font-weight:bold; ${color}">${label}</div>`;
    };

    const updateMarker = (userLoc: any) => {
        if (!mapRef.current) return;
        const position = new window.kakao.maps.LatLng(userLoc.lat, userLoc.lng);

        if (otherMarkersRef.current[userLoc.userId]) {
            otherMarkersRef.current[userLoc.userId].marker.setPosition(position);
            otherMarkersRef.current[userLoc.userId].infowindow.setContent(getInfoWindowContent(userLoc));
            otherMarkersRef.current[userLoc.userId].infowindow.setPosition(position);
        } else {
            const marker = new window.kakao.maps.Marker({
                position: position,
                map: mapRef.current
            });

            const infowindow = new window.kakao.maps.InfoWindow({
                position: position,
                content: getInfoWindowContent(userLoc)
            });
            infowindow.open(mapRef.current, marker);

            otherMarkersRef.current[userLoc.userId] = { marker, infowindow };
        }
    };

    const startSharing = () => {
        if (!navigator.geolocation) {
            alert("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
            setIsSharing(false);
            return;
        }

        setStatusText("위치 확인 중...");
        sendLocation();
        sendIntervalRef.current = setInterval(sendLocation, 10000);

        // 90분 뒤 자동 중단 타이머 설정
        if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
        autoStopTimerRef.current = setTimeout(() => {
            console.log("Auto-stopping location share after 90 minutes");
            setIsSharing(false);
            stopSharing();
            alert("보안을 위해 위치 공유가 시작 90분 후 자동으로 중지되었습니다.");
        }, 90 * 60 * 1000);

        const myRef = ref(database, 'locations/' + userId);
        onDisconnect(myRef).remove();
    };

    const stopSharing = () => {
        if (sendIntervalRef.current) clearInterval(sendIntervalRef.current);
        if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
        setStatusText("공유 중지됨");
        remove(ref(database, 'locations/' + userId));
    };

    const sendLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                const name = nickname || "익명";
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
                        setLastUpdate(`전송됨: ${timeStr}`);
                        setStatusText(`공유 중 (${name})`);
                    })
                    .catch(err => console.error(err));

                if (mapRef.current) {
                    mapRef.current.setCenter(new window.kakao.maps.LatLng(lat, lng));
                }
            },
            (err) => {
                console.error(err);
                setStatusText("위치 오류 재시도...");
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    };

    const copyLink = () => {
        const url = window.location.href;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                alert("링크가 복사되었습니다! 친구에게 공유하세요.");
            });
        } else {
            alert("링크 복사 기능을 지원하지 않는 브라우저입니다.");
        }
    };

    const handleToggleSharing = (checked: boolean) => {
        if (!nickname) {
            alert("공유를 시작하려면 닉네임을 입력해주세요.");
            return;
        }
        setIsSharing(checked);
        if (checked) {
            startSharing();
        } else {
            stopSharing();
        }
    };

    return (
        <div className="location-share-container">
            <Script
                src="//dapi.kakao.com/v2/maps/sdk.js?appkey=3409644aa1cb50eb41430562f5df97d2&libraries=services&autoload=false"
                strategy="afterInteractive"
                onReady={handleKakaoLoad}
            />

            <div className="header-bar">
                <div className="d-flex align-items-center">
                    <button onClick={() => router.back()} className="back-btn text-white me-3 fs-4 border-0 bg-transparent">
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <h5 className="m-0 fw-bold">실시간 위치 공유</h5>
                </div>
                <div>
                    <i className="bi bi-geo-alt-fill fs-4 text-white"></i>
                </div>
            </div>

            <div className="control-panel">
                <div className="mb-3">
                    <div style={{ fontSize: '11px', color: '#d32f2f', marginBottom: '2px' }}>
                        ※ 이 지도맵을 활용하려면 반드시 GPS가 켜져있어야 합니다
                    </div>
                    <label className="form-label small text-muted mb-1">닉네임 (필수)</label>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            value={nickname}
                            onChange={(e) => {
                                setNickname(e.target.value);
                                localStorage.setItem('terra_nickname', e.target.value);
                            }}
                            placeholder="이름을 입력하세요"
                        />
                        <button className="btn btn-outline-secondary" type="button" onClick={copyLink}>
                            링크복사
                        </button>
                    </div>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <div className="form-check form-switch">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="shareToggle"
                                checked={isSharing}
                                onChange={(e) => handleToggleSharing(e.target.checked)}
                            />
                            <label className="form-check-label fw-bold" htmlFor="shareToggle">위치 공유 시작</label>
                        </div>
                        <div className={`status-badge ${isSharing ? 'active' : ''}`}>
                            {statusText}
                        </div>
                    </div>
                    <div className="text-end small text-muted">
                        {lastUpdate}
                    </div>
                </div>
            </div>

            <div id="map" className="map-container"></div>

            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" />

            <style jsx>{`
                .location-share-container {
                    font-family: 'Noto Sans KR', sans-serif;
                    background: #f0f2f5;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                }
                .header-bar {
                    background: #00897B;
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
                .back-btn:hover {
                    opacity: 0.8;
                }
            `}</style>
        </div>
    );
}
