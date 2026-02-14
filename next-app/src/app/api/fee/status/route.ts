// src/app/api/fee/status/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db'; // 몽고DB 연결 설정 파일 (경로는 본인 프로젝트에 맞게)

// 2. [주의] NextAuth 설정 경로가 정확해야 합니다.
// 만약 authOptions 에러가 계속 난다면, 이 줄을 잠시 주석 처리하고 테스트해보세요.
import { getServerSession } from 'next-auth';
// 👇 경로가 정확한지 꼭 확인하세요! (보통은 아래 경로가 맞습니다)
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // NextAuth 설정 경로 확인

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

  try {
    const client = await clientPromise;
    const db = client.db('terraone_db'); // DB 이름 확인

    // 1. 회원 목록 조회
    const members = await db.collection('members')
      .find({ name: { $ne: '공용계정' } })
      .sort({ name: 1 })
      .toArray();

    // 2. 납부 현황 조회
    const passData = await db.collection('account_pass')
      .find({ pay_year: year })
      .toArray();

    // 3. 데이터 가공 (PHP의 passMap 만들기)
    const passMap: any = {};
    passData.forEach((p: any) => {
      const mId = p.member_id.toString();
      const month = p.pay_month;
      if (!passMap[mId]) passMap[mId] = {};
      passMap[mId][month] = p.paid;
    });

    return NextResponse.json({ members, passMap });

  } catch (error) {
    return NextResponse.json({ error: 'DB Error' }, { status: 500 });
  }
}