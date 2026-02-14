"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MemberEditPlaceholder() {
    return (
        <div className="container py-5 text-center">
            <div className="alert alert-warning shadow-sm p-5">
                <h2 className="mb-4">🛠 회원 편집 페이지</h2>
                <p className="lead">이 페이지는 현재 개발 중입니다.</p>
                <p>기존 <code>tel_edit.php</code>의 기능을 이곳에 구현할 예정입니다.</p>
                <Link href="/members" className="btn btn-primary mt-3">
                    <ArrowLeft size={18} className="me-2" /> 돌아가기
                </Link>
            </div>
        </div>
    );
}
