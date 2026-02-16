"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function VotePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return <div className="text-center mt-5">Loading...</div>;
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
                .vote-body {
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
                    <div className="vote-body">
                        <p className="lead">이 기능은 아직 개발 중입니다.</p>
                        <p className="text-muted">
                            MongoDB 기반 투표 시스템을 구현 예정입니다.
                        </p>
                        <button
                            className="btn btn-secondary btn-lg mt-4"
                            onClick={() => router.push('/activities')}
                        >
                            ⏪ 돌아가기
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}