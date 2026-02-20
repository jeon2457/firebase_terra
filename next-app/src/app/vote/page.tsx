"use client";

import { useSession } from "next-auth/react";
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

export default function VotePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedPlace, setSelectedPlace] = useState<string>("");
    const [totalMembers, setTotalMembers] = useState(0);
    const [majorityLimit, setMajorityLimit] = useState(0);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchPolls();
            checkVotedStatus();
        }
    }, [status, router]);

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
            console.error('투표 데이터 조회 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkVotedStatus = () => {
        // 로컬 스토리지에서 투표 여부 확인
        const voted = localStorage.getItem('voted_2026_picnic');
        if (voted) {
            setHasVoted(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDate || !selectedPlace) {
            alert('모든 문항에投票해주세요.');
            return;
        }

        setSubmitting(true);

        try {
            const memberId = session?.user?.email || 'anonymous';
            
            const response = await fetch('/api/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dateOptionId: selectedDate,
                    placeOptionId: selectedPlace,
                    memberId
                })
            });

            const result = await response.json();

            if (result.success) {
                // 로컬 스토리지에 투표 여부 저장
                localStorage.setItem('voted_2026_picnic', 'true');
                setHasVoted(true);
                alert('투표가 완료되었습니다!');
                router.push('/vote/results');
            } else {
                alert(result.error || '투표에 실패했습니다.');
            }
        } catch (error) {
            console.error('투표 제출 오류:', error);
            alert('투표에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (hasVoted) {
        return (
            <>
                <style jsx>{`
                    .vote-container {
                        max-width: 800px;
                        margin: 50px auto;
                        padding: 20px;
                    }
                    .vote-card {
                        border: none;
                        border-radius: 15px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                        background: white;
                        margin-bottom: 20px;
                    }
                    .vote-header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border-radius: 15px 15px 0 0;
                        padding: 40px;
                        text-align: center;
                    }
                `}</style>

                <div className="vote-container">
                    <div className="vote-card">
                        <div className="vote-header">
                            <h2>📊 투표하기 / 설문조사</h2>
                            <p className="mb-0">회원 여러분의 소중한 의견을 들려주세요</p>
                        </div>
                        <div className="card-body text-center py-5">
                            <div className="alert alert-info">
                                <h4>이미 투표에 참여하셨습니다!</h4>
                                <p className="mb-0">중복 투표는 불가능합니다.</p>
                            </div>
                            <div className="mt-4">
                                <button
                                    className="btn btn-primary btn-lg me-2"
                                    onClick={() => router.push('/vote/results')}
                                >
                                    📊 결과 보기
                                </button>
                                <button
                                    className="btn btn-secondary btn-lg"
                                    onClick={() => router.push('/activities')}
                                >
                                    ⏪ 돌아가기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style jsx>{`
                .vote-container {
                    max-width: 800px;
                    margin: 50px auto;
                    padding: 20px;
                }
                .vote-card {
                    border: none;
                    border-radius: 15px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    background: white;
                    margin-bottom: 20px;
                }
                .vote-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 15px 15px 0 0;
                    padding: 40px;
                    text-align: center;
                }
                .form-check-input:checked {
                    background-color: #764ba2;
                    border-color: #764ba2;
                }
                .form-check-label {
                    cursor: pointer;
                    font-size: 1.1rem;
                    width: 100%;
                    display: block;
                }
                .form-check {
                    padding: 15px;
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    margin-bottom: 10px;
                    transition: all 0.2s;
                }
                .form-check:hover {
                    background-color: #f1f3f5;
                    border-color: #764ba2;
                }
            `}</style>

            <div className="vote-container">
                <form onSubmit={handleSubmit}>
                    <div className="vote-card">
                        <div className="vote-header">
                            <h2>📅 2026년 야유회 의견 조사</h2>
                            <p className="mb-0">회원 여러분의 소중한 의견을 들려주세요.</p>
                        </div>
                    </div>

                    {/* 질문 1: 날짜 */}
                    {polls.length > 0 && (
                        <div className="vote-card p-4">
                            <h4 className="mb-4 text-primary fw-bold">{polls[0].title}</h4>
                            {polls[0].options.map((option) => (
                                <div className="form-check" key={option._id}>
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="dateOption"
                                        id={`date-${option._id}`}
                                        value={option._id}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        required
                                    />
                                    <label className="form-check-label" htmlFor={`date-${option._id}`}>
                                        {option.optionText}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 질문 2: 장소 */}
                    {polls.length > 1 && (
                        <div className="vote-card p-4">
                            <h4 className="mb-4 text-success fw-bold">{polls[1].title}</h4>
                            {polls[1].options.map((option) => (
                                <div className="form-check" key={option._id}>
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="placeOption"
                                        id={`place-${option._id}`}
                                        value={option._id}
                                        onChange={(e) => setSelectedPlace(e.target.value)}
                                        required
                                    />
                                    <label className="form-check-label" htmlFor={`place-${option._id}`}>
                                        {option.optionText}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 제출 버튼 */}
                    <div className="d-grid gap-2">
                        <button 
                            type="submit" 
                            className="btn btn-primary btn-lg py-3 rounded-pill shadow"
                            disabled={submitting}
                        >
                            {submitting ? '투표 중...' : '투표 완료하기 ✨'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm mt-2"
                            onClick={() => router.push('/vote/results')}
                        >
                            결과만 보기
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
