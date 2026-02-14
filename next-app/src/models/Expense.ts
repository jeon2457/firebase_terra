import mongoose, { Schema, model, models } from 'mongoose';

const ExpenseSchema = new Schema({
    date: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    amount: { type: Number, required: true },
}, {
    timestamps: true,
    collection: 'expense_table'
});

const Expense = models.Expense || model('Expense', ExpenseSchema);

export default Expense;
