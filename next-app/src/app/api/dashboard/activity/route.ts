import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Member from '@/models/Member';
import AccountPass from '@/models/AccountPass';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    try {
        await dbConnect();

        // 1. 회원 목록 조회 (공용계정 제외)
        const members = await Member.find({ name: { $ne: '공용계정' } }).sort({ name: 1 });

        // 2. 해당 연도의 모든 납부 현황 조회
        const passRecords = await AccountPass.find({ pay_year: year });

        // passMap 생성 (member_id -> { month -> paid })
        const passMap: any = {};
        passRecords.forEach((record: any) => {
            const memberId = record.member_id.toString();
            if (!passMap[memberId]) {
                passMap[memberId] = {};
            }
            passMap[memberId][record.pay_month] = record.paid;
        });

        // 3. 통계 계산
        let totalLogins = 0;
        let membersWithFullPayment = 0;

        const monthlyActivity = Array(12).fill(0);
        const processedMembers = members.map((member: any) => {
            const memberId = member._id.toString();
            const monthlyPaid = passMap[memberId] || {};
            const paidMonthsCount = Object.values(monthlyPaid).filter(v => v === 1).length;
            const paymentRate = Math.round((paidMonthsCount / 12) * 100);

            totalLogins += (member.login_count || 0);
            if (paymentRate === 100) membersWithFullPayment++;

            // 월별 활동 추이 (납부 기준)
            for (let m = 1; m <= 12; m++) {
                if (monthlyPaid[m] === 1) monthlyActivity[m - 1]++;
            }

            return {
                id: memberId,
                name: member.name,
                tel: member.tel || '010-0000-0000',
                paymentRate,
                loginCount: member.login_count || 0,
            };
        });

        const avgPaymentRate = processedMembers.length > 0
            ? Math.round(processedMembers.reduce((acc, m) => acc + m.paymentRate, 0) / processedMembers.length)
            : 0;

        // 4. 순위 계산 (납부율 70% + 로그인 30%)
        // Normalized Login Score: (loginCount / maxLoginCount) * 100
        const maxLogins = Math.max(...processedMembers.map(m => m.loginCount), 1);

        const rankedMembers = processedMembers.map(m => {
            const loginScore = (m.loginCount / maxLogins) * 100;
            const totalScore = Math.round((m.paymentRate * 0.7) + (loginScore * 0.3));
            return { ...m, totalScore };
        }).sort((a, b) => b.totalScore - a.totalScore);

        return NextResponse.json({
            success: true,
            summary: {
                totalMembers: processedMembers.length,
                avgPaymentRate,
                totalLogins,
                topPerformers: membersWithFullPayment,
                year
            },
            monthlyActivity,
            top5: rankedMembers.slice(0, 5),
            allMembers: rankedMembers
        });

    } catch (error) {
        console.error('Error fetching activity dashboard data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
