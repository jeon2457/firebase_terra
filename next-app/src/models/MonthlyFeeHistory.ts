import mongoose from 'mongoose';

const MonthlyFeeHistorySchema = new mongoose.Schema({
  apply_year: { type: Number, required: true },
  apply_month: { type: Number, required: true },
  fee_amount: { type: Number, required: true },
}, { timestamps: true });

// 중복 방지를 위한 인덱스
MonthlyFeeHistorySchema.index({ apply_year: 1, apply_month: 1 }, { unique: true });

export default mongoose.models.MonthlyFeeHistory || mongoose.model('MonthlyFeeHistory', MonthlyFeeHistorySchema);