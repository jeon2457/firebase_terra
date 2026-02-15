"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import Script from "next/script";

declare global {
    interface Window {
        kakao: any;
    }
}

type PlaceResult = {
    place_name: string;
    address_name: string;
    road_address_name?: string;
    x: string;
    y: string;
};

export default function MapCreatePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [keyword, setKeyword] = useState("");
    const [places, setPlaces] = useState<PlaceResult[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
    const [selectedCoords, setSelectedCoords] = useState<any>(null); // kakao.maps.LatLng
    const [isMapPreviewed, setIsMapPreviewed] = useState(false);
    const [noticeText, setNoticeText] = useState(`📖 모임제목:
📅 모임날짜:
⏰ 시간:
📍 장소:
📢 전달사항:

📝 안내사항: 아래의 '카카오맵' / 'TMAP실행' 버튼을 클릭하면 네비게이션이 장소로 안내합니다.

앱이 설치되어있지 않으면 설치 후 이용해주세요.`);

    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const [kakaoLoaded, setKakaoLoaded] = useState(false);

    // 권한 체크
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            // session.user의 타입 문제 해결을 위해 any로 캐스팅하거나 타입을 확장해야 함
            if ((session?.user as any)?.level < 10) { // user_level 대신 level 확인 (NextAuth 설정에 따라 다름)
                alert("관리자 전용 페이지입니다.");
                router.push("/dashboard");
            }
        }
    }, [status, session, router]);

    // 카카오 맵 로드 완료 핸들러
    const handleKakaoLoad = () => {
        if (window.kakao && window.kakao.maps) {
            window.kakao.maps.load(() => {
                setKakaoLoaded(true);
            });
        }
    };

    // 지도 초기화
    useEffect(() => {
        if (kakaoLoaded && !mapRef.current) {
            const container = document.getElementById('map');
            if (container && window.kakao) {
                const options = {
                    center: new window.kakao.maps.LatLng(37.5665, 126.9780),
                    level: 3
                };
                const map = new window.kakao.maps.Map(container, options);
                mapRef.current = map;
                markerRef.current = new window.kakao.maps.Marker({ map: map });
            }
        }
    }, [kakaoLoaded]);


    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        if (!keyword.trim()) {
            alert('검색어를 입력해주세요!');
            return;
        }

        if (!kakaoLoaded || !window.kakao) {
            alert('지도를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        const ps = new window.kakao.maps.services.Places();
        // const geocoder = new window.kakao.maps.services.Geocoder(); // 사용 안 함

        ps.keywordSearch(keyword, (data: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
                setPlaces(data);
            } else {
                alert('검색 결과가 존재하지 않습니다.');
                setPlaces([]);
            }
        });
    };

    const handleSelectPlace = (place: PlaceResult) => {
        setSelectedPlace(place);
        // 좌표 객체 생성은 kakaoLoaded 상태일 때만 가능
        if (window.kakao) {
            const coords = new window.kakao.maps.LatLng(place.y, place.x);
            setSelectedCoords(coords);
        }
        setKeyword(place.place_name);
        setIsMapPreviewed(false); // 장소 변경 시 미리보기 상태 해제
    };

    const handlePreview = () => {
        if (!selectedPlace || !selectedCoords) {
            alert("목록에서 장소를 먼저 선택해주세요!");
            return;
        }

        if (!mapRef.current) {
            // 지도가 아직 초기화되지 않았다면 (혹은 hidden 상태여서)
            // mapBox를 보여주고 지도를 다시 그릴 수 있도록 함
            const container = document.getElementById('map');
            if (container && window.kakao) {
                 const options = {
                    center: selectedCoords,
                    level: 3
                };
                const map = new window.kakao.maps.Map(container, options);
                mapRef.current = map;
                markerRef.current = new window.kakao.maps.Marker({ map: map, position: selectedCoords });
            }
        }

        // 지도 박스 보이기
        const mapBox = document.getElementById('mapBox');
        if (mapBox) mapBox.classList.add('show');
        
        const placeholder = document.getElementById('mapPlaceholder');
        if (placeholder) placeholder.style.display = 'none';

        if (mapRef.current && window.kakao) {
            mapRef.current.setCenter(selectedCoords);
            markerRef.current.setPosition(selectedCoords);

             // 인포윈도우 (선택 사항)
            // 기존 인포윈도우가 있다면 닫거나 새로 생성
            // 여기서는 간단하게 새로 생성
            const infowindow = new window.kakao.maps.InfoWindow({
                content: `<div style="padding:5px;font-size:12px;">${selectedPlace.place_name}</div>`
            });
            infowindow.open(mapRef.current, markerRef.current);
            
            // 지도 레이아웃 재설정 (display:none -> block 변경 시 깨짐 방지)
            setTimeout(() => {
                mapRef.current.relayout();
                mapRef.current.setCenter(selectedCoords);
            }, 100);
        }

        setIsMapPreviewed(true);

        setTimeout(() => {
             document.getElementById('mapBox')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
    };


    const handleSend = async () => {
        if (!isMapPreviewed) {
            alert("먼저 '지도 미리보기' 버튼을 눌러 지도를 확인해주세요!");
            return;
        }

        if (!selectedPlace || !selectedCoords) {
            alert("장소를 선택해주세요!");
            return;
        }
        
        // Kakao LatLng 객체에서 좌표 추출
        const lat = selectedCoords.getLat();
        const lng = selectedCoords.getLng();

        try {
            const res = await axios.post('/api/map/save', {
                addr: selectedPlace.place_name, // 장소명
                road_address: selectedPlace.road_address_name || selectedPlace.address_name, // 주소
                lat,
                lng,
                notice: noticeText
            });

            if (res.data.success) {
                // 성공 시 알림 저장 후 이동 (localStorage 사용 예시)
                // localStorage.setItem('modalNoticeText', noticeText); 
                alert('지도가 저장되었습니다.');
                // router.push(`/map/view?addr=${encodeURIComponent(selectedPlace.place_name)}&lat=${lat}&lng=${lng}`);
                // 또는 저장된 목록 페이지 등으로 이동
                router.push('/dashboard'); 
            } else {
                alert('DB 저장에 실패했습니다: ' + res.data.message);
            }
        } catch (error) {
            console.error('저장 오류:', error);
            alert('서버 통신 중 오류가 발생했습니다.');
        }
    };

    if (status === "loading") {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', background: '#f0f2f5', minHeight: '100vh' }}>
            <Script
                src="//dapi.kakao.com/v2/maps/sdk.js?appkey=3409644aa1cb50eb41430562f5df97d2&libraries=services&autoload=false"
                strategy="afterInteractive"
                onReady={handleKakaoLoad}
            />

            <h2 className="text-center mb-4">지도 생성</h2>

            {/* 검색 폼 */}
            <form className="search-form" onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    value={keyword} 
                    onChange={(e) => setKeyword(e.target.value)} 
                    placeholder="장소를 검색하세요" 
                    style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <button type="submit" className="btn btn-primary">검색</button>
            </form>

            {/* 검색 결과 목록 */}
            {places.length > 0 && (
                <ul className="places-list" style={{ listStyle: 'none', padding: 0, background: 'white', borderRadius: '5px', maxHeight: '200px', overflowY: 'auto', marginBottom: '20px' }}>
                    {places.map((place, index) => (
                        <li 
                            key={index} 
                            onClick={() => handleSelectPlace(place)}
                            style={{ 
                                padding: '10px', 
                                borderBottom: '1px solid #eee', 
                                cursor: 'pointer',
                                backgroundColor: selectedPlace?.x === place.x && selectedPlace?.y === place.y ? '#e3f2fd' : 'white'
                            }}
                        >
                            <div className="place-name" style={{ fontWeight: 'bold' }}>{place.place_name}</div>
                            <div className="place-addr" style={{ fontSize: '12px', color: '#666' }}>
                                {place.road_address_name || place.address_name}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* 지도 미리보기 버튼 */}
            <button onClick={handlePreview} className="btn btn-secondary w-100 mb-3">
                지도 미리보기
            </button>

            {/* 지도 영역 */}
            <div id="mapBox" className="map-box" style={{ display: 'none', marginBottom: '20px' }}>
                 <div id="map" style={{ width: '100%', height: '300px', borderRadius: '10px' }}></div>
            </div>
             <div id="mapPlaceholder" style={{ 
                height: '300px', 
                background: '#ddd', 
                display: isMapPreviewed ? 'none' : 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                borderRadius: '10px',
                marginBottom: '20px',
                color: '#666'
            }}>
                지도가 여기에 표시됩니다.
            </div>


            {/* 공지사항 입력 */}
            <textarea 
                className="form-control mb-3" 
                rows={10} 
                value={noticeText} 
                onChange={(e) => setNoticeText(e.target.value)}
                style={{ fontSize: '14px' }}
            ></textarea>

            {/* 저장 버튼 */}
            <button onClick={handleSend} className="btn btn-success w-100">
                저장하기
            </button>
        </div>
    );
}