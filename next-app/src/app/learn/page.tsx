"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BookOpen, TrendingUp, Vote, Database, ArrowLeft, Layout } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function LearnPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") {
        return <div className="text-center mt-5">Loading...</div>;
    }

    if (!session) {
        router.push("/login");
        return null;
    }

    const menuItems = [
        {
            title: "대한민국 통일후 주식시장 유망주",
            description: "남북 통일 후 유망한 건설주 및 인프라 관련주를 분석합니다.",
            icon: <TrendingUp size={40} />,
            color: "bg-danger",
            path: "/learn/stocks"
        },
        {
            title: "투표 시스템 구현 전개코드",
            description: "Next.js로 구현한 투표 시스템의 데이터 흐름과 구현 코드를 설명합니다.",
            icon: <Vote size={40} />,
            color: "bg-success",
            path: "/learn/voting"
        },
        {
            title: "Vercel Next.js + MongoDB 연동",
            description: "Vercel에 배포하고 GitHub와 MongoDB를 연동하는 전체流程을 다룹니다.",
            icon: <Database size={40} />,
            color: "bg-primary",
            path: "/learn/vercel-mongodb"
        }
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#f0f2f5", padding: "30px 0" }}>
            <style>{`
                .learn-container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 0 15px;
                }
                .learn-header {
                    text-align: center;
                    margin-bottom: 40px;
                }
                .learn-title {
                    color: #2c3e50;
                    font-weight: 800;
                    font-size: 2rem;
                    margin-bottom: 10px;
                }
                .learn-subtitle {
                    color: #6c757d;
                    font-size: 1.1rem;
                }
                .learn-card {
                    background: white;
                    border-radius: 16px;
                    padding: 25px;
                    margin-bottom: 20px;
                    cursor: pointer;
                    border: 2px solid transparent;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .learn-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                    border-color: rgba(0,123,255,0.3);
                }
                .learn-icon {
                    width: 80px;
                    height: 80px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                }
                .learn-icon.bg-danger {
                    background: linear-gradient(135deg, #e74c3c, #c0392b);
                }
                .learn-icon.bg-success {
                    background: linear-gradient(135deg, #27ae60, #1e8449);
                }
                .learn-icon.bg-primary {
                    background: linear-gradient(135deg, #3498db, #2980b9);
                }
                .learn-content {
                    flex: 1;
                }
                .learn-card-title {
                    font-weight: 800;
                    font-size: 1.2rem;
                    color: #2c3e50;
                    margin-bottom: 8px;
                }
                .learn-card-desc {
                    color: #6c757d;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }
                .back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: white;
                    border: 2px solid #dee2e6;
                    border-radius: 30px;
                    color: #6c757d;
                    font-weight: 600;
                    text-decoration: none;
                    margin-bottom: 30px;
                    transition: all 0.3s;
                }
                .back-btn:hover {
                    background: #f8f9fa;
                    border-color: #adb5bd;
                    color: #495057;
                }
                @media (max-width: 576px) {
                    .learn-card {
                        flex-direction: column;
                        text-align: center;
                    }
                    .learn-icon {
                        margin: 0 auto;
                    }
                }
            `}</style>

            <div className="learn-container">
                <a href="/dashboard" className="back-btn">
                    <ArrowLeft size={18} /> 대시보드로 돌아가기
                </a>

                <div className="learn-header">
                    <h1 className="learn-title">
                        <BookOpen className="me-3" size={40} />
                        학습하기
                    </h1>
                    <p className="learn-subtitle">다양한 주제의 학습 자료를 확인하세요</p>
                </div>

                <div className="learn-menu">
                    {menuItems.map((item, idx) => (
                        <div
                            key={idx}
                            className="learn-card"
                            onClick={() => router.push(item.path)}
                        >
                            <div className={`learn-icon ${item.color}`}>
                                {item.icon}
                            </div>
                            <div className="learn-content">
                                <div className="learn-card-title">{item.title}</div>
                                <div className="learn-card-desc">{item.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
