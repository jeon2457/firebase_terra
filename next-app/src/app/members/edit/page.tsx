"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import axios from "axios";

export default function MemberEditListPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchMembers();
        }
        document.title = "회원 편집";
    }, [status, router]);

    const fetchMembers = async () => {
        try {
            const res = await axios.get("/api/members?includeSystem=1");
            if (res.data.success) {
                setMembers(res.data.data);
            }
        } catch (error) {
            console.error("Failed to load members", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        if (!selectedId) return alert("수정할 회원을 선택해주세요.");
        router.push(`/members/edit/${selectedId}`);
    };

    const handleDelete = async () => {
        if (!selectedId) return alert("삭제할 회원을 선택해주세요.");
        if (!confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

        try {
            const res = await axios.delete(`/api/members?id=${selectedId}`);
            if (res.data.success) {
                alert("삭제되었습니다.");
                fetchMembers();
                setSelectedId(null);
            }
        } catch (error: any) {
            alert("삭제 실패: " + (error.response?.data?.message || error.message));
        }
    };

    if (status === "loading" || loading) return <div className="text-center mt-5">Loading...</div>;

    return (
        <div className="container mt-4 mb-5" style={{ maxWidth: "900px" }}>
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
        /* 반응형 스타일 */
        @media (max-width: 768px) {
          .hide-mobile {
            display: none !important;
          }
          .remark-col {
            width: 80px !important;
            min-width: 80px;
          }
          /* 모바일에서 테이블 폰트 크기 조정 */
          .table {
            font-size: 0.85rem;
          }
          .table th, .table td {
            padding: 0.4rem 0.2rem !important;
            vertical-align: middle;
          }
        }
        /* PC용 열 너비 */
        @media (min-width: 769px) {
          .remark-col {
            width: 100px;
            min-width: 80px;
          }
        }
      `}</style>

            <h3 className="section-title mb-4">📋 회원편집 / 삭제</h3>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-bold">전체회원수: {(members || []).length} 명</span>
            </div>

            <div className="table-responsive bg-white rounded shadow-sm">
                <table className="table table-bordered table-hover text-center align-middle mb-0">
                    <thead className="table-light">
                        <tr>
                            <th style={{ width: "50px" }} className="text-nowrap">선택</th>
                            <th>이름</th>
                            <th>전화번호</th>
                            <th className="text-nowrap">주소</th>
                            <th className="remark-col hide-mobile">비고</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(members || []).length > 0 ? (
                            (members || []).map((m) => (
                                <tr key={m._id} onClick={() => setSelectedId(m._id)} style={{ cursor: "pointer" }}>
                                    <td>
                                        <input
                                            type="radio"
                                            name="edit_id"
                                            checked={selectedId === m._id}
                                            onChange={() => setSelectedId(m._id)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </td>
                                    <td>
                                        {m.name === '공용계정' || m.id === 'jikji35' ? (
                                            <span style={{ color: '#fd7e14', fontWeight: 'bold' }}>{m.name}</span>
                                        ) : (
                                            m.name
                                        )}
                                    </td>
                                    <td>{m.tel}</td>
                                    <td>{m.addr}</td>
                                    <td className="hide-mobile">{m.remark || "-"}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={5} className="p-3">등록된 회원이 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="text-center mt-4 mb-5 d-flex justify-content-center gap-2">
                <button className="btn btn-warning px-4 fw-bold" onClick={handleEdit}>
                    <Edit size={18} className="me-1" /> 수정하기
                </button>
                <button className="btn btn-danger px-4 fw-bold" onClick={handleDelete}>
                    <Trash2 size={18} className="me-1" /> 삭제하기
                </button>
                <Link href="/members" className="btn btn-secondary px-4 fw-bold text-decoration-none d-flex align-items-center">
                    <ArrowLeft size={18} className="me-1" /> 돌아가기
                </Link>
            </div>
        </div>
    );
}
