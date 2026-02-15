import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import MonthlyFeeHistory from '@/models/MonthlyFeeHistory';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).user_level < 10) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { year, month, amount } = await req.json();

        // 기존 레코드 확인
        const existing = await MonthlyFeeHistory.findOne({
            apply_year: year,
            apply_month: month
        });

        if (existing) {
            existing.fee_amount = amount;
            await existing.save();
        } else {
            await MonthlyFeeHistory.create({
                apply_year: year,
                apply_month: month,
                fee_amount: amount
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating fee amount:', error);
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
    }
}