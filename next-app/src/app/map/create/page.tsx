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
    const [kakaoLoaded, setKakaoLoaded] = useState(false);
    
    // PHP 코드의 기본값 적용
    const [noticeText, setNoticeText] = useState(`📖 모임제목:
📅 모임날짜:
⏰ 시간:
📍 장소:
📢 전달사항:

📝 안내사항: 아래의 '카카오맵' / 'TMAP실행' 버튼을 클릭하면 네비게이션이 장소로 안내합니다.

앱이 설치되어있지 않으면 설치 후 이용해주세요.`);

    const mapRef = useRef<any>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            // 레벨 체크 로직
            const userLevel = (session?.user as any)?.user_level || 0;
            if (userLevel < 10) {
                alert("관리자 전용 페이지입니다.");
                router.push("/dashboard");
            }
        }
    }, [status, session, router]);

    const handleKakaoLoad = () => {
        if (window.kakao && window.kakao.maps) {
            window.kakao.maps.load(() => {
                setKakaoLoaded(true);
            });
        }
    };

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!keyword.trim()) {
            alert('장소를 입력해주세요!');
            return;
        }
        if (!kakaoLoaded || !window.kakao) {
            alert('지도를 로딩중입니다.');
            return;
        }

        const ps = new window.kakao.maps.services.Places();
        ps.keywordSearch(keyword, (data: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
                setPlaces(data);
                setSelectedPlace(null);
                setSelectedCoords(null);
                setIsMapPreviewed(false);
            } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
                alert('검색 결과가 없습니다.');
                setPlaces([]);
            } else {
                alert('검색 중 오류 발생');
            }
        });
    };

    const handleSelectPlace = (place: PlaceResult) => {
        setSelectedPlace(place);
        if (window.kakao) {
            const coords = new window.kakao.maps.LatLng(place.y, place.x);
            setSelectedCoords(coords);
        }
        setKeyword(place.place_name);
        setIsMapPreviewed(false);
        setPlaces([]); // 선택 후 목록 숨김 (깔끔하게)
    };

    const handlePreview = () => {
        if (!selectedCoords) {
            alert("목록에서 장소를 선택해주세요.");
            return;
        }
        setIsMapPreviewed(true);

        setTimeout(() => {
            const container = document.getElementById('map');
            if (container && window.kakao) {
                const options = { center: selectedCoords, level: 3 };
                const map = new window.kakao.maps.Map(container, options);
                mapRef.current = map;

                const marker = new window.kakao.maps.Marker({ position: selectedCoords });
                marker.setMap(map);

                const infowindow = new window.kakao.maps.InfoWindow({
                    content: `<div style="padding:5px;font-size:12px;text-align:center;">${selectedPlace?.place_name}</div>`
                });
                infowindow.open(map, marker);
                
                container.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    // ✅ [핵심] 이 위치로 지도 보내기 (저장)
    const handleSend = async () => {
        if (!selectedPlace || !selectedCoords) {
            alert("장소를 선택하고 지도 미리보기를 확인해주세요.");
            return;
        }

        const lat = selectedCoords.getLat();
        const lng = selectedCoords.getLng();

        if(!confirm(`"${selectedPlace.place_name}" 위치로 저장하시겠습니까?`)) return;

        try {
            const res = await axios.post('/api/map/save', {
                addr: selectedPlace.place_name,
                road_address: selectedPlace.road_address_name || selectedPlace.address_name,
                lat,
                lng,
                notice: noticeText
            });

            if (res.data.success) {
                alert('✅ 지도가 성공적으로 저장되었습니다!');
                // 저장 후 지도 보기 페이지로 이동할지 물어보기
                if(confirm("저장된 지도를 바로 확인하시겠습니까?")) {
                    router.push('/map/view');
                }
            } else {
                alert('저장 실패: ' + res.data.message);
            }
        } catch (error) {
            console.error(error);
            alert('서버 저장 중 오류가 발생했습니다.');
        }
    };

    if (status === "loading") return <div className="text-center mt-5">Loading...</div>;

    return (
        <div className="map-create-container">
            <Script
                src="//dapi.kakao.com/v2/maps/sdk.js?appkey=3409644aa1cb50eb41430562f5df97d2&libraries=services&autoload=false"
                strategy="afterInteractive"
                onReady={handleKakaoLoad}
            />

            <h4 className="page-title text-center mb-4">📍 모임 장소 설정</h4>

            <div className="search-box input-group mb-3">
                <input 
                    type="text" 
                    className="form-control" 
                    placeholder="장소명 (예: 강남역 스타벅스)" 
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="btn btn-primary" onClick={() => handleSearch()}>검색</button>
            </div>

            {/* 검색 결과 리스트 */}
            {places.length > 0 && (
                <div className="list-group mb-3 shadow-sm" style={{maxHeight: '200px', overflowY: 'auto'}}>
                    {places.map((place, idx) => (
                        <button 
                            key={idx} 
                            className={`list-group-item list-group-item-action ${selectedPlace?.x === place.x ? 'active' : ''}`}
                            onClick={() => handleSelectPlace(place)}
                        >
                            <div className="fw-bold">{place.place_name}</div>
                            <div className="small text-truncate opacity-75">{place.road_address_name || place.address_name}</div>
                        </button>
                    ))}
                </div>
            )}

            <div className="mb-3">
                <label className="form-label fw-bold small">안내문구 작성</label>
                <textarea 
                    className="form-control" 
                    rows={6}
                    value={noticeText}
                    onChange={(e) => setNoticeText(e.target.value)}
                    style={{fontSize: '0.9rem'}}
                ></textarea>
            </div>

            {/* 지도 미리보기 영역 */}
            <div id="map" className="mb-4 bg-light rounded" style={{height: isMapPreviewed ? '300px' : '0', transition: 'height 0.3s', overflow: 'hidden'}}></div>

            <div className="d-grid gap-2">
                <button className="btn btn-secondary" onClick={handlePreview}>
                    🗺️ 지도 미리보기
                </button>
                <button className="btn btn-success fw-bold py-3" onClick={handleSend}>
                    📥 이 위치로 지도 저장하기
                </button>
                <button className="btn btn-outline-secondary" onClick={() => router.push('/map/view')}>
                    🔎 저장된 지도 보기
                </button>
            </div>
            
            <div className="text-center mt-4">
                 <button className="btn btn-link text-secondary text-decoration-none" onClick={() => router.back()}>← 뒤로가기</button>
            </div>

            <style jsx>{`
                .map-create-container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #fff;
                    min-height: 100vh;
                }
            `}</style>
        </div>
    );
}