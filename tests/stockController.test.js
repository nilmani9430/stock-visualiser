const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Stock = require('../models/stock');
const fs = require('fs');
const path = require('path');
require("dotenv").config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});


afterEach(async () => {
  await Stock.deleteMany({});
});


afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /upload', () => {
  it('should upload a CSV file and store valid records', async () => {
    console.time("upload csv to db")
    const csvFilePath = path.join(__dirname, 'test_data.csv'); 
    console.log("csv file path is",csvFilePath)
    const response = await request(app)
      .post('/upload')
      .attach('file', csvFilePath);

    expect(response.statusCode).toBe(200);
    expect(response.body.successfulRecords).toBeGreaterThan(0);
    expect(response.body.failedRecords).toBeGreaterThanOrEqual(0);
    console.time("upload csv to db")
  },30000);

  it('should return an error for non-CSV files', async () => {
    const nonCsvFilePath = path.join(__dirname, 'test_data.txt'); 
    const response = await request(app)
      .post('/upload')
      .attach('file', nonCsvFilePath);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Only CSV files are allowed');
  },30000);
});

describe('GET /api/highest_volume', () => {
  it('should return the record with the highest volume', async () => {
    await Stock.create([
      {
        date: new Date('2024-01-01'),
        symbol: 'TEST1',
        volume: 1000,
      },
      {
        date: new Date('2024-01-02'),
        symbol: 'TEST2',
        volume: 2000,
      }
    ]);

    const response = await request(app).get('/api/highest_volume?start_date=2024-01-01&end_date=2024-12-31');
    expect(response.statusCode).toBe(200);
    expect(response.body.highest_volume.symbol).toBe('TEST2');
    expect(response.body.highest_volume.volume).toBe(2000);
  });
});

describe('GET /api/average_close', () => {
  it('should return the average close price', async () => {
    await Stock.create([
      { date: new Date('2024-01-01'), symbol: 'TEST1', close: 150 },
      { date: new Date('2024-01-02'), symbol: 'TEST1', close: 250 }
    ]);

    const response = await request(app).get('/api/average_close?start_date=2024-01-01&end_date=2024-12-31&symbol=TEST1');
    expect(response.statusCode).toBe(200);
    expect(response.body.average_close).toBe(200); // (150 + 250) / 2 = 200
  });

  it('should return 0 if no records are found', async () => {
    const response = await request(app).get('/api/average_close?start_date=2024-01-01&end_date=2024-12-31&symbol=NONEXISTENT');
    expect(response.statusCode).toBe(200);
    expect(response.body.average_close).toBe(0);
  });
});


describe('GET /api/average_vwap', () => {
  it('should return the average VWAP', async () => {
    await Stock.create([
      { date: new Date('2024-01-01'), symbol: 'TEST1', vwap: 100 },
      { date: new Date('2024-01-02'), symbol: 'TEST1', vwap: 200 }
    ]);

    const response = await request(app).get('/api/average_vwap?start_date=2024-01-01&end_date=2024-12-31&symbol=TEST1');
    expect(response.statusCode).toBe(200);
    expect(response.body.average_vwap).toBe(150); // (100 + 200) / 2 = 150
  });
});




