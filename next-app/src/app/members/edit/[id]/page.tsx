"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

export default function MemberEditFormPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();

    const [formData, setFormData] = useState({
        _id: "",
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

    const [loading, setLoading] = useState(true);
    const [isAutoSms2, setIsAutoSms2] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && params?.id) {
            fetchMember(params.id as string);
        }
    }, [status, router, params]);

    const fetchMember = async (id: string) => {
        try {
            const res = await axios.get(`/api/members/${id}`);
            if (res.data.success) {
                const m = res.data.member;
                setFormData({
                    _id: m._id,
                    id: m.id || "",
                    password: "",
                    name: m.name || "",
                    tel: m.tel || "",
                    addr: m.addr || "",
                    remark: m.remark || "",
                    sms: m.sms || "",
                    sms_2: m.sms_2 || "",
                    email: m.email || "",
                    user_level: m.user_level || 1
                });

                if (m.remark && (m.remark.includes("회장") || m.remark.includes("총무"))) {
                    setIsAutoSms2(true);
                }
            }
        } catch (error) {
            alert("데이터 로드 실패");
            router.push("/members/edit");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === "tel" || name === "sms") {
            newValue = value
                .replace(/[^0-9]/g, "")
                .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, "$1-$2-$3");
        }

        setFormData(prev => {
            const updated = { ...prev, [name]: newValue };

            if (name === "tel") updated.sms = newValue;

            if (name === "remark") {
                if (newValue.includes("회장") || newValue.includes("총무")) {
                    setIsAutoSms2(true);
                    updated.sms_2 = "저장 시 자동생성됩니다";
                } else {
                    setIsAutoSms2(false);
                    if (updated.sms_2 === "저장 시 자동생성됩니다") updated.sms_2 = "";
                }
            }

            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm("회원 정보를 수정하시겠습니까?")) return;

        try {
            const res = await axios.put("/api/members", formData);
            if (res.data.success) {
                alert("수정되었습니다.");
                router.push("/members/edit");
            }
        } catch (error: any) {
            alert("수정 실패: " + (error.response?.data?.message || error.message));
        }
    };

    if (status === "loading" || loading) return <div className="text-center mt-5">Loading...</div>;

    return (
        <div className="page-wrap">
            <style jsx>{`
        :root {
          --panel-bg: #e6ebf2;
          --panel-border: rgba(255, 255, 255, 0.35);
          --title: #6c8cff;
          --label: #3b3f45;
          --muted: #7b8794;
          --shadow-strong: rgba(0, 0, 0, 0.25);
          --shadow-soft: rgba(0, 0, 0, 0.12);
        }

        .page-wrap {
          min-height: 100vh;
          padding: 36px 16px;
          background: radial-gradient(1200px 900px at 50% 10%, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0) 55%),
            linear-gradient(180deg, #6a2be6 0%, #7330d8 40%, #5a24c6 100%);
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .panel {
          width: 100%;
          max-width: 640px;
          background: var(--panel-bg);
          border-radius: 28px;
          padding: 28px 26px 30px;
          border: 1px solid var(--panel-border);
          box-shadow: 0 28px 70px var(--shadow-strong);
        }

        .section-title {
          text-align: center;
          color: var(--title);
          font-weight: 900;
          margin-bottom: 22px;
          font-size: 2rem;
          letter-spacing: -0.5px;
        }

        .label-text {
          font-weight: 800;
          color: var(--label);
          margin-bottom: 8px;
          display: block;
          font-size: 0.95rem;
        }

        .help-text {
          color: var(--muted);
          font-size: 0.85rem;
          margin-top: 8px;
          margin-left: 2px;
        }

        .asterisk::after { content: " *"; color: #e74c3c; }

        .form-control, .form-select {
          border: none;
          padding: 14px 16px;
          font-size: 16px;
          border-radius: 14px;
          background: #eef3f9;
          box-shadow: inset 4px 4px 10px rgba(0,0,0,0.10), inset -4px -4px 10px rgba(255,255,255,0.80);
        }

        .form-control:disabled {
          opacity: 1;
          color: #2f3640;
          background: #eef3f9;
        }

        .form-control:focus, .form-select:focus {
          outline: none;
          box-shadow: inset 6px 6px 12px rgba(0,0,0,0.12), inset -6px -6px 12px rgba(255,255,255,0.85);
        }

        .divider {
          height: 1px;
          background: rgba(0,0,0,0.08);
          border: none;
          margin: 22px 0;
        }

        .auto-generated {
          cursor: not-allowed;
          color: #7a7a7a;
        }

        .btn-row {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 22px;
          flex-wrap: wrap;
        }

        .btn-soft {
          min-width: 140px;
          padding: 12px 18px;
          border-radius: 14px;
          border: none;
          font-weight: 900;
          font-size: 16px;
          box-shadow: 0 10px 22px var(--shadow-soft);
        }

        .btn-save {
          background: #d9e6ff;
          color: #4c74ff;
        }

        .btn-cancel {
          background: #e9eef5;
          color: #2f3640;
        }

        .btn-list {
          margin: 18px auto 0;
          display: flex;
          justify-content: center;
        }

        .btn-list a {
          width: 220px;
          text-align: center;
          padding: 12px 18px;
          border-radius: 14px;
          background: #e9eef5;
          color: #4c74ff;
          font-weight: 900;
          box-shadow: 0 10px 22px var(--shadow-soft);
        }

        @media (max-width: 480px) {
          .page-wrap { padding: 16px 10px; }
          .panel { border-radius: 18px; padding: 18px 16px 20px; }
          .section-title { font-size: 1.7rem; margin-bottom: 16px; }
          .btn-soft { min-width: 128px; }
          .btn-list a { width: 100%; }
        }
      `}</style>
            <div className="panel">
                <h2 className="section-title">회원 정보 수정</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="label-text asterisk">아이디</label>
                        <input type="text" className="form-control" value={formData.id} readOnly disabled />
                    </div>

                    <div className="mb-4">
                        <label className="label-text">비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            placeholder="변경할 때만 입력하세요"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <div className="help-text">※ 비워두면 기존 비밀번호가 유지됩니다.</div>
                    </div>

                    <div className="mb-4">
                        <label className="label-text asterisk">이름</label>
                        <input type="text" name="name" className="form-control" required value={formData.name} onChange={handleChange} />
                    </div>

                    <div className="mb-4">
                        <label className="label-text asterisk">전화번호</label>
                        <input type="text" name="tel" className="form-control" maxLength={13} required value={formData.tel} onChange={handleChange} />
                    </div>

                    <div className="mb-4">
                        <label className="label-text asterisk">거주지</label>
                        <input type="text" name="addr" className="form-control" required value={formData.addr} onChange={handleChange} />
                    </div>

                    <div className="mb-4">
                        <label className="label-text">비고(직책)</label>
                        <input type="text" name="remark" className="form-control" value={formData.remark} onChange={handleChange} />
                    </div>

                    <div className="mb-4">
                        <label className="label-text">SMS 수신번호 1</label>
                        <input type="text" name="sms" className="form-control" required maxLength={13} value={formData.sms} onChange={handleChange} />
                    </div>

                    <div className="mb-4">
                        <label className="label-text">SMS 수신번호 2</label>
                        <input type="text" name="sms_2" className={`form-control ${isAutoSms2 ? 'auto-generated' : ''}`} value={formData.sms_2} onChange={handleChange} readOnly={isAutoSms2} />
                    </div>

                    <hr className="divider" />

                    <div className="mb-4">
                        <label className="label-text">이메일</label>
                        <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} />
                    </div>

                    <div className="mb-4">
                        <label className="label-text asterisk">회원 등급(레벨)</label>
                        <select name="user_level" className="form-select" required value={formData.user_level} onChange={handleChange}>
                            <option value="1">게스트 (1)</option>
                            <option value="2">정회원 (2)</option>
                            <option value="5">Premium (5)</option>
                            <option value="10">관리자 (10)</option>
                        </select>
                    </div>

                    <div className="btn-row">
                        <button type="submit" className="btn-soft btn-save">정보 저장</button>
                        <button type="button" className="btn-soft btn-cancel" onClick={() => router.push("/members/edit")}>취소</button>
                    </div>

                    <div className="btn-list">
                        <Link href="/members/edit" className="text-decoration-none">◀◀ 회원목록으로</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
