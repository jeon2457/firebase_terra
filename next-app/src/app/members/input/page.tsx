"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import { ArrowLeft, UserPlus } from "lucide-react";
import axios from "axios";

export default function MemberInputPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [formData, setFormData] = useState({
        id: "",
        password: "",
        name: "",
        tel: "",
        addr: "",
        remark: "",
        sms: "",
        sms_2: "",
        email: "",
        user_level: 1
    });

    const [isAutoSms2, setIsAutoSms2] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let newValue = value;

        // Auto hyphen for phone numbers
        if (name === "tel" || name === "sms") {
            newValue = value
                .replace(/[^0-9]/g, "")
                .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, "$1-$2-$3");
        }

        setFormData(prev => {
            const updated = { ...prev, [name]: newValue };

            // Sync SMS with Tel
            if (name === "tel") {
                updated.sms = newValue;
            }

            // Check remark for Leader/Manager to auto-set sms_2 visual indicator
            if (name === "remark") {
                if (newValue.includes("회장") || newValue.includes("총무")) {
                    setIsAutoSms2(true);
                    updated.sms_2 = "저장 시 자동생성됩니다";
                } else {
                    setIsAutoSms2(false);
                    updated.sms_2 = "";
                }
            }

            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm("회원 정보를 등록하시겠습니까?")) return;

        try {
            const res = await axios.post("/api/members", formData);
            if (res.data.success) {
                alert("데이터가 저장되었습니다.");
                router.push("/members/view");
            }
        } catch (error: any) {
            alert("등록 실패: " + (error.response?.data?.message || error.message));
        }
    };

    if (status === "loading") return <div className="text-center mt-5">Loading...</div>;

    return (
        <div className="container py-5" style={{ maxWidth: "650px" }}>
            <style jsx>{`
        :root {
          --bg: #e0e5ec;
          --shadow: #a3b1c6;
          --light: #ffffff;
          --primary: #4A90E2;
        }
        .neumorphic-container {
          background: var(--bg);
          border-radius: 30px;
          padding: 40px;
          box-shadow: 15px 15px 30px var(--shadow), -15px -15px 30px var(--light);
        }
        .section-title {
          text-align: center;
          color: #115ef7;
          font-weight: 700;
          margin-bottom: 40px;
          padding: 15px;
          background: var(--bg);
          border-radius: 20px;
          box-shadow: inset 6px 6px 12px var(--shadow), inset -6px -6px 12px var(--light);
          font-size: 1.6rem;
        }
        .form-control, .form-select {
          border: none;
          padding: 15px 20px;
          font-size: 17px;
          border-radius: 15px;
          background: var(--bg);
          box-shadow: 6px 6px 12px var(--shadow), -6px -6px 12px var(--light);
          margin-bottom: 5px;
        }
        .form-control:focus, .form-select:focus {
          box-shadow: inset 5px 5px 10px var(--shadow), inset -5px -5px 10px var(--light);
          outline: none;
          color: #4A90E2;
        }
        .label-text {
          font-weight: bold;
          color: #555;
          margin-left: 10px;
          margin-bottom: 8px;
          display: block;
        }
        .asterisk::after {
          content: " *";
          color: #e74c3c;
        }
        .info-badge {
          font-size: 0.8rem;
          margin-left: 8px;
          border-radius: 10px;
          padding: 5px 10px;
          background-color: #4984f8;
          color: #f9fafc;
          box-shadow: 2px 2px 5px var(--shadow), -2px -2px 5px var(--light);
        }
        .btn-main {
          padding: 15px 40px;
          border: none;
          border-radius: 20px;
          font-size: 20px;
          font-weight: bold;
          transition: all 0.2s;
          box-shadow: 6px 6px 12px var(--shadow), -6px -6px 12px var(--light);
        }
        .btn-main:active {
          box-shadow: inset 6px 6px 12px var(--shadow), inset -6px -6px 12px var(--light);
          transform: scale(0.98);
        }
        .auto-generated {
          background-color: var(--bg);
          box-shadow: inset 4px 4px 8px var(--shadow), inset -4px -4px 8px var(--light);
          cursor: not-allowed;
          color: #888;
        }
      `}</style>

            <div className="neumorphic-container">
                <h2 className="section-title">모임회원 신규등록</h2>

                <form onSubmit={handleSubmit}>

                    <div className="mb-4">
                        <label className="label-text asterisk">아이디</label>
                        <input
                            type="text"
                            name="id"
                            className="form-control"
                            required
                            placeholder="영문, 숫자 조합"
                            value={formData.id}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="label-text asterisk">비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            required
                            placeholder="영문, 숫자, 특수문자 조합"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-4">
                            <label className="label-text asterisk">이름</label>
                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                required
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-md-6 mb-4">
                            <label className="label-text asterisk">전화번호</label>
                            <input
                                type="text"
                                name="tel"
                                className="form-control"
                                placeholder="010-0000-0000"
                                maxLength={13}
                                required
                                value={formData.tel}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="label-text asterisk">거주지</label>
                        <input
                            type="text"
                            name="addr"
                            className="form-control"
                            required
                            placeholder="예) 서울, 경기 등"
                            value={formData.addr}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="label-text">
                            비고(직책)
                            <span className="info-badge">회장/총무 입력 시 SMS_2 자동생성</span>
                        </label>
                        <input
                            type="text"
                            name="remark"
                            className="form-control"
                            placeholder="예) 회원, 총무, 회장 등"
                            value={formData.remark}
                            onChange={handleChange}
                        />
                    </div>

                    <hr style={{ margin: "35px 0", border: "none", height: "4px", background: "#e0e5ec", boxShadow: "inset 2px 2px 4px #a3b1c6, inset -2px -2px 4px #ffffff" }} />

                    <div className="mb-4">
                        <label className="label-text asterisk">SMS(Tel)</label>
                        <input
                            type="text"
                            name="sms"
                            className="form-control"
                            required
                            maxLength={13}
                            value={formData.sms}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="label-text">
                            SMS-2 단체
                            {isAutoSms2 && <span style={{ color: "#4A90E2", fontSize: "0.8rem", marginLeft: "10px" }}>[자동생성 예정]</span>}
                        </label>
                        <input
                            type="text"
                            name="sms_2"
                            className={`form-control ${isAutoSms2 ? 'auto-generated' : ''}`}
                            value={formData.sms_2}
                            onChange={handleChange}
                            readOnly={isAutoSms2}
                        />
                        <small className="text-muted ms-2" style={{ fontSize: '0.8rem' }}>회장/총무가 아닌 경우 수동입력 가능</small>
                    </div>

                    <div className="mb-4">
                        <label className="label-text">이메일</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="선택 사항"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <hr style={{ margin: "35px 0", border: "none", height: "4px", background: "#e0e5ec", boxShadow: "inset 2px 2px 4px #a3b1c6, inset -2px -2px 4px #ffffff" }} />

                    <div className="mb-4">
                        <label className="label-text asterisk">회원 레벨</label>
                        <select
                            name="user_level"
                            className="form-select"
                            required
                            value={formData.user_level}
                            onChange={handleChange}
                        >
                            <option value="1">게스트 (1)</option>
                            <option value="2">정회원 (2)</option>
                            <option value="5">Premium (5)</option>
                            <option value="10">관리자 (10)</option>
                        </select>
                    </div>

                    <div className="d-flex justify-content-center gap-3 mt-5">
                        <button type="submit" className="btn-main text-white" style={{ background: "#4A90E2" }}>
                            입력하기
                        </button>
                        <Link href="/members" className="btn-main text-white text-decoration-none d-flex align-items-center justify-content-center" style={{ background: "#a3b1c6" }}>
                            돌아가기
                        </Link>
                    </div>

                </form>
            </div>
            <style jsx>{`
                @media (max-width: 768px) {
                    .btn-main {
                        padding: 10px 20px !important;
                        font-size: 16px !important;
                        min-width: 100px;
                    }
                }
            `}</style>

        </form>
            </div >
        </div >
    );
}
