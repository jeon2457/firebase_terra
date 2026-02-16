import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import MapLocation from '@/models/MapLocation';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        console.log('Session:', session);
        
        if (!session) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        if ((session.user as any).user_level < 10) {
            return NextResponse.json({ success: false, message: 'Admin only' }, { status: 403 });
        }

        await dbConnect();

        const body = await req.json();
        console.log('Request body:', body);

        const { addr, lat, lng, notice } = body;

        if (!addr || lat === undefined || lng === undefined) {
            return NextResponse.json({ 
                success: false, 
                message: 'Missing required fields (addr, lat, lng)' 
            }, { status: 400 });
        }

        const newLocation = await MapLocation.create({
            addr,
            lat,
            lng,
            notice: notice || ''
        });

        console.log('Saved location:', newLocation);

        return NextResponse.json({ success: true, location: newLocation });
    } catch (error: any) {
        console.error('Map save error:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || 'Server Error' 
        }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();
        
        const locations = await MapLocation.find().sort({ createdAt: -1 }).limit(1);
        
        return NextResponse.json({ 
            success: true, 
            location: locations[0] || null 
        });
    } catch (error: any) {
        console.error('Map get error:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || 'Server Error' 
        }, { status: 500 });
    }
}