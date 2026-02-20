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

export default function FeeStatusPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [year, setYear] = useState(new Date().getFullYear());
    const [members, setMembers] = useState<Member[]>([]);
    const [passMap, setPassMap] = useState<PassMap>({});
    const [monthlyFees, setMonthlyFees] = useState<{ [month: number]: number }>({});
    const [currentMonthFee, setCurrentMonthFee] = useState(20000);
    const [lastApplyYear, setLastApplyYear] = useState(new Date().getFullYear());
    const [lastApplyMonth, setLastApplyMonth] = useState(1);
    const [loading, setLoading] = useState(true);

    const [showFeeModal, setShowFeeModal] = useState(false);
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [feeYear, setFeeYear] = useState(new Date().getFullYear());
    const [feeMonth, setFeeMonth] = useState(new Date().getMonth() + 1);
    const [feeAmount, setFeeAmount] = useState(20000);

    const [showPopup, setShowPopup] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const [currentTarget, setCurrentTarget] = useState<any>(null);
    
    // 툴팁 상태 (모든 사용자가能看到)
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const [tooltipData, setTooltipData] = useState<any>(null);

    const [checkedMembers, setCheckedMembers] = useState<string[]>([]);
    const [checkAll, setCheckAll] = useState(false);
    const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

    const isAdmin = (session?.user as any)?.user_level >= 10;
    const todayMonth = new Date().getMonth() + 1;
    const todayYear = new Date().getFullYear();

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
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [yearDropdownOpen]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchData();
        }
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
                setLastApplyYear(res.data.lastApplyYear);
                setLastApplyMonth(res.data.lastApplyMonth);
                setFeeAmount(res.data.currentMonthFee);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
            alert('데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 모든 사용자가能看到하는 툴팁 표시
    const showTooltip = (e: React.MouseEvent, memberId: string, memberName: string, month: number, paid: number) => {
        e.stopPropagation();
        
        const target = e.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        // 해당 회원의 모든 월별 데이터 수집
        const memberData = passMap[memberId] || {};
        const monthFee = monthlyFees[month] || currentMonthFee;
        
        setTooltipData({
            memberId,
            memberName,
            month,
            paid,
            monthFee,
            memberData,
            monthlyFees
        });
        
        // 툴팁 위치 설정
        const isRightSide = rect.left > window.innerWidth / 2;
        setTooltipPosition({
            top: rect.bottom + scrollTop + 5,
            left: isRightSide ? (rect.right + scrollLeft - 200) : (rect.left + scrollLeft)
        });
        setTooltipVisible(true);
    };

    const showChangePopup = (e: React.MouseEvent, memberId: string, month: number, paid: number) => {
        if (!isAdmin) return;
        e.stopPropagation();

        // 모바일 환경을 고려한 팝업 위치 조정
        const target = e.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        // 화면 오른쪽 끝에 가까우면 왼쪽으로 띄우기
        const isRightSide = rect.left > window.innerWidth / 2;
        
        setPopupPosition({
            top: rect.bottom + scrollTop + 5,
            left: isRightSide ? (rect.right + scrollLeft - 150) : (rect.left + scrollLeft)
        });
        setCurrentTarget({ memberId, month, paid });
        setShowPopup(true);
    };

    const confirmChange = async () => {
        if (!currentTarget) return;
        const { memberId, month, paid } = currentTarget;
        const newPaid = paid === 1 ? 0 : 1;

        try {
            const res = await axios.post('/api/fee/update', {
                memberId, year, month, paid: newPaid
            });
            if (res.data.success) {
                setPassMap(prev => ({
                    ...prev,
                    [memberId]: { ...prev[memberId], [month]: newPaid }
                }));
            }
        } catch (error) { alert('업데이트 실패'); }
        setShowPopup(false);
        setCurrentTarget(null);
    };

    const saveFee = async () => {
        try {
            const res = await axios.post('/api/fee/update-amount', {
                year: feeYear, month: feeMonth, amount: feeAmount
            });
            if (res.data.success) {
                alert('저장되었습니다.'); setShowFeeModal(false); fetchData();
            } else { alert('저장에 실패했습니다.'); }
        } catch (error) { alert('오류가 발생했습니다.'); }
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

    const handleCheckAll = () => {
        if (checkAll) setCheckedMembers([]);
        else setCheckedMembers(members.map(m => m._id));
        setCheckAll(!checkAll);
    };

    const handleCheckMember = (memberId: string) => {
        if (checkedMembers.includes(memberId)) setCheckedMembers(checkedMembers.filter(id => id !== memberId));
        else setCheckedMembers([...checkedMembers, memberId]);
    };

    const goMemberCheck = () => {
        console.log('=== goMemberCheck Debug ===');
        console.log('checkedMembers:', checkedMembers);
        console.log('checkedMembers.length:', checkedMembers.length);
        console.log('year:', year);
        
        if (checkedMembers.length === 0) { 
            console.log('❌ No members selected');
            alert('회원을 선택하세요.'); 
            return; 
        }
        
        const ids = checkedMembers.join(',');
        const url = `/account/member-check?members=${ids}&year=${year}`;
        
        console.log('✅ Generated IDs:', ids);
        console.log('🌐 Navigation URL:', url);
        
        router.push(url);
    };

    if (status === "loading" || loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    const years = [];
    const currentDate = new Date();
    const currentYearValue = currentDate.getFullYear();
    for (let i = 5; i >= 0; i--) { years.push(currentYearValue - i); }
    if (currentDate.getMonth() === 11 && currentDate.getDate() >= 1) { years.push(currentYearValue + 1); }
    const uniqueYears = [...new Set(years)].sort((a, b) => a - b);

    return (
        <div className="container-fluid py-4" style={{ background: "#f9f9fa", minHeight: "100vh" }}>
            <style jsx>{`
                body { background: #f9f9f9; margin: 20px 5px 10px 5px; }
                .admin-info { text-align: right; font-size: 15px; color: #6c757d; margin-bottom: 20px; }
                .header-box { display: grid; grid-template-columns: auto 1fr auto; align-items: center; margin-bottom: 10px; gap: 10px; }
                .title-btn { background: #1976d2; color: #fff; padding: 14px 28px; border-radius: 30px; font-weight: 800; font-size: 18px; white-space: nowrap; }
                .fee-btn { background: #eee; padding: 8px 15px; border-radius: 6px; white-space: nowrap; cursor: pointer; transition: background 0.2s; }
                .fee-btn:hover { background: #ddd; }
                .help-btn { background: #fff3e0; color: #f57c00; border: 1px solid #ffe0b2; padding: 8px 15px; border-radius: 15px; font-weight: bold; cursor: pointer; white-space: nowrap; }
                .help-btn:hover { background: #ffe0b2; }
                
                /* PC Table OX Styles */
                .ox { cursor: pointer; font-weight: bold; font-size: 18px; padding: 8px; display: inline-block; min-width: 32px; }
                .ox.o { color: green; }
                .ox.x { color: red; }
                .ox.no-access { cursor: default; opacity: 0.8; }
                
                .status-popup { position: absolute; background: white; border: 1px solid #999; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); padding: 12px; z-index: 2000; width: 150px; text-align: center; }
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; }
                .modal-content-custom { background: white; padding: 25px; border-radius: 12px; width: 90%; max-width: 400px; }
                .total-members-info { font-size: 14px; color: #555; font-weight: 700; margin-bottom: 8px; margin-left: 5px; }
                .guide-legend { display: flex; gap: 10px; justify-content: center; margin-bottom: 20px; }
                .legend-item { display: flex; align-items: center; gap: 8px; padding: 10px 15px; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                .legend-o { background: #e8f5e9; border: 1px solid #c8e6c9; color: #2e7d32; }
                .legend-x { background: #ffebee; border: 1px solid #ffcdd2; color: #c62828; }
                .guide-desc-box { background: #f8f9fa; border-radius: 8px; padding: 15px; font-size: 13px; color: #444; margin-top: 15px; text-align: left; }
                .guide-desc-box ul { margin: 0; padding-left: 20px; }
                .guide-desc-box li { margin-bottom: 5px; }

                /* ========================================================== */
                /*  Mobile Card View Styles (이미지와 동일한 디자인 구현) */
                /* ========================================================== */
                .mobile-header-bar {
                    display: grid;
                    grid-template-columns: 35px 75px 1fr;
                    border: 1px solid #333;
                    border-radius: 5px;
                    overflow: hidden;
                    margin-bottom: 10px;
                    background: #fff;
                    font-size: 13px;
                    font-weight: 700;
                    text-align: center;
                }
                .mobile-header-chk { display: flex; align-items: center; justify-content: center; border-right: 1px solid #333; padding: 8px 0; }
                .mobile-header-name { display: flex; align-items: center; justify-content: center; border-right: 1px solid #333; padding: 8px 0; }
                .mobile-header-right { display: flex; flex-direction: column; }
                .mh-blue { background: #e3f2fd; color: #1976d2; padding: 4px 0; border-bottom: 1px solid #ccc; flex: 1; }
                .mh-orange { background: #fff3e0; color: #f57c00; padding: 4px 0; flex: 1; }

                .mobile-card {
                    display: grid;
                    grid-template-columns: 35px 75px 1fr;
                    background: #fff;
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    margin-bottom: 15px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    overflow: hidden;
                    min-height: 120px;
                }
                
                /* 좌측: 체크박스 & 이름 */
                .mc-left-chk {
                    display: flex; align-items: center; justify-content: center;
                    border-right: 1px solid #eee;
                }
                .mc-left-name {
                    display: flex; align-items: center; justify-content: center;
                    border-right: 1px solid #eee;
                    font-weight: 700;
                    font-size: 15px;
                    color: #333;
                }

                /* 우측: 월별 데이터 & 합계 */
                .mc-right {
                    display: flex;
                    flex-direction: column;
                }
                
                /* 상반기 (1~6월) */
                .mc-row-months {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    height: 40px; /* 높이 고정 */
                }
                .mc-half-1 { background: #f4faff; border-bottom: 1px solid #f0f0f0; }
                .mc-half-2 { background: #fffaf4; border-bottom: 1px solid #f0f0f0; }

                .mc-month-cell {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-right: 1px solid rgba(0,0,0,0.03);
                    font-size: 14px;
                    font-weight: bold;
                }
                .mc-month-cell:last-child { border-right: none; }
                
                /* 합계 영역 */
                .mc-row-total {
                    display: flex;
                    height: 40px;
                    background: #fafafa;
                }
                .mc-total-box {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    font-weight: 700;
                }
                .mc-deposit { color: #2e7d32; background: #e8f5e9; margin: 4px; border-radius: 6px; }
                .mc-unpaid { color: #c62828; background: #ffebee; margin: 4px; border-radius: 6px; }

                /* Mobile OX Text */
                .m-ox { cursor: pointer; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
                .m-ox.o { color: green; }
                .m-ox.x { color: red; }

                @media (max-width: 768px) {
                    body { margin: 10px 3px; }
                    .header-box { display: flex; flex-direction: column; gap: 12px; margin-bottom: 15px; align-items: stretch; }
                    .header-box > div:nth-child(2) { order: 1; display: flex; justify-content: center; }
                    .header-box > div:nth-child(1) { order: 2; display: flex; justify-content: flex-start; }
                    .header-box > div:nth-child(3) { order: 3; display: flex; justify-content: flex-end; gap: 8px; }
                    .admin-info { text-align: right; font-size: 12px; margin-bottom: 20px; }
                    .help-btn { padding: 6px 10px; font-size: 12px; border-radius: 12px; }
                    .title-btn { font-size: 16px; padding: 10px 20px; text-align: center; width: 100%; }
                    .fee-btn { font-size: 11px; padding: 6px 10px; white-space: nowrap; }
                    
                    /* PC Table Hide */
                    .pc-table-view { display: none; }
                    /* Mobile View Show */
                    .mobile-card-view { display: block; }
                }

                @media (min-width: 769px) {
                    .pc-table-view { display: block; }
                    .mobile-card-view { display: none; }
                }
            `}</style>

            <div className="admin-info">
                {isAdmin ? (
                    <>
                        <span className="badge bg-primary">관리자 모드</span>
                        👤 관리자: <strong>{(session?.user as any)?.user_id || 'terraone'}</strong> (Level {(session?.user as any)?.user_level})
                    </>
                ) : (
                    <>
                        <span className="badge bg-dark">전용 열람 모드</span>
                        👤 <strong>회원</strong> (데이터 조회 가능)
                    </>
                )}
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
                             style={{ maxHeight: '250px', overflowY: 'auto', minWidth: '120px', zIndex: 1001 }}>
                            {uniqueYears.map(y => (
                                <button key={y} 
                                        className={`dropdown-item ${y === year ? 'active' : ''}`} 
                                        onClick={() => { setYear(y); setYearDropdownOpen(false); }}
                                        style={{ fontWeight: y === year ? '600' : 'normal', fontSize: '0.9rem' }}>
                                    {y}년 {y === new Date().getFullYear() ? '(현재)' : ''}
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
                    <div className={isAdmin ? 'fee-btn' : 'fee-btn'} onClick={() => isAdmin && setShowFeeModal(true)} style={{ cursor: isAdmin ? 'pointer' : 'default' }}>
                        월회비: {currentMonthFee.toLocaleString()}원
                    </div>
                </div>
            </div>

            <div className="total-members-info">
                전체 회원 수: {members.length}명
            </div>

            {members.length === 0 ? (
                <div className="alert alert-warning text-center">
                    회원 데이터가 없습니다. MongoDB에 회원을 추가해주세요.
                </div>
            ) : (
                <>
                    {/* ======================= */}
                    {/* 1. PC View (Table)      */}
                    {/* ======================= */}
                    <div className="table-responsive pc-table-view">
                        <table className={`table table-bordered text-center align-middle list-table`}>
                            <thead className="table-light">
                                <tr>
                                    {isAdmin && <th rowSpan={2} style={{ width: '40px' }}><input type="checkbox" checked={checkAll} onChange={handleCheckAll} /></th>}
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
                                        <tr key={member._id}>
                                            {isAdmin && <td><input type="checkbox" checked={checkedMembers.includes(member._id)} onChange={() => handleCheckMember(member._id)} /></td>}
                                            <td>{member.name}</td>
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => {
                                                const paid = passMap[member._id]?.[m] || 0;
                                                return (
                                                    <td key={m}>
                                                        <span className={`ox ${paid ? 'o' : 'x'}`}
                                                              onClick={(e) => {
                                                                  if (isAdmin) {
                                                                      showChangePopup(e, member._id, m, paid);
                                                                  } else {
                                                                      showTooltip(e, member._id, member.name, m, paid);
                                                                  }
                                                              }}>
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

                    {/* ======================= */}
                    {/* 2. Mobile View (Card)   */}
                    {/* ======================= */}
                    <div className="mobile-card-view">
                        {/* Mobile Header Bar */}
                        <div className="mobile-header-bar">
                            <div className="mobile-header-chk">
                                {isAdmin ? <input type="checkbox" checked={checkAll} onChange={handleCheckAll} /> : '☐'}
                            </div>
                            <div className="mobile-header-name">이름</div>
                            <div className="mobile-header-right">
                                <div className="mh-blue">상반기</div>
                                <div className="mh-orange">하반기</div>
                            </div>
                        </div>

                        {/* Member Cards */}
                        {members.map(member => {
                            const { totalPaid, unpaidTotal } = calculateTotals(member._id);
                            return (
                                <div className="mobile-card" key={member._id}>
                                    {/* Left: Checkbox */}
                                    <div className="mc-left-chk">
                                        {isAdmin && (
                                            <input type="checkbox" 
                                                   checked={checkedMembers.includes(member._id)} 
                                                   onChange={() => handleCheckMember(member._id)} 
                                                   style={{ transform: 'scale(1.2)' }}/>
                                        )}
                                    </div>
                                    
                                    {/* Left: Name */}
                                    <div className="mc-left-name">
                                        {member.name}
                                    </div>

                                    {/* Right: Data Grid */}
                                    <div className="mc-right">
                                        {/* Row 1: 1~6월 */}
                                        <div className="mc-row-months mc-half-1">
                                            {[1,2,3,4,5,6].map(m => {
                                                const paid = passMap[member._id]?.[m] || 0;
                                                return (
                                                    <div key={m} className="mc-month-cell">
                                                        <span className={`m-ox ${paid ? 'o' : 'x'}`}
                                                              onClick={(e) => {
                                                                  if (isAdmin) {
                                                                      showChangePopup(e, member._id, m, paid);
                                                                  } else {
                                                                      showTooltip(e, member._id, member.name, m, paid);
                                                                  }
                                                              }}>
                                                            {paid ? 'O' : 'X'}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {/* Row 2: 7~12월 */}
                                        <div className="mc-row-months mc-half-2">
                                            {[7,8,9,10,11,12].map(m => {
                                                const paid = passMap[member._id]?.[m] || 0;
                                                return (
                                                    <div key={m} className="mc-month-cell">
                                                        <span className={`m-ox ${paid ? 'o' : 'x'}`}
                                                              onClick={(e) => {
                                                                  if (isAdmin) {
                                                                      showChangePopup(e, member._id, m, paid);
                                                                  } else {
                                                                      showTooltip(e, member._id, member.name, m, paid);
                                                                  }
                                                              }}>
                                                            {paid ? 'O' : 'X'}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {/* Row 3: Totals */}
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
                </>
            )}

            {isAdmin && members.length > 0 && (
                <div className="d-flex justify-content-center gap-2 mt-4">
                    <button className="btn btn-primary btn-lg" onClick={goMemberCheck}>회원 체크하기</button>
                </div>
            )}

            <div className="d-flex justify-content-center mt-3 mb-4">
                <button className="btn btn-secondary btn-lg" onClick={() => router.push('/dashboard')}>⏪ 돌아가기</button>
            </div>

            {/* Popup & Modals */}
            {showPopup && (
                <div className="status-popup" style={{ top: popupPosition.top, left: popupPosition.left }}>
                    <div style={{ marginBottom: '8px' }}>
                        <p style={{ fontWeight: 'bold', fontSize: '13px', margin: 0 }}>{currentTarget?.month}월 선택 -</p>
                        <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>{currentTarget?.paid === 1 ? '미납(X)으로 변경?' : '납부(O)로 변경?'}</p>
                    </div>
                    <div className="d-flex gap-2 justify-content-center">
                        <button className="btn btn-primary btn-sm" onClick={confirmChange}>변경</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setShowPopup(false)}>취소</button>
                    </div>
                </div>
            )}
            
            {showFeeModal && (
                <div className="modal-overlay" onClick={() => setShowFeeModal(false)}>
                    <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
                        <h5>💰 월회비 변경</h5>
                        <div className="mb-3">
                            <label className="form-label">적용 연도/월</label>
                            <div className="d-flex gap-2">
                                <input type="number" className="form-control" value={feeYear} onChange={(e) => setFeeYear(parseInt(e.target.value))} />
                                <select className="form-select" value={feeMonth} onChange={(e) => setFeeMonth(parseInt(e.target.value))}>
                                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (<option key={m} value={m}>{m}월</option>))}
                                </select>
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">변경할 월회비 (원)</label>
                            <input type="number" className="form-control" value={feeAmount} onChange={(e) => setFeeAmount(parseInt(e.target.value))} />
                        </div>
                        <div className="d-flex gap-2 justify-content-end">
                            <button className="btn btn-secondary" onClick={() => setShowFeeModal(false)}>취소</button>
                            <button className="btn btn-primary" onClick={saveFee}>저장</button>
                        </div>
                    </div>
                </div>
            )}

            {showGuideModal && (
                <div className="modal-overlay" onClick={() => setShowGuideModal(false)}>
                    <div className="modal-content-custom" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
                        <h5 style={{ fontWeight: 800, textAlign: 'center', marginBottom: '20px', color: '#1976d2' }}>📋 현황표 보는법</h5>
                        <div className="guide-legend">
                            <div className="legend-item legend-o"><span style={{ fontSize: '18px' }}>O</span> 납부 완료</div>
                            <div className="legend-item legend-x"><span style={{ fontSize: '18px' }}>X</span> 미납</div>
                        </div>
                        <div className="guide-desc-box">
                            <ul>
                                <li><strong>입금합계</strong> : {year}년도 납부 총액</li>
                                <li><strong>미납금</strong> : {todayMonth}월까지 미납 총액</li>
                            </ul>
                        </div>
                        <div className="text-center mt-4"><button className="btn btn-dark w-100" onClick={() => setShowGuideModal(false)}>닫기</button></div>
                    </div>
                </div>
            )}

            {/* 툴팁 (모든 사용자가能看到) */}
            {tooltipVisible && tooltipData && (
                <>
                    <div 
                        className="status-popup" 
                        style={{ 
                            top: tooltipPosition.top, 
                            left: tooltipPosition.left,
                            width: '280px',
                            textAlign: 'left'
                        }}
                    >
                        <div style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                            <strong>{tooltipData.memberName}</strong> ({tooltipData.month}월)
                        </div>
                        <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                            {tooltipData.memberData && Object.entries(tooltipData.memberData).map(([m, paid]) => {
                                const monthNum = parseInt(m);
                                const isPaid = paid === 1;
                                const monthFee = tooltipData.monthlyFees?.[monthNum] || 20000;
                                return (
                                    <div key={m} style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        padding: '3px 0',
                                        background: monthNum === tooltipData.month ? '#e3f2fd' : 'transparent'
                                    }}>
                                        <span>{m}월</span>
                                        <span style={{ color: isPaid ? 'green' : 'red', fontWeight: 'bold' }}>
                                            {isPaid ? 'O' : 'X'} ({isPaid ? monthFee.toLocaleString() : '-'}원)
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #eee', fontSize: '12px', color: '#666' }}>
                            * 해당 월을 터치하면 상세정보 확인
                        </div>
                    </div>
                    <div 
                        style={{ position: 'fixed', inset: 0, zIndex: 1999 }} 
                        onClick={() => setTooltipVisible(false)} 
                    />
                </>
            )}
        </div>
    );
}
