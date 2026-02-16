"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import "bootstrap/dist/css/bootstrap.min.css";
import DashboardContent from "./DashboardContent";

type ThemeValue = "book" | "icon" | "glass" | "list" | "tech";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        const routeByTheme = async () => {
            if (status !== "authenticated") return;
            try {
                const res = await fetch("/api/theme", { method: "GET" });
                const data = await res.json();
                const theme = data?.theme as ThemeValue | undefined;
                if (theme && theme !== "book") {
                    router.replace(`/dashboard/${theme}`);
                }
            } catch {
                // ignore
            }
        };
        routeByTheme();
    }, [status, router]);

    return <DashboardContent />;
}
