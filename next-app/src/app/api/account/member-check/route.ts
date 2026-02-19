import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb"; // 기존 DB 연결 함수 사용
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
    // 1. 보안 체크: 로그인한 사용자만 접근 가능
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const membersParam = searchParams.get('members');
        const yearParam = searchParams.get('year');

        // 디버깅 로그 추가
        console.log('=== Member Check API Debug ===');
        console.log('Request URL:', req.url);
        console.log('membersParam:', membersParam);
        console.log('yearParam:', yearParam);

        // 파라미터 확인
        if (!membersParam) {
            console.log('❌ No members parameter');
            return NextResponse.json({ success: false, message: "선택된 회원이 없습니다." });
        }

        const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
        console.log('Parsed year:', year);
        
        // ID 유효성 검사 및 변환
        const idArr = membersParam.split(',');
        const objectIds: ObjectId[] = [];
        
        console.log('ID array before processing:', idArr);
        
        for (const id of idArr) {
            const trimmedId = id.trim();
            console.log('Processing ID:', trimmedId, 'Length:', trimmedId.length);
            if (trimmedId.length === 24) { // MongoDB ObjectId 길이 체크
                try {
                    objectIds.push(new ObjectId(trimmedId));
                    console.log('✅ Valid ObjectId:', trimmedId);
                } catch (e) {
                    console.error("❌ Invalid ID conversion:", trimmedId, e);
                }
            } else {
                console.log('❌ Invalid ID length:', trimmedId);
            }
        }

        console.log('Valid ObjectIds:', objectIds);

        if (objectIds.length === 0) {
            console.log('❌ No valid ObjectIds found');
            return NextResponse.json({ success: false, message: "유효한 회원 ID가 없습니다." });
        }

        // DB 연결 (Mongoose 사용)
        console.log('🔌 Connecting to database...');
        await dbConnect();
        console.log('✅ Database connected');
        
        // Mongoose 연결 객체에서 Native MongoDB DB 객체 가져오기
        const db = mongoose.connection.db;

        if (!db) {
            throw new Error("Database connection failed");
        }

        // 2. 회원 정보 조회
        console.log('🔍 Fetching members...');
        const members = await db.collection("members")
            .find({ _id: { $in: objectIds } })
            .sort({ name: 1 })
            .toArray();
        
        console.log('✅ Found members:', members.length, members);

        // 3. 월회비 이력 조회
        console.log('🔍 Fetching fee history...');
        const feeHistory = await db.collection("monthly_fee_history")
            .find({})
            .sort({ apply_year: 1, apply_month: 1 })
            .toArray();
        
        console.log('✅ Fee history count:', feeHistory.length);

        // 월별 회비 계산
        const monthlyFees: { [key: number]: number } = {};
        for (let m = 1; m <= 12; m++) {
            let fee = 20000;
            let found = null;
            
            for (const h of feeHistory) {
                if (h.apply_year < year || (h.apply_year === year && h.apply_month <= m)) {
                    found = h;
                }
            }
            if (found) fee = found.fee_amount;
            monthlyFees[m] = fee;
        }
        
        console.log('✅ Monthly fees calculated:', monthlyFees);

        // 4. 납부 내역 조회 - 다양한 방법으로 시도
        console.log('🔍 Fetching pass data...');
        console.log('Looking for member IDs (string):', objectIds.map(id => id.toString()));
        console.log('Looking for member IDs (ObjectId):', objectIds);
        console.log('For year:', year);
        
        // 먼저 해당 연도의 모든 데이터 구조 확인
        console.log('📊 Checking account_pass collection structure:');
        const allCollectionData = await db.collection("account_pass")
            .find({ pay_year: year })
            .limit(5)
            .toArray();
        console.log('Collection sample data:', allCollectionData);
        
        // 4-1. 문자열로 저장된 ID 조회
        const passDataString = await db.collection("account_pass")
            .find({
                member_id: { $in: objectIds.map(id => id.toString()) }, 
                pay_year: year
            })
            .toArray();
        
        console.log('✅ Pass data (string IDs):', passDataString.length);
        console.log('String ID sample data:', passDataString.slice(0, 2));
            
        // 4-2. ObjectId로 저장된 ID 조회
        const passDataObj = await db.collection("account_pass")
            .find({
                member_id: { $in: objectIds }, 
                pay_year: year
            })
            .toArray();
        
        console.log('✅ Pass data (ObjectIds):', passDataObj.length);
        console.log('ObjectId sample data:', passDataObj.slice(0, 2));

        // 4-3. 다른 필드명 시도 (member_id 대신 memberId)
        const passDataAlt = await db.collection("account_pass")
            .find({
                memberId: { $in: [...objectIds.map(id => id.toString()), ...objectIds] }, 
                pay_year: year
            })
            .toArray();
        
        console.log('✅ Pass data (memberId field):', passDataAlt.length);
        console.log('memberId field sample data:', passDataAlt.slice(0, 2));

        // 4-4. 해당 회원의 모든 납부 내역 조회 (연도 무시)
        const passDataAnyYear = await db.collection("account_pass")
            .find({
                $or: [
                    { member_id: { $in: objectIds } },
                    { member_id: { $in: objectIds.map(id => id.toString()) } },
                    { memberId: { $in: [...objectIds.map(id => id.toString()), ...objectIds] } }
                ]
            })
            .toArray();
        
        console.log('✅ Pass data (any year):', passDataAnyYear.length);
        console.log('Any year sample data:', passDataAnyYear.slice(0, 3));

        // 가장 관련성 높은 데이터 선택
        let allPassData = [...passDataString, ...passDataObj, ...passDataAlt];
        
        // 만약 해당 연도 데이터가 없다면 모든 연도 데이터에서 필터링
        if (allPassData.length === 0 && passDataAnyYear.length > 0) {
            console.log('🔄 Using cross-year data as fallback');
            allPassData = passDataAnyYear.filter(p => p.pay_year === year);
        }
        
        console.log('✅ Final pass data count:', allPassData.length);
        console.log('Final pass data:', allPassData);

        // 납부 내역 맵핑
        const passMap: any = {};
        allPassData.forEach((p: any) => {
            const mId = p.member_id?.toString() || p.memberId?.toString();
            if (mId) {
                if (!passMap[mId]) passMap[mId] = {};
                passMap[mId][p.pay_month] = p.paid;
                console.log(`Mapping: ${mId} -> month ${p.pay_month} -> paid ${p.paid}`);
            } else {
                console.log('⚠️ Invalid pass data entry:', p);
            }
        });
        
        console.log('✅ Pass map created:', passMap);

        // 5. 결과 반환
        const result = {
            success: true,
            members: members.map(m => ({ _id: m._id.toString(), name: m.name })),
            passMap,
            monthlyFees,
            debug: {
                objectIdCount: objectIds.length,
                stringIdsCount: passDataString.length,
                objectIdsCount: passDataObj.length,
                altFieldCount: passDataAlt.length,
                anyYearCount: passDataAnyYear.length,
                finalDataCount: allPassData.length,
                sampleCollectionData: allCollectionData.slice(0, 2),
                samplePassData: allPassData.slice(0, 3)
            }
        };
        
        console.log('✅ Final result:', result);
        return NextResponse.json(result);

    } catch (error) {
        console.error("❌ Member Check API Error:", error);
        return NextResponse.json(
            { success: false, message: "서버 오류가 발생했습니다.", error: String(error) },
            { status: 500 }
        );
    }
}