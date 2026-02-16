import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).user_level < 5) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        
        const { data } = await request.json();
        
        if (!data || !data.collections || !data.collections.members) {
            return NextResponse.json({ 
                success: false, 
                error: '잘못된 백업 파일 형식입니다.' 
            }, { status: 400 });
        }
        
        // 기존 데이터 삭제
        await User.deleteMany({});
        
        // 백업 데이터 복원
        const members = data.collections.members;
        if (Array.isArray(members) && members.length > 0) {
            await User.insertMany(members);
        }
        
        return NextResponse.json({ 
            success: true, 
            message: '데이터 복구가 완료되었습니다.' 
        });
    } catch (error) {
        console.error('복구 오류:', error);
        return NextResponse.json({ 
            success: false, 
            error: '복구에 실패했습니다.' 
        }, { status: 500 });
    }
}
