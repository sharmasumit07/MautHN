import React, { useState, useEffect } from "react";
import { Box, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid'; // Import DataGrid from MUI
import './request.css'; // Reuse the CSS file used for Requests component

const Logs = () => {
  const [logs, setLogs] = useState([]);

  const fetchLogs = () => {
    const id = sessionStorage.getItem("id");

    fetch("https://mauthn.mukham.in/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ id }), // Sending the user ID to get all logs
    })
      .then((response) => response.text()) // Fetch the plain text response
      .then((data) => {
        if (data.trim() === "0000") {
          setLogs([]); // No logs available
        } else {
          // Parsing the text response into log entries
          const logEntries = data
            .trim()
            .split("\n") // Split by new lines
            .map((line, index) => {
              const [requester, timestamp] = line.split(","); // Assuming comma-separated logs
              return { id: index + 1, requester: requester.trim(), timestamp: timestamp.trim() }; // Set unique id
            });
          setLogs(logEntries); // Set all logs in the state
        }
      })
      .catch((error) => {
        console.error("Error fetching logs:", error);
        setLogs([]); // Reset logs in case of error
      });
  };

  useEffect(() => {
    // Fetch logs immediately
    fetchLogs();

    // Set up polling to fetch logs every 10 seconds
    const interval = setInterval(fetchLogs, 10000); // Polling every 10 seconds

    return () => clearInterval(interval); // Clear the interval on component unmount
  }, []); // Empty dependency array to run only once when the component mounts

  // Define columns for the DataGrid
  const columns = [
    { field: 'requester', headerName: 'Requester', flex: 1.5 },
    { field: 'timestamp', headerName: 'Timestamp', flex: 1 },
  ];

  return (
    <Box className="dataGridContainer">
  <Typography variant="h5" gutterBottom>Logs</Typography>
{/* 
  {errorMessage && (
    <Typography color="error" sx={{ mb: 2 }}>{errorMessage}</Typography>
  )} */}

  <Box className="dataGridTable">
    <DataGrid
      rows={logs}           // Data from logs state
      columns={columns}      // Columns defined for requester and timestamp
      components={{ Toolbar: GridToolbar }}
      pageSize={5}           // Number of rows per page
      rowsPerPageOptions={[5, 10, 20]} // Options for page size
      slots={{ toolbar: GridToolbar }}  // Match the second grid table
      disableSelectionOnClick
      autoHeight
    />
  </Box>

  
</Box>

  );
};

export default Logs;