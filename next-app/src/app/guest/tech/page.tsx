"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardContent from "@/app/dashboard/DashboardContent";

type ThemeValue = "book" | "icon" | "glass" | "list" | "tech";

export default function GuestTechPage() {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status !== "authenticated") return;
        const ensureTheme = async () => {
            const res = await fetch("/api/theme");
            const data = await res.json();
            const theme = data?.theme as ThemeValue | undefined;
            if (theme && theme !== "tech") {
                router.replace(theme === "book" ? "/guest" : `/guest/${theme}`);
            }
        };
        ensureTheme().catch(() => {
            // ignore
        });
    }, [status, router]);

    if (status === "loading") return <div className="text-center mt-5">Loading...</div>;
    if (status === "unauthenticated") {
        router.replace("/login");
        return null;
    }

    return <DashboardContent theme="tech" />;
}
