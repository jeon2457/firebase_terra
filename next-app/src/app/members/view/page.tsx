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

    const [isPageReady, setIsPageReady] = useState(false);

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

    useEffect(() => {
        const t = setTimeout(() => {
            setIsPageReady(true);
        }, 2500);
        return () => clearTimeout(t);
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await axios.get("/api/members");
            if (res.data.success) {
                // Filter out specific system/public accounts
                const filteredMembers = res.data.members.filter((m: any) => m.name !== '공용계정' && m.id !== 'jikji35');
                setMembers(filteredMembers);
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
          background: linear-gradient(to right, #232526, #414345);
          margin: 0;
          padding: 3px 0;
          font-family: 'Noto Sans KR', sans-serif;
          color: #ffffff;
        }
      `}</style>
            <style jsx>{`
        .wrapper {
            width: 100%;
            min-height: 100vh;
            background: transparent;
        }

        a { text-decoration: none !important; }

        /* Loading Screen */
        #loading-screen {
            position: fixed;
            width: 100%;
            height: 100%;
            background: #363434;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: opacity 0.5s ease;
            z-index: 9999;
            inset: 0;
        }
        #loading-screen img {
            width: 250px;
            max-width: 80%;
        }

        #main-content {
            display: ${isPageReady ? "block" : "none"};
        }

        /* Container */
        .container {
            max-width: 700px;
            margin: 0 auto;
            padding: 0;
        }

        /* Header */
        .header {
            width: 100%;
            max-width: 700px;
            height: 3.5rem;
            margin: 0 auto;
            text-align: center;
            color: #f4f4f4;
            background-color: rgba(0, 0, 0);
            padding: 0 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
        }

        .header-left { display: flex; align-items: center; gap: 10px; }
        .date-text { color: #cea71bff; font-size: 1.5rem; }
        .time-text { color: #4A9EFF; font-size: 1.5rem; line-height: 1.1; }
        .header-right { display: flex; align-items: center; }
        .user-info-box {
            font-size: 12px;
            color: #E3EFFA !important;
            background: #333;
            padding: 4px 8px;
            border-radius: 5px;
            border: 1px solid #555;
            white-space: nowrap;
        }

        /* Marquee Section (wrap2) */
        .wrap2 {
            position: fixed;
            top: 3.5rem;
            left: 0;
            right: 0;
            z-index: 999;
            width: 100%;
            max-width: 700px;
            margin: 0 auto;
            overflow: hidden;
            background-image: url('/images/bg.gif');
            background-color: lightgray;
            background-position: center;
            background-repeat: repeat-x;
            background-size: contain;
            height: 40px;
            display: flex;
            align-items: center;
            padding: 0 103px 0 93px;
            box-sizing: border-box;
        }
        
        /* 3D Cube */
        .cube-container {
            position: absolute;
            top: 7px;
            left: 10px;
            z-index: 1001;
        }

        .wrap1 {
            width: 25px;
            height: 25px;
            perspective: 500px;
            transform-style: preserve-3d;
            position: relative;
            padding: 0;
        }

        .cube {
            width: 25px;
            height: 25px;
            position: absolute;
            top: 0;
            left: 0;
            transform-style: preserve-3d;
            transform: rotateX(${cubeDeg}deg);
            transition: transform 0.6s ease;
        }
        .cube img {
            position: absolute;
            top: 3px;
            left: -3px;
            width: 25px;
            height: 25px;
            backface-visibility: hidden;
            display: block;
        }
        .cube img:nth-child(1) { transform: translateZ(12.5px); }
        .cube img:nth-child(2) { transform: rotateX(90deg) translateZ(12.5px); }
        .cube img:nth-child(3) { transform: rotateX(180deg) translateZ(12.5px); }
        .cube img:nth-child(4) { transform: rotateX(270deg) translateZ(12.5px); }

        /* Marquee Text */
        .marquee-container {
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
            box-sizing: border-box;
            display: flex;
            align-items: center;
        }

        .marquee {
            display: flex;
            align-items: center;
            animation: marquee 15s linear infinite;
            font-size: 18px;
            color: #ffffff;
            padding-left: 100%;
        }
        @keyframes marquee {
            0% { transform: translateX(0); }
            10% { transform: translateX(-50px); }
            90% { transform: translateX(calc(-100% + 50px)); }
            100% { transform: translateX(-100%); }
        }
        .custom-span {
            display: inline-block;
            font-size: 18px;
            line-height: 30px;
            margin: 1px 20px 5px 17px;
            padding: 0;
            vertical-align: middle;
        }

        /* Table */
        .table-container {
            padding-top: calc(3.25rem + 30px);
            padding-bottom: 2px;
        }
        .custom-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            border: 1px solid #eedca6;
            max-width: 700px;
        }
        .custom-table thead th {
            position: sticky;
            height: 45px;
            top: calc(3.5rem + 40px);
            z-index: 998;
            background: url('/images/background_mable-1.jpg') center center / cover no-repeat !important;
            color: #cea71bff !important;
            text-shadow: 0 0 10px rgba(240, 196, 32, 0.4), 1px 1px 2px #000;
            font-weight: bold;
            border-bottom: 1px solid #444;
            border: 1px solid #eedca6 !important;
            text-align: center;
            vertical-align: middle;
            padding: 0;
            font-size: 0.9em;
        }
        .custom-table tbody tr {
            background-color: transparent;
            color: #ffffff;
            border: 1px solid #eedca6 !important;
        }
        .custom-table tbody tr:hover { background: rgba(255,255,255,0.06); }

        /* [수동조절 위치] 첫 번째 데이터 행이 상단(sticky 헤더/전광판)에 가려질 때 아래 값을 조절하세요 */
        /* 예: 2px~12px 사이로 조절 */
        .custom-table tbody tr:first-child td {
            padding-top: calc(0.44rem + 12px);
        }

        .custom-table td {
            border: 1px solid #eedca6 !important;
            text-align: center;
            vertical-align: middle;
            padding: 0.44rem 0;
            word-break: break-word;
            line-height: 1.1;
        }
        .name-link {
             font-size: 1.1rem; font-weight: 600; color: #ffffff !important; text-decoration: none !important;
        }
        .name-link:hover { color: #ffffff !important; text-decoration: none !important; }
        
        .sms-icon { cursor: pointer; transition: transform 0.2s; }
        .sms-icon:hover { transform: scale(1.15); }

        .max-small {
            width: 1.15rem;
            height: 1.15rem;
        }

        /* Address Toggle Logic */
        .address-header { cursor: pointer; color: #cea71b !important; }
        .addr-visible { color: #cea71b !important; } 
        
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
            .header {
                max-width: 100%;
                width: 100vw;
                left: 0;
                right: 0;
                margin: 0;
                height: 60px;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                padding: 5px 10px;
            }

            .header-left { gap: 6px; }
            .date-text { font-size: 1.1rem; color: #f0c420; }
            .time-text { font-size: 1.1rem; }
            .user-info-box { font-size: 10px; padding: 2px 6px; }

            .wrap2 { top: 3.5rem; padding: 5px 42px 0 60px; height: 40px; }
            .cube-container { top: 50%; left: 1px; transform: translateY(-50%); }
            .wrap1 { width: 22px; height: 22px; }
            .cube { width: 22px; height: 22px; }
            .cube img { width: 22px; height: 22px; top: 0; left: 0; }
            .cube img:nth-child(1) { transform: translateZ(11px); }
            .cube img:nth-child(2) { transform: rotateX(90deg) translateZ(11px); }
            .cube img:nth-child(3) { transform: rotateX(180deg) translateZ(11px); }
            .cube img:nth-child(4) { transform: rotateX(270deg) translateZ(11px); }

            .custom-table thead th { font-size: 0.7em; color: #f0c420; }
            .custom-table td { font-size: 12px; padding: 0.32rem 0; }

            .custom-span { font-size: 14px; margin: 0 10px; line-height: 30px; }
            
            /* Column Widths Mobile */
            .col-no { width: 6%; }
            .col-name { width: 22%; }
            .col-tel { width: 47%; }
            .col-addr { width: 17%; }
            .col-remark { display: none; } /* Hide remark on mobile */
            .col-sms { width: 12%; }
            .hide-mobile { display: none; }
        }

        /* PC Column Widths */
        @media (min-width: 769px) {
             .col-no { width: 1.56rem; }
             .col-name { width: 6rem; }
             .col-tel { width: 10.5rem; white-space: nowrap; }
             .col-addr { width: 2.8rem; }
             .col-remark { width: 3.75rem; }
             .col-sms { width: 3.75rem; }
        }

        /* Phone cell specific style to prevent wrapping and ensure consistency */
        .member-tel-cell {
            white-space: nowrap;
            font-variant-numeric: tabular-nums; /* Ensures numbers are same width */
        }
      `}</style>

            <div
                id="loading-screen"
                style={{ opacity: isPageReady ? 0 : 1, pointerEvents: isPageReady ? 'none' : 'auto' }}
            >
                <img src="/images/clova.png" alt="loading" />
            </div>

            <div id="main-content">
                <div className="container">
                    {/* Header */}
                    <div className="header">
                        <div className="header-left">
                            <span className="date-text">{dateStr}</span>
                            <span className="time-text">{timeStr}</span>
                        </div>
                        <div className="header-right">
                            <div className="user-info-box">{userDisplayText}</div>
                        </div>
                    </div>

                    <div className="table-container">
                        <div className="wrap2">
                            <div className="cube-container">
                                <div className="wrap1">
                                    <div className="cube">
                                        <img src="/images/mail_1.png" alt="이메일" />
                                        <img src="/images/chat_1.png" alt="채팅" />
                                        <img src="/images/phone_1.png" alt="전화" />
                                        <img src="/images/sms_1.png" alt="문자" />
                                    </div>
                                </div>
                            </div>

                            <div className="marquee-container">
                                <div className="marquee">
                                    <img src="/images/aa.gif" width="25" height="25" alt="" />
                                    <img src="/images/dd.gif" width="25" height="25" alt="" />
                                    <span className="custom-span">직지초35회 김천지부 동기연락망</span>
                                    <img src="/images/dd.gif" width="25" height="25" alt="" />
                                    <img src="/images/aa.gif" width="25" height="25" alt="" />
                                </div>
                            </div>
                        </div>

                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th className="col-no"><span>NO</span></th>
                                    <th className="col-name"><span>이름</span></th>
                                    <th className="col-tel"><span>전화번호</span></th>
                                    <th className="col-addr address-header" onClick={handleToggleSecurity}>
                                        <span className="addr-visible">거주지</span>
                                    </th>
                                    <th className="col-remark hide-mobile"><span>비고</span></th>
                                    <th className="col-sms"><span>SMS</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member, index) => (
                                    <tr key={member._id}>
                                        <td className="no_1">{index + 1}</td>
                                        <td className="name_1">
                                            <a href={`tel:${member.tel}`} className="name-link">
                                                {member.name}
                                            </a>
                                        </td>
                                        <td className="tel_1 member-tel-cell">
                                            <a href={`tel:${member.tel}`} className="name-link">
                                                {member.tel}
                                            </a>
                                        </td>
                                        <td className="address_1">
                                            {['회장', '총무'].some(role => member.remark?.includes(role)) ? (
                                                <a
                                                    href={`sms:${members
                                                        .filter(m => m.tel && m.tel !== member.tel)
                                                        .map(m => m.tel.replace(/-/g, ''))
                                                        .join(',')}`}
                                                    style={{ color: '#ffffff', textDecoration: 'none', cursor: 'pointer', fontWeight: 700 }}
                                                    title="전체 회원에게 문자 보내기"
                                                >
                                                    {member.addr}
                                                </a>
                                            ) : (
                                                member.addr
                                            )}
                                        </td>
                                        <td className="remark_1 hide-mobile">{member.remark}</td>
                                        <td className="sms_1">
                                            <a href={`sms:${member.sms || member.tel}`}>
                                                <img
                                                    src="/images/sms-4.png"
                                                    alt="SMS"
                                                    className="max-small sms-icon"
                                                />
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
        </div>
    );
}
