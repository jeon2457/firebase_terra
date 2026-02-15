import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import MapLocation from '@/models/MapLocation';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).user_level < 10) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { addr, lat, lng, notice } = await req.json();

        const newLocation = new MapLocation({
            addr,
            lat,
            lng,
            notice
        });

        await newLocation.save();

        return NextResponse.json({ success: true, location: newLocation });
    } catch (error) {
        console.error('Map save error:', error);
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const locations = await MapLocation.find().sort({ createdAt: -1 }).limit(1);
        
        return NextResponse.json({ success: true, location: locations[0] || null });
    } catch (error) {
        console.error('Map get error:', error);
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
    }
}