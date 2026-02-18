import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Income from "@/models/Income";
import Expense from "@/models/Expense";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).user_level < 10) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        
        // 기본값: 2년 이전 데이터 삭제
        const { yearsToKeep = 2 } = await req.json();
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - yearsToKeep);
        const cutoffDateString = cutoffDate.toISOString().split('T')[0];

        // 삭제 전 백업 및 통계
        const oldIncomeCount = await Income.countDocuments({ date: { $lt: cutoffDateString } });
        const oldExpenseCount = await Expense.countDocuments({ date: { $lt: cutoffDateString } });

        if (oldIncomeCount === 0 && oldExpenseCount === 0) {
            return NextResponse.json({ 
                success: true, 
                message: "삭제할 오래된 데이터가 없습니다.",
                deletedIncome: 0,
                deletedExpense: 0
            });
        }

        // 오래된 데이터 삭제
        const incomeResult = await Income.deleteMany({ date: { $lt: cutoffDateString } });
        const expenseResult = await Expense.deleteMany({ date: { $lt: cutoffDateString } });

        return NextResponse.json({ 
            success: true, 
            message: `데이터 정리 완료: ${incomeResult.deletedCount}개 수입, ${expenseResult.deletedCount}개 지출 삭제`,
            deletedIncome: incomeResult.deletedCount,
            deletedExpense: expenseResult.deletedCount,
            cutoffDate: cutoffDateString,
            yearsToKeep
        });
    } catch (error: any) {
        console.error('데이터 정리 오류:', error);
        return NextResponse.json({ 
            success: false, 
            error: '데이터 정리 중 오류가 발생했습니다.' 
        }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).user_level < 10) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        
        // 현재 데이터 현황 조회
        const totalIncome = await Income.countDocuments();
        const totalExpense = await Expense.countDocuments();
        
        // 1년, 2년, 3년 이전 데이터 통계
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const oneYearAgoString = oneYearAgo.toISOString().split('T')[0];
        
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        const twoYearsAgoString = twoYearsAgo.toISOString().split('T')[0];
        
        const threeYearsAgo = new Date();
        threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
        const threeYearsAgoString = threeYearsAgo.toISOString().split('T')[0];

        const oldIncome1Year = await Income.countDocuments({ date: { $lt: oneYearAgoString } });
        const oldExpense1Year = await Expense.countDocuments({ date: { $lt: oneYearAgoString } });
        
        const oldIncome2Years = await Income.countDocuments({ date: { $lt: twoYearsAgoString } });
        const oldExpense2Years = await Expense.countDocuments({ date: { $lt: twoYearsAgoString } });
        
        const oldIncome3Years = await Income.countDocuments({ date: { $lt: threeYearsAgoString } });
        const oldExpense3Years = await Expense.countDocuments({ date: { $lt: threeYearsAgoString } });

        return NextResponse.json({ 
            success: true, 
            statistics: {
                totalIncome,
                totalExpense,
                deletableByPeriod: {
                    '1년이상': { income: oldIncome1Year, expense: oldExpense1Year },
                    '2년이상': { income: oldIncome2Years, expense: oldExpense2Years },
                    '3년이상': { income: oldIncome3Years, expense: oldExpense3Years }
                }
            }
        });
    } catch (error: any) {
        console.error('통계 조회 오류:', error);
        return NextResponse.json({ 
            success: false, 
            error: '통계 조회 중 오류가 발생했습니다.' 
        }, { status: 500 });
    }
}