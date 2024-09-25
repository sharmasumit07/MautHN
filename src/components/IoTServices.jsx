import React, { useEffect, useState } from "react";
import QRious from "qrious";
import './iot.css';

const IoTServices = () => {
  const [iotToken, setIoTToken] = useState("Loading IoT Token...");

  useEffect(() => {
    const id = sessionStorage.getItem("id");

    fetch("https://mauthn.mukham.in/get_iot", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        id,
      }),
    })
      .then((response) => response.text())
      .then((iottoken) => {
        setIoTToken(iottoken);

        // Generate QR Code
        new QRious({
          element: document.getElementById("qrCode"),
          value: iottoken,
          size: 200, // Set size of the QR code
        });
      })
      .catch((error) => {
        setIoTToken("Error fetching IoT Token.");
        console.error("Error:", error);
      });
  }, []);

  return (
    <div>
      <h3>IoT Services</h3>
      <p>{iotToken}</p>
      <canvas id="qrCode"></canvas>
    </div>
  );
};

export default IoTServices;
