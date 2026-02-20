import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

// MongoDB 연결 캐시
let cachedClient: MongoClient | null = null;

async function getClient() {
    if (cachedClient) {
        return cachedClient;
    }
    const uri = process.env.MONGODB_URI!;
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
    return cachedClient;
}

export async function POST(request: NextRequest) {
    let client: MongoClient | null = null;
    try {
        const obituaryData = await request.json();
        
        client = await getClient();
        const database = client.db('vercel_mongodb');
        const collection = database.collection('obituaries');
        
        const result = await collection.insertOne({
            ...obituaryData,
            createdAt: new Date()
        });
        
        return NextResponse.json({ 
            success: true, 
            id: result.insertedId.toString() 
        });
    } catch (error) {
        console.error('MongoDB 저장 오류:', error);
        return NextResponse.json({ 
            success: false, 
            error: '부고장 저장에 실패했습니다.' 
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    let client: MongoClient | null = null;
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        client = await getClient();
        const database = client.db('vercel_mongodb');
        const collection = database.collection('obituaries');
        
        if (id) {
            const obituary = await collection.findOne({ _id: new ObjectId(id) });
            if (!obituary) {
                return NextResponse.json({ error: '부고장을 찾을 수 없습니다.' }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: obituary });
        } else {
            const obituaries = await collection.find({}).sort({ createdAt: -1 }).toArray();
            return NextResponse.json({ success: true, data: obituaries });
        }
    } catch (error) {
        console.error('MongoDB 조회 오류:', error);
        return NextResponse.json({ 
            success: false, 
            error: '부고장 조회에 실패했습니다.' 
        }, { status: 500 });
    }
}
