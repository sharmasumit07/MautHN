import React, { useState } from "react";
import './login.css';

const Login = ({ setId }) => {
  const [token, setToken] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  const handleLogin = () => {
    fetch("https://mauthn.mukham.in/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        token,
      }),
    })
      .then((response) => response.text())
      .then((id) => {
        if (id === "0000") {
          setLoginMessage("Login failed.");
        } else {
          sessionStorage.setItem("id", id);
          setId(id);
          setLoginMessage("Login successful!");
        }
      })
      .catch((error) => {
        setLoginMessage("Error during login.");
        console.error("Error:", error);
      });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src="logo.png" alt="MAuthN Logo" className="login-logo" />
        <h2 className="login-title">MAuthN</h2>
        <div className="input-group">
          <label htmlFor="token" className="input-label">
            Token
          </label>
          <input
            type="text"
            id="token"
            name="token"
            className="input-field"
            placeholder="Enter token here"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>
        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>
        <p id="loginMessage" className="login-message">
          {loginMessage}
        </p>
        <p className="login-help-text">
          To get a token visit{" "}
          <a
            href="https://mauthn.mukham.in/email-login"
            target="_blank"
            className="login-link"
            rel="noopener noreferrer"
          >
            mauthn.mukham.in/email-login
          </a>
        </p>
        <footer className="login-footer">Powered by Mukham</footer>
      </div>
    </div>
  );
};

export default Login;
