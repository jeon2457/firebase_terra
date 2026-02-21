import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
    // GET 요청은 세션 없이도 허용
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const includeSystem = searchParams.get("includeSystem") === "1";

        const query = includeSystem
            ? {}
            : {
                name: { $ne: '공용계정' },
                tel: { $ne: '', $exists: true }
            };

        // 보안: 비밀번호 필드는 절대 반환하지 않음
        const members = await User.find(query).select("-password").sort({ name: 1 });
        return NextResponse.json({ success: true, data: members });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).user_level < 5) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        const data = await req.json();

        // Special logic from tel_input.php: auto-generate sms_2 for leaders
        let sms_2 = data.sms_2 || "";
        const isLeader = data.remark && (data.remark.includes("회장") || data.remark.includes("총무"));

        if (isLeader) {
            const allTels = await User.find({ tel: { $exists: true, $ne: "" } }).select("tel");
            sms_2 = allTels.map(u => u.tel).join(",");
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newMember = new User({
            ...data,
            password: hashedPassword,
            sms_2
        });

        await newMember.save();
        return NextResponse.json({ success: true, member: newMember });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).user_level < 5) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const data = await req.json();
        const { _id, password, ...updateData } = data;

        if (updateData.id) {
            const existing = await User.findOne({ id: updateData.id, _id: { $ne: _id } }).select("_id");
            if (existing) {
                return NextResponse.json({ success: false, message: "이미 사용중인 아이디입니다." }, { status: 409 });
            }
        }

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Handle sms_2 logic for updates
        let sms_2 = updateData.sms_2 || "";
        const isLeader = updateData.remark && (updateData.remark.includes("회장") || updateData.remark.includes("총무"));
        if (isLeader) {
            const allTels = await User.find({ tel: { $exists: true, $ne: "" } }).select("tel");
            sms_2 = allTels.map(u => u.tel).join(",");
            updateData.sms_2 = sms_2;
        }

        await User.findByIdAndUpdate(_id, updateData);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).user_level < 10) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    try {
        await dbConnect();
        await User.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
