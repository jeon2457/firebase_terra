"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function InvitationPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <div className="container mt-5 text-center">
            <h2>경조사 문자메세지 보내기</h2>
            <p className="mt-4">이 기능은 아직 개발 중입니다.</p>
            <button 
                className="btn btn-secondary mt-4"
                onClick={() => router.push('/activities')}
            >
                ⏪ 돌아가기
            </button>
        </div>
    );
}