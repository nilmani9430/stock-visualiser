const fs = require('fs');
const csv = require('csv-parser');
const moment = require('moment');
const Stock = require('../models/stock');

const path = require('path');

exports.uploadCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a file' });
  }

  const fileMimeType = req.file.mimetype;
  const fileExtension = path.extname(req.file.originalname).toLowerCase();

  if (
    fileMimeType !== 'text/csv' &&
    fileMimeType !== 'application/vnd.ms-excel' ||
    fileExtension !== '.csv'
  ) {

    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Only CSV files are allowed' });
  }

  const filePath = req.file.path;
  const requiredColumns = [
    'Date', 'Symbol', 'Series', 'Prev Close', 'Open', 'High', 'Low', 'Last',
    'Close', 'VWAP', 'Volume', 'Turnover', 'Trades', 'Deliverable', '%Deliverable'
  ];

  let totalRecords = 0;
  let successfulRecords = 0;
  let failedRecords = 0;
  const failedRows = [];

  const rowPromises = [];

  let rowIndex = 0;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      rowIndex++; 
      totalRecords++;

      rowPromises.push(
        new Promise(async (resolve) => {
          try {
            const newStock = {
              date: null,
              symbol: null,
              series: null,
              prev_close: null,
              open: null,
              high: null,
              low: null,
              last: null,
              close: null,
              vwap: null,
              volume: null,
              turnover: null,
              trades: null,
              deliverable: null,
              percent_deliverable: null,
            };

            for (const column of requiredColumns) {
              if (!row[column]) {
                newStock[column.toLowerCase().replace(/ /g, '_')] = null;
              } else {
                if (column === 'Date') {
                  const parsedDate = moment(row.Date, true);
                  if (!parsedDate.isValid()) {
                    throw new Error(`Invalid date format: ${row.Date}`);
                  }
                  newStock.date = new Date(row.Date);
                } else {
                  switch (column) {
                    case 'Prev Close':
                    case 'Open':
                    case 'High':
                    case 'Low':
                    case 'Last':
                    case 'Close':
                    case 'VWAP':
                    case 'Turnover':
                    case '%Deliverable':
                      newStock[column.toLowerCase().replace(/ /g, '_')] = parseFloat(row[column]);
                      break;
                    case 'Volume':
                    case 'Trades':
                    case 'Deliverable':
                      newStock[column.toLowerCase().replace(/ /g, '_')] = parseInt(row[column], 10);
                      break;
                    default:
                      newStock[column.toLowerCase().replace(/ /g, '_')] = row[column];
                  }
                }
              }
            }

            await new Stock(newStock).save();
            successfulRecords++;
          } catch (error) {
            failedRecords++;
            failedRows.push({error: error.message, rowData: row });
          }
          resolve();
        })
      );
    })
    .on('end', async () => {
      await Promise.all(rowPromises);

      fs.unlinkSync(filePath);

      res.json({
        totalRecords,
        successfulRecords,
        failedRecords,
        failedRows,
      });
    });
};

exports.getHighestVolume = async (req, res) => {
  const { start_date, end_date, symbol } = req.query;
  const query = {};

  if (start_date && end_date) {
    query.date = { $gte: new Date(start_date), $lte: new Date(end_date) };
  }
  if (symbol) {
    query.symbol = symbol;
  }

  try {
    const result = await Stock.find(query)
      .sort({ volume: -1 })
      .limit(1)
      .select('date symbol volume'); 

    if (result.length === 0) {
      return res.status(404).json({ message: 'No records found' });
    }

    const { date, symbol, volume } = result[0];
    res.json({
      highest_volume: {
        date: date.toISOString().split('T')[0], 
        symbol,
        volume,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getAverageClose = async (req, res) => {
  const { start_date, end_date, symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol is required' });
  }

  const query = {
    date: { $gte: new Date(start_date), $lte: new Date(end_date) },
    symbol,
  };

  try {
    const result = await Stock.aggregate([
      { $match: query },
      { $group: { _id: null, average_close: { $avg: '$close' } } },
    ]);
    res.json({ average_close: result[0]?.average_close || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAverageVWAP = async (req, res) => {
  const { start_date, end_date, symbol } = req.query;

  const query = {};
  if (start_date && end_date) {
    query.date = { $gte: new Date(start_date), $lte: new Date(end_date) };
  }
  if (symbol) {
    query.symbol = symbol;
  }

  try {
    const result = await Stock.aggregate([
      { $match: query },
      { $group: { _id: null, average_vwap: { $avg: '$vwap' } } },
    ]);
    res.json({ average_vwap: result[0]?.average_vwap || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

