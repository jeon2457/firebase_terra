import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Income from '@/models/Income';
import Expense from '@/models/Expense';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const year = req.nextUrl.searchParams.get('year') || new Date().getFullYear().toString();

        await dbConnect();

        const query = { date: { $regex: `^${year}-` } };
        const income = await Income.find(query).sort({ date: 1 }).lean();
        const expense = await Expense.find(query).sort({ date: 1 }).lean();

        return NextResponse.json({
            success: true,
            income,
            expense
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).user_level < 5) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        const { date, time, type, category, description, amount } = await req.json();

        const datetime = `${date} ${time || '00:00'}:00`;
        const Model = type === '수입' ? Income : Expense;

        const newRecord = new Model({
            date: datetime,
            category,
            description,
            amount: Number(amount)
        });

        await newRecord.save();
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).user_level < 5) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        const { id, date, time, type, category, description, amount } = await req.json();

        const datetime = `${date} ${time || '00:00'}:00`;
        const Model = type === '수입' ? Income : Expense;

        await Model.findByIdAndUpdate(id, {
            date: datetime,
            category,
            description,
            amount: Number(amount),
            updated_at: new Date()
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).user_level < 5) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const id = req.nextUrl.searchParams.get('id');
        const type = req.nextUrl.searchParams.get('type');
        if (!id || !type) return NextResponse.json({ success: false }, { status: 400 });

        await dbConnect();
        const Model = type === '수입' ? Income : Expense;
        await Model.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}
