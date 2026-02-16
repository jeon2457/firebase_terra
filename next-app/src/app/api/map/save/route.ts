import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import MapLocation from '@/models/MapLocation';

// DB 연결 함수 (lib폴더에 있다면 import해서 쓰셔도 됩니다)
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
};

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { addr, road_address, lat, lng, notice } = body;

    if (!addr || !lat || !lng) {
      return NextResponse.json({ success: false, message: '필수 데이터 누락' }, { status: 400 });
    }

    // _id: 1인 문서를 찾아 업데이트 (없으면 생성 - upsert)
    await MapLocation.findOneAndUpdate(
      { _id: 1 },
      { 
        addr, 
        road_address, 
        lat, 
        lng, 
        notice, 
        updated_at: new Date() 
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}