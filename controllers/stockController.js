const fs = require('fs');
const csv = require('csv-parser');
const moment = require('moment');
const Stock = require('../models/stock');

const path = require('path');

exports.uploadCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a file' });
  }

  // Check if the file is a CSV
  const fileMimeType = req.file.mimetype;
  const fileExtension = path.extname(req.file.originalname).toLowerCase();

  if (
    fileMimeType !== 'text/csv' &&
    fileMimeType !== 'application/vnd.ms-excel' ||
    fileExtension !== '.csv'
  ) {
    // Delete the uploaded file if it's not a CSV
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

  // Store all row processing promises
  const rowPromises = [];

  // Initialize rowIndex to zero
  let rowIndex = 0;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      rowIndex++; 
      totalRecords++;

      // Push each row processing as a promise
      rowPromises.push(
        new Promise(async (resolve) => {
          try {
            // Create a new stock object with default values set to null
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

            // Validate required columns and set values
            for (const column of requiredColumns) {
              if (!row[column]) {
                newStock[column.toLowerCase().replace(/ /g, '_')] = null;
              } else {
                // Special handling for date column
                if (column === 'Date') {
                  const parsedDate = moment(row.Date, true);
                  if (!parsedDate.isValid()) {
                    throw new Error(`Invalid date format: ${row.Date}`);
                  }
                  newStock.date = new Date(row.Date);
                } else {
                  // Convert numeric fields to proper data types
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

            // Save the new stock entry to the database
            await new Stock(newStock).save();
            successfulRecords++;
          } catch (error) {
            failedRecords++;
            // Include the rowIndex and error message in the failedRows array
            failedRows.push({error: error.message, rowData: row });
          }
          resolve();
        })
      );
    })
    .on('end', async () => {
      // Wait for all row promises to complete
      await Promise.all(rowPromises);

      // Delete the uploaded file
      fs.unlinkSync(filePath);

      // Send response with the results
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
      .select('date symbol volume'); // Select only the required fields

    if (result.length === 0) {
      return res.status(404).json({ message: 'No records found' });
    }

    const { date, symbol, volume } = result[0];
    res.json({
      highest_volume: {
        date: date.toISOString().split('T')[0], // Convert date to YYYY-MM-DD format
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

