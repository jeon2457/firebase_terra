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

// 투표 데이터 초기화 (테스트용)
async function initializePolls() {
    const client = await getClient();
    const database = client.db('vercel_mongodb');
    const pollsCollection = database.collection('polls');
    const optionsCollection = database.collection('poll_options');

    // 기존 데이터 확인
    const existingPolls = await pollsCollection.countDocuments();
    if (existingPolls === 0) {
        // 투표 주제 생성
        const poll1Result = await pollsCollection.insertOne({
            id: 1,
            title: 'Q1. 언제가 가장 좋을까요?',
            createdAt: new Date(),
            endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10일 후
        });

        const poll2Result = await pollsCollection.insertOne({
            id: 2,
            title: 'Q2. 어디로 갈까요?',
            createdAt: new Date(),
            endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10일 후
        });

        // 투표 옵션 생성
        await optionsCollection.insertMany([
            { poll_id: 1, option_text: '2월 (겨울의 끝자락)', votes: 0 },
            { poll_id: 1, option_text: '3월 (봄의 시작)', votes: 0 },
            { poll_id: 1, option_text: '4월 (따뜻한 봄)', votes: 0 },
            { poll_id: 2, option_text: '⛰️ 금오산', votes: 0 },
            { poll_id: 2, option_text: '⛰️ 팔공산', votes: 0 },
            { poll_id: 2, option_text: '⛰️ 황악산', votes: 0 },
        ]);
    }
}

// GET: 투표 데이터 및 결과 가져오기
export async function GET(request: NextRequest) {
    let client: MongoClient | null = null;
    try {
        client = await getClient();
        const database = client.db('vercel_mongodb');
        
        // 투표 초기화 (첫 실행 시)
        await initializePolls();
        
        const pollsCollection = database.collection('polls');
        const optionsCollection = database.collection('poll_options');
        const membersCollection = database.collection('members');

        // 전체 회원수
        const totalMembers = await membersCollection.countDocuments();

        // 투표 데이터 가져오기
        const polls = await pollsCollection.find({}).sort({ id: 1 }).toArray();
        
        const processedPolls = [];
        for (const poll of polls) {
            const options = await optionsCollection.find({ poll_id: poll.id }).toArray();
            
            let totalVotes = 0;
            options.forEach(opt => {
                totalVotes += opt.votes || 0;
            });

            processedPolls.push({
                id: poll.id,
                title: poll.title,
                endDate: poll.endDate,
                totalVotes,
                options: options.map(opt => ({
                    _id: opt._id,
                    optionText: opt.option_text,
                    votes: opt.votes || 0
                }))
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                polls: processedPolls,
                totalMembers,
                majorityLimit: Math.floor(totalMembers / 2)
            }
        });
    } catch (error) {
        console.error('투표 조회 오류:', error);
        return NextResponse.json({
            success: false,
            error: '투표 조회에 실패했습니다.'
        }, { status: 500 });
    }
}

// POST: 투표하기
export async function POST(request: NextRequest) {
    let client: MongoClient | null = null;
    try {
        const body = await request.json();
        const { dateOptionId, placeOptionId, memberId } = body;

        client = await getClient();
        const database = client.db('vercel_mongodb');
        const votesCollection = database.collection('poll_votes');
        const optionsCollection = database.collection('poll_options');

        // 이미 투표했는지 확인
        const existingVote = await votesCollection.findOne({ memberId });
        if (existingVote) {
            return NextResponse.json({
                success: false,
                error: '이미 투표하셨습니다.'
            }, { status: 400 });
        }

        // 투표 기록 저장
        await votesCollection.insertOne({
            memberId,
            dateOptionId: new ObjectId(dateOptionId),
            placeOptionId: new ObjectId(placeOptionId),
            votedAt: new Date()
        });

        // 각 옵션의 투표수 증가
        if (dateOptionId) {
            await optionsCollection.updateOne(
                { _id: new ObjectId(dateOptionId) },
                { $inc: { votes: 1 } }
            );
        }

        if (placeOptionId) {
            await optionsCollection.updateOne(
                { _id: new ObjectId(placeOptionId) },
                { $inc: { votes: 1 } }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('투표 처리 오류:', error);
        return NextResponse.json({
            success: false,
            error: '투표 처리에 실패했습니다.'
        }, { status: 500 });
    }
}
