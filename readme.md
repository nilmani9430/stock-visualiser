# Stock Data API

A RESTful API for managing and querying stock market data. This API allows you to upload stock data from a CSV file, retrieve stock data based on various parameters, and perform calculations like finding the highest volume, average close, and average VWAP over a specified date range.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
  - [Upload Stock Data](#upload-stock-data)
  - [Get Stock with Highest Volume](#get-stock-with-highest-volume)
  - [Get Average Close](#get-average-close)
  - [Get Average VWAP](#get-average-vwap)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Documentation](#documentation)

## Features

- Upload stock data through a CSV file.
- Validate CSV file format and content.
- Retrieve stock data with the highest trading volume within a date range.
- Calculate the average closing price for a stock symbol within a date range.
- Calculate the average VWAP (Volume Weighted Average Price) for a stock symbol within a date range.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Testing**: Jest, Supertest
- **CSV Parsing**: `csv-parser`
- **Date Handling**: Moment.js

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nilmani9430/stock-visualiser
   cd stock-visualiser
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
PORT=
MONGODB_URL=
```

### Running the Application

1. Run the server:
   ```bash
   npm start
   ```

   The server will start on the desired port.

## API Endpoints

### Upload Stock Data

- **Endpoint**: `POST /upload`
- **Description**: Uploads a CSV file containing stock data.
- **Request Parameters**:
  - `file`: CSV file containing stock data.
- **Response**:
  - `200 OK`:
    ```json
    {
      "totalRecords": 100,
      "successfulRecords": 95,
      "failedRecords": 5,
      "failedRows": [
        {
          "error": "Invalid date format",
          "rowData": { /* Data of the failed row */ }
        }
      ]
    }
    ```
  - `400 Bad Request`: If the file is missing or not a CSV.
    ```json
    {
      "error": "Only CSV files are allowed"
    }
    ```

### Get Stock with Highest Volume

- **Endpoint**: `GET /highest-volume`
- **Description**: Retrieves the stock entry with the highest trading volume within a specified date range.
- **Query Parameters**:
  - `start_date` (optional): The start date in `YYYY-MM-DD` format.
  - `end_date` (optional): The end date in `YYYY-MM-DD` format.
  - `symbol` (optional): The stock symbol to filter by.
- **Response**:
  - `200 OK`:
    ```json
    {
      "highest_volume": {
        "date": "2024-01-10",
        "symbol": "ULTRACEMCO",
        "volume": 1000000
      }
    }
    ```
  - `404 Not Found`: If no records are found.

### Get Average Close

- **Endpoint**: `GET /average-close`
- **Description**: Calculates the average closing price for a given stock symbol over a specified date range.
- **Query Parameters**:
  - `start_date` (required): The start date in `YYYY-MM-DD` format.
  - `end_date` (required): The end date in `YYYY-MM-DD` format.
  - `symbol` (required): The stock symbol.
- **Response**:
  - `200 OK`:
    ```json
    {
      "average_close": 1234.56
    }
    ```
  - `400 Bad Request`: If the symbol is missing.

### Get Average VWAP

- **Endpoint**: `GET /average-vwap`
- **Description**: Calculates the average VWAP for a given stock symbol over a specified date range.
- **Query Parameters**:
  - `start_date` (optional): The start date in `YYYY-MM-DD` format.
  - `end_date` (optional): The end date in `YYYY-MM-DD` format.
  - `symbol` (optional): The stock symbol.
- **Response**:
  - `200 OK`:
    ```json
    {
      "average_vwap": 5678.90
    }
    ```


## Documentation

- **API Documentation**: [API Word Document](https://docs.google.com/document/d/1HWO7GKZEYkroI40nXBRMN7LqpgyEExzD/edit?usp=sharing&ouid=102028042699684586291&rtpof=true&sd=true)
- **Postman Documentation**: [Postman Documentation](https://documenter.getpostman.com/view/30464667/2sAY4uBNQV)
- **Deployed API URL**: [Stock Data API](https://stock-visualiser.onrender.com)

**Note**: Since I am using the free version of Render, please wait for some time as it may take a moment when hitting the API for the first time.