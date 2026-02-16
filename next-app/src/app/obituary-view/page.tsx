"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

interface ObituaryData {
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

export default function ObituaryViewPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [obituary, setObituary] = useState<ObituaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (id) {
            fetchObituary();
        } else {
            setError('부고장 ID가 없습니다.');
            setLoading(false);
        }
    }, [id]);

    const fetchObituary = async () => {
        try {
            const response = await fetch(`/api/obituary?id=${id}`);
            const result = await response.json();
            
            if (result.success) {
                setObituary(result.data);
            } else {
                setError(result.error || '부고장을 불러오는데 실패했습니다.');
            }
        } catch (err) {
            setError('부고장을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (!obituary) return;

        const text = `
${obituary.intro}

■ 고인 정보
故人 성함: ${obituary.deceasedName}
향년: ${obituary.age}세
별세일: ${obituary.deathDate}
${obituary.deathTime ? `별세시간: ${obituary.deathTime}` : ''}

■ 빈소 정보
빈소 위치: ${obituary.funeralHome}
${obituary.funeralAddress ? `빈소 주소: ${obituary.funeralAddress}` : ''}
발인일시: ${obituary.departureTime}
장지: ${obituary.cemetery}

■ 상주 정보
${obituary.mourners}

${obituary.bankInfo ? `■ 마음 전하실 곳\n${obituary.bankInfo}` : ''}

${obituary.message}
        `.trim();

        try {
            await navigator.clipboard.writeText(text);
            alert('부고장이 복사되었습니다. 카카오톡/문자에 붙여넣기 하세요.');
        } catch {
            alert('복사되었습니다.');
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

    if (error || !obituary) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    {error || '부고장을 찾을 수 없습니다.'}
                </div>
                <button 
                    className="btn btn-secondary" 
                    onClick={() => router.push('/invitation')}
                >
                    돌아가기
                </button>
            </div>
        );
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
                    max-width: 800px;
                    margin: 0 auto;
                }

                .card {
                    border: 3px solid #333;
                    border-radius: 0;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                    background: #fefefe;
                }

                .card-header {
                    background: #1a1a1a;
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                    border-bottom: 3px solid #333;
                }

                .card-header h1 {
                    font-size: 2rem;
                    font-weight: 700;
                    margin: 0;
                    letter-spacing: 3px;
                }

                .card-body {
                    padding: 40px 30px;
                    background: white;
                    line-height: 1.8;
                    white-space: pre-wrap;
                }

                .section-title {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin: 30px 0 20px 0;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #333;
                }

                .btn-custom {
                    display: block;
                    width: 100%;
                    padding: 18px;
                    background: #1a1a1a;
                    color: white;
                    border: none;
                    font-size: 1.2rem;
                    font-weight: 700;
                    letter-spacing: 2px;
                    margin-top: 15px;
                    transition: all 0.3s;
                    text-align: center;
                    text-decoration: none;
                    border-radius: 0;
                    cursor: pointer;
                }

                .btn-custom:hover {
                    background: #333;
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                }

                .btn-back {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px 30px;
                    background: rgba(255, 255, 255, 0.9);
                    color: #667eea;
                    border: 2px solid #667eea;
                    border-radius: 12px;
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 16px;
                    margin: 30px auto 0;
                    width: 100%;
                    max-width: 220px;
                }

                .btn-back:hover {
                    background: #667eea;
                    color: #fff;
                    transform: translateY(-2px);
                }

                .obituary-content {
                    font-size: 1.1rem;
                    line-height: 2;
                    color: #333;
                }

                .info-item {
                    margin: 10px 0;
                }

                .info-label {
                    font-weight: 700;
                    color: #1a1a1a;
                }
            `}</style>

            <div className="container">
                <div className="card">
                    <div className="card-header">
                        <h1>訃 告</h1>
                        <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', letterSpacing: '1px' }}>
                            부고장
                        </p>
                    </div>

                    <div className="card-body">
                        <div className="obituary-content">
                            <div style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.2rem' }}>
                                {obituary.intro}
                            </div>

                            <div className="section-title">■ 고인 정보</div>
                            <div className="info-item">
                                <span className="info-label">故人 성함:</span> {obituary.deceasedName}
                            </div>
                            <div className="info-item">
                                <span className="info-label">향년:</span> {obituary.age}세
                            </div>
                            <div className="info-item">
                                <span className="info-label">별세일:</span> {obituary.deathDate}
                            </div>
                            {obituary.deathTime && (
                                <div className="info-item">
                                    <span className="info-label">별세시간:</span> {obituary.deathTime}
                                </div>
                            )}

                            <div className="section-title">■ 빈소 정보</div>
                            <div className="info-item">
                                <span className="info-label">빈소 위치:</span> {obituary.funeralHome}
                            </div>
                            {obituary.funeralAddress && (
                                <div className="info-item">
                                    <span className="info-label">빈소 주소:</span> {obituary.funeralAddress}
                                </div>
                            )}
                            <div className="info-item">
                                <span className="info-label">발인일시:</span> {obituary.departureTime}
                            </div>
                            <div className="info-item">
                                <span className="info-label">장지:</span> {obituary.cemetery}
                            </div>

                            <div className="section-title">■ 상주 정보</div>
                            <div style={{ whiteSpace: 'pre-line' }}>
                                {obituary.mourners}
                            </div>

                            {obituary.bankInfo && (
                                <>
                                    <div className="section-title">■ 마음 전하실 곳</div>
                                    <div>{obituary.bankInfo}</div>
                                </>
                            )}

                            <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '1.1rem' }}>
                                {obituary.message}
                            </div>
                        </div>

                        <button 
                            type="button" 
                            className="btn-custom"
                            onClick={copyToClipboard}
                        >
                            📋 부고장 복사하기
                        </button>

                        <a 
                            href="https://open.kakao.com/o/gWWWIK5h" 
                            target="_blank" 
                            className="btn-custom"
                            style={{ backgroundColor: '#FEE500', color: '#3C1E1E' }}
                        >
                            🔗 카톡 공유방
                        </a>

                        <a href="/obituary-sms" className="btn-back">
                            ⏪ 돌아가기
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
