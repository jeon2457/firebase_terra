"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function MembersSamplePage() {
    const router = useRouter();

    // Sample Data
    const members = [
        { id: 1, name: "강호동", tel: "010-0000-0001", addr: "서울", remark: "회장" },
        { id: 2, name: "고 수", tel: "010-0000-0002", addr: "경기", remark: "" },
        { id: 3, name: "공 유", tel: "010-0000-0003", addr: "부산", remark: "" },
        { id: 4, name: "김혜수", tel: "010-0000-0004", addr: "서울", remark: "" },
        { id: 5, name: "김희선", tel: "010-0000-0005", addr: "대구", remark: "" },
        { id: 6, name: "마동석", tel: "010-0000-0006", addr: "인천", remark: "" },
        { id: 7, name: "박보검", tel: "010-0000-0007", addr: "서울", remark: "" },
        { id: 8, name: "박서준", tel: "010-0000-0008", addr: "경기", remark: "" },
        { id: 9, name: "송강호", tel: "010-0000-0009", addr: "부산", remark: "" },
        { id: 10, name: "송중기", tel: "010-0000-0010", addr: "대전", remark: "" },
        { id: 11, name: "송혜교", tel: "010-0000-0011", addr: "대구", remark: "" },
        { id: 12, name: "아이유", tel: "010-0000-0012", addr: "서울", remark: "" },
        { id: 13, name: "유재석", tel: "010-0000-0013", addr: "서울", remark: "총무" },
        { id: 14, name: "이병헌", tel: "010-0000-0014", addr: "성남", remark: "" },
        { id: 15, name: "이영애", tel: "010-0000-0015", addr: "양평", remark: "" },
        { id: 16, name: "이정재", tel: "010-0000-0016", addr: "서울", remark: "" },
        { id: 17, name: "이효리", tel: "010-0000-0017", addr: "제주", remark: "" },
        { id: 18, name: "장동건", tel: "010-0000-0018", addr: "서울", remark: "" },
        { id: 19, name: "전지현", tel: "010-0000-0019", addr: "서울", remark: "" },
        { id: 20, name: "정우성", tel: "010-0000-0020", addr: "서울", remark: "" },
        { id: 21, name: "최민식", tel: "010-0000-0021", addr: "경기", remark: "" },
        { id: 22, name: "하정우", tel: "010-0000-0022", addr: "서울", remark: "" },
        { id: 23, name: "한석규", tel: "010-0000-0023", addr: "서울", remark: "" },
        { id: 24, name: "한효주", tel: "010-0000-0024", addr: "충북", remark: "" },
        { id: 25, name: "현 빈", tel: "010-0000-0025", addr: "서울", remark: "" },
    ];

    // SMS State
    const [isSmsActive, setIsSmsActive] = useState(false);

    // Clock State
    const [timeStr, setTimeStr] = useState("");
    const [dateStr, setDateStr] = useState("");

    // Animation State
    const [cubeDeg, setCubeDeg] = useState(0);
    const [isPageReady, setIsPageReady] = useState(false);

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
        }, 2000);
        return () => clearInterval(cubeTimer);
    }, []);

    // SMS Auto-Off Timer
    useEffect(() => {
        let autoOffTimer: any = null;
        if (isSmsActive) {
            autoOffTimer = setTimeout(() => {
                setIsSmsActive(false);
            }, 3 * 60 * 1000); // 3분
        }
        return () => {
            if (autoOffTimer) clearTimeout(autoOffTimer);
        };
    }, [isSmsActive]);

    useEffect(() => {
        const t = setTimeout(() => {
            setIsPageReady(true);
        }, 1000);
        return () => clearTimeout(t);
    }, []);

    const toggleSmsLinks = () => {
        setIsSmsActive(!isSmsActive);
    };

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
                    width: 200px;
                    height: auto;
                    max-width: 90vw;
                    border-radius: 15px;
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
                    box-sizing: border-box; 
                }

                .header-left { display: flex; align-items: center; gap: 10px; }
                .date-text { color: #cea71bff; font-size: 1.2rem; }
                .time-text { color: #4A9EFF; font-size: 1.2rem; line-height: 1.1; }
                .header-right { display: flex; align-items: center; gap: 10px; }
                .user-info-box {
                    font-size: 12px;
                    color: #E3EFFA !important;
                    background: #333;
                    padding: 4px 8px;
                    border-radius: 5px;
                    border: 1px solid #555;
                    white-space: nowrap;
                }
                .back-btn {
                    font-size: 11px;
                    color: #fff;
                    background: #4A9EFF;
                    padding: 4px 10px;
                    border-radius: 4px;
                    border: none;
                    cursor: pointer;
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
                    left: 12px;
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
                    font-size: 12px;
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
                    font-size: 12px;
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
                    margin: 0 auto; 
                }
                .custom-table thead th {
                    position: sticky;
                    top: calc(3.5rem + 39px);
                    z-index: 998;
                    background: url('/images/background_mable-1.jpg') center center / cover no-repeat !important;
                    color: #cea71bff !important;
                    text-shadow: 0 0 10px rgba(240, 196, 32, 0.4), 1px 1px 2px #000;
                    font-weight: bold;
                    border-bottom: 1px solid #444;
                    border: 1px solid #eedca6 !important;
                    text-align: center;
                    vertical-align: middle;
                    padding: 0.44rem 0;
                    font-size: 0.9em;
                }
                .custom-table tbody tr {
                    background-color: transparent;
                    color: #ffffff;
                    border: 1px solid #eedca6 !important;
                }
                .custom-table tbody tr:hover { background: rgba(255,255,255,0.06); }
                .custom-table td {
                    border: 1px solid #eedca6 !important;
                    text-align: center;
                    vertical-align: middle;
                    padding: 0.44rem 0;
                    word-break: break-all;
                    line-height: 1.1;
                    font-size: 0.9rem;
                }
                .custom-table tbody tr:first-child td {
                    padding-top: calc(0.44rem + 15px);
                }

                .name-link {
                    color: #ffffff !important; 
                    text-decoration: none !important;
                    display: block;
                    width: 100%;
                    text-align: center;
                }
                
                .sms-icon { cursor: pointer; transition: transform 0.2s; }
                .sms-icon:hover { transform: scale(1.15); }
                .max-small { width: 1.15rem; height: 1.15rem; }

                .toggle-header { cursor: pointer; color: ${isSmsActive ? "#ffffff" : "#cea71b"} !important; transition: color 0.3s ease; }
                .sms-link {
                    color: #ffffff !important;
                    text-decoration: none !important;
                    cursor: ${isSmsActive ? "pointer" : "default"} !important;
                    pointer-events: ${isSmsActive ? "auto" : "none"} !important;
                    font-weight: 700;
                }

                @media (max-width: 768px) {
                    .container { padding: 0 5px; }
                    .header { height: 60px; padding: 0 10px; }
                    .date-text, .time-text { font-size: 1rem; }
                    .wrap2 { top: 3.5rem; padding: 0 40px; }
                    .custom-table thead th { font-size: 0.8rem; }
                    .custom-table td { font-size: 0.8rem; padding: 0.3rem 0; }
                    .hide-mobile { display: none; }
                    .col-no { width: 10%; }
                    .col-name { width: 22%; }
                    .col-tel { width: 43%; }
                    .col-addr { width: 15%; }
                    .col-sms { width: 10%; }
                }

                /* Foot */
                .foot {
                    text-align: center;
                    padding: 20px 0;
                    font-size: 0.8rem;
                    color: #aaa;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `}</style>

            <div id="loading-screen" style={{ opacity: isPageReady ? 0 : 1, pointerEvents: isPageReady ? 'none' : 'auto' }}>
                <img src="/images/gughwak.jpg" alt="Loading" />
            </div>

            <div id="main-content">
                <div className="container">
                    <div className="header">
                        <div className="header-left">
                            <span className="date-text">{dateStr}</span>
                            <span className="time-text">{timeStr}</span>
                        </div>
                        <div className="header-right">
                            <div className="user-info-box">샘플 페이지</div>
                            <button className="back-btn" onClick={() => router.push('/dashboard')}>뒤로</button>
                        </div>
                    </div>

                    <div className="table-container">
                        <div className="wrap2">
                            <div className="cube-container">
                                <div className="wrap1">
                                    <div className="cube">
                                        <img src="/images/mail_1.png" alt="Email" />
                                        <img src="/images/chat_1.png" alt="Chat" />
                                        <img src="/images/phone_1.png" alt="Phone" />
                                        <img src="/images/sms_1.png" alt="SMS" />
                                    </div>
                                </div>
                            </div>
                            <div className="marquee-container">
                                <div className="marquee">
                                    <img src="/images/aa.gif" width="25" height="25" alt="" />
                                    <img src="/images/dd.gif" width="25" height="25" alt="" />
                                    <span className="custom-span">모임 연락망 테스트 중입니다. (샘플용)</span>
                                    <img src="/images/dd.gif" width="25" height="25" alt="" />
                                    <img src="/images/aa.gif" width="25" height="25" alt="" />
                                </div>
                            </div>
                        </div>

                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th className="col-no">NO</th>
                                    <th className="col-name">이름</th>
                                    <th className="col-tel">전화번호</th>
                                    <th className="col-addr toggle-header" onClick={toggleSmsLinks} title="클릭하여 문자발송 기능 ON/OFF">거주지</th>
                                    <th className="col-remark hide-mobile">비고</th>
                                    <th className="col-sms">SMS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member, index) => (
                                    <tr key={member.id}>
                                        <td>{member.id}</td>
                                        <td>
                                            <a href={`tel:${member.tel}`} className="name-link">{member.name}</a>
                                        </td>
                                        <td>
                                            <a href={`tel:${member.tel}`} className="name-link">{member.tel}</a>
                                        </td>
                                        <td>
                                            {member.remark === "회장" || member.remark === "총무" ? (
                                                <a
                                                    href={`sms:${members.filter(m => m.id !== member.id).map(m => m.tel.replace(/-/g, '')).join(',')}`}
                                                    className="sms-link"
                                                >
                                                    {member.addr}
                                                </a>
                                            ) : (
                                                <span>{member.addr}</span>
                                            )}
                                        </td>
                                        <td className="hide-mobile">{member.remark || "-"}</td>
                                        <td>
                                            <a href={`sms:${member.tel}`}>
                                                <img src="/images/sms-4.png" alt="SMS" className="max-small sms-icon" />
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={6}>
                                        <div className="foot">
                                            <img src="/images/anicircle03_green.gif" alt="" />&nbsp;&nbsp;
                                            <span>https://vercel-terraone.vercel.app/</span>&nbsp;
                                            <img src="/images/anicircle03_green.gif" alt="" />
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* 위로가기 버튼 */}
                <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 2000 }}>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        style={{
                            width: '40px', height: '40px', borderRadius: '50%', border: 'none',
                            background: 'rgba(74, 158, 255, 0.7)', color: '#fff', fontSize: '20px',
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
