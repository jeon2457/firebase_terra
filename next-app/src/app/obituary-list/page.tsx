"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

interface ObituaryData {
    _id: string;
    intro: string;
    deceasedName: string;
    age: string;
    deathDate: string;
    deathTime: string;
    funeralHome: string;
    funeralAddress: string;
    departureTime: string;
    cemetery: string;
    mourners: string;
    bankInfo: string;
    message: string;
    createdAt: string;
}

export default function ObituaryListPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [obituaries, setObituaries] = useState<ObituaryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchObituaries();
        }
    }, [status, router]);

    const fetchObituaries = async () => {
        try {
            const response = await fetch('/api/obituary');
            const result = await response.json();
            
            if (result.success) {
                setObituaries(result.data);
            } else {
                setError(result.error || '부고장 목록을 불러오는데 실패했습니다.');
            }
        } catch (err) {
            setError('부고장 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const goToObituary = (id: string) => {
        router.push(`/obituary-view?id=${id}`);
    };

    if (status === "loading") {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <>
            <style jsx global>{`
                body {
                    background: linear-gradient(135deg, #434343 0%, #000000 100%);
                    min-height: 100vh;
                    padding: 20px 10px;
                    font-family: 'Nanum Myeongjo', serif;
                }

                .container {
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .page-header {
                    text-align: center;
                    color: white;
                    margin-bottom: 30px;
                }

                .page-header h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin: 0;
                    letter-spacing: 5px;
                }

                .obituary-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .obituary-card {
                    border: 2px solid #333;
                    border-radius: 8px;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
                    background: #fefefe;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    overflow: hidden;
                }

                .obituary-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
                    border-color: #667eea;
                }

                .card-header {
                    background: #1a1a1a;
                    color: white;
                    padding: 20px 15px;
                    text-align: center;
                    border-bottom: 2px solid #333;
                }

                .card-header h3 {
                    font-size: 1.3rem;
                    font-weight: 700;
                    margin: 0;
                    letter-spacing: 2px;
                }

                .card-body {
                    padding: 20px 15px;
                    line-height: 1.6;
                }

                .deceased-name {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin-bottom: 10px;
                    text-align: center;
                }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 8px 0;
                    font-size: 0.9rem;
                    color: #666;
                }

                .date-info {
                    font-size: 0.85rem;
                    color: #888;
                    text-align: center;
                    margin-top: 10px;
                }

                .btn-back {
                    display: block;
                    width: 100%;
                    max-width: 300px;
                    margin: 0 auto;
                    padding: 15px 30px;
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    text-align: center;
                }

                .btn-back:hover {
                    background: #5a67d8;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
                }

                @media (max-width: 768px) {
                    .obituary-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .page-header h1 {
                        font-size: 2rem;
                    }
                }
            `}</style>

            <div className="container">
                <div className="page-header">
                    <h1>부고장 목록</h1>
                </div>

                {loading ? (
                    <div className="text-center mt-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                ) : obituaries.length === 0 ? (
                    <div className="text-center mt-5" style={{ color: 'white' }}>
                        <h3>생성된 부고장이 없습니다.</h3>
                        <button 
                            className="btn-back mt-4"
                            onClick={() => router.push('/obituary-create')}
                        >
                            부고장 생성하기
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="obituary-grid">
                            {obituaries.map((obituary) => (
                                <div 
                                    key={obituary._id}
                                    className="obituary-card"
                                    onClick={() => goToObituary(obituary._id)}
                                >
                                    <div className="card-header">
                                        <h3>訃 告</h3>
                                    </div>
                                    <div className="card-body">
                                        <div className="deceased-name">
                                            故 {obituary.deceasedName}
                                        </div>
                                        <div className="info-row">
                                            <span>향년: {obituary.age}세</span>
                                            <span>별세: {obituary.deathDate}</span>
                                        </div>
                                        {obituary.deathTime && (
                                            <div className="info-row">
                                                <span>시간: {obituary.deathTime}</span>
                                            </div>
                                        )}
                                        <div className="date-info">
                                            생성일: {formatDate(obituary.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button 
                            className="btn-back"
                            onClick={() => router.push('/invitation')}
                        >
                            ⏪ 돌아가기
                        </button>
                    </>
                )}
            </div>
        </>
    );
}
