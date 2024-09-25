import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const FacialRecognition = ({ onSuccess, onError }) => {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models'; // Path to your face-api models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setLoading(false);
    };

    loadModels();

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (error) {
        console.error('Error accessing camera:', error);
        onError(error);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [onError]);

  const handleFacialRecognition = async () => {
    if (!videoRef.current) return;

    const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detections) {
      // Here you can handle the detected face
      onSuccess(); // Call onSuccess if facial recognition is successful
    } else {
      onError(new Error('No face detected.'));
    }
  };

  if (loading) return <p>Loading models...</p>;

  return (
    <div>
      <video ref={videoRef} autoPlay muted />
      <button onClick={handleFacialRecognition}>Start Facial Recognition</button>
    </div>
  );
};

export default FacialRecognition;
