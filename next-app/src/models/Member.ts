import mongoose from 'mongoose';

const MemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user_level: { type: Number, default: 1 },
  login_count: { type: Number, default: 0 },
  last_login_at: { type: Date },
}, { timestamps: true });

export default mongoose.models.Member || mongoose.model('Member', MemberSchema);