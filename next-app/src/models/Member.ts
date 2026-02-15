import mongoose from 'mongoose';

const MemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user_level: { type: Number, default: 1 },
  // 필요한 다른 필드들 추가
}, { timestamps: true });

export default mongoose.models.Member || mongoose.model('Member', MemberSchema);