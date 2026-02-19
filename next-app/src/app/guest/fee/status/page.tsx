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
    
    // 5년 전부터 현재까지의 년도 생성, 그리고 다음 해까지 포함
    const currentDate = new Date();
    const currentYearValue = currentDate.getFullYear();
    
    // 5년 전부터 현재까지
    for (let i = 5; i >= 0; i--) {
        years.push(currentYearValue - i);
    }
    
    // 12월 1일 이후에만 다음 해 자동 추가
    if (currentDate.getMonth() === 11 && currentDate.getDate() >= 1) {
        years.push(currentYearValue + 1);
    }
    
    // 중복 제거 및 정렬
    const uniqueYears = [...new Set(years)].sort((a, b) => a - b);

    return (
        <div className="container-fluid py-4" style={{ background: "#f9f9fa", minHeight: "100vh" }}>
            <style jsx>{`
                body { background: #f9f9f9; margin: 20px 5px 10px 5px; }
                
                .admin-info {
                    text-align: right;
                    font-size: 15px;
                    color: #6c757d;
                    margin-bottom: 20px;
                }
                
                .header-box {
                    display: grid;
                    grid-template-columns: auto 1fr auto;
                    align-items: center;
                    margin-bottom: 10px;
                    gap: 10px;
                }
                
                .title-btn {
                    background: #1976d2;
                    color: #fff;
                    padding: 14px 28px;
                    border-radius: 30px;
                    font-weight: 800;
                    font-size: 18px;
                    white-space: nowrap;
                }
                
                .fee-btn {
                    background: #eee;
                    padding: 8px 15px;
                    border-radius: 6px;
                    white-space: nowrap;
                    cursor: default; /* 게스트 모드에서는 커서 기본값 */
                    transition: background 0.2s;
                }
                
                .fee-btn:hover { background: #ddd; }
                
                .help-btn {
                    background: #fff3e0;
                    color: #f57c00;
                    border: 1px solid #ffe0b2;
                    padding: 8px 15px;
                    border-radius: 15px;
                    font-weight: bold;
                    cursor: pointer;
                    white-space: nowrap;
                }
                
                .help-btn:hover { background: #ffe0b2; }
                
                .ox {
                    font-weight: bold;
                    font-size: 18px;
                    padding: 8px;
                    display: inline-block;
                    min-width: 32px;
                    cursor: default; /* 게스트 모드에서는 클릭 불가 */
                }
                
                .ox.o { color: green; }
                .ox.x { color: red; }
                
                .total-members-info {
                    font-size: 14px;
                    color: #555;
                    font-weight: 700;
                    margin-bottom: 8px;
                    margin-left: 5px;
                }

                /* [추가] 안내 모달 전용 스타일 */
                .guide-legend {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    margin-bottom: 20px;
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 15px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 14px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .legend-o { background: #e8f5e9; border: 1px solid #c8e6c9; color: #2e7d32; }
                .legend-x { background: #ffebee; border: 1px solid #ffcdd2; color: #c62828; }
                
                .guide-desc-box {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 15px;
                    font-size: 13px;
                    color: #444;
                    margin-top: 15px;
                    text-align: left;
                }
                .guide-desc-box ul { margin: 0; padding-left: 20px; }
                .guide-desc-box li { margin-bottom: 5px; }

                /* 모바일 반응형 */
                @media (max-width: 768px) {
                    body { margin: 10px 3px; }
                    
                    .header-box {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                        margin-bottom: 15px;
                        align-items: stretch;
                    }
                    
                    /* 제목을 맨 위에 중앙정렬 */
                    .header-box > div:nth-child(2) {
                        order: 1;
                        display: flex;
                        justify-content: center;
                    }
                    
                    /* 연도 선택을 두 번째로 */
                    .header-box > div:nth-child(1) {
                        order: 2;
                        display: flex;
                        justify-content: flex-start;
                    }
                    
                    /* 보는법, 월회비를 세 번째로 */
                    .header-box > div:nth-child(3) {
                        order: 3;
                        display: flex;
                        justify-content: flex-end;
                        gap: 8px;
                    }
                    
                    .admin-info {
                        text-align: right;
                        font-size: 12px;
                        margin-bottom: 20px;
                    }
                    
                    .help-btn {
                        padding: 6px 10px;
                        font-size: 12px;
                        border-radius: 12px;
                    }
                    
                    .title-btn {
                        font-size: 16px;
                        padding: 10px 20px;
                        text-align: center;
                        width: 100%;
                    }
                    
                    .fee-btn {
                        font-size: 11px;
                        padding: 6px 10px;
                        white-space: nowrap;
                    }
                    
                    /* 모달창 모바일 크기 조정 */
                    .modal-content-custom {
                        width: 95%;
                        max-width: 350px;
                        padding: 20px;
                        max-height: 90vh;
                        overflow-y: auto;
                    }
                    
                    .modal-content-custom h5 {
                        font-size: 16px;
                    }
                    
                    /* [추가] 모바일 안내 모달 내 폰트 조정 */
                    .legend-item { padding: 8px 12px; font-size: 13px; }
                    .guide-desc-box { font-size: 12px; padding: 12px; }
                }
            `}</style>

            <div className="admin-info">
                <span className="badge bg-dark">전용 열람 모드</span>
                👤 <strong>{(session?.user as any)?.name || '회원'}</strong> (데이터 조회 가능)
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
                <div className="table-responsive">
                    <table className="table table-bordered text-center align-middle list-table mode-guest">
                        <thead>
                            <tr>
                                <th rowSpan={2}>이름</th>
                                <th colSpan={6} className="month-group">상반기</th>
                                <th colSpan={6} className="month-group second-half">하반기</th>
                                <th rowSpan={2}>입금합계</th>
                                <th rowSpan={2}>미납금</th>
                            </tr>
                            <tr>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                    <th key={m} className={`month-col month-${m}`}>{m}월</th>
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
            )}

            <div className="d-flex justify-content-center mt-3 mb-4">
                <button className="btn btn-secondary btn-lg" onClick={() => router.push('/guest')}>⏪ 돌아가기</button>
            </div>

            {/* ======================================================== */}
            {/* 안내 모달: 예시와 스타일이 강화됨 */}
            {/* ======================================================== */}
            {showGuideModal && (
                <div className="modal-overlay" onClick={() => setShowGuideModal(false)}>
                    <div className="modal-content-custom" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
                        <h5 style={{ fontWeight: 800, textAlign: 'center', marginBottom: '20px', color: '#1976d2' }}>
                            📋 현황표 보는법
                        </h5>
                        
                        {/* 1. 범례 (O/X) */}
                        <div className="guide-legend">
                            <div className="legend-item legend-o">
                                <span style={{ fontSize: '18px' }}>O</span> 납부 완료
                            </div>
                            <div className="legend-item legend-x">
                                <span style={{ fontSize: '18px' }}>X</span> 미납
                            </div>
                        </div>

                        {/* 2. 예시 테이블 */}
                        <div style={{ marginBottom: '20px' }}>
                            <h6 style={{ fontSize: '14px', fontWeight: 'bold', color: '#555', marginBottom: '8px' }}>👇 표 예시</h6>
                            <table className="table table-bordered table-sm text-center mb-0" style={{ fontSize: '13px' }}>
                                <thead className="table-light">
                                    <tr>
                                        <th>이름</th>
                                        <th>1월</th>
                                        <th>2월</th>
                                        <th>...</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>홍길동</td>
                                        <td style={{ color: 'green', fontWeight: 'bold' }}>O</td>
                                        <td style={{ color: 'red', fontWeight: 'bold' }}>X</td>
                                        <td style={{ color: '#999' }}>...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 3. 상세 설명 */}
                        <div className="guide-desc-box">
                            <ul>
                                <li>
                                    <strong>입금합계</strong> : {year}년도에 납부한 총 금액
                                </li>
                                <li style={{ marginTop: '5px' }}>
                                    <strong>미납금</strong> : 오늘({todayMonth}월)까지 안 낸 금액<br/>
                                    <span style={{ fontSize: '11px', color: '#d63384' }}>* 미래의 회비는 미납금에 포함되지 않습니다.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="text-center mt-4">
                            <button className="btn btn-dark w-100" onClick={() => setShowGuideModal(false)}>확인 및 닫기</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 모달 오버레이 */}
            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.6);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                
                .modal-content-custom {
                    background: white;
                    padding: 25px;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 400px;
                }
            `}</style>
        </div>
    );
}
