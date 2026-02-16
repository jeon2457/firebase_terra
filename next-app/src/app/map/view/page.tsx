"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

declare global {
    interface Window {
        kakao: any;
    }
}

function MapViewContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [kakaoLoaded, setKakaoLoaded] = useState(false);
    const [locationData, setLocationData] = useState<any>(null);
    const [noticeText, setNoticeText] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [mapInitialized, setMapInitialized] = useState(false);

    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const scriptLoadedRef = useRef(false);

    // 카카오 맵 스크립트 로드
    useEffect(() => {
        if (scriptLoadedRef.current) return;

        const loadKakaoScript = () => {
            // 이미 로드되어 있는지 확인
            if (window.kakao && window.kakao.maps) {
                console.log('Kakao maps already loaded');
                window.kakao.maps.load(() => {
                    setKakaoLoaded(true);
                    scriptLoadedRef.current = true;
                });
                return;
            }

            // 스크립트 동적 로드
            const script = document.createElement('script');
            script.src = '//dapi.kakao.com/v2/maps/sdk.js?appkey=3409644aa1cb50eb41430562f5df97d2&libraries=services&autoload=false';
            script.async = true;
            script.onload = () => {
                console.log('Kakao script loaded');
                if (window.kakao && window.kakao.maps) {
                    window.kakao.maps.load(() => {
                        console.log('Kakao maps API ready');
                        setKakaoLoaded(true);
                        scriptLoadedRef.current = true;
                    });
                }
            };
            script.onerror = () => {
                console.error('Failed to load Kakao maps script');
            };
            document.head.appendChild(script);
        };

        loadKakaoScript();
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            loadLocationData();
        }
    }, [status, router]);

    const loadLocationData = async () => {
        setIsLoading(true);
        const addr = searchParams.get('addr');
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');

        console.log('Loading location data...', { addr, lat, lng });

        if (addr && lat && lng) {
            const data = {
                addr,
                lat: parseFloat(lat),
                lng: parseFloat(lng)
            };
            console.log('Setting location from URL:', data);
            setLocationData(data);
            setIsLoading(false);
        } else {
            try {
                console.log('Fetching location from API...');
                const res = await axios.get('/api/map/save');
                console.log('API response:', res.data);
                if (res.data.success && res.data.location) {
                    setLocationData(res.data.location);
                }
            } catch (error) {
                console.error('Failed to load location data', error);
            } finally {
                setIsLoading(false);
            }
        }

        const savedNotice = localStorage.getItem('modalNoticeText');
        if (savedNotice) {
            setNoticeText(savedNotice);
        }
    };

    useEffect(() => {
        console.log('Init effect triggered:', { 
            kakaoLoaded, 
            locationData: !!locationData, 
            mapInitialized,
            isLoading,
            container: !!mapContainerRef.current 
        });

        if (kakaoLoaded && locationData && !mapInitialized && !isLoading && mapContainerRef.current) {
            console.log('Initializing map...');
            
            // 약간의 지연을 주어 DOM이 완전히 준비되도록 함
            const timer = setTimeout(() => {
                initializeMap();
            }, 200);

            return () => clearTimeout(timer);
        }
    }, [kakaoLoaded, locationData, mapInitialized, isLoading]);

    const initializeMap = () => {
        if (!kakaoLoaded || !window.kakao || !locationData || !mapContainerRef.current) {
            console.log('Cannot initialize map - missing requirements:', {
                kakaoLoaded,
                kakao: !!window.kakao,
                locationData: !!locationData,
                container: !!mapContainerRef.current
            });
            return;
        }

        // 이미 초기화되었으면 중복 실행 방지
        if (mapRef.current) {
            console.log('Map already initialized');
            return;
        }

        const container = mapContainerRef.current;
        console.log('Creating map with:', locationData);

        try {
            const options = {
                center: new window.kakao.maps.LatLng(locationData.lat, locationData.lng),
                level: 3
            };

            mapRef.current = new window.kakao.maps.Map(container, options);
            markerRef.current = new window.kakao.maps.Marker({
                map: mapRef.current,
                position: new window.kakao.maps.LatLng(locationData.lat, locationData.lng)
            });

            const infowindow = new window.kakao.maps.InfoWindow({
                content: `<div style="width:150px;text-align:center;padding:6px 0;font-size:14px;">${locationData.addr}</div>`
            });
            infowindow.open(mapRef.current, markerRef.current);

            setMapInitialized(true);
            console.log('Map initialized successfully');
        } catch (error) {
            console.error('Map initialization error:', error);
        }
    };

    const openKakaoMap = () => {
        if (!locationData) return;
        // /link/map/ → /link/to/ 로 변경 (도착지로 바로 설정)
        const url = `https://map.kakao.com/link/to/${encodeURIComponent(locationData.addr)},${locationData.lat},${locationData.lng}`;
        window.open(url, '_blank');
    };

    const openTmap = () => {
        if (!locationData) return;
        
        const tmapUrl = `tmap://route?goalname=${encodeURIComponent(locationData.addr)}&goalx=${locationData.lng}&goaly=${locationData.lat}`;
        
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = tmapUrl;
        document.body.appendChild(iframe);

        setTimeout(() => {
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
        }, 2000);

        setTimeout(() => {
            if (document.visibilityState === 'visible') {
                if (confirm('TMAP 앱이 설치되어 있지 않습니다.\n앱 스토어로 이동하시겠습니까?')) {
                    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                    
                    if (isMobile) {
                        if (isIOS) {
                            window.open('https://apps.apple.com/kr/app/tmap/id431589174', '_blank');
                        } else {
                            window.open('https://play.google.com/store/apps/details?id=com.skt.tmap.ku', '_blank');
                        }
                    }
                }
            }
        }, 3000);
    };

    const openNaverMap = () => {
        if (!locationData) return;
        const url = `https://map.naver.com/v5/search/${encodeURIComponent(locationData.addr)}`;
        window.open(url, '_blank');
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">지도 정보를 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', background: '#f0f2f5', minHeight: '100vh' }}>
            <style jsx>{`
                #map { 
                    width: 100%; 
                    height: 400px; 
                    border-radius: 15px; 
                    margin-bottom: 20px;
                    background: #e9ecef;
                }
                .btn-nav { 
                    display: block; 
                    width: 100%; 
                    max-width: 350px; 
                    margin: 15px auto; 
                    padding: 16px; 
                    font-size: 18px; 
                    font-weight: bold; 
                    border-radius: 12px; 
                    border: none; 
                    cursor: pointer; 
                    color: white;
                    transition: all 0.2s;
                }
                .btn-nav:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }
                .btn-nav:active {
                    transform: translateY(0);
                }
                .btn-kakao { 
                    background-color: #FEE500; 
                    color: #000; 
                }
                .btn-kakao:hover {
                    background-color: #FFD700;
                }
                .btn-tmap { 
                    background-color: #1E88E5; 
                }
                .btn-tmap:hover {
                    background-color: #1565C0;
                }
                .btn-naver { 
                    background-color: #2DB400; 
                }
                .btn-naver:hover {
                    background-color: #259600;
                }
                .btn-notice { 
                    background-color: #FF6F00; 
                }
                .btn-notice:hover {
                    background-color: #E65100;
                }
                .modal-overlay { 
                    position: fixed; 
                    inset: 0; 
                    background: rgba(0,0,0,0.5); 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    z-index: 1000; 
                }
                .modal-content { 
                    background: white; 
                    padding: 30px; 
                    border-radius: 15px; 
                    max-width: 500px; 
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                }
                .loading-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255,255,255,0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 15px;
                    z-index: 10;
                }
            `}</style>

            <h2 style={{ textAlign: 'center', marginBottom: '15px', color: '#2c3e50' }}>
                🗺️ 지도 보기
            </h2>

            {locationData ? (
                <>
                    <div style={{ background: 'white', padding: '15px', borderRadius: '12px', marginBottom: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>📍 {locationData.addr}</h4>
                        <small style={{ color: '#666' }}>
                            좌표: {locationData.lat.toFixed(6)}, {locationData.lng.toFixed(6)}
                        </small>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <div 
                            id="map" 
                            ref={mapContainerRef}
                            style={{ 
                                width: '100%', 
                                height: '400px', 
                                borderRadius: '15px', 
                                marginBottom: '20px',
                                background: '#e9ecef',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                            }}
                        />
                        {(!mapInitialized || !kakaoLoaded) && (
                            <div className="loading-overlay">
                                <div className="text-center">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-2 text-muted">
                                        {!kakaoLoaded ? '카카오맵 로딩 중...' : '지도를 불러오는 중...'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="btn-nav btn-kakao" onClick={openKakaoMap}>
                        🗺️ 카카오맵으로 보기
                    </button>

                    <button className="btn-nav btn-tmap" onClick={openTmap}>
                        📍 TMAP 실행
                    </button>

                    <button className="btn-nav btn-naver" onClick={openNaverMap}>
                        🧭 네이버지도로 보기
                    </button>

                    {noticeText && (
                        <button className="btn-nav btn-notice" onClick={() => setShowModal(true)}>
                            📢 안내사항 보기
                        </button>
                    )}

                    <button 
                        className="btn-nav" 
                        style={{ backgroundColor: '#6c757d' }} 
                        onClick={() => router.push('/dashboard')}
                    >
                        ⏪ 돌아가기
                    </button>
                </>
            ) : (
                <div className="text-center mt-5" style={{ padding: '40px', background: 'white', borderRadius: '15px' }}>
                    <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
                        저장된 지도 정보가 없습니다.
                    </p>
                    <button 
                        className="btn btn-primary btn-lg" 
                        onClick={() => router.push('/map/create')}
                        style={{ padding: '12px 30px', fontSize: '16px' }}
                    >
                        📍 지도 만들기
                    </button>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h4 style={{ marginBottom: '20px', color: '#FF6F00', fontWeight: 'bold' }}>
                            📢 모임 안내
                        </h4>
                        <pre style={{ 
                            whiteSpace: 'pre-wrap', 
                            fontSize: '14px', 
                            lineHeight: '1.8',
                            background: '#f8f9fa',
                            padding: '15px',
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0',
                            margin: '0 0 20px 0'
                        }}>
                            {noticeText}
                        </pre>
                        <button 
                            className="btn btn-secondary w-100" 
                            style={{ padding: '12px', fontSize: '16px', fontWeight: 'bold' }}
                            onClick={() => setShowModal(false)}
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function MapViewPage() {
    return (
        <Suspense fallback={
            <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        }>
            <MapViewContent />
        </Suspense>
    );
}