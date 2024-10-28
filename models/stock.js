const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  symbol: String,
  series: String,
  prev_close: {type:Number , default: null},
  open: {type:Number , default: null},
  high: {type:Number , default: null},
  low: {type:Number , default: null},
  last: {type:Number , default: null},
  close: {type:Number , default: null},
  vwap: {type:Number , default: null},
  volume: {type:Number , default: null},
  turnover: {type:Number , default: null},
  trades: {type:Number , default: null},
  deliverable: {type:Number , default: null},
  percent_deliverable: {type:Number , default: null},
});

module.exports = mongoose.model('Stock', StockSchema);
