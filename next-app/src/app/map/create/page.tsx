"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import Script from "next/script";

// 카카오 타입 선언
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

    // 상태 관리
    const [keyword, setKeyword] = useState("");
    const [places, setPlaces] = useState<PlaceResult[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
    const [selectedCoords, setSelectedCoords] = useState<any>(null);
    const [isMapPreviewed, setIsMapPreviewed] = useState(false);
    const [kakaoLoaded, setKakaoLoaded] = useState(false);
    
    // 안내문구 기본값 (이미지 참조)
    const [noticeText, setNoticeText] = useState(`📖 모임제목:
📅 모임날짜:
⏰ 시간:
📍 장소:
📢 전달사항:

📝 안내사항: 아래의 '카카오맵' / 'TMAP실행' 버튼을 클릭하면 네비게이션이 장소로 안내합니다.

앱이 설치되어있지 않으면 설치 후 이용해주세요.`);

    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

    // 1. 권한 체크
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

    // 2. 카카오맵 스크립트 로드 완료 후 초기화
    const handleKakaoLoad = () => {
        if (window.kakao && window.kakao.maps) {
            window.kakao.maps.load(() => {
                console.log("Kakao Maps Loaded");
                setKakaoLoaded(true);
            });
        }
    };

    // 3. 검색 로직
    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!keyword.trim()) {
            alert('장소를 입력해주세요!');
            return;
        }

        if (!kakaoLoaded || !window.kakao) {
            alert('지도를 불러오는 중입니다. 잠시만 기다려주세요.');
            return;
        }

        const ps = new window.kakao.maps.services.Places();
        ps.keywordSearch(keyword, (data: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
                setPlaces(data);
                // 검색 후 기존 선택 초기화
                setSelectedPlace(null);
                setSelectedCoords(null);
                setIsMapPreviewed(false);
            } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
                alert('검색 결과가 존재하지 않습니다.');
                setPlaces([]);
            } else {
                alert('검색 중 오류가 발생했습니다.');
            }
        });
    };

    // 4. 장소 선택
    const handleSelectPlace = (place: PlaceResult) => {
        setSelectedPlace(place);
        if (window.kakao) {
            const coords = new window.kakao.maps.LatLng(place.y, place.x);
            setSelectedCoords(coords);
        }
        // 선택 시 입력창에 장소명 반영
        setKeyword(place.place_name);
        setIsMapPreviewed(false); // 지도는 아직 안 보여줌
    };

    // 5. 지도 미리보기 (버튼 클릭 시)
    const handlePreview = () => {
        if (!selectedCoords) {
            alert("목록에서 장소를 먼저 선택해주세요!");
            return;
        }

        setIsMapPreviewed(true);

        // DOM 업데이트 후 지도 그리기 위해 setTimeout 사용
        setTimeout(() => {
            const container = document.getElementById('map');
            if (container && window.kakao) {
                const options = {
                    center: selectedCoords,
                    level: 3
                };
                
                // 지도 생성 (또는 재설정)
                const map = new window.kakao.maps.Map(container, options);
                mapRef.current = map;

                // 마커 생성
                const marker = new window.kakao.maps.Marker({
                    position: selectedCoords
                });
                marker.setMap(map);

                // 인포윈도우
                const infowindow = new window.kakao.maps.InfoWindow({
                    content: `<div style="padding:5px;font-size:12px;text-align:center;">${selectedPlace?.place_name}</div>`
                });
                infowindow.open(map, marker);

                // 지도 영역으로 스크롤 이동
                container.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    // 6. 저장 및 전송
    const handleSend = async () => {
        if (!selectedPlace || !selectedCoords) {
            alert("장소를 선택하고 지도 미리보기를 확인해주세요.");
            return;
        }

        const lat = selectedCoords.getLat();
        const lng = selectedCoords.getLng();

        try {
            const res = await axios.post('/api/map/save', {
                addr: selectedPlace.place_name,
                road_address: selectedPlace.road_address_name || selectedPlace.address_name,
                lat,
                lng,
                notice: noticeText
            });

            if (res.data.success) {
                // 저장 성공 시 알림용 로컬스토리지 저장 (선택사항)
                localStorage.setItem('modalNoticeText', noticeText);
                
                // 상세 보기 페이지 또는 목록으로 이동
                // 여기서는 dashboard로 보내거나, 생성된 지도를 바로 보여주는 페이지로 이동
                alert('지도가 저장되었습니다.');
                router.push('/dashboard'); 
            } else {
                alert('저장 실패: ' + res.data.message);
            }
        } catch (error) {
            console.error(error);
            alert('서버 통신 오류');
        }
    };

    // 로딩 중 화면
    if (status === "loading") return <div className="text-center mt-5">Loading...</div>;

    return (
        <div className="map-create-container">
            {/* 카카오맵 스크립트 (앱키는 본인 것으로 확인 필수) */}
            <Script
                src="//dapi.kakao.com/v2/maps/sdk.js?appkey=3409644aa1cb50eb41430562f5df97d2&libraries=services&autoload=false"
                strategy="afterInteractive"
                onReady={handleKakaoLoad}
            />

            {/* 헤더 타이틀 */}
            <h4 className="page-title text-center mb-4">
                <span className="me-2">📍</span>장소/주소 검색
            </h4>

            {/* 검색창 영역 */}
            <div className="search-box input-group mb-3">
                <input 
                    type="text" 
                    className="form-control search-input" 
                    placeholder="장소명 입력 (예: 설악산)" 
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="btn btn-search" type="button" onClick={() => handleSearch()}>
                    🔍
                </button>
            </div>

            {/* 안내문 입력 영역 */}
            <div className="notice-section mb-3">
                <label className="form-label fw-bold small text-dark">모달창 생성 안내문</label>
                <textarea 
                    className="form-control notice-textarea" 
                    rows={8}
                    value={noticeText}
                    onChange={(e) => setNoticeText(e.target.value)}
                ></textarea>
            </div>

            {/* 검색 결과 목록 (검색 시에만 표시) */}
            {places.length > 0 && (
                <div className="search-results mb-4">
                    <ul className="list-group">
                        {places.map((place, idx) => (
                            <li 
                                key={idx} 
                                className={`list-group-item list-group-item-action ${selectedPlace?.x === place.x ? 'active-item' : ''}`}
                                onClick={() => handleSelectPlace(place)}
                            >
                                <div className="fw-bold">{place.place_name}</div>
                                <div className="small text-secondary">{place.road_address_name || place.address_name}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 중앙 안내 문구 (지도가 없을 때만 표시) */}
            {!isMapPreviewed && (
                <div className="guide-text text-center my-5">
                    <p className="mb-1 text-secondary">📍 위의 검색창에서 장소(주소)를 검색하고</p>
                    <p className="mb-1 text-secondary">목록에서 선택한 후</p>
                    <p className="text-secondary">"🗺️ <strong>지도 미리보기</strong>" 버튼을 눌러주세요</p>
                </div>
            )}

            {/* 지도 영역 (미리보기 클릭 시 표시) */}
            <div id="map" className={`map-area mb-4 ${isMapPreviewed ? 'd-block' : 'd-none'}`}></div>

            {/* 하단 버튼 그룹 */}
            <div className="d-grid gap-3 mt-4 footer-buttons">
                {/* 1. 지도 미리보기 */}
                <button className="btn btn-secondary btn-lg btn-block custom-btn preview-btn" onClick={handlePreview}>
                    🗺️ 지도 미리보기
                </button>

                {/* 2. 저장하기 (이 위치로 지도 보내기) */}
                <button className="btn btn-secondary btn-lg btn-block custom-btn send-btn" onClick={handleSend}>
                    📥 이 위치로 지도 보내기
                </button>

                {/* 3. 지도 보기 (목록으로 이동 등) */}
                <button className="btn btn-light btn-lg btn-block custom-btn view-btn" onClick={() => router.push('/dashboard')}>
                    🔎 지도 보기
                </button>
            </div>

            {/* 돌아가기 버튼 */}
            <div className="text-center mt-5 mb-3">
                <button className="btn btn-secondary btn-back" onClick={() => router.back()}>
                    🔙 돌아가기
                </button>
            </div>

            {/* 스타일 (JSX Styled) - 이미지와 디자인 맞춤 */}
            <style jsx>{`
                .map-create-container {
                    max-width: 500px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f0f4f8; /* 배경색: 연한 블루그레이 */
                    min-height: 100vh;
                    font-family: 'Pretendard', sans-serif;
                }
                .page-title {
                    font-weight: 700;
                    color: #333;
                }
                .search-input {
                    border-radius: 8px 0 0 8px;
                    border: 1px solid #ced4da;
                    padding: 12px;
                }
                .btn-search {
                    background-color: #5b9bd5; /* 파란색 버튼 */
                    color: white;
                    border-radius: 0 8px 8px 0;
                    width: 50px;
                    border: none;
                }
                .notice-textarea {
                    border-radius: 8px;
                    font-size: 0.9rem;
                    resize: none;
                    background-color: #fff;
                }
                .search-results {
                    max-height: 200px;
                    overflow-y: auto;
                    border-radius: 8px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                .active-item {
                    background-color: #e8f0fe; /* 선택된 항목 배경색 */
                    border-left: 4px solid #5b9bd5;
                }
                .guide-text {
                    font-size: 0.9rem;
                    color: #888;
                }
                .map-area {
                    width: 100%;
                    height: 300px;
                    border-radius: 12px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    background-color: #ddd;
                }
                .custom-btn {
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    padding: 12px;
                    border: none;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .preview-btn {
                    background-color: #d1d5db; /* 연회색 */
                    color: #333;
                }
                .send-btn {
                    background-color: #d1d5db; /* 연회색 */
                    color: #333;
                }
                .view-btn {
                    background-color: #f8f9fa; /* 흰색에 가까운 회색 */
                    color: #333;
                    border: 1px solid #ddd;
                }
                .btn-back {
                    padding: 8px 20px;
                    font-size: 0.9rem;
                    background-color: #6c757d;
                    color: white;
                    border-radius: 5px;
                }
            `}</style>
        </div>
    );
}