"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import "bootstrap/dist/css/bootstrap.min.css";
import DashboardContent from "./DashboardContent";

type ThemeValue = "book" | "icon" | "glass" | "list" | "tech";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [currentTheme, setCurrentTheme] = useState<ThemeValue | null>(null);
    const [isLoadingTheme, setIsLoadingTheme] = useState(true);

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
                } else {
                    setCurrentTheme("book");
                    setIsLoadingTheme(false);
                }
            } catch {
                setCurrentTheme("book");
                setIsLoadingTheme(false);
            }
        };
        routeByTheme();
    }, [status, router]);

    if (isLoadingTheme || status === "loading") {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return <DashboardContent theme={currentTheme || "book"} />;
}
