"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function ActivitiesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [selectedPage, setSelectedPage] = useState<string>("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const handleLogout = () => {
        signOut({ callbackUrl: "/login" });
    };

    const handleGoNext = () => {
        if (!selectedPage) {
            alert("이동할 페이지를 선택해주세요.");
            return;
        }

        // 외부 링크인 경우
        if (selectedPage.startsWith('http')) {
            window.open(selectedPage, '_blank');
        } else {
            router.push(selectedPage);
        }
    };

    const options = [
        {
            id: "opt_map",
            value: "/map/view",
            icon: "bi-map",
            title: "지도보기",
            description: "지정된 장소로 네비게이션이 안내합니다.",
            bgColor: "#fafbfc"
        },


        
        {
            id: "opt_message",
            value: "/invitation",
            icon: "bi-chat-dots",
            title: "경조사 문자메세지 보내기",
            description: "각종 경조사 관련된 문자를 보낼 수 있습니다.",
            bgColor: "#fafbfc"
        },
        {
            id: "opt_vote",
            value: "/vote",
            icon: "bi-box-seam",
            title: "투표하기/설문조사",
            description: "투표하기/설문조사로 의사결정",
            bgColor: "#fafbfc"
        },


        {
            id: "opt_kakao",
            value: "https://open.kakao.com/o/gWWWIK5h",
            icon: "bi-chat-dots",
            title: "카카오톡 공유",
            description: "카카오톡 오픈채팅 앱을 열수가 있습니다.",
            bgColor: "#FEE500"
        }
    ];

    if (status === "loading") {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <>
            <style jsx global>{`
                body {
                    background-color: #f4f6f9;
                    font-size: 16px;
                }

                .activities-container {
                    max-width: 650px;
                    margin: 50px auto;
                    padding: 35px;
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
                }

                .section-title {
                    text-align: center;
                    color: #007bff;
                    font-weight: 700;
                    margin-bottom: 30px;
                    padding: 10px;
                    background: #e9f3ff;
                    border-radius: 10px;
                    border: 1px solid #c9e3ff;
                }

                .admin-info {
                    text-align: right;
                    font-size: 15px;
                    color: #6c757d;
                    margin-bottom: 20px;
                    background: #f1f3f5;
                    padding: 10px;
                    border-radius: 8px;
                }

                .btn-logout-small {
                    padding: 3px 8px;
                    font-size: 11px;
                    border-radius: 6px;
                    border: 1px solid #ff4444;
                    background: rgba(255, 255, 255, 0.9);
                    color: #ff4444;
                    cursor: pointer;
                    font-weight: 700;
                    transition: all 0.2s;
                    white-space: nowrap;
                    margin-left: 10px;
                }

                .btn-logout-small:hover {
                    background: #ff4444;
                    color: white;
                    box-shadow: 0 4px 10px rgba(255, 68, 68, 0.2);
                }

                .option-box {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .select-card {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    border: 1px solid #dee2e6;
                    border-radius: 10px;
                    padding: 18px;
                    transition: all 0.2s ease-in-out;
                    cursor: pointer;
                }

                .select-card:hover {
                    border-color: #007bff;
                    box-shadow: 0 6px 16px rgba(13, 110, 253, 0.1);
                    transform: translateY(-3px);
                }

                .select-card.active {
                    border-color: #0d6efd;
                    box-shadow: 0 8px 20px rgba(13, 110, 253, 0.15);
                    background-color: #f1f5ff;
                }

                .select-card input[type="checkbox"] {
                    width: 22px;
                    height: 22px;
                    cursor: pointer;
                }

                .select-card h5 {
                    font-size: 18px;
                    margin-bottom: 4px;
                    margin-top: 0;
                }

                .select-card p {
                    margin: 0;
                    color: #6c757d;
                    font-size: 14px;
                }

                .icon-color {
                    color: #007bff;
                    font-size: 1.5rem;
                    margin-right: 8px;
                }

                .btn-area {
                    margin-top: 30px;
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .btn-same {
                    width: 100%;
                    max-width: 300px;
                    padding: 14px 0 !important;
                    font-size: 1.25rem !important;
                }

                .btn-back {
                    width: 100%;
                    max-width: 300px;
                    padding: 14px 0;
                    font-size: 1.25rem;
                    border-radius: 0.375rem;
                    display: inline-block;
                    text-align: center;
                    text-decoration: none;
                    background-color: #6c757d;
                    color: white;
                    border: 1px solid #6c757d;
                    margin-top: 0.5rem;
                    cursor: pointer;
                }

                .btn-back:hover {
                    background-color: #5c636a;
                    color: white;
                }

                @media (max-width: 480px) {
                    .activities-container {
                        padding: 25px;
                        margin: 20px;
                    }
                }
            `}</style>

            <div className="activities-container">
                <h2 className="section-title">일정관리 선택</h2>

                <div className="admin-info">
                    👤 관리자: <strong>{(session?.user as any)?.id}</strong> (Level {(session?.user as any)?.user_level})
                    <button onClick={handleLogout} className="btn-logout-small">
                        로그아웃
                    </button>
                </div>

                <div className="option-box">
                    {options.map((option, index) => (
                        <label
                            key={option.id}
                            className={`select-card ${selectedPage === option.value ? 'active' : ''}`}
                            style={{ backgroundColor: option.bgColor }}
                        >
                            <input
                                type="checkbox"
                                checked={selectedPage === option.value}
                                onChange={() => setSelectedPage(option.value)}
                            />
                            <div>
                                <h5>
                                    <i className={`${option.icon} icon-color`}></i>
                                    {option.title}
                                </h5>
                                <p>{option.description}</p>
                            </div>
                        </label>
                    ))}
                </div>

                <div className="btn-area text-center mt-5">
                    <button
                        type="button"
                        className="btn btn-primary btn-lg btn-same"
                        onClick={handleGoNext}
                    >
                        선택한 페이지로 이동
                    </button>
                    <button
                        className="btn-back"
                        onClick={() => router.push('/dashboard')}
                    >
                        ⏪ 돌아가기
                    </button>
                </div>
            </div>
        </>
    );
}