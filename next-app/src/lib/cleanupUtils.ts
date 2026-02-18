import dbConnect from '@/lib/mongodb';
import Income from '@/models/Income';
import Expense from '@/models/Expense';

/**
 * 자동 데이터 정리 유틸리티
 * MongoDB Atlas 무료 티어 용량 제한 방지
 */

interface CleanupOptions {
    yearsToKeep?: number;  // 보관할 년수 (기본값: 2년)
    dryRun?: boolean;      // 실제 삭제 없이 통계만 확인
}

export async function cleanupFinancialData(options: CleanupOptions = {}) {
    const { yearsToKeep = 2, dryRun = false } = options;
    
    try {
        await dbConnect();
        
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - yearsToKeep);
        const cutoffDateString = cutoffDate.toISOString().split('T')[0];

        // 삭제 대상 데이터 통계
        const oldIncomeCount = await Income.countDocuments({ date: { $lt: cutoffDateString } });
        const oldExpenseCount = await Expense.countDocuments({ date: { $lt: cutoffDateString } });

        if (oldIncomeCount === 0 && oldExpenseCount === 0) {
            return {
                success: true,
                message: "삭제할 오래된 데이터가 없습니다.",
                deletedIncome: 0,
                deletedExpense: 0,
                cutoffDate: cutoffDateString,
                dryRun
            };
        }

        if (dryRun) {
            return {
                success: true,
                message: `DRY RUN: ${oldIncomeCount}개 수입, ${oldExpenseCount}개 지출이 삭제될 예정입니다.`,
                wouldDeleteIncome: oldIncomeCount,
                wouldDeleteExpense: oldExpenseCount,
                cutoffDate: cutoffDateString,
                dryRun: true
            };
        }

        // 실제 데이터 삭제
        const incomeResult = await Income.deleteMany({ date: { $lt: cutoffDateString } });
        const expenseResult = await Expense.deleteMany({ date: { $lt: cutoffDateString } });

        return {
            success: true,
            message: `데이터 정리 완료: ${incomeResult.deletedCount}개 수입, ${expenseResult.deletedCount}개 지출 삭제`,
            deletedIncome: incomeResult.deletedCount,
            deletedExpense: expenseResult.deletedCount,
            cutoffDate: cutoffDateString,
            yearsToKeep,
            dryRun: false
        };
    } catch (error: any) {
        console.error('데이터 정리 오류:', error);
        throw new Error(`데이터 정리 중 오류가 발생했습니다: ${error.message}`);
    }
}

/**
 * 데이터베이스 사용량 통계
 */
export async function getDatabaseStats() {
    try {
        await dbConnect();
        
        const totalIncome = await Income.countDocuments();
        const totalExpense = await Expense.countDocuments();
        
        // 날짜별 데이터 분포 확인
        const dateStats = await Income.aggregate([
            {
                $group: {
                    _id: { $substr: ["$date", 0, 7] }, // YYYY-MM 형식
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } },
            { $limit: 12 }
        ]);

        return {
            success: true,
            statistics: {
                totalIncome,
                totalExpense,
                totalRecords: totalIncome + totalExpense,
                monthlyDistribution: dateStats,
                estimatedStorage: {
                    // 대략적인 추정치 (실제 문서 크기에 따라 다름)
                    incomeRecords: totalIncome,
                    expenseRecords: totalExpense,
                    estimatedMB: Math.ceil((totalIncome + totalExpense) * 0.5) // 대략 0.5KB per record
                }
            }
        };
    } catch (error: any) {
        console.error('통계 조회 오류:', error);
        throw new Error(`통계 조회 중 오류가 발생했습니다: ${error.message}`);
    }
}