import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import AccountPass from '@/models/AccountPass';
import mongoose from 'mongoose';

export async function GET() {
    return NextResponse.json({ success: true, message: 'Fee update API is reachable' });
}

export async function POST(req: NextRequest) {
    console.log('Fee update POST request received');
    try {
        const session = await getServerSession(authOptions);
        console.log('Session check:', session ? 'User level ' + (session.user as any)?.user_level : 'No session');

        if (!session || (session.user as any).user_level < 10) {
            return NextResponse.json({ success: false, message: 'Unauthorized: Admin level required' }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();
        console.log('Request body:', body);
        const { memberId, year, month, paid } = body;

        if (!memberId || !year || !month) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        // Mongoose automatically casts string to ObjectId if specified in Schema
        const query = {
            member_id: memberId,
            pay_year: year,
            pay_month: month
        };

        const existing = await AccountPass.findOne(query);
        console.log('Existing record found:', existing ? 'Yes' : 'No');

        if (existing) {
            existing.paid = paid;
            await existing.save();
            console.log('Existing record updated');
        } else {
            await AccountPass.create({
                ...query,
                paid: paid
            });
            console.log('New record created');
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating fee status:', error);
        return NextResponse.json({ success: false, message: 'Server Error: ' + error.message }, { status: 500 });
    }
}
