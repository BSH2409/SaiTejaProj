const express = require('express');
const csvParser = require('csv-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Enable CORS for all routes

app.get('/api/fetch-data', (req, res) => {
  const { startDate, endDate } = req.query;
  let startDateTimestamp = getPreviousDayTimestamp();
  let endDateTimestamp = Date.now(); // Current timestamp

  // If start date is provided, set it as the start date
  if (startDate) {
    startDateTimestamp = new Date(startDate).getTime();
  }

  // If end date is provided, set it as the end date
  if (endDate) {
    endDateTimestamp = new Date(endDate).getTime();
  }
  const data = [];
  fs.createReadStream('./data/demoPumpDayData.csv')
    .pipe(csvParser())
    .on('data', (row) => {
      // Convert string values to numbers where necessary
      row.fromts = parseFloat(row.fromts);
      row.tots = parseFloat(row.tots);
      row.metrics = JSON.parse(row.metrics);
      row.metrics.Psum.avgvalue = parseFloat(row.metrics.Psum.avgvalue);
      // Check if row is within the specified date range
      if (row.fromts >= startDateTimestamp && row.tots <= endDateTimestamp) {
        data.push(row);
      }
    })
    .on('end', () => {
      // Sort by 'Psum' in descending order to get the top values
      data.sort((a, b) => b.metrics.Psum.avgvalue - a.metrics.Psum.avgvalue);

      // Get the top 10 'Psum' values and calculate their average
      const top10PsumValues = data.slice(0, 10);
      const operatingLoad = top10PsumValues.reduce((acc, cur) => acc + cur.metrics.Psum.avgvalue, 0) / top10PsumValues.length;

      // Add 'operating load' to each row of the filtered data
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
