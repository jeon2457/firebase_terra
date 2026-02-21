import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Member from '@/models/Member';
import AccountPass from '@/models/AccountPass';
import MonthlyFeeHistory from '@/models/MonthlyFeeHistory';

export async function GET(req: NextRequest) {
    // GET 요청은 세션 없이도 허용

    const searchParams = req.nextUrl.searchParams;
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    try {
        await dbConnect();

        // 1. 회원 목록 조회 (공용계정 제외)
        const members = await Member.find({ name: { $ne: '공용계정' } }).sort({ name: 1 });

        // 2. 해당 연도의 모든 납부 현황 조회
        const passRecords = await AccountPass.find({ pay_year: year });

        // passMap 생성 (member_id -> { month -> paid })
        const passMap: any = {};
        passRecords.forEach((record: any) => {
            const memberId = record.member_id.toString();
            if (!passMap[memberId]) {
                passMap[memberId] = {};
            }
            passMap[memberId][record.pay_month] = record.paid;
        });

        // 3. 현재 월회비 조회
        const currentFee = await MonthlyFeeHistory.findOne().sort({ apply_year: -1, apply_month: -1 });
        const currentMonthFee = currentFee?.fee_amount || 20000;
        const lastApplyYear = currentFee?.apply_year || new Date().getFullYear();
        const lastApplyMonth = currentFee?.apply_month || 1;

        // 4. 월별 회비 내역 조회 (1~12월)
        const monthlyFees: any = {};
        for (let m = 1; m <= 12; m++) {
            const fee = await MonthlyFeeHistory.findOne({
                $or: [
                    { apply_year: { $lt: year } },
                    { apply_year: year, apply_month: { $lte: m } }
                ]
            }).sort({ apply_year: -1, apply_month: -1 });
            monthlyFees[m] = fee?.fee_amount || 20000;
        }

        // 회원 데이터를 안전하게 변환하여 _id를 문자열로 변환
        const safeMembers = members.map((member: any) => ({
            ...member.toObject(),
            _id: member._id.toString()
        }));

        return NextResponse.json({
            success: true,
            members: safeMembers,
            passMap,
            currentMonthFee,
            lastApplyYear,
            lastApplyMonth,
            monthlyFees
        });
    } catch (error) {
        console.error('Error fetching fee status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}