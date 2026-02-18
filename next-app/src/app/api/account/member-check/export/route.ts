import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import * as XLSX from 'xlsx';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { members, year, passMap, monthlyFees } = await req.json();

        // 엑셀 워크북 생성
        const wb = XLSX.utils.book_new();
        
        // 헤더 생성
        const headers = [
            '이름',
            '1월', '2월', '3월', '4월', '5월', '6월',
            '7월', '8월', '9월', '10월', '11월', '12월',
            '입금합계', '미납금'
        ];
        
        // 데이터 생성
        const data: any[][] = [headers];
        
        const todayYear = new Date().getFullYear();
        const todayMonth = new Date().getMonth() + 1;
        
        members.forEach((member: any) => {
            const memberId = member._id.toString();
            let totalPaid = 0;
            let unpaidTotal = 0;
            
            const row = [member.name];
            
            // 월별 데이터 추가
            for (let m = 1; m <= 12; m++) {
                const paid = passMap[memberId]?.[m] || 0;
                const monthFee = monthlyFees[m] || 20000;
                
                if (paid) {
                    totalPaid += monthFee;
                    row.push('O');
                } else {
                    if (year < todayYear || (year === todayYear && m <= todayMonth)) {
                        unpaidTotal += monthFee;
                    }
                    row.push('X');
                }
            }
            
            // 합계 추가
            row.push(totalPaid);
            row.push(unpaidTotal);
            
            data.push(row);
        });
        
        // 워크시트에 데이터 추가
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "회원납부현황");
        
        // 엑셀 파일 생성
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
        
        // 임시 디렉토리 확인 및 생성
        const tempDir = join(process.cwd(), 'temp');
        try {
            await mkdir(tempDir, { recursive: true });
        } catch (error) {
            // 디렉토리가 이미 존재할 수 있음
        }
        
        const fileName = `회원납부현황_${year}년_${new Date().toISOString().slice(0, 10)}.xlsx`;
        const filePath = join(tempDir, fileName);
        
        await writeFile(filePath, excelBuffer as Buffer);
        
        // 파일 다운로드 URL 생성
        const downloadUrl = `/api/account/member-check/download?file=${fileName}`;
        
        return NextResponse.json({
            success: true,
            downloadUrl
        });
        
    } catch (error) {
        console.error("Excel export error:", error);
        return NextResponse.json(
            { success: false, message: "엑셀 파일 생성에 실패했습니다." },
            { status: 500 }
        );
    }
}
