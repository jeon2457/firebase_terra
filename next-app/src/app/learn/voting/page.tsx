"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Vote } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function VotingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") {
        return <div className="text-center mt-5">Loading...</div>;
    }

    if (!session) {
        router.push("/login");
        return null;
    }

    return (
        <div style={{ minHeight: "100vh", background: "#f8f9fa", padding: "30px 0" }}>
            <style>{`
                .voting-container {
                    max-width: 100%;
                    margin: 20px auto;
                    background: #fff;
                    padding: 30px 20px;
                    borderRadius: 8px;
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }
                .voting-title {
                    color: #007bff;
                    textAlign: "center";
                    marginBottom: 20px;
                    fontSize: "clamp(1.4rem, 4vw, 2rem)",
                    fontWeight: "bold"
                }
                .voting-section {
                    marginTop: 20px
                }
                .voting-section h2 {
                    color: #28a745;
                    marginTop: 20px;
                    fontSize: "clamp(1.1rem, 3vw, 1.5rem)"
                }
                .voting-section h3 {
                    color: #6c757d;
                    marginTop: 10px;
                    fontSize: "clamp(0.9rem, 2.5vw, 1.2rem)"
                }
                .voting-section p {
                    lineHeight: "1.6",
                    marginBottom: 10px
                }
                .voting-section ul {
                    listStyle: "disc";
                    marginLeft: 20px;
                    marginBottom: 15px
                }
                .voting-section li {
                    marginBottom: 5px
                }
                .voting-code {
                    backgroundColor: "#e9ecef",
                    padding: 15px;
                    borderRadius: 5px;
                    overflowX: "auto",
                    whiteSpace: "pre-wrap",
                    fontFamily: "monospace",
                    fontSize: "clamp(0.75rem, 2vw, 0.9rem)",
                    marginTop: 10px
                }
                .voting-notice {
                    background: "#fff3cd",
                    border: "2px solid #ffc107",
                    borderRadius: 10px;
                    padding: 20px;
                    margin: 20px 0
                }
                .voting-notice strong {
                    color: #856404
                }
                .back-btn {
                    display: inline-flex;
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    background: "white",
                    border: "2px solid #dee2e6",
                    borderRadius: "30px",
                    color: "#6c757d",
                    fontWeight: "600",
                    textDecoration: "none",
                    marginBottom: "30px",
                    transition: "all 0.3s",
                    cursor: "pointer"
                }
                .back-btn:hover {
                    background: "#f8f9fa",
                    borderColor: "#adb5bd",
                    color: "#495057"
                }
                @media (max-width: 768px) {
                    .voting-container {
                        margin: 10px;
                        padding: 20px 15px
                    }
                    .voting-section ul {
                        marginLeft: 15px
                    }
                }
            `}</style>

            <div className="container">
                <button className="back-btn" onClick={() => router.push("/learn")}>
                    <ArrowLeft size={18} /> 학습하기로 돌아가기
                </button>
            </div>

            <div className="voting-container">
                <h1 className="voting-title">
                    <Vote className="me-2" />
                    투표 시스템 전개 코드 구현
                </h1>

                <h2>생성된 파일들</h2>
                <ul>
                    <li><code>/api/vote/route.ts</code> - 투표 API (데이터 처리)</li>
                    <li><code>/vote/page.tsx</code> - 투표하기 페이지</li>
                    <li><code>/vote/results/page.tsx</code> - 결과 보기 페이지</li>
                </ul>

                <div className="voting-notice">
                    <strong>[알림]</strong> 이 설문조사를 운영하려면 각 회원들 아이디/비밀번호가 있어야만 가능할 것입니다. 
                    왜냐하면, 투표는 중복으로 할 수가 없기 때문입니다.
                </div>

                <h2>데이터 흐름 (Data Flow)</h2>
                <div className="voting-code">
{`┌─────────────────────────────────────────────────────────────────┐
│                        MongoDB Database                          │
│  ┌─────────────┐  ┌────────────────┐  ┌───────────────────┐  │
│  │   polls     │  │ poll_options   │  │   poll_votes     │  │
│  │ (투표 주제)  │  │  (투표 옵션)    │  │   (투표 기록)     │  │
│  │ - id        │  │ - poll_id      │  │ - memberId       │  │
│  │ - title     │  │ - option_text  │  │ - dateOptionId   │  │
│  │ - endDate   │  │ - votes        │  │ - placeOptionId  │  │
│  └─────────────┘  └────────────────┘  │ - votedAt        │  │
│                                        └───────────────────┘  │
│                         + members 컬렉션 (전체 회원수 계산용)      │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ GET /api/vote
┌─────────────────────────────┴───────────────────────────────┐
│                     API Route (Next.js)                      │
│  GET: polls, poll_options 데이터 조회 + 자동 초기화           │
│  POST: 투표 저장 + 중복 투표 방지                              │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ fetch('/api/vote')
┌─────────────────────────────┴───────────────────────────────┐
│                    Pages (React)                             │
│                                                               │
│  /vote (투표하기)                                            │
│    ├── 사용자가 선택지 선택 후 제출                            │
│    ├── POST /api/vote 로 데이터 전송                          │
│    └── 중복 투표는 localStorage로 방지                        │
│                                                               │
│  /vote/results (결과 보기)                                    │
│    ├── GET /api/vote 로 데이터 조회                          │
│    └── 투표수, 퍼센트, 과반수 계산 후 표시                     │
└─────────────────────────────────────────────────────────────┘`}
                </div>

                <h2>주요 기능</h2>
                <ul>
                    <li><strong>투표 기간:</strong> 생성일로부터 10일</li>
                    <li><strong>투표 주제:</strong>
                        <ul>
                            <li>Q1. 언제가 가장 좋을까요? (2월, 3월, 4월)</li>
                            <li>Q2. 어디로 갈까요? (금오산, 팔공산, 황악산)</li>
                        </ul>
                    </li>
                    <li><strong>중복 투표 방지:</strong> localStorage + MongoDB 중복 확인</li>
                    <li><strong>과반수 계산:</strong> 전체 회원수의 과반수 달성 시 표시</li>
                    <li><strong>결과 정렬:</strong> 투표수가 높은 순으로 정렬</li>
                </ul>
            </div>
        </div>
    );
}
