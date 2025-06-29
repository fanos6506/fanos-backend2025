// server/api/v1/models/searchHistory.js
import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  keyword: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const SearchHistory = mongoose.model("SearchHistory", searchHistorySchema);

export default SearchHistory;
