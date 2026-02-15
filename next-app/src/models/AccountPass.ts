import mongoose from 'mongoose';

const AccountPassSchema = new mongoose.Schema({
  member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  pay_year: { type: Number, required: true },
  pay_month: { type: Number, required: true },
  paid: { type: Number, default: 0 }, // 0: 미납, 1: 납부
}, { timestamps: true });

// 중복 방지를 위한 인덱스
AccountPassSchema.index({ member_id: 1, pay_year: 1, pay_month: 1 }, { unique: true });

export default mongoose.models.AccountPass || mongoose.model('AccountPass', AccountPassSchema);