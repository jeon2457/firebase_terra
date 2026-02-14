"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    ArrowLeft,
    UserPlus,
    Search,
    MessageSquare,
    Phone,
    MapPin,
    Tag,
    X,
    Lock,
    Unlock
} from "lucide-react";
import axios from "axios";

export default function MembersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSecured, setIsSecured] = useState(true); // Security switch

    // New Member Form State
    const [newMember, setNewMember] = useState({
        id: "",
        password: "",
        name: "",
        tel: "",
        addr: "",
        remark: "",
        sms: "",
        email: "",
        user_level: 1
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchMembers();
        }
    }, [status, router]);

    const fetchMembers = async () => {
        try {
            const res = await axios.get("/api/members");
            if (res.data.success) {
                setMembers(res.data.members);
            }
        } catch (error) {
            console.error("Failed to fetch members", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post("/api/members", newMember);
            if (res.data.success) {
                alert("회원이 성공적으로 등록되었습니다.");
                setShowAddModal(false);
                fetchMembers();
                setNewMember({
                    id: "",
                    password: "",
                    name: "",
                    tel: "",
                    addr: "",
                    remark: "",
                    sms: "",
                    email: "",
                    user_level: 1
                });
            }
        } catch (error: any) {
            alert("등록 실패: " + (error.response?.data?.message || error.message));
        }
    };

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.tel?.includes(searchTerm) ||
        m.remark?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (status === "loading" || loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <div className="container-fluid p-0 pb-5" style={{ background: "#000", minHeight: "100vh", color: "#fff" }}>
            <style jsx>{`
                .sticky-header {
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    background: #000;
                    border-bottom: 1px solid #333;
                    padding: 15px 20px;
                }
                .member-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .member-table th {
                    background: #111;
                    color: #cea71b;
                    padding: 12px;
                    text-align: center;
                    border-bottom: 1px solid #333;
                    font-size: 14px;
                }
                .member-table td {
                    padding: 15px 10px;
                    text-align: center;
                    border-bottom: 1px solid #222;
                    vertical-align: middle;
                }
                .member-row:hover {
                    background: #1a1a1a;
                }
                .sms-btn {
                    color: #4A9EFF;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .sms-btn:hover {
                    transform: scale(1.2);
                }
                .security-toggle {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 5px 15px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.3s;
                }
                .security-on { background: #333; color: #cea71b; border: 1px solid #cea71b; }
                .security-off { background: #cea71b; color: #000; font-weight: bold; }
                
                /* Modal */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }
                .modal-content {
                    background: #e0e5ec;
                    color: #333;
                    border-radius: 25px;
                    max-width: 600px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    padding: 30px;
                    box-shadow: 10px 10px 20px #000;
                }
            `}</style>

            <div className="sticky-header shadow-sm">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <button className="btn btn-outline-light btn-sm rounded-circle" onClick={() => router.push("/dashboard")}>
                            <ArrowLeft size={18} />
                        </button>
                        <h4 className="m-0 fw-bold" style={{ color: "#cea71b" }}>회원 연락망</h4>
                    </div>

                    <div className="d-flex align-items-center gap-3 flex-grow-1" style={{ maxWidth: "400px" }}>
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-dark border-secondary text-secondary">
                                <Search size={16} />
                            </span>
                            <input
                                type="text"
                                className="form-control bg-dark border-secondary text-white"
                                placeholder="이름, 전화번호, 비고 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <div
                            className={`security-toggle ${isSecured ? 'security-on' : 'security-off'}`}
                            onClick={() => setIsSecured(!isSecured)}
                        >
                            {isSecured ? <Lock size={14} /> : <Unlock size={14} />}
                            {isSecured ? '보안 ON' : '보안 OFF'}
                        </div>
                        {(session?.user as any).user_level >= 5 && (
                            <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => setShowAddModal(true)}>
                                <UserPlus size={16} className="me-1" /> 등록
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="table-responsive mt-3">
                <table className="member-table">
                    <thead>
                        <tr>
                            <th style={{ width: "60px" }}>NO</th>
                            <th style={{ width: "120px" }}>이름</th>
                            <th style={{ width: "160px" }}>전화번호</th>
                            <th>거주지</th>
                            <th style={{ width: "120px" }}>비고</th>
                            <th style={{ width: "80px" }}>SMS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map((member, index) => (
                            <tr key={member._id} className="member-row">
                                <td className="text-secondary">{index + 1}</td>
                                <td className="fw-bold">{member.name}</td>
                                <td>
                                    <a href={`tel:${member.tel}`} className="text-white text-decoration-none">
                                        {member.tel}
                                    </a>
                                </td>
                                <td className="text-secondary" style={{ fontSize: "14px" }}>
                                    {isSecured ? "****" : member.addr}
                                </td>
                                <td className="small text-info">{member.remark}</td>
                                <td>
                                    <a href={`sms:${member.sms || member.tel}`} className="sms-btn">
                                        <MessageSquare size={20} />
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Member Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-bold m-0" style={{ color: "#115ef7" }}>모임회원 신규등록</h4>
                            <button className="btn btn-link text-dark p-0" onClick={() => setShowAddModal(false)}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleAddMember}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="fw-bold small mb-1">아이디</label>
                                    <input type="text" className="form-control" required
                                        value={newMember.id} onChange={e => setNewMember({ ...newMember, id: e.target.value })} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="fw-bold small mb-1">비밀번호</label>
                                    <input type="password" className="form-control" required
                                        value={newMember.password} onChange={e => setNewMember({ ...newMember, password: e.target.value })} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="fw-bold small mb-1">이름</label>
                                    <input type="text" className="form-control" required
                                        value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="fw-bold small mb-1">전화번호</label>
                                    <input type="text" className="form-control" required placeholder="010-0000-0000"
                                        value={newMember.tel} onChange={e => setNewMember({ ...newMember, tel: e.target.value })} />
                                </div>
                                <div className="col-12 mb-3">
                                    <label className="fw-bold small mb-1">거주지</label>
                                    <input type="text" className="form-control" required
                                        value={newMember.addr} onChange={e => setNewMember({ ...newMember, addr: e.target.value })} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="fw-bold small mb-1">비고(직책)</label>
                                    <input type="text" className="form-control" placeholder="회원, 총무, 회장 등"
                                        value={newMember.remark} onChange={e => setNewMember({ ...newMember, remark: e.target.value })} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="fw-bold small mb-1">회원 레벨</label>
                                    <select className="form-select" value={newMember.user_level}
                                        onChange={e => setNewMember({ ...newMember, user_level: Number(e.target.value) })}>
                                        <option value="1">게스트 (1)</option>
                                        <option value="2">정회원 (2)</option>
                                        <option value="5">Premium (5)</option>
                                        <option value="10">관리자 (10)</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-pill mt-4 shadow" style={{ background: "#4A90E2" }}>
                                등록하기
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
