"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardContent from "../DashboardContent";

type ThemeValue = "book" | "icon" | "glass" | "list" | "tech";

export default function DashboardTechPage() {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        const ensureTheme = async () => {
            if (status !== "authenticated") return;
            const res = await fetch("/api/theme");
            const data = await res.json();
            const theme = data?.theme as ThemeValue | undefined;
            if (theme && theme !== "tech") {
                router.replace(theme === "book" ? "/dashboard" : `/dashboard/${theme}`);
            }
        };
        ensureTheme().catch(() => {
            // ignore
        });
    }, [status, router]);

    return <DashboardContent themeLabel="tech" />;
}
