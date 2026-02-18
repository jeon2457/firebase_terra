import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Member from "@/models/Member";
import AccountPass from "@/models/AccountPass";
import MonthlyFeeHistory from "@/models/MonthlyFeeHistory";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const memberIds = searchParams.get('members');
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

        if (!memberIds) {
            return NextResponse.json({ success: false, message: "선택된 회원이 없습니다." });
        }

        // MongoDB ObjectId로 변환
        const idArr = memberIds.split(',');
        const objectIds = [];
        
        for (const id of idArr) {
            try {
                objectIds.push(new ObjectId(id.trim()));
            } catch (error) {
                console.error('Invalid ObjectId:', id);
            }
        }
        
        if (objectIds.length === 0) {
            return NextResponse.json({ success: false, message: "유효한 회원 ID가 없습니다." });
        }

        // 회원 정보 조회
        const members = await Member.find(
            { _id: { $in: objectIds } },
            { sort: { name: 1 } }
        );

        // 월별 회비 조회 함수
        async function getMonthlyFee(year: number, month: number) {
            const row = await MonthlyFeeHistory.findOne(
                {
                    $or: [
                        { apply_year: { $lt: year } },
                        { apply_year: year, apply_month: { $lte: month } }
                    ]
                },
                { sort: { apply_year: -1, apply_month: -1 } }
            );
            return row ? row.fee_amount : 20000;
        }

        // 납부 데이터 조회
        const passData = await AccountPass.find({
            member_id: { $in: objectIds },
            pay_year: year
        });
        
        const passMap: { [memberId: string]: { [month: number]: number } } = {};
        passData.forEach((p: any) => {
            const memberId = p.member_id.toString();
            const month = p.pay_month;
            passMap[memberId] = {
                ...passMap[memberId],
                [month]: p.paid
            };
        });

        // 월별 회비 데이터 생성
        const monthlyFees: { [month: number]: number } = {};
        for (let m = 1; m <= 12; m++) {
            monthlyFees[m] = await getMonthlyFee(year, m);
        }

        return NextResponse.json({
            success: true,
            members,
            passMap,
            monthlyFees
        });

    } catch (error) {
        console.error("Member check API error:", error);
        return NextResponse.json(
            { success: false, message: "서버 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
