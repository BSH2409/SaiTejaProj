const express = require('express');
const csvParser = require('csv-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Enable CORS for all routes

app.get('/api/fetch-data', (req, res) => {
  const data = [];

  fs.createReadStream('./data/demoPumpDayData.csv')
    .pipe(csvParser())
    .on('data', (row) => {
      data.push(row);
    })
    .on('end', () => {
      res.json(data);
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
    data.sort((a, b) => parseFloat(a.tots) - parseFloat(b.tots));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
