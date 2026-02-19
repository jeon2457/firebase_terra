import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import AccountPass from "@/models/AccountPass";
import MonthlyFeeHistory from "@/models/MonthlyFeeHistory";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
    // 임시로 세션 체크 제거 (디버깅용)
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //     return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    // }

    try {
        const { searchParams } = new URL(req.url);
        const membersParam = searchParams.get('members');
        const yearParam = searchParams.get('year');

        // 강화된 디버깅 로그
        console.log('=== Member Check API Debug ===');
        console.log('Request URL:', req.url);
        console.log('Full searchParams:', Object.fromEntries(searchParams.entries()));
        console.log('membersParam:', membersParam);
        console.log('yearParam:', yearParam);
        console.log('membersParam type:', typeof membersParam);
        console.log('membersParam length:', membersParam?.length);

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

        // 2. 회원 정보 조회 (User 모델 사용 - tel 필드가 있음)
        console.log('🔍 Fetching members from User model...');
        
        // 먼저 User 컬렉션에서 직접 tel 필드 확인
        const userCheck = await User.find({ _id: { $in: objectIds } }).select('name tel').limit(3);
        console.log('📋 User collection sample (name, tel):', userCheck);
        
        const members = await User.find({ _id: { $in: objectIds } }).sort({ name: 1 });
        console.log('✅ Found members:', members.length);
        
        // 전화번호 필드 확인을 위한 디버깅
        members.forEach((member, index) => {
            console.log(`Member ${index + 1}:`, {
                _id: member._id.toString(),
                name: member.name,
                tel: member.tel,
                hasTelField: 'tel' in member,
                telType: typeof member.tel,
                allKeys: Object.keys(member.toObject())
            });
        });
        
        // Member 컬렉션에서도 확인
        const memberCheck = await Member.find({ _id: { $in: objectIds } });
        console.log('📋 Member collection sample:', memberCheck);

        // 3. 월회비 이력 조회 (Mongoose 모델 사용)
        console.log('🔍 Fetching fee history...');
        const feeHistory = await MonthlyFeeHistory.find({}).sort({ apply_year: 1, apply_month: 1 });
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

        // 4. 납부 내역 조회 (Mongoose 모델 사용)
        console.log('🔍 Fetching pass data...');
        console.log('Looking for member IDs:', objectIds);
        console.log('For year:', year);
        
        const passRecords = await AccountPass.find({ 
            member_id: { $in: objectIds }, 
            pay_year: year 
        });
        
        console.log('✅ Pass records found:', passRecords.length);
        console.log('Sample pass data:', passRecords.slice(0, 3));

        // passMap 생성 (fee/status API와 동일한 방식)
        const passMap: any = {};
        passRecords.forEach((record: any) => {
            const memberId = record.member_id.toString();
            if (!passMap[memberId]) {
                passMap[memberId] = {};
            }
            passMap[memberId][record.pay_month] = record.paid;
            console.log(`Mapping: ${memberId} -> month ${record.pay_month} -> paid ${record.paid}`);
        });
        
        console.log('✅ Pass map created:', passMap);

        // 5. 결과 반환
        const result = {
            success: true,
            members: members.map(m => ({ 
                _id: m._id.toString(), 
                name: m.name,
                tel: m.tel || ''
            })),
            passMap,
            monthlyFees
        };
        
        console.log('✅ Final result members with phone numbers:');
        result.members.forEach((member, index) => {
            console.log(`Member ${index + 1}: ID=${member._id}, Name=${member.name}, Tel=${member.tel}`);
        });
        
        return NextResponse.json(result);

    } catch (error) {
        console.error("❌ Member Check API Error:", error);
        return NextResponse.json(
            { success: false, message: "서버 오류가 발생했습니다.", error: String(error) },
            { status: 500 }
        );
    }
}