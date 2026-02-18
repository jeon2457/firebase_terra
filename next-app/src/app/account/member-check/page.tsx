"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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

export default function MemberCheckPage({ searchParams }: { searchParams?: { members?: string; year?: string } }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    
    const [members, setMembers] = useState<Member[]>([]);
    const [passMap, setPassMap] = useState<PassMap>({});
    const [monthlyFees, setMonthlyFees] = useState<{ [month: number]: number }>({});
    const [loading, setLoading] = useState(true);
    
    const memberIds = searchParams?.members || '';
    const year = searchParams?.year ? parseInt(searchParams.year) : new Date().getFullYear();
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
        if (!memberIds) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const res = await axios.get(`/api/account/member-check?members=${encodeURIComponent(memberIds)}&year=${year}`);
            
            if (res.data.success) {
                setMembers(res.data.members);
                setPassMap(res.data.passMap);
                setMonthlyFees(res.data.monthlyFees);
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

    const downloadExcel = async () => {
        try {
            const res = await axios.post('/api/account/member-check/export', {
                members,
                year,
                passMap,
                monthlyFees
            });

            if (res.data.success) {
                // 다운로드 링크가 있으면 다운로드
                if (res.data.downloadUrl) {
                    window.open(res.data.downloadUrl, '_blank');
                } else {
                    alert('엑셀 파일 생성에 실패했습니다.');
                }
            }
        } catch (error) {
            alert('엑셀 다운로드에 실패했습니다.');
        }
    };

    if (status === "loading" || loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <div className="container-fluid py-4" style={{ background: "#f4f6f9", minHeight: "100vh" }}>
            <style jsx>{`
                body { 
                    background: #f4f6f9; 
                    padding: 15px 10px; 
                    font-family: 'Noto Sans KR', sans-serif; 
                }
                
                h4 { 
                    font-size: 1.3rem; 
                }
                
                .month-card {
                    border-radius: 12px;
                    padding: 12px;
                    color: #fff;
                    min-height: 100px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                
                .paid {
                    background: linear-gradient(135deg, #2e7d32 0%, #43a047 100%);
                    box-shadow: 0 3px 8px rgba(46, 125, 50, 0.2);
                }
                
                .unpaid {
                    background: linear-gradient(135deg, #c62828 0%, #e53935 100%);
                    box-shadow: 0 3px 8px rgba(198, 40, 40, 0.2);
                }
                
                .member-card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    border: 1px solid #e0e0e0;
                }
                
                .member-name {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #2c3e50;
                    margin-bottom: 20px;
                    text-align: center;
                }
                
                .months-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 10px;
                    margin-bottom: 20px;
                }
                
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    margin-bottom: 15px;
                }
                
                .summary-label {
                    font-weight: 600;
                    color: #495057;
                }
                
                .summary-value {
                    font-weight: 700;
                    color: #2c3e50;
                }
                
                .btn-download {
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    border: none;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .btn-download:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(40, 167, 69, 0.3);
                }
                
                @media (max-width: 768px) {
                    .months-grid {
                        grid-template-columns: repeat(3, 1fr);
                        gap: 8px;
                    }
                    
                    .member-card {
                        padding: 15px;
                        margin-bottom: 15px;
                    }
                }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0">회원 납부 상세 확인</h3>
                <div>
                    <span className="badge bg-primary">{year}년도</span>
                    <button className="btn btn-secondary btn-sm ms-2" onClick={() => router.back()}>
                        뒤로 가기
                    </button>
                </div>
            </div>

            {members.length === 0 ? (
                <div className="alert alert-warning text-center">
                    선택된 회원이 없습니다.
                </div>
            ) : (
                <>
                    {members.map(member => {
                        const { totalPaid, unpaidTotal } = calculateTotals(member._id);
                        return (
                            <div key={member._id} className="member-card">
                                <div className="member-name">{member.name}</div>
                                
                                <div className="months-grid">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => {
                                        const paid = passMap[member._id]?.[month] || 0;
                                        const monthFee = monthlyFees[month] || 20000;
                                        const isCurrentYear = year === todayYear;
                                        const isPastMonth = year < todayYear || (isCurrentYear && month <= todayMonth);
                                        
                                        return (
                                            <div key={month} className={`month-card ${paid ? 'paid' : (isPastMonth ? 'unpaid' : '')}`}>
                                                <div className="text-center">
                                                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                                                        {month}월
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                                                        {paid ? '납부완료' : (isPastMonth ? `미납 ${monthFee.toLocaleString()}원` : '해당없음')}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                <div className="summary-row">
                                    <div>
                                        <span className="summary-label">입금합계:</span>
                                        <span className="summary-value ms-2">{totalPaid.toLocaleString()}원</span>
                                    </div>
                                    <div>
                                        <span className="summary-label">미납금:</span>
                                        <span className="summary-value ms-2">{unpaidTotal.toLocaleString()}원</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    <div className="text-center mt-4">
                        <button className="btn-download" onClick={downloadExcel}>
                            📊 엑셀 다운로드
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
