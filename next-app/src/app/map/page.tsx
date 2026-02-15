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
    const [selectedCoords, setSelectedCoords] = useState<any>(null);
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

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            if ((session?.user as any)?.user_level < 10) {
                alert("관리자 전용 페이지입니다.");
                router.push("/dashboard");
            }
        }
    }, [status, session, router]);

    const handleKakaoLoad = () => {
        window.kakao.maps.load(() => {
            setKakaoLoaded(true);
        });
    };

    const initializeMap = () => {
        if (!kakaoLoaded || !window.kakao) return;

        const container = document.getElementById('map');
        if (!container) return;

        const options = {
            center: new window.kakao.maps.LatLng(37.5665, 126.9780),
            level: 3
        };

        mapRef.current = new window.kakao.maps.Map(container, options);
        markerRef.current = new window.kakao.maps.Marker({ map: mapRef.current });
    };

    useEffect(() => {
        if (kakaoLoaded && !mapRef.current) {
            initializeMap();
        }
    }, [kakaoLoaded]);

    const handleSearch = async (e: React.FormEvent) => {
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
        const geocoder = new window.kakao.maps.services.Geocoder();

        // 키워드 검색
        ps.keywordSearch(keyword, (data: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
                setPlaces(data);
            } else {
                // 주소 검색
                geocoder.addressSearch(keyword, (result: any, addrStatus: any) => {
                    if (addrStatus === window.kakao.maps.services.Status.OK) {
                        const addrData = result.map((item: any) => ({
                            place_name: item.road_address ? item.road_address.address_name : item.address.address_name,
                            address_name: item.address_name,
                            road_address_name: item.road_address ? item.road_address.address_name : '',
                            x: item.x,
                            y: item.y
                        }));
                        setPlaces(addrData);
                    } else {
                        alert('검색 결과가 존재하지 않습니다.');
                        setPlaces([]);
                    }
                });
            }
        });
    };

    const handleSelectPlace = (place: PlaceResult) => {
        setSelectedPlace(place);
        const coords = new window.kakao.maps.LatLng(place.y, place.x);
        setSelectedCoords(coords);
        setKeyword(place.place_name);
        setIsMapPreviewed(false);
    };

    const handlePreview = () => {
        if (!selectedCoords || !mapRef.current) {
            alert("목록에서 장소를 먼저 선택해주세요!");
            return;
        }

        document.getElementById('mapBox')?.classList.add('show');
        document.getElementById('mapPlaceholder')?.style.setProperty('display', 'none');

        mapRef.current.setCenter(selectedCoords);
        markerRef.current.setPosition(selectedCoords);

        const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="width:150px;text-align:center;padding:6px 0;font-size:14px;">${selectedPlace?.place_name}</div>`
        });
        infowindow.open(mapRef.current, markerRef.current);

        setTimeout(() => {
            mapRef.current.relayout();
            mapRef.current.setCenter(selectedCoords);
        }, 100);

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

        const lat = selectedCoords.getLat();
        const lng = selectedCoords.getLng();

        try {
            const res = await axios.post('/api/map/save', {
                addr: selectedPlace.place_name,
                lat,
                lng,
                notice: noticeText
            });

            if (res.data.success) {
                localStorage.setItem('modalNoticeText', noticeText);
                router.push(`/map/view?addr=${encodeURIComponent(selectedPlace.place_name)}&lat=${lat}&lng=${lng}`);
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
        <>
            <Script
                src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`}
                strategy="afterInteractive"
                onLoad={handleKakaoLoad}
            />

            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', background: '#f0f2f5', minHeight: '100vh' }}>
                <style jsx>{`
                    .search-form { display: flex; gap: 10px; margin-bottom: 10px; }
                    input[type="text"] { flex: 1; padding: 15px; font-size: 16px; border-radius: 12px; border: 1px solid #ccc; }
                    .btn-search { background-color: #4a90e2; color: white; border: none; border-radius: 12px; width: 55px; cursor: pointer; font-size: 1.2rem; }
                    .places-list { list-style: none; padding: 0; margin: 0 0 20px 0; background: white; border-radius: 12px; max-height: 200px; overflow-y: auto; }
                    .places-list li { padding: 15px; border-bottom: 1px solid #eee; cursor: pointer; }
                    .places-list li:hover { background-color: #f9f9f9; }
                    .places-list li.selected { background-color: #e3f2fd; border-left: 5px solid #4a90e2; }
                    .place-name { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
                    .place-addr { font-size: 13px; color: #777; }
                    .map-box { background: white; padding: 5px; border-radius: 15px; min-height: 300px; margin: 20px 0; display: none; }
                    .map-box.show { display: block; }
                    #map { width: 100%; height: 300px; border-radius: 10px; }
                    .map-placeholder { display: flex; align-items: center; justify-content: center; min-height: 300px; color: #999; text-align: center; padding: 40px; }
                    .btn-link { display: block; width: 100%; max-width: 350px; margin: 15px auto; padding: 16px; font-size: 18px; font-weight: bold; border-radius: 12px; border: none; cursor: pointer; }
                    .btn-preview { background-color: #34c759; color: white; }
                    .btn-send { background-color: #4a90e2; color: white; }
                    .btn-preview:disabled, .btn-send:disabled { background-color: #ccc; cursor: not-allowed; opacity: 0.6; }
                `}</style>

                <h2 style={{ textAlign: 'center', marginBottom: '15px', color: '#2c3e50' }}>
                    📍 장소/주소 검색
                </h2>

                <form className="search-form" onSubmit={handleSearch}>
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="주소(지번/도로명) 또는 건물명 입력"
                        autoComplete="off"
                    />
                    <button type="submit" className="btn-search">🔍</button>
                </form>

                <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>모달창 생성 안내문</div>
                    <textarea
                        value={noticeText}
                        onChange={(e) => setNoticeText(e.target.value)}
                        maxLength={500}
                        rows={10}
                        style={{
                            width: '100%',
                            padding: '15px',
                            fontSize: '16px',
                            borderRadius: '12px',
                            border: '1px solid #ccc',
                            resize: 'none',
                            whiteSpace: 'pre-line'
                        }}
                    />
                </div>

                {places.length > 0 && (
                    <ul className="places-list">
                        {places.map((place, index) => (
                            <li
                                key={index}
                                className={selectedPlace === place ? 'selected' : ''}
                                onClick={() => handleSelectPlace(place)}
                            >
                                <div className="place-name">{place.place_name}</div>
                                <div className="place-addr">
                                    {place.road_address_name || place.address_name}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="map-box" id="mapBox">
                    <div id="map"></div>
                </div>

                <div className="map-placeholder" id="mapPlaceholder">
                    📍 위의 검색창에서 장소(주소)를 검색하고<br />
                    목록에서 선택한 후<br />
                    "🗺️ 지도 미리보기" 버튼을 눌러주세요
                </div>

                <div>
                    <button
                        className="btn-link btn-preview"
                        onClick={handlePreview}
                        disabled={!selectedPlace}
                    >
                        🗺️ 지도 미리보기
                    </button>

                    <button
                        className="btn-link btn-send"
                        onClick={handleSend}
                        disabled={!isMapPreviewed}
                    >
                        📤 이 위치로 지도 보내기
                    </button>

                    <button
                        className="btn-link"
                        style={{ backgroundColor: '#6c757d', color: 'white' }}
                        onClick={() => router.push('/map/view')}
                    >
                        🔎 지도 보기
                    </button>

                    <button
                        className="btn-link"
                        style={{ backgroundColor: '#6c757d', color: 'white' }}
                        onClick={() => router.push('/dashboard')}
                    >
                        ⏪ 돌아가기
                    </button>
                </div>
            </div>
        </>
    );
}
```

---

## 4️⃣ 환경변수 설정

`.env.local` 파일에 추가:
```
NEXT_PUBLIC_KAKAO_MAP_KEY=3409644aa1cb50eb41430562f5df97d2