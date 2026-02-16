import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).user_level < 5) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        
        // 모든 컬렉션 데이터 가져오기
        const users = await User.find({}).lean();
        
        const backupData = {
            timestamp: new Date().toISOString(),
            collections: {
                members: users
            }
        };
        
        return NextResponse.json({ 
            success: true, 
            data: backupData 
        });
    } catch (error) {
        console.error('백업 오류:', error);
        return NextResponse.json({ 
            success: false, 
            error: '백업에 실패했습니다.' 
        }, { status: 500 });
    }
}
