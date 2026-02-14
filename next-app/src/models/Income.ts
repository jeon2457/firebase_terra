import mongoose, { Schema, model, models } from 'mongoose';

const IncomeSchema = new Schema({
    date: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    amount: { type: Number, required: true },
}, {
    timestamps: true,
    collection: 'income_table'
});

const Income = models.Income || model('Income', IncomeSchema);

export default Income;
