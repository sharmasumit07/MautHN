import React, { useState, useRef, useEffect } from 'react';
import './auth.css';

const AuthPopup = ({ perms, token, onClose }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [imageCaptured, setImageCaptured] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [facialRecognitionComplete, setFacialRecognitionComplete] = useState(false);
  const [deviceAttestationComplete, setDeviceAttestationComplete] = useState(false);
  const [passkeyVerificationComplete, setPasskeyVerificationComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // Track the current verification step
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Sequential verification modes in order
  const modes = [
    { name: 'Facial Recognition', complete: facialRecognitionComplete },
    { name: 'Device Attestation', complete: deviceAttestationComplete },
    { name: 'Security Key Verification', complete: passkeyVerificationComplete },
  ];

  useEffect(() => {
    // Camera activation logic
    if (cameraActive) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((error) => console.error('Error accessing the camera:', error));
    }
  }, [cameraActive]);

  const verifyMode = (mode) => {
    switch (mode) {
      case 'Facial Recognition':
        setCameraActive(true);
        break;

      case 'Device Attestation':
        const attestationWindow = window.open(`https://mauthn.mukham.in/fido_platform?token=${token}`, '_blank');
        if (attestationWindow) {
          setDeviceAttestationComplete(true);
          setVerificationResult('Device Attestation completed successfully!');
          setCurrentStep((prev) => prev + 1); // Move to next step
        } else {
          setVerificationResult('Failed to open Device Attestation window.');
        }
        break;

      case 'Security Key Verification':
        const passkeyWindow = window.open(`https://mauthn.mukham.in/fido_roaming?token=${token}`, '_blank');
        if (passkeyWindow) {
          setPasskeyVerificationComplete(true);
          setVerificationResult('Passkey Verification completed successfully!');
          setCurrentStep((prev) => prev + 1); // Move to next step
        } else {
          setVerificationResult('Failed to open Passkey Verification window.');
        }
        break;

      default:
        break;
    }
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video && video.videoWidth > 0 && video.videoHeight > 0) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const image = canvas.toDataURL('image/png').replace('data:image/png;base64,', '');
      streamRef.current.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
      setImageCaptured(true);
      const formData = new FormData();
      formData.append('img', image);
      formData.append('token', token);
      formData.append('location', '(0,0)');
      fetch('https://mauthn.mukham.in/face', { method: 'POST', body: formData })
        .then((response) => response.text())
        .then((data) => {
          if (data.includes('true')) {
            setFacialRecognitionComplete(true);
            setVerificationResult('Facial Recognition completed successfully!');
            setCurrentStep((prev) => prev + 1); // Move to next step
          } else {
            setVerificationResult('Facial Recognition failed.');
          }
        })
        .catch(() => setVerificationResult('Facial Recognition failed due to an error.'));
    }
  };

  useEffect(() => {
    if (facialRecognitionComplete && deviceAttestationComplete && passkeyVerificationComplete) {
      setVerificationResult('All verifications completed successfully!');
      setTimeout(() => onClose(), 2000);
    }
  }, [facialRecognitionComplete, deviceAttestationComplete, passkeyVerificationComplete, onClose]);

  return (
    <div className="popup">
      <div className="popup-content">
        <div className="popup-header">
          <span className="popup-close" onClick={onClose}>×</span>
          <h3>Authentication Required</h3>
          <p className="instructions">Please complete the verifications one by one:</p>
        </div>
        <div className="verification-list">
          {modes.map((mode, index) => (
            <div key={index} className="verification-item">
              <span>{mode.name}</span>
              <button
                className="verify-button"
                disabled={index !== currentStep || mode.complete} // Only enable the current step
                onClick={() => verifyMode(mode.name)}
              >
                {mode.complete ? 'Done' : 'Verify'}
              </button>
            </div>
          ))}
        </div>
        {cameraActive && (
          <div className="camera-container">
            <video ref={videoRef} autoPlay className="camera-view" />
            <button className="capture-btn" onClick={captureImage}>Capture</button>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        )}
        {verificationResult && (
          <div className={`verification-result ${verificationResult.includes('failed') ? 'error-message' : ''}`}>
            {verificationResult}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPopup;
