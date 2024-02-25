const express = require('express');
const csvParser = require('csv-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Enable CORS for all routes

app.get('/api/fetch-data', (req, res) => {
  const data = [];
  const previousDayTimestamp = getPreviousDayTimestamp();

  fs.createReadStream('./data/demoPumpDayData.csv')
    .pipe(csvParser())
    .on('data', (row) => {
            // Convert string values to numbers where necessary
      row.fromts = parseFloat(row.fromts);
      row.tots = parseFloat(row.tots);
      row.metrics = JSON.parse(row.metrics);
      row.metrics.Psum.avgvalue = parseFloat(row.metrics.Psum.avgvalue);
      data.push(row);
    })
    .on('end', () => {
      // Filter data to only include rows from the previous day
      const previousDayData = data.filter(row => isSameDay(row.fromts, previousDayTimestamp));
      
      // Sort by 'Psum' in descending order to get the top values
      previousDayData.sort((a, b) => b.metrics.Psum.avgvalue - a.metrics.Psum.avgvalue);
      
      // Get the top 10 'Psum' values and calculate their average
      const top10PsumValues = previousDayData.slice(0, 10);
      
      const operatingLoad = top10PsumValues.reduce((acc, cur) => acc + cur.metrics.Psum.avgvalue, 0) / top10PsumValues.length;
      // Add 'operating load' to each row of the original data
      data.forEach(row => {
        row.operatingLoad = operatingLoad;
      });

      res.json(data);
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

function getPreviousDayTimestamp() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.getTime();
}

function isSameDay(timestamp1, timestamp2) {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}
