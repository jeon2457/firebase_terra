"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AccountEditPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Auth check
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (!mounted) return <div className="p-5 text-center">Loading... (Client)</div>;
    if (status === "loading") return <div className="p-5 text-center">Loading... (Auth)</div>;

    if (session && (session.user as any).user_level < 5) {
        return <div className="p-5 text-center text-danger">권한이 없습니다.</div>;
    }

    return (
        <div className="container py-5">
            <h1>Account Edit Page - Minimal Test</h1>
            <p>If you see this, the layout execution is fine.</p>
            <button className="btn btn-primary" onClick={() => router.push("/dashboard")}>
                Dashboard
            </button>
        </div>
    );
}
