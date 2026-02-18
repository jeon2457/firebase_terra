import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const ALLOWED_THEMES = ["book", "icon", "glass", "list", "tech"] as const;
type ThemeValue = (typeof ALLOWED_THEMES)[number];

function isAllowedTheme(value: any): value is ThemeValue {
    return ALLOWED_THEMES.includes(value);
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    
    try {
        await dbConnect();

        const cookieTheme = req.cookies.get("user_site_theme")?.value;
        let theme: ThemeValue = "book";

        if (session) {
            const userId = (session.user as any).id as string;
            const userDoc = await User.findOne({ id: userId }).select("site_theme");
            const dbTheme = userDoc?.site_theme;
            if (isAllowedTheme(dbTheme)) {
                theme = dbTheme;
            } else if (isAllowedTheme(cookieTheme)) {
                theme = cookieTheme;
            }
        } else {
            // 세션이 없는 경우 (게스트 모드)
            if (isAllowedTheme(cookieTheme)) {
                theme = cookieTheme;
            }
        }

        const res = NextResponse.json({ success: true, theme });
        res.cookies.set("user_site_theme", theme, {
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
        });
        return res;
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).user_level < 10) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const theme = body?.theme;

        if (!isAllowedTheme(theme)) {
            return NextResponse.json({ success: false, message: "Invalid theme" }, { status: 400 });
        }

        await dbConnect();

        await User.updateMany({}, { $set: { site_theme: theme } });

        const res = NextResponse.json({ success: true, theme });
        res.cookies.set("user_site_theme", theme, {
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
        });
        return res;
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
