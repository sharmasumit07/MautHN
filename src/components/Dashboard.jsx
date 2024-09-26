import React, { useState, useEffect, useRef } from "react";
import IoTServices from "./IoTServices";
import Requests from "./Requests";
import Logs from "./Logs";
import { useNavigate } from 'react-router-dom';
import "./Dashboard.css";

const Dashboard = ({ setId }) => {
  const [activeTab, setActiveTab] = useState("requests");
  const [activeRequests, setActiveRequests] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  // Function to fetch active requests
  const fetchActiveRequests = async () => {
    try {
      const id = sessionStorage.getItem("id");
      if (!id) {
        throw new Error("Session ID not found. Please log in again.");
      }

      const response = await fetch("https://mauthn.mukham.in/req", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ id }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.text();
      setActiveRequests(data === "0000" || data === "[]" ? 0 : data.trim().split("\n").length);
    } catch (error) {
      console.error("Failed to fetch active requests:", error);
      setActiveRequests(0); // Fallback value
    }
  };

  useEffect(() => {
    const intervalId = setInterval(fetchActiveRequests, 5000); // Poll every 5 seconds
    fetchActiveRequests(); // Initial fetch

    return () => clearInterval(intervalId); // Clean up on component unmount
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("id");
    setId(null);
    navigate("/");
  };

  const handleAuthenticate = () => {
    setShowPopup(false);
    navigate("/verify");
  };

  return (
    <div className="dashboard">
      <div className="header">
        <button onClick={handleLogout} className="logout-btn">Logout</button>
        <div className="tab-container">
          <button
            onClick={() => setActiveTab("requests")}
            className={`tab-btn ${activeTab === "requests" ? "active" : ""}`}
          >
            Requests
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`tab-btn ${activeTab === "logs" ? "active" : ""}`}
          >
            Logs
          </button>
        </div>
      </div>

      {activeTab === "requests" && (
        <div className="requests-section">
          <div className="active-requests-circle">
            <div className="active-requests-text">
              <span>Active</span>
              <h3>{activeRequests} Requests</h3>
            </div>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Authentication Required</h3>
            <p>Do you want to authenticate the request?</p>
            <button onClick={handleAuthenticate} className="auth-btn">Authenticate</button>
            <button onClick={() => setShowPopup(false)} className="close-btn">Close</button>
          </div>
        </div>
      )}

      <div className="tab-content">
        {activeTab === "iotServices" && <IoTServices />}
        {activeTab === "requests" && <Requests />}
        {activeTab === "logs" && <Logs />}
      </div>
    </div>
  );
};

export default Dashboard;
