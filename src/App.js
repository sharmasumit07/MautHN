import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";


function App() {
  const [id, setId] = useState(sessionStorage.getItem("id") || null);

  useEffect(() => {
    if (!id) {
      sessionStorage.removeItem("id");
    }
  }, [id]);

  return (
    <Router>
      <Routes>
        {/* If the user is not logged in, show the Login component */}
        <Route
          path="/"
          element={!id ? <Login setId={setId} /> : <Navigate to="/dashboard" />}
        />
        
        {/* Show the Dashboard if the user is logged in */}
        <Route
          path="/dashboard"
          element={id ? <Dashboard setId={setId} /> : <Navigate to="/" />}
        />
        
       
      </Routes>
    </Router>
  );
}

export default App;
