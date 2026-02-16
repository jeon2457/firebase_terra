"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import Script from "next/script";

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

    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            loadLocationData();
        }
    }, [status, router]);

    const loadLocationData = async () => {
        const addr = searchParams.get('addr');
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');

        console.log('URL params:', { addr, lat, lng });

        if (addr && lat && lng) {
            const data = {
                addr,
                lat: parseFloat(lat),
                lng: parseFloat(lng)
            };
            console.log('Setting location data from URL:', data);
            setLocationData(data);
        } else {
            try {
                const res = await axios.get('/api/map/save');
                console.log('API response:', res.data);
                if (res.data.success && res.data.location) {
                    setLocationData(res.data.location);
                }
            } catch (error) {
                console.error('Failed to load location data', error);
            }
        }

        const savedNotice = localStorage.getItem('modalNoticeText');
        if (savedNotice) {
            setNoticeText(savedNotice);
        }
    };

    const handleKakaoLoad = () => {
        console.log('Kakao script loaded');
        if (window.kakao && window.kakao.maps) {
            window.kakao.maps.load(() => {
                console.log('Kakao maps loaded');
                setKakaoLoaded(true);
            });
        }
    };

    useEffect(() => {
        console.log('Effect triggered:', { kakaoLoaded, locationData, mapRef: mapRef.current });
        if (kakaoLoaded && locationData && !mapRef.current && mapContainerRef.current) {
            console.log('Initializing map...');
            initializeMap();
        }
    }, [kakaoLoaded, locationData]);

    const initializeMap = () => {
        if (!kakaoLoaded || !window.kakao || !locationData) {
            console.log('Cannot initialize map:', { kakaoLoaded, kakao: !!window.kakao, locationData });
            return;
        }

        const container = mapContainerRef.current;
        if (!container) {
            console.log('Map container not found');
            return;
        }

        console.log('Creating map with:', locationData);

        const options = {
            center: new window.kakao.maps.LatLng(locationData.lat, locationData.lng),
            level: 3
        };

        try {
            mapRef.current = new window.kakao.maps.Map(container, options);
            markerRef.current = new window.kakao.maps.Marker({
                map: mapRef.current,
                position: new window.kakao.maps.LatLng(locationData.lat, locationData.lng)
            });

            const infowindow = new window.kakao.maps.InfoWindow({
                content: `<div style="width:150px;text-align:center;padding:6px 0;font-size:14px;">${locationData.addr}</div>`
            });
            infowindow.open(mapRef.current, markerRef.current);

            console.log('Map initialized successfully');
        } catch (error) {
            console.error('Map initialization error:', error);
        }
    };

    const openKakaoMap = () => {
        if (!locationData) return;
        const url = `https://map.kakao.com/link/map/${encodeURIComponent(locationData.addr)},${locationData.lat},${locationData.lng}`;
        window.open(url, '_blank');
    };

    const openTmap = () => {
        if (!locationData) return;
        const url = `tmap://route?goalname=${encodeURIComponent(locationData.addr)}&goalx=${locationData.lng}&goaly=${locationData.lat}`;
        window.location.href = url;
    };

    if (status === "loading") {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <>
            <Script
                src="//dapi.kakao.com/v2/maps/sdk.js?appkey=3409644aa1cb50eb41430562f5df97d2&libraries=services&autoload=false"
                strategy="afterInteractive"
                onLoad={handleKakaoLoad}
            />

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
                    }
                    .btn-kakao { background-color: #FEE500; color: #000; }
                    .btn-tmap { background-color: #1E88E5; }
                    .btn-notice { background-color: #FF6F00; }
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
                    }
                `}</style>

                <h2 style={{ textAlign: 'center', marginBottom: '15px', color: '#2c3e50' }}>
                    🗺️ 지도 보기
                </h2>

                {locationData ? (
                    <>
                        <div style={{ background: 'white', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
                            <h4>📍 {locationData.addr}</h4>
                            <small style={{ color: '#666' }}>
                                좌표: {locationData.lat.toFixed(6)}, {locationData.lng.toFixed(6)}
                            </small>
                        </div>

                        <div 
                            id="map" 
                            ref={mapContainerRef}
                            style={{ 
                                width: '100%', 
                                height: '400px', 
                                borderRadius: '15px', 
                                marginBottom: '20px',
                                background: '#e9ecef'
                            }}
                        />

                        <button className="btn-nav btn-kakao" onClick={openKakaoMap}>
                            카카오맵으로 보기
                        </button>

                        <button className="btn-nav btn-tmap" onClick={openTmap}>
                            TMAP 실행
                        </button>

                        {noticeText && (
                            <button className="btn-nav btn-notice" onClick={() => setShowModal(true)}>
                                📢 안내사항 보기
                            </button>
                        )}

                        <button className="btn-nav" style={{ backgroundColor: '#6c757d' }} onClick={() => router.push('/dashboard')}>
                            ⏪ 돌아가기
                        </button>
                    </>
                ) : (
                    <div className="text-center mt-5">
                        <p>저장된 지도 정보가 없습니다.</p>
                        <button className="btn btn-primary" onClick={() => router.push('/map/create')}>
                            지도 만들기
                        </button>
                    </div>
                )}

                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <h4>📢 모임 안내</h4>
                            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.6' }}>
                                {noticeText}
                            </pre>
                            <button className="btn btn-secondary w-100 mt-3" onClick={() => setShowModal(false)}>
                                닫기
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default function MapViewPage() {
    return (
        <Suspense fallback={<div className="text-center mt-5">Loading...</div>}>
            <MapViewContent />
        </Suspense>
    );
}