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

    // 전화번호 형식 통일 함수
    const formatPhoneNumber = (phone: string) => {
        if (!phone) return '';
        
        // 숫자만 추출
        const numbers = phone.replace(/[^0-9]/g, '');
        
        // 형식에 맞게 하이픈 추가
        if (numbers.length === 11) {
            // 010-1234-5678
            return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
        } else if (numbers.length === 10) {
            // 02-123-4567 or 010-123-4567
            if (numbers.startsWith('02')) {
                return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5)}`;
            } else {
                return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
            }
        } else if (numbers.length === 9) {
            // 02-12-3456
            return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5)}`;
        }
        
        return numbers; // 형식에 맞지 않으면 숫자만 반환
    };

    // 이름 표준화 함수 - 동일한 너비를 위해 공백 패딩 추가
    const formatName = (name: string) => {
        if (!name) return '';
        
        // 이름 길이를 6자로 통일 (한글 기준)
        const targetLength = 6;
        const currentLength = name.length;
        
        if (currentLength < targetLength) {
            // 부족한 길이만큼 공백 추가 (양쪽에 균등하게)
            const leftSpaces = Math.floor((targetLength - currentLength) / 2);
            const rightSpaces = targetLength - currentLength - leftSpaces;
            return '　'.repeat(leftSpaces) + name + '　'.repeat(rightSpaces);
        }
        
        return name; // 6자 이상이면 그대로 반환
    };

    const fetchMembers = async () => {
        try {
            const res = await axios.get("/api/members");
            if (res.data.success) {
                // Filter out specific system/public accounts and format phone numbers and names
                const filteredMembers = res.data.data
                    .filter((m: any) => m.name !== '공용계정' && m.id !== 'jikji35')
                    .map((m: any) => ({
                        ...m,
                        tel: formatPhoneNumber(m.tel),
                        name: formatName(m.name)
                    }));
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
        #loading-screen video {
            width: 200px;
            height: 200px;
            max-width: 90vw;
            max-height: 90vh;
            object-fit: contain;
        }

        @media (max-width: 768px) {
            #loading-screen video {
                width: 150px;
                height: 150px;
            }
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
            top: calc(3.5rem + 39px); /* 1px 위로 이동 */
            z-index: 998;
            background: url('/images/background_mable-1.jpg') center center / cover no-repeat !important;
            color: #cea71bff !important;
            text-shadow: 0 0 10px rgba(240, 196, 32, 0.4), 1px 1px 2px #000;
            font-weight: bold;
            border-bottom: 1px solid #444;
            border: 1px solid #eedca6 !important;
            text-align: center;
            vertical-align: middle;
            padding: 0.44rem 0; /* 데이터 행과 동일한 높이로 조정 */
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
             font-family: 'Courier New', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important; /* 이름도 고정폭 폰트로 통일 */
             letter-spacing: 0.5px; /* 글자 간격 통일 */
             display: inline-block; /* 블록 요소로 만들어 폭 일정하게 */
             width: 100%; /* 전체 너비 사용 */
             text-align: center; /* 중앙 정렬 */
        }
        .name-link:hover { color: #ffffff !important; text-decoration: none !important; }
        
        /* 이름 셀 스타일 추가 */
        .name_1 {
            text-align: center;
            padding: 0.32rem 0;
            font-size: 13px !important;
            font-family: 'Courier New', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
        }
        
        /* 전화번호 셀 스타일 추가 */
        .tel_1 {
            text-align: center;
            padding: 0.32rem 0;
            font-size: 13px !important;
            font-family: 'Courier New', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
        }
        
        .name-link {
            font-size: 13px !important;
            font-family: 'Courier New', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
            color: #ffffff !important;
            text-decoration: none !important;
            display: block;
            text-align: center;
        }
        
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

            .custom-table thead th { color: #f0c420; } /* font-size removed */
            .custom-table td { font-size: 12px; padding: 0.32rem 0; }

    .wrap2 { top: 3.5rem; padding: 5px 42px 0 60px; height: 40px; }
    .cube-container { top: 50%; left: 1px; transform: translateY(-50%); }
    .wrap1 { width: 22px; height: 22px; }
    .cube { width: 22px; height: 22px; }
    .cube img { width: 22px; height: 22px; top: 0; left: 0; }
    .cube img:nth-child(1) { transform: translateZ(11px); }
    .cube img:nth-child(2) { transform: rotateX(90deg) translateZ(11px); }
    .cube img:nth-child(3) { transform: rotateX(180deg) translateZ(11px); }
    .cube img:nth-child(4) { transform: rotateX(270deg) translateZ(11px); }

    .custom-table thead th { color: #f0c420; } /* font-size removed */
    .custom-table td { font-size: 12px; padding: 0.32rem 0; }

    .custom-span { font-size: 14px; margin: 0 10px; line-height: 30px; }
            
    /* 테이블 제목 너비폭 비율 및 폰트크기  */
    .col-no { width: 6%; font-size: 11px !important; } /* NO */
    .col-name { width: 22%; font-size: 13px !important; text-align: center; } /* 이름 - 폰트 크기 통일, 중앙 정렬 */
    .col-tel { width: 47%; font-size: 13px !important; text-align: center; } /* 전화번호 - 폰트 크기 통일, 중앙 정렬 */
    .col-addr { width: 17%; font-size: 13px !important; } /* 거주지 */
    .col-remark { display: none; } /* Hide remark on mobile */
    .col-sms { width: 8%; font-size: 13px !important; text-align: center; } /* SMS - 너비 축소, 중앙 정렬 */
    .hide-mobile { display: none; }
}

/* PC Column Widths */
@media (min-width: 769px) {
     .col-no { width: 1.56rem; }
     .col-name { width: 6rem; min-width: 80px; } /* 이름 - 고정 너비 유지 */
     .col-tel { width: 10.5rem; white-space: nowrap; min-width: 140px; } /* 고정 너비 유지 */
     .col-addr { width: 2.8rem; }
     .col-remark { width: 3.75rem; }
     .col-sms { width: 3.75rem; }
}
             .col-no { width: 1.56rem; }
             .col-name { width: 6rem; min-width: 80px; } /* 이름 - 고정 너비 유지 */
             .col-tel { width: 10.5rem; white-space: nowrap; min-width: 140px; } /* 고정 너비 유지 */
             .col-addr { width: 2.8rem; }
             .col-remark { width: 3.75rem; }
             .col-sms { width: 3.75rem; }
        }

        /* Phone cell specific style to prevent wrapping and ensure consistency */
        .member-tel-cell {
            white-space: nowrap;
            font-variant-numeric: tabular-nums; /* Ensures numbers are same width */
            font-family: 'Courier New', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important; /* 고정폭 폰트로 숫자 너비 통일 */
            letter-spacing: 0.5px; /* 숫자 사이 간격 통일 */
            text-align: center; /* 중앙 정렬 */
            display: block; /* 블록 요소로 만들어 폭 일정하게 */
            margin: 0 auto; /* 중앙 정렬 */
        }
        
        .tel_1 a {
            font-family: 'Courier New', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
            letter-spacing: 0.5px;
            text-align: center;
            display: inline-block;
            width: 100%;
            font-weight: 500 !important; /* 폰트 두께 통일 */
        }
        
        /* 전화번호 링크에 대한 추가 스타일 - 폭 일정하게 유지 */
        .tel_1 .name-link {
            font-family: 'Courier New', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
            font-size: inherit !important; /* 부모 요소의 폰트 크기 상속 */
            line-height: 1.2 !important; /* 라인 높이 통일 */
        }

        /* SMS 아이콘 위치 수정 */
        .sms_1 {
            text-align: center;
            vertical-align: middle;
            padding: 2px;
        }
        .sms-icon {
            display: block;
            margin: 0 auto;
            max-width: 16px;
            max-height: 16px;
        }
        
        @media (max-width: 768px) {
            .sms_1 {
                width: 10% !important; /* SMS 열 너비 조정 */
                padding: 1px;
            }
            .sms-icon {
                max-width: 14px;
                max-height: 14px;
            }
        }
      `}</style>

            <div
                id="loading-screen"
                style={{ opacity: isPageReady ? 0 : 1, pointerEvents: isPageReady ? 'none' : 'auto' }}
            >
                <video src="/images/clova.mp4" autoPlay loop muted playsInline style={{ width: '200px', height: '200px' }} />
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
                                                userLevel >= 5 ? (
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
                                                    <span style={{ color: '#ffffff', textDecoration: 'none', cursor: 'default', fontWeight: 700 }}>
                                                        {member.addr}
                                                    </span>
                                                )
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
