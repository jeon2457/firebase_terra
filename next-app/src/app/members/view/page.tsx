"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";

export default function MembersViewPage() {
    const { data: session, status } = useSession();
    const router = useRouter();


    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSecured, setIsSecured] = useState(true); // Default ON

    // Clock State
    const [timeStr, setTimeStr] = useState("");
    const [dateStr, setDateStr] = useState("");

    // Animation State
    const [cubeDeg, setCubeDeg] = useState(0);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchMembers();
        }
    }, [status, router]);

    // Clock Timer
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();

            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const week = ['일', '월', '화', '수', '목', '금', '토'][now.getDay()];

            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');

            setDateStr(`${year}/${month}/${day}(${week})`);
            setTimeStr(`${hours}:${minutes}`);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Cube Animation Timer
    useEffect(() => {
        const cubeTimer = setInterval(() => {
            setCubeDeg(prev => prev - 90);
        }, 2000); // Slower rotate for better stability
        return () => clearInterval(cubeTimer);
    }, []);

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

    const handleToggleSecurity = () => {
        if ((session?.user as any)?.user_level >= 5) {
            setIsSecured(!isSecured);
        } else {
            if (confirm("이 기능을 사용하려면 관리자 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?")) {
                router.push("/login");
            }
        }
    };

    if (status === "loading" || loading) {
        return (
            <div style={{ background: "#000", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", color: "#fff" }}>
                Loading...
            </div>
        );
    }

    const userLevel = (session?.user as any)?.user_level || 0;
    const userName = (session?.user as any)?.name || "Guest";
    const userDisplayText = userLevel >= 10 ? `관리자: ${userName}님` : `회원: ${userName}님`;

    return (
        <div className="wrapper">
            <style jsx global>{`
        body {
          background-color: #000;
          color: #fff;
          font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;
          margin: 0;
          padding: 0;
        }
      `}</style>
            <style jsx>{`
        .wrapper {
            width: 100%;
            min-height: 100vh;
            background: #000;
        }
        /* Header */
        .header {
            width: 100%;
            height: 55px;
            background: #000;
            color: #cea71b;
            padding: 5px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #333;
            font-weight: bold;
            position: sticky;
            top: 0;
            z-index: 1001;
        }
        .date-text { font-size: 16px; letter-spacing: 1px; color: #cea71b; }
        .header-right { display: flex; flex-direction: column; align-items: flex-end; justify-content: center; }
        .time-text { font-size: 20px; letter-spacing: 2px; color: #4A9EFF; line-height: 1.1; }
        .user-info-box {
            font-size: 10px;
            color: #fff;
            background: #333;
            padding: 2px 8px;
            border-radius: 5px;
            margin-top: 3px;
            border: 1px solid #555;
        }

        /* Marquee Section (wrap2) */
        .wrap2 {
            position: sticky;
            top: 55px; /* Below Header */
            z-index: 1000;
            width: 100%;
            height: 50px;
            background-image: url('/images/bg.gif');
            background-size: auto;
            background-repeat: repeat;
            background-position: center;
            display: flex;
            align-items: center;
            overflow: hidden;
            border-bottom: 1px solid #444;
        }
        
        /* 3D Cube */
        .wrap1 {
            position: absolute;
            left: 5px;
            top: 50%;
            transform: translateY(-50%);
            width: 50px;
            height: 50px;
            perspective: 500px;
            z-index: 10;
        }
        .cube {
            width: 100%;
            height: 100%;
            position: relative;
            transform-style: preserve-3d;
            transform: rotateX(${cubeDeg}deg);
            transition: transform 0.6s ease;
        }
        .cube img {
            position: absolute;
            width: 50px;
            height: 50px;
            object-fit: cover;
        }
        .cube img:nth-child(1) { transform: rotateX(0deg) translateZ(25px); }
        .cube img:nth-child(2) { transform: rotateX(90deg) translateZ(25px); }
        .cube img:nth-child(3) { transform: rotateX(180deg) translateZ(25px); }
        .cube img:nth-child(4) { transform: rotateX(270deg) translateZ(25px); }

        /* Marquee Text */
        .billboard-container {
            position: absolute;
            left: 70px; /* Adjusted for Cube */
            right: 0;
            height: 100%;
            overflow: hidden;
            display: flex;
            align-items: center;
        }
        .billboard {
            white-space: nowrap;
            display: flex;
            align-items: center;
            animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
        }
        .custom-span {
             color: #ccc; font-size: 20px; font-weight: bold; margin: 0 20px; text-shadow: 1px 1px 2px #000;
        }

        /* Table */
        .table-container {
            margin-top: 0;
            background: #333;
        }
        .custom-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }
        .custom-table thead th {
             position: sticky;
             top: 105px; /* Header 55 + Wrap2 50 */
             background: url('/images/background_mable-1.jpg') center center / cover no-repeat !important; /* Fixed path */
             color: #cea71b !important;
             z-index: 990;
             padding: 12px 8px;
             text-align: center;
             font-weight: bold;
             border: 1px solid #555;
        }
        .custom-table tbody tr {
             background-color: #333;
             color: #fff;
             border-bottom: 1px solid #555;
        }
        .custom-table tbody tr:hover { background: #444; }
        .custom-table td {
             padding: 10px 8px;
             text-align: center;
             border: 1px solid #555;
             vertical-align: middle;
             word-break: break-word;
        }
        .name-link {
             font-size: 1.1rem; font-weight: 600; color: #ffffff !important; text-decoration: none !important;
        }
        .name-link:hover { color: #ffffff !important; text-decoration: none !important; }
        
        .sms-icon { color: #4A9EFF; font-size: 24px; cursor: pointer; transition: transform 0.2s; }
        .sms-icon:hover { transform: scale(1.2); }

        /* Address Toggle Logic */
        .address-header { cursor: pointer; color: #cea71b !important; }
        .addr-visible { color: #cea71b !important; } 
        
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
            .header { height: 60px; padding: 5px 10px; flex-direction: column; align-items: flex-start; justify-content: center; gap: 2px; }
            .date-text { font-size: 13px; width: 100%; text-align: left; }
            .header-right { width: 100%; flex-direction: row; justify-content: center; position: relative; }
            .time-text { font-size: 17px; }
            .user-info-box { position: absolute; right: 0; bottom: 0; font-size: 8px; padding: 1px 5px; }
            
            .wrap2 { top: 60px; height: 33px; }
            .wrap1 { width: 24px; height: 24px; left: 4px; }
            .cube img { width: 24px; height: 24px; }
            .cube img:nth-child(1) { transform: rotateX(0deg) translateZ(12px); }
            .cube img:nth-child(2) { transform: rotateX(90deg) translateZ(12px); }
            .cube img:nth-child(3) { transform: rotateX(180deg) translateZ(12px); }
            .cube img:nth-child(4) { transform: rotateX(270deg) translateZ(12px); }
            
            .custom-table thead th { top: 93px; font-size: 12px; padding: 6px 2px; }
            .custom-table td { font-size: 12px; padding: 6px 2px; }
            
            .billboard-container { left: 40px; }
            .custom-span { font-size: 14px; }
            
            /* Column Widths Mobile */
            .col-no { width: 30px; }
            .col-name { width: 70px; }
            .col-tel { width: auto; }
            .col-addr { width: 50px; }
            .col-remark { display: none; } /* Hide remark on mobile */
            .col-sms { width: 40px; }
            .hide-mobile { display: none; }
        }

        /* PC Column Widths */
        @media (min-width: 769px) {
             .col-no { width: 5%; }
             .col-name { width: 15%; }
             .col-tel { width: 20%; white-space: nowrap; }
             .col-addr { width: 30%; }
             .col-remark { width: 10%; }
             .col-sms { width: 10%; }
        }

        /* Phone cell specific style to prevent wrapping and ensure consistency */
        .member-tel-cell {
            white-space: nowrap;
            font-variant-numeric: tabular-nums; /* Ensures numbers are same width */
        }
      `}</style>

            {/* Header */}
            <div className="header">
                <div className="date-text">{dateStr}</div>
                <div className="header-right">
                    <div className="time-text">{timeStr}</div>
                    <div className="user-info-box">{userDisplayText}</div>
                </div>
            </div>

            {/* Feature Section (Marquee / Cube) */}
            <div className="wrap2">
                <div className="wrap1">
                    <div className="cube">
                        <img src="/images/mail_1.png" alt="이메일" />
                        <img src="/images/chat_1.png" alt="채팅" />
                        <img src="/images/phone_1.png" alt="전화" />
                        <img src="/images/sms_1.png" alt="문자" />
                    </div>
                </div>

                <div className="billboard-container">
                    <div className="billboard">
                        <img src="/images/aa.gif" width="25" height="25" alt="" />
                        <img src="/images/dd.gif" width="25" height="25" alt="" />
                        <span className="custom-span">직지초35회 김천지부 동기연락망</span>
                        <img src="/images/dd.gif" width="25" height="25" alt="" />
                        <img src="/images/aa.gif" width="25" height="25" alt="" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th className="col-no">NO</th>
                            <th className="col-name">이름</th>
                            <th className="col-tel">전화번호</th>
                            <th className="col-addr address-header" onClick={handleToggleSecurity} style={{ color: '#cea71b' }}>
                                <span className="addr-visible" style={{ color: '#cea71b' }}>거주지</span>
                            </th>
                            <th className="col-remark hide-mobile">비고</th>
                            <th className="col-sms">SMS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((member, index) => (
                            <tr key={member._id}>
                                <td>{index + 1}</td>
                                <td>
                                    <Link href={`tel:${member.tel}`} className="name-link" style={{ color: '#ffffff', textDecoration: 'none' }}>
                                        {member.name}
                                    </Link>
                                </td>
                                <td className="member-tel-cell">
                                    <Link href={`tel:${member.tel}`} className="name-link" style={{ color: '#ffffff', textDecoration: 'none' }}>
                                        {member.tel}
                                    </Link>
                                </td>
                                <td>
                                    {member.addr}
                                </td>
                                <td className="hide-mobile">{member.remark}</td>
                                <td>
                                    <Link href={`sms:${member.sms || member.tel}`}>
                                        <img src="/images/sms-4.png" alt="SMS" className="sms-icon" style={{ width: '18px', height: '18px' }} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Floating Action Button (Scroll to Top) */}
            <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 2000 }}>
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    style={{
                        width: '40px', height: '40px', borderRadius: '50%', border: 'none',
                        background: 'rgba(10, 132, 255, 0.7)', color: '#fff', fontSize: '20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        backdropFilter: 'blur(4px)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}
                >
                    <i className="bi bi-arrow-up"></i>
                </button>
            </div>
        </div>
    );
}
