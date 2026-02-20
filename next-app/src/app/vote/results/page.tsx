"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

interface PollOption {
    _id: string;
    optionText: string;
    votes: number;
}

interface Poll {
    id: number;
    title: string;
    endDate: string;
    totalVotes: number;
    options: PollOption[];
}

export default function VoteResultsPage() {
    const router = useRouter();

    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalMembers, setTotalMembers] = useState(0);
    const [majorityLimit, setMajorityLimit] = useState(0);

    useEffect(() => {
        fetchPolls();
    }, []);

    const fetchPolls = async () => {
        try {
            const response = await fetch('/api/vote');
            const result = await response.json();
            if (result.success) {
                setPolls(result.data.polls);
                setTotalMembers(result.data.totalMembers);
                setMajorityLimit(result.data.majorityLimit);
            }
        } catch (error) {
            console.error('투표 결과 조회 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    // 투표수 계산 (가장 높은 투표수)
    const getMaxVotes = (options: PollOption[]) => {
        return Math.max(...options.map(opt => opt.votes));
    };

    // 퍼센트 계산
    const getPercent = (votes: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((votes / total) * 100);
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <style jsx>{`
                .result-container {
                    max-width: 800px;
                    margin: 50px auto;
                    padding: 20px;
                }
                .result-card {
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    padding: 30px;
                    margin-bottom: 30px;
                }
                .progress {
                    height: 25px;
                    border-radius: 12px;
                    background-color: #e9ecef;
                    margin-top: 5px;
                }
                .progress-bar {
                    line-height: 25px;
                    font-weight: bold;
                    font-size: 0.9rem;
                }
                .member-count-box {
                    font-size: 1.1rem;
                    color: #495057;
                    background-color: #fff;
                    padding: 10px 20px;
                    border-radius: 50px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                    display: inline-block;
                }
            `}</style>

            <div className="result-container">
                <h2 className="text-center mb-4 fw-bold text-dark">📊 투표 결과 현황</h2>

                {/* 전체 회원수 표시 */}
                <div className="d-flex justify-content-end mb-4">
                    <div className="member-count-box">
                        <span className="fw-bold">전체 회원수:</span>
                        <span className="text-primary fw-bold ms-1">{totalMembers}명</span>
                    </div>
                </div>

                {polls.map((poll, pollIndex) => {
                    const maxVotes = getMaxVotes(poll.options);
                    const pollColor = pollIndex === 0 ? 'bg-primary' : 'bg-success';
                    
                    // 투표수 기준 정렬
                    const sortedOptions = [...poll.options].sort((a, b) => b.votes - a.votes);

                    return (
                        <div className="result-card" key={poll.id}>
                            <h4 className="border-bottom pb-2 mb-4 d-flex justify-content-between">
                                <span>{poll.title}</span>
                                <div className="d-flex align-items-center gap-2">
                                    {poll.totalVotes > majorityLimit && (
                                        <span className="badge bg-danger">과반수 달성!</span>
                                    )}
                                    <span className="badge bg-secondary fs-6">총 {poll.totalVotes}표</span>
                                </div>
                            </h4>

                            {sortedOptions.map((option) => {
                                const percent = getPercent(option.votes, poll.totalVotes);
                                const isWinner = option.votes === maxVotes && poll.totalVotes > 0;

                                return (
                                    <div className="mb-4" key={option._id}>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className={`fw-bold ${isWinner ? 'text-success' : ''}`}>
                                                {isWinner && '🏆 '}
                                                {option.optionText}
                                            </span>
                                            <span>
                                                {option.votes}표 ({percent}%)
                                            </span>
                                        </div>
                                        <div className="progress shadow-sm">
                                            <div 
                                                className={`progress-bar ${pollColor} ${pollIndex === 0 ? 'progress-bar-striped progress-bar-animated' : ''}`}
                                                role="progressbar" 
                                                style={{ width: `${percent}%` }}
                                                aria-valuenow={percent} 
                                                aria-valuemin={0} 
                                                aria-valuemax={100}
                                            >
                                                {percent > 5 ? `${percent}%` : ''}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}

                {polls.length === 0 && (
                    <div className="alert alert-warning text-center">진행 중인 투표가 없습니다.</div>
                )}

                <div className="text-center mt-4">
                    <button 
                        className="btn btn-dark px-4 py-2" 
                        onClick={() => router.push('/vote')}
                    >
                        ⬅️ 투표 화면으로 돌아가기
                    </button>
                </div>
            </div>
        </>
    );
}
