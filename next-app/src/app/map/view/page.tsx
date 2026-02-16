"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css"; // 아이콘 사용 시

declare global {
  interface Window {
    kakao: any;
  }
}

export default function MapViewPage() {
  const [mapData, setMapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 데이터 불러오기
  useEffect(() => {
    const fetchMap = async () => {
      try {
        const res = await axios.get('/api/map/load');
        if (res.data.success) {
          setMapData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMap();
  }, []);

  // 카카오맵 그리기
  const handleKakaoLoad = () => {
    if (!mapData || !window.kakao) return;

    window.kakao.maps.load(() => {
      const container = document.getElementById('view-map');
      if (!container) return;

      const coords = new window.kakao.maps.LatLng(mapData.lat, mapData.lng);
      const options = { center: coords, level: 3 };
      const map = new window.kakao.maps.Map(container, options);

      const marker = new window.kakao.maps.Marker({ position: coords });
      marker.setMap(map);

      // 인포윈도우 (장소명)
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:5px;text-align:center;width:150px;font-weight:bold;">${mapData.addr}</div>`
      });
      infowindow.open(map, marker);
    });
  };

  // TMAP 실행 로직
  const runTmap = () => {
    if (!mapData) return;
    // TMap URL Scheme (앱 실행 시도)
    window.location.href = `tmap://route?goalname=${mapData.addr}&goalx=${mapData.lng}&goaly=${mapData.lat}`;
  };

  // 카카오맵 바로가기
  const runKakaoMap = () => {
    if (!mapData) return;
    window.open(`https://map.kakao.com/link/to/${mapData.addr},${mapData.lat},${mapData.lng}`, '_blank');
  };

  // 공유하기
  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `[모임장소] ${mapData?.addr}`,
        text: `모임 장소 안내입니다.\n장소: ${mapData?.addr}`,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("링크가 복사되었습니다!");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading map info...</div>;
  if (!mapData) return <div className="text-center mt-5">저장된 모임 장소가 없습니다.</div>;

  return (
    <div className="container py-3" style={{ maxWidth: '600px' }}>
      <Script
        src="//dapi.kakao.com/v2/maps/sdk.js?appkey=3409644aa1cb50eb41430562f5df97d2&libraries=services&autoload=false"
        strategy="afterInteractive"
        onReady={handleKakaoLoad}
      />

      <h2 className="text-center mb-3 fw-bold" style={{color: '#2c3e50'}}>📍 모임 장소 안내</h2>

      <div id="view-map" className="w-100 rounded shadow-sm mb-4" style={{ height: '350px', background: '#eee' }}></div>

      <div className="card border-0 shadow-sm mb-5">
        <div className="card-body text-center">
            <h4 className="fw-bold text-primary mb-3">{mapData.addr}</h4>
            <div className="text-start bg-light p-3 rounded text-secondary" style={{whiteSpace: 'pre-line', fontSize: '0.95rem'}}>
                {mapData.notice || "전달사항이 없습니다."}
            </div>
        </div>
      </div>

      {/* 하단 고정 버튼 영역 */}
      <div className="fixed-bottom p-3 bg-white border-top" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="row g-2">
            <div className="col-6">
                <button className="btn w-100 py-3 fw-bold" style={{backgroundColor: '#FEE500', color: '#3C1E1E'}} onClick={runKakaoMap}>
                    카카오맵
                </button>
            </div>
            <div className="col-6">
                <button className="btn w-100 py-3 fw-bold text-white" style={{backgroundColor: '#004c97'}} onClick={runTmap}>
                    TMAP 실행
                </button>
            </div>
            <div className="col-12">
                <button className="btn btn-success w-100 fw-bold" onClick={handleShare}>
                    <i className="bi bi-share-fill me-2"></i> 링크 공유하기
                </button>
            </div>
        </div>
      </div>
      {/* 하단 여백 확보 */}
      <div style={{height: '160px'}}></div>
    </div>
  );
}