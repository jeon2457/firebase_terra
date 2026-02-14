import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    tel: { type: String },
    addr: { type: String },
    remark: { type: String },
    sms: { type: String },
    sms_2: { type: String },
    email: { type: String },
    user_level: { type: Number, default: 1 },
}, {
    timestamps: true,
    collection: 'members' // Match existing PHP collection
});

const User = models.User || model('User', UserSchema);

export default User;
