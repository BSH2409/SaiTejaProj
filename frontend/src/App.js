import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Import CSS for styling
import ShowDeviceData from './components/ShowDeviceData';

function App() {
  const [dataById, setDataById] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const parseMetrics = (metrics) => {
    try {
      return JSON.parse(metrics);
    } catch (error) {
      console.error('Error parsing metrics:', error);
      return null;
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/fetch-data', {
        params: {
          startDate,
          endDate
        }
      });
      const parsedDataById = response.data.reduce((acc, item) => {
        const { deviceid, fromts, tots, metrics, operatingLoad} = item;
        if (!acc[deviceid]) {
          acc[deviceid] = [];
        }
        acc[deviceid].push({ deviceid, fromts, tots, metrics: metrics, operatingLoad: operatingLoad });
        return acc;
      }, {});
      setDataById(parsedDataById);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Object.keys(dataById).slice(indexOfFirstItem, indexOfLastItem);

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Fetch data with new dates
    fetchData();
  };

  return (
    <div className="App">
      <h1>Machine State App</h1>
      <form onSubmit={handleSubmit}>
        <div>
          Start Date:
          <input type="date" value={startDate} onChange={handleStartDateChange} />
        </div>
        <div>
          End Date:
          <input type="date" value={endDate} onChange={handleEndDateChange} />
        </div>
        <button type="submit">Submit</button>
      </form>
      {currentItems.map((deviceId) => <div key={deviceId}>
        {deviceId}
        <ShowDeviceData 
          deviceId={deviceId} 
          data={dataById[deviceId]}
          operating_load={dataById[deviceId][0] && dataById[deviceId][0].operatingLoad}
        /></div>)}
      <Pagination
        itemsPerPage={itemsPerPage}
        totalItems={Object.keys(dataById).flat().length}
        paginate={paginate}
      />
    </div>
  );
}

const Pagination = ({ itemsPerPage, totalItems, paginate }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <ul className="pagination">
      {pageNumbers.map((number) => (
        <li key={number}>
          <button onClick={() => paginate(number)}>{number}</button>
        </li>
      ))}
    </ul>
  );
};

export default App;
