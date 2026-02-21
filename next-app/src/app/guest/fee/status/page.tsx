"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

type Member = {
    _id: string;
    name: string;
};

type PassMap = {
    [memberId: string]: {
        [month: number]: number;
    };
};

export default function GuestFeeStatusPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [year, setYear] = useState(new Date().getFullYear());
    const [members, setMembers] = useState<Member[]>([]);
    const [passMap, setPassMap] = useState<PassMap>({});
    const [monthlyFees, setMonthlyFees] = useState<{ [month: number]: number }>({});
    const [currentMonthFee, setCurrentMonthFee] = useState(20000);
    const [loading, setLoading] = useState(true);

    const [showGuideModal, setShowGuideModal] = useState(false);
    const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const [popupMonth, setPopupMonth] = useState(0);

    // 월별 툴팁형 팝업 표시 함수 - 스크롤에 영향 안 받게 수정
    const handleShowMonthPopup = (el: HTMLElement, month: number) => {
        const rect = el.getBoundingClientRect();

        // 툴팁 이동 - 좌측으로 5픽셀 추가 이동
        // position: fixed를 사용하여 스크롤에 영향 안 받게 함
        setPopupPosition({
            top: rect.bottom + 10,  // 바로 아래
            left: rect.left - 43     // 중앙 정렬 (좌측 이동)
        });
        setPopupMonth(month);
        setShowPopup(true);
    };

    const todayMonth = new Date().getMonth() + 1;
    const todayYear = new Date().getFullYear();

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (yearDropdownOpen) {
                const dropdown = document.querySelector('.year-dropdown-container');
                if (dropdown && !dropdown.contains(event.target as Node)) {
                    setYearDropdownOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [yearDropdownOpen]);

    useEffect(() => {
        if (status !== "loading") {
            fetchData();
        }
        document.title = "월회비 입금현황";
    }, [status, year]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/fee/status?year=${year}`);
            if (res.data.success) {
                setMembers(res.data.members);
                setPassMap(res.data.passMap);
                setMonthlyFees(res.data.monthlyFees);
                setCurrentMonthFee(res.data.currentMonthFee);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
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

            if (paid) {
                totalPaid += monthFee;
            } else {
                if (year < todayYear || (year === todayYear && m <= todayMonth)) {
                    unpaidTotal += monthFee;
                }
            }
        }

        return { totalPaid, unpaidTotal };
    };

    if (status === "loading" || loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    const years = [];
    const currentDate = new Date();
    const currentYearValue = currentDate.getFullYear();

    for (let i = 5; i >= 0; i--) {
        years.push(currentYearValue - i);
    }

    if (currentDate.getMonth() === 11 && currentDate.getDate() >= 1) {
        years.push(currentYearValue + 1);
    }

    const uniqueYears = [...new Set(years)].sort((a, b) => a - b);

    return (
        <div className="container-fluid py-4" style={{ background: "#f9f9fa", minHeight: "100vh" }}>
            <style jsx>{`
                body { background: #f9f9f9; margin: 20px 5px 10px 5px; }
                
                .admin-info { text-align: right; margin-bottom: 20px; }
                .user-info-box {
                    font-size: 13px;
                    color: #6c757d;
                    background: #f1f3f5;
                    padding: 4px 12px;
                    border-radius: 20px;
                    border: 1px solid #dee2e6;
                    display: inline-flex;
                    align-items: center;
                }
                .header-box { display: grid; grid-template-columns: auto 1fr auto; align-items: center; margin-bottom: 10px; gap: 10px; }
                .title-btn { background: #1976d2; color: #fff; padding: 14px 28px; border-radius: 30px; font-weight: 800; font-size: 18px; white-space: nowrap; }
                .fee-btn { background: #eee; padding: 8px 15px; border-radius: 6px; white-space: nowrap; cursor: default; transition: background 0.2s; }
                .fee-btn:hover { background: #ddd; }
                .help-btn { background: #fff3e0; color: #f57c00; border: 1px solid #ffe0b2; padding: 8px 15px; border-radius: 15px; font-weight: bold; cursor: pointer; white-space: nowrap; }
                .help-btn:hover { background: #ffe0b2; }
                
                /* PC Table Styles */
                .ox { font-weight: bold; font-size: 18px; padding: 8px; display: inline-block; min-width: 32px; cursor: default; }
                .ox.o { color: green; }
                .ox.x { color: red; }
                
                .total-members-info { font-size: 14px; color: #555; font-weight: 700; margin-bottom: 8px; margin-left: 5px; }

                /* Mobile Card View Styles */
                .mobile-header-bar {
                    display: grid;
                    grid-template-columns: 75px 1fr;
                    border: 1px solid #333;
                    border-radius: 5px;
                    overflow: hidden;
                    margin-bottom: 10px;
                    background: #fff;
                    font-size: 13px;
                    font-weight: 700;
                    text-align: center;
                }
                .mobile-header-name { display: flex; align-items: center; justify-content: center; border-right: 1px solid #333; padding: 8px 0; }
                .mobile-header-right { display: flex; flex-direction: column; }
                .mh-blue { background: #e3f2fd; color: #1976d2; padding: 4px 0; border-bottom: 1px solid #ccc; flex: 1; }
                .mh-orange { background: #fff3e0; color: #f57c00; padding: 4px 0; flex: 1; }

                .mobile-card {
                    display: grid;
                    grid-template-columns: 75px 1fr;
                    background: #fff;
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    margin-bottom: 15px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    overflow: hidden;
                    min-height: 120px;
                }
                .mc-left-name { display: flex; align-items: center; justify-content: center; border-right: 1px solid #eee; font-weight: 700; font-size: 15px; color: #333; }
                .mc-right { display: flex; flex-direction: column; }
                .mc-row-months { display: grid; grid-template-columns: repeat(6, 1fr); height: 40px; }
                .mc-half-1 { background: #f4faff; border-bottom: 1px solid #f0f0f0; }
                .mc-half-2 { background: #fffaf4; border-bottom: 1px solid #f0f0f0; }
                .mc-month-cell { display: flex; align-items: center; justify-content: center; border-right: 1px solid rgba(0,0,0,0.03); font-size: 14px; font-weight: bold; }
                .mc-month-cell:last-child { border-right: none; }
                .mc-row-total { display: flex; height: 40px; background: #fafafa; }
                .mc-total-box { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }
                .mc-deposit { color: #2e7d32; background: #e8f5e9; margin: 4px; border-radius: 6px; }
                .mc-unpaid { color: #c62828; background: #ffebee; margin: 4px; border-radius: 6px; }
                .m-ox { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; cursor: default; }
                .m-ox.o { color: green; }
                .m-ox.x { color: red; }

                /* [수정됨] 모달 내부 스타일 (이미지 디자인 반영) */
                .example-box {
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .exam-header-blue {
                    background: #e3f2fd;
                    color: #0d47a1;
                    font-weight: bold;
                    text-align: center;
                    padding: 8px;
                    font-size: 14px;
                    border-bottom: 1px solid #dee2e6;
                }
                .exam-header-orange {
                    background: #fff3e0;
                    color: #e65100;
                    font-weight: bold;
                    text-align: center;
                    padding: 8px;
                    font-size: 14px;
                    border-top: 1px solid #dee2e6;
                    border-bottom: 1px solid #dee2e6;
                }
                .exam-summary {
                    background: #f8f9fa;
                    padding: 15px;
                    text-align: center;
                    font-weight: bold;
                    font-size: 15px;
                    border-top: 1px solid #dee2e6;
                }
                .exam-table td {
                    vertical-align: middle;
                    padding: 6px 2px;
                }

                @media (max-width: 768px) {
                    body { margin: 10px 3px; }
                    .header-box { display: flex; flex-direction: column; gap: 12px; margin-bottom: 15px; align-items: stretch; }
                    .header-box > div:nth-child(2) { order: 1; display: flex; justify-content: center; }
                    .header-box > div:nth-child(1) { order: 2; display: flex; justify-content: flex-start; }
                    .header-box > div:nth-child(3) { order: 3; display: flex; justify-content: flex-end; gap: 8px; }
                    .admin-info { text-align: right; margin-bottom: 15px; }
                    .user-info-box {
                        font-size: 11px;
                        padding: 3px 10px;
                    }
                    .help-btn { padding: 6px 10px; font-size: 12px; border-radius: 12px; }
                    .title-btn { font-size: 16px; padding: 10px 20px; text-align: center; width: 100%; }
                    .fee-btn { font-size: 11px; padding: 6px 10px; white-space: nowrap; }
                    
                    /* PC Table Hide */
                    .pc-table-view { display: none; }
                    .mobile-card-view { display: block; }
                    
                    .modal-content-custom { width: 95%; max-width: 350px; padding: 20px; max-height: 90vh; overflow-y: auto; }
                    .modal-content-custom h5 { font-size: 16px; }
                }

                @media (min-width: 769px) {
                    .pc-table-view { display: block; }
                    .mobile-card-view { display: none; }
                }
            `}</style>

            <div className="admin-info">
                <div className="user-info-box">
                    👤 {session?.user ? (
                        <><strong>{(session?.user as any)?.name}</strong> 님 ({(session?.user as any)?.remark || '회원'})</>
                    ) : (
                        "방문자"
                    )}
                </div>
            </div>

            <div className="header-box">
                <div className="position-relative year-dropdown-container">
                    <button className="btn btn-primary dropdown-toggle rounded-pill px-3 shadow-sm"
                        onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                        style={{ fontWeight: '600' }}>
                        📅 {year}년
                    </button>
                    {yearDropdownOpen && (
                        <div className="dropdown-menu show position-absolute end-0 mt-1 shadow"
                            style={{ maxHeight: '250px', overflowY: 'auto', minWidth: '120px' }}>
                            {uniqueYears.map(y => (
                                <button key={y}
                                    className={`dropdown-item ${y === year ? 'active' : ''}`}
                                    onClick={() => {
                                        setYear(y);
                                        setYearDropdownOpen(false);
                                    }}
                                    style={{ fontWeight: y === year ? '600' : 'normal', fontSize: '0.9rem' }}>
                                    {y}년 {y === new Date().getFullYear() ? '(현재)' : ''} {y === new Date().getFullYear() + 1 ? '(다음해)' : ''}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="text-center">
                    <div className="title-btn">{year}년도 회비납부 현황</div>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <button className="help-btn" onClick={() => setShowGuideModal(true)}>❓ 보는법</button>
                    <div className="fee-btn" style={{ cursor: 'default' }}>
                        월회비: {currentMonthFee.toLocaleString()}원
                    </div>
                </div>
            </div>

            <div className="total-members-info">
                전체 회원 수: {members.length}명
            </div>

            {/* 메인 테이블 렌더링 영역 */}
            {members.length === 0 ? (
                <div className="alert alert-warning text-center">
                    회원 데이터가 없습니다. MongoDB에 회원을 추가해주세요.
                </div>
            ) : (
                <>
                    {/* PC View (Table) */}
                    <div className="table-responsive pc-table-view">
                        <table className="table table-bordered text-center align-middle list-table mode-guest">
                            <thead className="table-light">
                                <tr>
                                    <th rowSpan={2}>이름</th>
                                    <th colSpan={6} style={{ background: '#e3f2fd', color: '#1976d2' }}>상반기</th>
                                    <th colSpan={6} style={{ background: '#fff3e0', color: '#f57c00' }}>하반기</th>
                                    <th rowSpan={2}>입금합계</th>
                                    <th rowSpan={2}>미납금</th>
                                </tr>
                                <tr>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                        <th key={m} style={{ fontSize: '13px' }}>{m}월</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {members.map(member => {
                                    const { totalPaid, unpaidTotal } = calculateTotals(member._id);
                                    return (
                                        <tr key={member._id} data-id={member._id}>
                                            <td>{member.name}</td>
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => {
                                                const paid = passMap[member._id]?.[m] || 0;
                                                return (
                                                    <td key={m}>
                                                        <span
                                                            className={`ox ${paid ? 'o' : 'x'}`}
                                                            data-month={m}
                                                            data-paid={paid}
                                                            onClick={(e) => handleShowMonthPopup(e.currentTarget, m)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            {paid ? 'O' : 'X'}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                            <td>{totalPaid.toLocaleString()}</td>
                                            <td>{unpaidTotal.toLocaleString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View (Card) */}
                    <div className="mobile-card-view">
                        <div className="mobile-header-bar">
                            <div className="mobile-header-name">이름</div>
                            <div className="mobile-header-right">
                                <div className="mh-blue">상반기</div>
                                <div className="mh-orange">하반기</div>
                            </div>
                        </div>

                        {members.map(member => {
                            const { totalPaid, unpaidTotal } = calculateTotals(member._id);
                            return (
                                <div className="mobile-card" key={member._id}>
                                    <div className="mc-left-name">{member.name}</div>
                                    <div className="mc-right">
                                        <div className="mc-row-months mc-half-1">
                                            {[1, 2, 3, 4, 5, 6].map(m => {
                                                const paid = passMap[member._id]?.[m] || 0;
                                                return (
                                                    <div key={m} className="mc-month-cell">
                                                        <span
                                                            className={`m-ox ${paid ? 'o' : 'x'}`}
                                                            data-month={m}
                                                            onClick={(e) => handleShowMonthPopup(e.currentTarget, m)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            {paid ? 'O' : 'X'}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div className="mc-row-months mc-half-2">
                                            {[7, 8, 9, 10, 11, 12].map(m => {
                                                const paid = passMap[member._id]?.[m] || 0;
                                                return (
                                                    <div key={m} className="mc-month-cell">
                                                        <span
                                                            className={`m-ox ${paid ? 'o' : 'x'}`}
                                                            data-month={m}
                                                            onClick={(e) => handleShowMonthPopup(e.currentTarget, m)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            {paid ? 'O' : 'X'}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div className="mc-row-total">
                                            <div className="mc-total-box">
                                                <div className="mc-deposit w-100 h-100 d-flex align-items-center justify-content-center">
                                                    입금: {totalPaid.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="mc-total-box">
                                                <div className="mc-unpaid w-100 h-100 d-flex align-items-center justify-content-center">
                                                    미납: {unpaidTotal.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 월별 툴팁형 팝업 */}
                    {showPopup && (
                        <div
                            className="month-popup"
                            style={{
                                display: 'block',
                                position: 'fixed',
                                top: popupPosition.top,
                                left: popupPosition.left,
                                zIndex: 2000,
                            }}
                        >
                            <div className="month-popup-arrow"></div>
                            <p className="month-popup-msg">{popupMonth}월</p>
                        </div>
                    )}
                </>
            )}

            <div className="d-flex justify-content-center mt-3 mb-4">
                <button className="btn btn-secondary btn-lg" onClick={() => router.push('/guest')}>⏪ 돌아가기</button>
            </div>

            {/* ======================================================== */}
            {/* [수정됨] 안내 모달: 이미지 디자인 반영 */}
            {/* ======================================================== */}
            {showGuideModal && (
                <div className="modal-overlay" onClick={() => setShowGuideModal(false)}>
                    <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="text-center mb-3">
                            <h5 style={{ fontWeight: 800, color: '#1976d2', margin: 0 }}>
                                📋 회비납부 현황 보는법 안내
                            </h5>
                        </div>

                        {/* Description */}
                        <div className="text-center mb-3" style={{ fontSize: '13px', color: '#555' }}>
                            <p className="mb-1">예:) 아래 예시와 같이 월별 납부 현황이 표시됩니다.</p>
                            <p className="mb-2">월회비가 20,000원인 경우로 계산된겁니다.</p>
                            <div style={{ fontWeight: 'bold' }}>
                                <span style={{ color: 'green' }}>O (납부)</span> / <span style={{ color: 'red' }}>X (미납)</span>
                            </div>
                        </div>

                        {/* Example Table Box */}
                        <div className="example-box">
                            {/* 상반기 */}
                            <div>
                                <div className="exam-header-blue">상반기 (1~6월)</div>
                                <table className="table table-bordered mb-0 text-center exam-table" style={{ fontSize: '13px', width: '100%' }}>
                                    <tbody>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <td rowSpan={2} style={{ verticalAlign: 'middle', fontWeight: 'bold', width: '20%' }}>홍길동</td>
                                            <td>1월</td><td>2월</td><td>3월</td><td>4월</td><td>5월</td><td>6월</td>
                                        </tr>
                                        <tr>
                                            <td className="text-success fw-bold">O</td>
                                            <td className="text-success fw-bold">O</td>
                                            <td className="text-success fw-bold">O</td>
                                            <td className="text-success fw-bold">O</td>
                                            <td className="text-success fw-bold">O</td>
                                            <td className="text-success fw-bold">O</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* 하반기 */}
                            <div>
                                <div className="exam-header-orange">하반기 (7~12월)</div>
                                <table className="table table-bordered mb-0 text-center exam-table" style={{ fontSize: '13px', width: '100%' }}>
                                    <tbody>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <td rowSpan={2} style={{ verticalAlign: 'middle', fontWeight: 'bold', width: '20%' }}>홍길동</td>
                                            <td>7월</td><td>8월</td><td>9월</td><td>10월</td><td>11월</td><td>12월</td>
                                        </tr>
                                        <tr>
                                            <td className="text-success fw-bold">O</td>
                                            <td className="text-success fw-bold">O</td>
                                            <td className="text-success fw-bold">O</td>
                                            <td className="text-success fw-bold">O</td>
                                            <td className="text-danger fw-bold">X</td>
                                            <td className="text-danger fw-bold">X</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary */}
                            <div className="exam-summary">
                                <div className="mb-1">
                                    <span style={{ color: '#2e7d32' }}>✅ 입금 합계: 200,000원</span>
                                </div>
                                <div>
                                    <span style={{ color: '#c62828' }}>❌ 미납 합계: 40,000원</span>
                                </div>
                            </div>
                        </div>

                        {/* Close Button */}
                        <div className="mt-4">
                            <button className="btn btn-dark w-100 fw-bold" onClick={() => setShowGuideModal(false)}>
                                확인 및 닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Overlay Style & Month Popup */}
            <style jsx>{`
                .modal-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 9999;
                    display: flex; align-items: center; justify-content: center; padding: 20px;
                }
                .modal-content-custom {
                    background: white; padding: 25px; border-radius: 12px; width: 95%; max-width: 420px;
                }
                /* 월별 툴팁형 팝업 스타일 */
                .month-popup {
                    display: none;
                    background: white;
                    border: 1px solid #999;
                    border-radius: 8px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    padding: 12px;
                    text-align: center;
                    width: 120px;
                }
                .month-popup-arrow {
                    position: absolute;
                    top: -6px;
                    left: 55px;
                    width: 10px;
                    height: 10px;
                    background: white;
                    border-left: 1px solid #999;
                    border-top: 1px solid #999;
                    transform: rotate(45deg);
                }
                .month-popup-msg {
                    margin-bottom: 0;
                    font-weight: bold;
                    font-size: 14px;
                    color: #333;
                }
            `}</style>
        </div>
    );
}