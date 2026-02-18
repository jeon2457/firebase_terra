"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { UserPlus, Edit, Users, LogOut, ArrowLeft } from "lucide-react";

export default function MembersSelectPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [selectedPage, setSelectedPage] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const handleGoNext = () => {
        if (!selectedPage) {
            alert("이동할 페이지를 선택해주세요.");
            return;
        }
        router.push(selectedPage);
    };

    if (status === "loading") {
        return <div className="text-center mt-5">Loading...</div>;
    }

    const menuItems = [
        {
            id: "opt_input",
            title: "회원 등록",
            desc: "신규 회원을 등록합니다.",
            path: "/members/input",
            icon: <UserPlus size={24} />,
            color: "border-primary"
        },
        {
            id: "opt_edit",
            title: "회원 편집",
            desc: "기존 회원 정보를 검색하고 수정합니다.",
            path: "/members/edit",
            icon: <Edit size={24} />,
            color: "border-warning"
        },
        {
            id: "opt_view",
            title: "회원 연락망 열람",
            desc: "회원 정보를 열람합니다.",
            path: "/members/view",
            icon: <Users size={24} />,
            color: "border-success"
        }
    ];

    const userLevel = (session?.user as any)?.user_level || 0;

    const filteredMenuItems = userLevel >= 5
        ? menuItems
        : menuItems.filter(item => item.id === "opt_view");

    return (
        <div className="container py-5" style={{ maxWidth: "650px" }}>
            <style jsx>{`
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
          background: white;
        }
        .select-card:hover {
          border-color: #007bff;
          box-shadow: 0 6px 16px rgba(13, 110, 253, 0.1);
          transform: translateY(-3px);
        }
        .select-card.active {
          border-color: #007bff;
          box-shadow: 0 8px 20px rgba(13, 110, 253, 0.15);
          background-color: #f8f9ff;
        }
        .btn-area {
          margin-top: 30px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }
      `}</style>

            <div className="p-4 bg-white rounded-4 shadow-sm">
                <h2 className="section-title">회원관리 선택</h2>
                <div className="admin-info">
                    👤 관리자: <strong>{(session?.user as any)?.name || "User"}</strong> (Level {(session?.user as any)?.user_level})
                </div>

                <div className="d-flex flex-column gap-3">
                    {filteredMenuItems.map((item) => (
                        <div
                            key={item.id}
                            className={`select-card ${selectedPage === item.path ? 'active' : ''}`}
                            onClick={() => setSelectedPage(item.path)}
                        >
                            <div className={`p-2 rounded-circle bg-light ${selectedPage === item.path ? 'text-primary' : 'text-secondary'}`}>
                                {item.icon}
                            </div>
                            <div>
                                <h5 className="mb-1 fw-bold">{item.title}</h5>
                                <p className="mb-0 text-secondary small">{item.desc}</p>
                            </div>
                            <div className="ms-auto">
                                <input
                                    type="radio"
                                    name="pageSelect"
                                    checked={selectedPage === item.path}
                                    onChange={() => setSelectedPage(item.path)}
                                    style={{ width: "20px", height: "20px" }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="btn-area">
                    <button type="button" className="btn btn-primary px-4 py-2 fw-bold" onClick={handleGoNext}>
                        선택한 페이지로 이동
                    </button>
                    <button type="button" className="btn btn-outline-danger px-4 py-2" onClick={() => signOut()}>
                        <LogOut size={18} className="me-1" /> 로그아웃
                    </button>
                </div>

                <div className="d-flex justify-content-center mt-4">
                    <Link href="/dashboard" className="btn btn-secondary w-100 py-2 d-flex align-items-center justify-content-center" style={{ maxWidth: "300px" }}>
                        <ArrowLeft size={16} className="me-2" /> 전체 관리시스템으로 되돌아가기
                    </Link>
                </div>
            </div>
        </div>
    );
}
