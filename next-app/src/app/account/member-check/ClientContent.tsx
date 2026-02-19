"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

// @ts-ignore
import { saveAs } from "file-saver";

type Member = {
    _id: string;
    name: string;
};

type PassMap = {
    [memberId: string]: {
        [month: number]: number;
    };
};

interface ClientContentProps {
    memberIds: string;
    year: number;
}

export default function ClientContent({ memberIds, year }: ClientContentProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    
    const [members, setMembers] = useState<Member[]>([]);
    const [passMap, setPassMap] = useState<PassMap>({});
    const [monthlyFees, setMonthlyFees] = useState<{ [month: number]: number }>({});
    const [loading, setLoading] = useState(true);
    const [imgUrl, setImgUrl] = useState<string | null>(null); // 캡처 이미지 URL
    
    const captureRef = useRef<HTMLDivElement>(null); // 캡처 영역 참조

    const todayYear = new Date().getFullYear();
    const todayMonth = new Date().getMonth() + 1;

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchData();
        }
    }, [status, memberIds, year]);

    const fetchData = async () => {
        console.log('=== Client Fetch Debug ===');
        console.log('memberIds:', memberIds);
        console.log('year:', year);
        console.log('memberIds type:', typeof memberIds);
        console.log('memberIds.trim():', memberIds?.trim());

        if (!memberIds || memberIds.trim() === '') {
            console.log('❌ No member IDs provided');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const apiUrl = `/api/account/member-check?members=${encodeURIComponent(memberIds)}&year=${year}`;
            console.log('🌐 API URL:', apiUrl);
            
            const res = await axios.get(apiUrl);
            
            console.log('📡 API Response:', res.data);
            console.log('Full response object:', JSON.stringify(res.data, null, 2));
            console.log('Response status:', res.status);
            
            if (res.data.success) {
                console.log('✅ Data loaded successfully');
                console.log('Members:', res.data.members);
                console.log('PassMap:', res.data.passMap);
                console.log('MonthlyFees:', res.data.monthlyFees);
                
                // 디버깅 정보 확인
                if (res.data.debug) {
                    console.log('🔍 Debug Info:');
                    console.log('ObjectId count:', res.data.debug.objectIdCount);
                    console.log('String IDs count:', res.data.debug.stringIdsCount);
                    console.log('ObjectIds count:', res.data.debug.objectIdsCount);
                    console.log('Alt field count:', res.data.debug.altFieldCount);
                    console.log('Any year count:', res.data.debug.anyYearCount);
                    console.log('Final data count:', res.data.debug.finalDataCount);
                    console.log('Sample collection data:', res.data.debug.sampleCollectionData);
                    console.log('Sample pass data:', res.data.debug.samplePassData);
                } else {
                    console.log('⚠️ No debug info in response - API may not be updated yet');
                }
                
                setMembers(res.data.members);
                setPassMap(res.data.passMap);
                setMonthlyFees(res.data.monthlyFees);
            } else {
                console.log('❌ API returned error:', res.data.message);
                alert(res.data.message || '데이터 로드 실패');
            }
        } catch (error: any) {
            console.error("❌ Failed to fetch data:", error);
            console.error('Error details:', error.response?.data);
            console.error('Error status:', error.response?.status);
            alert('데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotals = (memberId: string) => {
        let totalPaid = 0;
        let unpaidTotal = 0;

        for (let m = 1; m <= 12; m++) {
            const paid = passMap[memberId]?.[m] || 0;
            const monthFee = monthlyFees[m] || 20000;
            
            const isFuture = year > todayYear || (year === todayYear && m > todayMonth);

            if (paid) {
                totalPaid += monthFee;
            } else {
                if (!isFuture) {
                    unpaidTotal += monthFee;
                }
            }
        }

        return { totalPaid, unpaidTotal };
    };

    // 엑셀 다운로드 (클라이언트 처리)
    const downloadExcel = () => {
        const wb = XLSX.utils.book_new();
        const wsData: any[][] = [];

        // 헤더
        wsData.push(["회원명", "월", "납부금액", "상태"]);

        members.forEach(member => {
            const { totalPaid, unpaidTotal } = calculateTotals(member._id);
            
            wsData.push([`[${member.name}]`, "", "", ""]); // 회원 구분행

            for (let m = 1; m <= 12; m++) {
                const paid = passMap[member._id]?.[m] || 0;
                const monthFee = monthlyFees[m] || 20000;
                const isFuture = year > todayYear || (year === todayYear && m > todayMonth);

                let statusText = "미납";
                let amount = monthFee;

                if (paid) {
                    statusText = "납부완료";
                } else if (isFuture) {
                    statusText = "해당없음";
                    amount = 0;
                }

                wsData.push([
                    member.name,
                    `${m}월`,
                    amount,
                    statusText
                ]);
            }
            
            wsData.push(["합계", "입금액:", totalPaid, "미납액:", unpaidTotal]);
            wsData.push(["", "", "", ""]); // 공백
        });

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, `${year}년_납부현황`);
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, `회비납부상세_${year}.xlsx`);
    };

    // 이미지 캡처
    const captureToImage = async () => {
        if (!captureRef.current) return;
        
        try {
            // 캡처 시 체크박스 등 숨길 요소 처리 (필요시)
            const canvas = await html2canvas(captureRef.current, {
                scale: 2, // 고해상도
                backgroundColor: "#f4f6f9",
                useCORS: true
            });
            
            const imgData = canvas.toDataURL("image/jpeg", 0.9);
            setImgUrl(imgData);
            
            // 모달 띄우기 (Bootstrap Modal 방식)
            const modalEl = document.getElementById('imageModal');
            if (modalEl) {
                // @ts-ignore
                const modal = new window.bootstrap.Modal(modalEl);
                modal.show();
            }
        } catch (error) {
            console.error("Capture failed:", error);
            alert("이미지 생성에 실패했습니다.");
        }
    };

    // SMS 발송 페이지 이동
    const sendSMS = () => {
        const ids = members.map(m => m._id).join(',');
        router.push(`/account/sms-send?members=${ids}&year=${year}`);
    };

    if (status === "loading" || loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <div className="container-fluid py-4" style={{ background: "#f4f6f9", minHeight: "100vh" }}>
            <style jsx global>{`
                body { 
                    background: #f4f6f9; 
                    font-family: 'Noto Sans KR', sans-serif; 
                }
                
                h4 { font-size: 1.3rem; font-weight: bold; }
                
                .month-card {
                    border-radius: 12px;
                    padding: 12px;
                    color: #fff;
                    min-height: 100px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    text-align: center;
                }
                
                .month-card h6 { font-weight: 700; margin-bottom: 5px; font-size: 1rem; }
                .month-card p { font-size: 0.85rem; margin-bottom: 4px; opacity: 0.9; }
                .month-card small { font-weight: 600; font-size: 0.9rem; border-top: 1px solid rgba(255, 255, 255, 0.3); padding-top: 3px; display: block; }
                
                .paid {
                    background: linear-gradient(135deg, #2e7d32 0%, #43a047 100%);
                    box-shadow: 0 3px 8px rgba(46, 125, 50, 0.2);
                }
                
                .unpaid {
                    background: linear-gradient(135deg, #c62828 0%, #e53935 100%);
                    box-shadow: 0 3px 8px rgba(198, 40, 40, 0.2);
                }

                .future {
                    background: linear-gradient(135deg, #757575 0%, #9e9e9e 100%);
                    box-shadow: 0 3px 8px rgba(117, 117, 117, 0.2);
                    opacity: 0.7;
                }
                
                .card-custom {
                    background: white;
                    border: none;
                    border-radius: 15px;
                    overflow: hidden;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }
                
                .card-header-custom {
                    background: linear-gradient(135deg, #1976d2 0%, #2196f3 100%);
                    color: white;
                    padding: 15px 20px;
                    font-size: 1.1rem;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .summary-box {
                    background: #f8f9fa;
                    border-top: 1px solid #eee;
                    padding: 15px;
                    border-radius: 0 0 15px 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .summary-item { font-weight: 800; font-size: 1rem; }
                .text-paid { color: #2e7d32; }
                .text-unpaid { color: #c62828; }

                @media (max-width: 768px) {
                    .month-col { width: 50%; }
                }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 mx-auto">📋 {year}년 회원 회비 납부 상세</h4>
            </div>

            {/* 캡처 영역 시작 */}
            <div id="captureArea" ref={captureRef} style={{ padding: '10px', background: '#f4f6f9' }}>
                {members.length === 0 ? (
                    <div className="alert alert-warning text-center p-5">
                        선택된 회원이 없습니다.
                    </div>
                ) : (
                    members.map(member => {
                        const { totalPaid, unpaidTotal } = calculateTotals(member._id);
                        return (
                            <div key={member._id} className="card-custom">
                                <div className="card-header-custom">
                                    <i className="bi bi-person-fill"></i>
                                    {member.name} 님 납부 현황
                                </div>
                                
                                <div className="p-3">
                                    <div className="row g-2">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => {
                                            const paid = passMap[member._id]?.[month] || 0;
                                            const fee = monthlyFees[month] || 20000;
                                            
                                            // 미래/과거 판단 로직
                                            let isFuture = false;
                                            if (year > todayYear) isFuture = true;
                                            else if (year === todayYear && month > todayMonth) isFuture = true;

                                            let cardClass = 'unpaid';
                                            let statusText = '미납안내';

                                            if (paid) {
                                                cardClass = 'paid';
                                                statusText = '납부완료';
                                            } else if (isFuture) {
                                                cardClass = 'future';
                                                statusText = '해당없음';
                                            }

                                            return (
                                                <div key={month} className="col-6 col-md-3">
                                                    <div className={`month-card ${cardClass}`}>
                                                        <h6>{month}월</h6>
                                                        <p>{statusText}</p>
                                                        <small>{fee.toLocaleString()}원</small>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                
                                <div className="summary-box">
                                    <div className="summary-item">
                                        <span className="text-secondary small me-2">입금합계:</span>
                                        <span className="text-paid">{totalPaid.toLocaleString()}원</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="text-secondary small me-2">미납합계:</span>
                                        <span className="text-unpaid">{unpaidTotal.toLocaleString()}원</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            {/* 캡처 영역 끝 */}

            {/* 버튼 그룹 */}
            {members.length > 0 && (
                <div className="d-flex justify-content-center gap-2 my-4 flex-wrap">
                    <button className="btn btn-success" onClick={downloadExcel}>
                        📥 엑셀 다운로드
                    </button>
                    <button className="btn btn-warning text-dark fw-bold" onClick={sendSMS}>
                        📩 미납자 SMS 발송
                    </button>
                </div>
            )}
            
            <div className="text-center mt-2 mb-5 d-flex justify-content-center gap-2">
                 {members.length > 0 && (
                    <button className="btn btn-primary" onClick={captureToImage}>
                        🖼️ 데이터 ={">"} 이미지화
                    </button>
                 )}
                <button className="btn btn-secondary" onClick={() => router.back()}>
                    ⏪ 돌아가기
                </button>
            </div>

            {/* 이미지 모달 */}
            <div className="modal fade" id="imageModal" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">🖼️ 납부현황 이미지 생성</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body text-center">
                            <div className="alert alert-info py-2 small">
                                💡 <b>스마트폰:</b> 이미지를 길게 눌러 저장하세요.<br />
                                💡 <b>PC:</b> 마우스 우클릭 후 '이미지를 다른 이름으로 저장'
                            </div>
                            {imgUrl && <img src={imgUrl} className="img-fluid border rounded" alt="Capture" />}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary w-100" data-bs-dismiss="modal">닫기</button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Bootstrap JS 로드 (모달용) */}
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" async></script>
        </div>
    );
}