import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import MapLocation from '@/models/MapLocation';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
};

export async function GET() {
  try {
    await connectDB();
    const data = await MapLocation.findById(1); // ID가 1인 데이터 조회

    if (data) {
      return NextResponse.json({ success: true, data });
    } else {
      return NextResponse.json({ success: false, message: '데이터 없음' });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}