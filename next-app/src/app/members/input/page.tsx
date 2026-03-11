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
        document.title = "회원 등록";
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
        <div className="page-wrap">
            <style jsx>{`
        :root {
          --panel-bg: #e6ebf2;
          --panel-border: rgba(255, 255, 255, 0.6);
          --title: #6c8cff;
          --label: #3b3f45;
          --muted: #7b8794;
          --shadow-strong: rgba(0, 0, 0, 0.25);
          --shadow-soft: rgba(0, 0, 0, 0.12);
          --primary: #5f7cf5;
        }

        .page-wrap {
          min-height: 100vh;
          padding: 24px 14px;
          background: linear-gradient(180deg, #eff3f8 0%, #e2e8f0 100%);
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .panel {
          width: 100%;
          max-width: 520px;
          background: var(--panel-bg);
          border-radius: 28px;
          padding: 22px 22px 26px;
          border: 1px solid var(--panel-border);
          box-shadow: 0 26px 60px var(--shadow-strong);
        }

        .header-box {
          border-radius: 20px;
          padding: 18px 16px;
          text-align: center;
          background: #e9eef5;
          box-shadow: inset 6px 6px 14px rgba(0,0,0,0.10), inset -6px -6px 14px rgba(255,255,255,0.80);
          margin-bottom: 18px;
        }

        .title {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          justify-content: center;
          font-weight: 900;
          color: var(--title);
          font-size: 1.7rem;
          letter-spacing: -0.5px;
          margin: 0;
        }

        .subtitle {
          margin-top: 8px;
          font-weight: 900;
          color: #e74c3c;
          font-size: 0.9rem;
        }

        .label-text {
          font-weight: 800;
          color: var(--label);
          margin-bottom: 8px;
          display: block;
          font-size: 0.95rem;
        }
        .asterisk::after { content: " *"; color: #e74c3c; }

        .form-control, .form-select {
          border: none;
          padding: 14px 16px;
          font-size: 16px;
          border-radius: 14px;
          background: #eef3f9;
          /* 볼록한(튀어나온) 기본 상태 */
          box-shadow: 6px 6px 12px rgba(0,0,0,0.15), -6px -6px 12px rgba(255,255,255,0.9);
          transition: all 0.2s ease;
        }
        .form-control:focus, .form-select:focus {
          outline: none;
          /* 클릭시 오목하게(들어간) 상태 */
          box-shadow: inset 6px 6px 12px rgba(0,0,0,0.12), inset -6px -6px 12px rgba(255,255,255,0.85);
        }
        .auto-generated {
          cursor: not-allowed;
          color: #7a7a7a;
        }

        .help-text {
          display: inline-block;
          color: #ffffff;
          font-size: 0.8rem;
          margin-top: 8px;
          margin-left: 2px;
          padding: 6px 12px;
          border-radius: 20px;
          background: #3b82f6;
          font-weight: 500;
        }

        .divider {
          height: 1px;
          background: rgba(0,0,0,0.08);
          border: none;
          margin: 22px 0;
        }

        .btn-primary-wide {
          width: 100%;
          border: none;
          border-radius: 16px;
          padding: 14px 16px;
          font-weight: 900;
          font-size: 18px;
          color: #ffffff;
          background: #637fed;
          box-shadow: 0 14px 28px rgba(99, 127, 237, 0.35), 0 8px 18px var(--shadow-soft);
        }

        .btn-primary-wide:active {
          transform: translateY(1px);
          box-shadow: 0 10px 20px rgba(99, 127, 237, 0.28), 0 6px 14px var(--shadow-soft);
        }

        .btn-secondary-wide {
          width: 100%;
          border: none;
          border-radius: 16px;
          padding: 14px 16px;
          font-weight: 900;
          font-size: 16px;
          color: #6b7280;
          background: #e9eef5;
          box-shadow: 0 10px 22px var(--shadow-soft);
        }

        .btn-secondary-wide:active {
          transform: translateY(1px);
          box-shadow: 0 8px 18px var(--shadow-soft);
        }

        .btn-stack {
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @media (max-width: 480px) {
          .page-wrap { padding: 12px 10px; }
          .panel { border-radius: 18px; padding: 16px 14px 18px; }
          .title { font-size: 1.5rem; }
        }
      `}</style>

            <div className="panel">
                <div className="header-box">
                    <h2 className="title">
                        <UserPlus size={20} /> 회원 신규등록
                    </h2>
                    <div className="subtitle">※ 관리자 전용 권한 시스템!</div>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="mb-4">
                        <label className="label-text asterisk">아이디</label>
                        <input
                            type="text"
                            name="id"
                            className="form-control"
                            required
                            placeholder="접속 아이디 입력"
                            value={formData.id}
                            onChange={handleChange}
                            autoComplete="off"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="label-text asterisk">비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            required
                            placeholder="초기 비밀번호 설정"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="off"
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
                                placeholder="회원 이름"
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
                            placeholder="예: 서울,김천,부산 등..."
                            value={formData.addr}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="label-text">
                            직책/비고
                        </label>
                        <input
                            type="text"
                            name="remark"
                            className="form-control"
                            placeholder="예: 임시,회원,총무,회장,감사 등"
                            required
                            value={formData.remark}
                            onChange={handleChange}
                        />
                    </div>

                    <hr className="divider" />

                    <div className="mb-4">
                        <label className="label-text">SMS 수신번호</label>
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
                            SMS 수신번호 2
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
                        <div className="help-text">회장/총무가 아닌 경우 수동입력 가능</div>
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

                    <hr className="divider" />

                    <div className="mb-4">
                        <label className="label-text asterisk">회원 레벨</label>
                        <select
                            name="user_level"
                            className="form-select"
                            required
                            value={formData.user_level}
                            onChange={handleChange}
                        >
                            <option value="1">임시회원 (1)</option>
                            <option value="2">회원 (2)</option>
                            <option value="3">우수회원 (3)</option>
                            <option value="5">Premium (5)</option>
                            <option value="10">관리자 (10)</option>
                        </select>
                    </div>

                    <div className="btn-stack">
                        <button type="submit" className="btn-primary-wide">
                            등록 완료
                        </button>
                        <Link href="/members" className="btn-secondary-wide text-decoration-none d-flex align-items-center justify-content-center gap-2">
                            <ArrowLeft size={18} /> 돌아가기
                        </Link>
                    </div>

                </form>
            </div>
        </div>
    );
}
