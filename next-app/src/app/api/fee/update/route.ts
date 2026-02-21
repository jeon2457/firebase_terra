import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import AccountPass from '@/models/AccountPass';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).user_level < 10) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { memberId, year, month, paid } = await req.json();

        // 기존 레코드 찾기 또는 생성
        const query = {
            member_id: new mongoose.Types.ObjectId(memberId),
            pay_year: year,
            pay_month: month
        };

        const existing = await AccountPass.findOne(query);

        if (existing) {
            // 업데이트
            existing.paid = paid;
            await existing.save();
        } else {
            // 새로 생성
            await AccountPass.create({
                ...query,
                paid: paid
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating fee status:', error);
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
    }
}
