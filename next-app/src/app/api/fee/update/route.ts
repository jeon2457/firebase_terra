import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import AccountPass from '@/models/AccountPass';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).user_level < 10) {
            return NextResponse.json({ success: false, message: 'Unauthorized: Admin level required' }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();
        const { memberId, year, month, paid } = body;

        if (!memberId || !year || !month) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        const query = {
            member_id: memberId,
            pay_year: year,
            pay_month: month
        };

        const existing = await AccountPass.findOne(query);

        if (existing) {
            existing.paid = paid;
            await existing.save();
        } else {
            await AccountPass.create({
                ...query,
                paid: paid
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating fee status:', error);
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
    }
}
