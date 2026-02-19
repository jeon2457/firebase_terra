import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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

        // 파라미터 확인
        if (!membersParam) {
            return NextResponse.json({ success: false, message: "선택된 회원이 없습니다." });
        }

        const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
        
        // ID 유효성 검사 및 변환
        const idArr = membersParam.split(',');
        const objectIds: ObjectId[] = [];
        
        for (const id of idArr) {
            const trimmedId = id.trim();
            if (trimmedId.length === 24) { // MongoDB ObjectId 길이 체크
                try {
                    objectIds.push(new ObjectId(trimmedId));
                } catch (e) {
                    console.error("Invalid ID conversion:", trimmedId);
                }
            }
        }

        if (objectIds.length === 0) {
            return NextResponse.json({ success: false, message: "유효한 회원 ID가 없습니다." });
        }

        // DB 연결 (Native Driver 사용)
        const client = await clientPromise;
        const db = client.db("terraone"); // DB 이름 (필요시 수정)

        // 2. 회원 정보 조회
        const members = await db.collection("members")
            .find({ _id: { $in: objectIds } })
            .sort({ name: 1 })
            .toArray();

        // 3. 월회비 이력 조회 (한 번에 조회하여 성능 최적화)
        const feeHistory = await db.collection("monthly_fee_history")
            .find({})
            .sort({ apply_year: 1, apply_month: 1 })
            .toArray();

        // 월별 회비 계산 (메모리 연산)
        const monthlyFees: { [key: number]: number } = {};
        for (let m = 1; m <= 12; m++) {
            let fee = 20000; // 기본값
            let found = null;
            
            // 해당 연/월에 적용되는 가장 마지막 설정값 찾기
            for (const h of feeHistory) {
                if (h.apply_year < year || (h.apply_year === year && h.apply_month <= m)) {
                    found = h;
                }
            }
            if (found) fee = found.fee_amount;
            monthlyFees[m] = fee;
        }

        // 4. 납부 내역 조회
        const passData = await db.collection("account_pass")
            .find({
                member_id: { $in: objectIds.map(id => id.toString()) }, // 문자열로 저장된 경우 대비
                pay_year: year
            })
            .toArray();
            
        // 만약 account_pass 컬렉션의 member_id가 ObjectId 타입으로 저장되어 있다면 아래 쿼리도 추가 실행 (안전장치)
        const passDataObj = await db.collection("account_pass")
            .find({
                member_id: { $in: objectIds }, 
                pay_year: year
            })
            .toArray();

        // 두 결과 합치기
        const allPassData = [...passData, ...passDataObj];

        // 납부 내역 맵핑 (Map 구조로 변환)
        const passMap: any = {};
        allPassData.forEach((p: any) => {
            const mId = p.member_id.toString();
            if (!passMap[mId]) passMap[mId] = {};
            passMap[mId][p.pay_month] = p.paid;
        });

        // 5. 결과 반환
        return NextResponse.json({
            success: true,
            members: members.map(m => ({ _id: m._id.toString(), name: m.name })),
            passMap,
            monthlyFees
        });

    } catch (error) {
        console.error("Member Check API Error:", error);
        return NextResponse.json(
            { success: false, message: "서버 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}