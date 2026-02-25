"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function MembersSampleMp4Page() {
    const router = useRouter();

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

    useEffect(() => {
        const t = setTimeout(() => {
            setIsPageReady(true);
        }, 1000);
        return () => clearTimeout(t);
    }, []);

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

                /* Content Wall */
                .content-wall {
                    padding-top: calc(3.25rem + 30px);
                    padding-bottom: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .video-card {
                    width: 100%;
                    background: rgba(0, 0, 0, 0.4);
                    border: 1px solid #eedca6;
                    border-radius: 12px;
                    overflow: hidden;
                    margin-top: 20px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(4px);
                }

                .video-container {
                    width: 100%;
                    aspect-ratio: 16 / 9;
                    background: #000;
                }

                video {
                    width: 100%;
                    height: 100%;
                }

                .download-section {
                    padding: 24px;
                    text-align: center;
                }

                .btn-download {
                    display: inline-block;
                    padding: 14px 28px;
                    background: linear-gradient(135deg, #4A9EFF 0%, #2D5CFE 100%);
                    color: white;
                    text-decoration: none;
                    font-weight: bold;
                    border-radius: 30px;
                    box-shadow: 0 4px 15px rgba(74, 158, 255, 0.4);
                    transition: transform 0.2s, box-shadow 0.2s;
                    border: none;
                    cursor: pointer;
                    font-size: 1rem;
                }

                .btn-download:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(74, 158, 255, 0.6);
                    color: #fff !important;
                }

                .btn-download i {
                    margin-right: 8px;
                }

                @media (max-width: 768px) {
                    .container { padding: 0 10px; }
                    .header { height: 60px; padding: 0 10px; }
                    .date-text, .time-text { font-size: 1rem; }
                    .wrap2 { top: 3.5rem; }
                    .custom-span { font-size: 14px; }
                    .btn-download { width: 100%; box-sizing: border-box; }
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
                    gap: 10px;
                }
            `}</style>

            <div id="main-content" style={{ display: isPageReady ? "block" : "none" }}>
                <div className="container">
                    {/* Header */}
                    <div className="header">
                        <div className="header-left">
                            <span className="date-text">{dateStr}</span>
                            <span className="time-text">{timeStr}</span>
                        </div>
                        <div className="header-right">
                            <button className="back-btn" onClick={() => router.push('/dashboard')}>뒤로</button>
                        </div>
                    </div>

                    <div className="content-wall">
                        {/* Marquee Navigation Mockup */}
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
                                    <span className="custom-span">🎬 샘플 동영상 확인 (MP4 테스트)</span>
                                    <img src="/images/dd.gif" width="25" height="25" alt="" />
                                    <img src="/images/aa.gif" width="25" height="25" alt="" />
                                </div>
                            </div>
                        </div>

                        {/* Video Card */}
                        <div className="video-card">
                            <div className="video-container">
                                <video controls autoPlay muted playsInline>
                                    <source src="/movie/tel_view_sample.mp4" type="video/mp4" />
                                    브라우저가 비디오 태그를 지원하지 않습니다.
                                </video>
                            </div>
                            <div className="download-section">
                                <div style={{ marginTop: '15px', color: '#4A9EFF', fontSize: '0.85rem' }}>
                                    <span style={{ color: '#FF0000' }}>☞</span> 위 <i className="bi bi-arrows-fullscreen" style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '1.1em', verticalAlign: 'middle' }}></i>를 클릭하면 동영상을 전체화면으로 볼수있습니다.(동영상부분을 터치)
                                </div><br />
                                <a href="/movie/tel_view_sample.mp4" download className="btn-download">
                                    <i className="bi bi-download"></i> 동영상 다운로드 받기
                                </a>
                                <div style={{ marginTop: '15px', color: '#888', fontSize: '0.85rem' }}>
                                    동영상이 재생되지 않을 경우 다운로드하여 확인해 주세요.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="foot">
                        <img src="/images/anicircle03_green.gif" alt="" />
                        <span>Next.js Premium Video Sample</span>
                        <img src="/images/anicircle03_green.gif" alt="" />
                    </div>
                </div>
            </div>
        </div>
    );
}
