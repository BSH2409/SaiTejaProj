import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Import CSS for styling
import ShowDevideData from './components/ShowDeviceData';



function App() {
  const [dataById, setDataById] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

    
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
      const response = await axios.get('http://localhost:5000/api/fetch-data');
      const parsedDataById = response.data.reduce((acc, item) => {
        const { deviceid, fromts, tots, metrics } = item;
        if (!acc[deviceid]) {
          acc[deviceid] = [];
        }
        acc[deviceid].push({ deviceid, fromts, tots, metrics: parseMetrics(metrics) });
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

  return (
    <div className="App">
      <h1>Machine State App</h1>
      {currentItems.map((deviceId) => <div key={deviceId}>{deviceId}
        <ShowDevideData 
          deviceId={deviceId} 
          data={dataById[deviceId]}
          operating_load={200}
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
