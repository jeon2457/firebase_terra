import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Image from "@/models/Image";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: NextRequest) {
    // GET 요청은 세션 없이도 허용

    const searchParams = req.nextUrl.searchParams;
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    try {
        await dbConnect();
        let query = {};
        if (year && month) {
            const monthStr = month.padStart(2, '0');
            query = { date: { $regex: `^${year}-${monthStr}` } };
        }

        const images = await Image.find(query).sort({ date: -1 });
        return NextResponse.json({ success: true, images });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).user_level < 5) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    try {
        await dbConnect();
        const { url, notice } = await req.json();

        // 한국 시간으로 변환
        const now = new Date();
        const koreaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
        const datetime = koreaTime.toISOString().replace('T', ' ').substring(0, 19);

        const newImage = new Image({
            url,
            notice,
            date: datetime
        });
        await newImage.save();
        return NextResponse.json({ success: true, image: newImage });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}


export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).user_level < 5) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        const { id, notice } = await req.json();
        await Image.findByIdAndUpdate(id, { notice });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).user_level < 5) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const id = req.nextUrl.searchParams.get('id');
        const publicId = req.nextUrl.searchParams.get('public_id');

        await dbConnect();

        // Delete from MongoDB
        if (id) {
            await Image.findByIdAndDelete(id);
        }

        // Optionally delete from Cloudinary if publicId is provided
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
