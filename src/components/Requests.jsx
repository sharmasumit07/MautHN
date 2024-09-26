import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AuthPopup from './AuthPopup';
import './request.css'; // Import the CSS file

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authData, setAuthData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      const id = sessionStorage.getItem("id");

      try {
        const response = await fetch("https://mauthn.mukham.in/req", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ id }),
        });

        const data = await response.text();

        if (data === "0000") {
          setErrorMessage("Invalid session or no active requests.");
          setRequests([]);
          return;
        }

        if (data === "[]") {
          setErrorMessage("No active requests found.");
          setRequests([]);
          return;
        }

        try {
          const jsonData = JSON.parse(data);
          setRequests(jsonData); // Update the requests list
          setErrorMessage("");
        } catch (error) {
          setErrorMessage("Error parsing requests data.");
        }
      } catch (error) {
        setErrorMessage("Error fetching requests.");
      }
    };

    // Fetch the requests immediately when the component mounts
    fetchRequests();

    // Set an interval to fetch requests every 5 seconds
    const intervalId = setInterval(fetchRequests, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleAuth = (perms, token) => {
    setAuthData({ perms, token });
    setShowAuthPopup(true);
  };

  const columns = [
    { field: 'requester', headerName: 'Requester', flex: 1.5 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Button 
          variant="contained"
          onClick={() => handleAuth(params.row.perms, params.row.token)}
        >
          Authenticate
        </Button>
      ),
    },
  ];

  const rows = requests.map((request, index) => ({
    id: index,
    requester: request.requester,
    perms: request.perms,
    token: request.token,
  }));

  return (
    <Box className="dataGridContainer">
      <Typography variant="h5" gutterBottom>Requests</Typography>

      {errorMessage && (
        <Typography color="error" sx={{ mb: 2 }}>{errorMessage}</Typography>
      )}

      <Box className="dataGridTable">
        <DataGrid
          rows={rows}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          slots={{ toolbar: GridToolbar }}
          disableSelectionOnClick
          autoHeight
         
        />
      </Box>

      {showAuthPopup && <AuthPopup {...authData} onClose={() => setShowAuthPopup(false)} />}
    </Box>
  );
};

export default Requests;
