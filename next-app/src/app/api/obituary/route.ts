import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function POST(request: NextRequest) {
    try {
        const obituaryData = await request.json();
        
        await client.connect();
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
    } finally {
        await client.close();
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        await client.connect();
        const database = client.db('vercel_mongodb');
        const collection = database.collection('obituaries');
        
        if (id) {
            const obituary = await collection.findOne({ _id: new (require('mongodb').ObjectId)(id) });
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
    } finally {
        await client.close();
    }
}
