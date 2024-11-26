import React, { useState, useRef } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';

function App() {
  const { user } = useAuthenticator((context) => [context.user]);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null); // Explicit type
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handles the file input change
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setUploadedImage(event.target.files[0]);
    }
  };

  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing the camera", error);
      }
    }
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 640, 480);
        const imageDataUrl = canvasRef.current.toDataURL("image/png");
        setCapturedImage(imageDataUrl);
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadedImage && !capturedImage) {
      alert("Please select an image or capture a selfie.");
      return;
    }
    if (!user) {
      alert("Please make sure you're logged in.");
      return;
    }

    setLoading(true);
    setResponseMessage("");

    try {
      const userEmail = user.signInDetails?.loginId || '';
      const modifiedEmail = userEmail.replace('@', ':');
      const imageBlob = capturedImage ? await (await fetch(capturedImage)).blob() : uploadedImage;

      // Make the API call to Lambda
      const response = await fetch(
        "https://v8c6qwk16b.execute-api.us-east-1.amazonaws.com/default/FaceDataCapture",
        {
          method: "POST",
          headers: {
            'x-user-email': modifiedEmail,
          },
          body: imageBlob,
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        setResponseMessage(
          "Registration Successful: " + JSON.stringify(responseData)
        );
      } else {
        setResponseMessage("Error: " + JSON.stringify(responseData));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Upload error", error);
        setResponseMessage("Upload error: " + error.message);
      } else {
        console.error("Unexpected error", error);
        setResponseMessage("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h2>Register Your Face</h2>
      <p>Email: {user.signInDetails?.loginId}</p>
      <div>
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>
      <div>
        <button onClick={startCamera}>Start Camera</button>
        <video ref={videoRef} width="640" height="480" autoPlay></video>
        <button onClick={captureSelfie}>Capture Selfie</button>
      </div>
      {capturedImage && (
        <div>
          <h3>Captured Selfie:</h3>
          <img src={capturedImage} alt="Captured Selfie" />
        </div>
      )}
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload Image"}
      </button>
      {responseMessage && <p>{responseMessage}</p>}
      <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }}></canvas>
    </div>
  );
}

export default App;
