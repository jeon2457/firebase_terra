import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import AccountPass from '@/models/AccountPass';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).user_level < 10) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { memberId, year, month, paid } = await req.json();

        // 기존 레코드 찾기 또는 생성
        const existing = await AccountPass.findOne({
            member_id: memberId,
            pay_year: year,
            pay_month: month
        });

        if (existing) {
            // 업데이트
            existing.paid = paid;
            await existing.save();
        } else {
            // 새로 생성
            await AccountPass.create({
                member_id: memberId,
                pay_year: year,
                pay_month: month,
                paid: paid
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating fee status:', error);
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
    }
}
