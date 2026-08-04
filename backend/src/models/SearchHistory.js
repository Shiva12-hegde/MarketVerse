import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    query: { type: String, required: true },
    type: { type: String, enum: ['keyword', 'ai', 'semantic'], default: 'keyword' },
    resultsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('SearchHistory', searchHistorySchema);
