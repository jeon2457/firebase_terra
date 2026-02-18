import { NextRequest, NextResponse } from "next/server";
import { readFile, unlink } from "fs/promises";
import { join } from "path";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const fileName = searchParams.get('file');
        
        if (!fileName) {
            return NextResponse.json({ error: "파일 이름이 없습니다." }, { status: 400 });
        }
        
        const filePath = join(process.cwd(), 'temp', fileName);
        
        // 파일 읽기
        const fileBuffer = await readFile(filePath);
        
        // 파일 삭제 (다운로드 후 정리)
        setTimeout(async () => {
            try {
                await unlink(filePath);
            } catch (error) {
                console.error("File deletion error:", error);
            }
        }, 5000); // 5초 후 삭제
        
        // 파일 다운로드 응답
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
            },
        });
        
    } catch (error) {
        console.error("File download error:", error);
        return NextResponse.json(
            { error: "파일 다운로드에 실패했습니다." },
            { status: 500 }
        );
    }
}
