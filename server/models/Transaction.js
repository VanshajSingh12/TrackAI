import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true }, // Simple string for now, or can ref Category model
  type: { type: String, enum: ['expense', 'income'], required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  sustainability: {
    sdg_alignment: { type: String, default: "SDG 12: Responsible Consumption" },
    co2_footprint_kg: { type: Number, default: 0 },
    sdg_rating: { type: String, enum: ['A', 'B', 'C', 'D', 'F'], default: 'C' },
    eco_insight: { type: String, default: "" }
  },
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
