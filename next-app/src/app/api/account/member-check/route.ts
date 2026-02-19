import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb"; // 기존 DB 연결 함수 사용
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
    // 1. 보안 체크: 로그인한 사용자만 접근 가능
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const membersParam = searchParams.get('members');
        const yearParam = searchParams.get('year');

        // 파라미터 확인
        if (!membersParam) {
            return NextResponse.json({ success: false, message: "선택된 회원이 없습니다." });
        }

        const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
        
        // ID 유효성 검사 및 변환
        const idArr = membersParam.split(',');
        const objectIds: ObjectId[] = [];
        
        for (const id of idArr) {
            const trimmedId = id.trim();
            if (trimmedId.length === 24) { // MongoDB ObjectId 길이 체크
                try {
                    objectIds.push(new ObjectId(trimmedId));
                } catch (e) {
                    console.error("Invalid ID conversion:", trimmedId);
                }
            }
        }

        if (objectIds.length === 0) {
            return NextResponse.json({ success: false, message: "유효한 회원 ID가 없습니다." });
        }

        // DB 연결 (Mongoose 사용)
        await dbConnect();
        
        // Mongoose 연결 객체에서 Native MongoDB DB 객체 가져오기
        // 주의: mongoose.connection.db가 초기화될 때까지 기다려야 할 수도 있으나, await dbConnect() 이후엔 보통 사용 가능합니다.
        const db = mongoose.connection.db;

        if (!db) {
            throw new Error("Database connection failed");
        }

        // 2. 회원 정보 조회
        const members = await db.collection("members")
            .find({ _id: { $in: objectIds } })
            .sort({ name: 1 })
            .toArray();

        // 3. 월회비 이력 조회 (한 번에 조회하여 성능 최적화)
        const feeHistory = await db.collection("monthly_fee_history")
            .find({})
            .sort({ apply_year: 1, apply_month: 1 })
            .toArray();

        // 월별 회비 계산 (메모리 연산)
        const monthlyFees: { [key: number]: number } = {};
        for (let m = 1; m <= 12; m++) {
            let fee = 20000; // 기본값
            let found = null;
            
            // 해당 연/월에 적용되는 가장 마지막 설정값 찾기
            for (const h of feeHistory) {
                if (h.apply_year < year || (h.apply_year === year && h.apply_month <= m)) {
                    found = h;
                }
            }
            if (found) fee = found.fee_amount;
            monthlyFees[m] = fee;
        }

        // 4. 납부 내역 조회 (문자열 ID와 ObjectId 둘 다 조회)
        // 4-1. 문자열로 저장된 ID 조회
        const passDataString = await db.collection("account_pass")
            .find({
                member_id: { $in: objectIds.map(id => id.toString()) }, 
                pay_year: year
            })
            .toArray();
            
        // 4-2. ObjectId로 저장된 ID 조회
        const passDataObj = await db.collection("account_pass")
            .find({
                member_id: { $in: objectIds }, 
                pay_year: year
            })
            .toArray();

        // 두 결과 합치기
        const allPassData = [...passDataString, ...passDataObj];

        // 납부 내역 맵핑 (Map 구조로 변환)
        const passMap: any = {};
        allPassData.forEach((p: any) => {
            const mId = p.member_id.toString();
            if (!passMap[mId]) passMap[mId] = {};
            passMap[mId][p.pay_month] = p.paid;
        });

        // 5. 결과 반환
        return NextResponse.json({
            success: true,
            members: members.map(m => ({ _id: m._id.toString(), name: m.name })),
            passMap,
            monthlyFees
        });

    } catch (error) {
        console.error("Member Check API Error:", error);
        return NextResponse.json(
            { success: false, message: "서버 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}