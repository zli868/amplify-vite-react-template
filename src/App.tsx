import React, { useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';

function App() {
  const { user } = useAuthenticator((context) => [context.user]);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null); // Explicit type
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  // Handles the file input change
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setUploadedImage(event.target.files[0]);
    }
  };


  const handleUpload = async () => {
    if (!uploadedImage || !user) {
      alert("Please select an image and make sure you're logged in.");
      return;
    }
  
    setLoading(true);
    setResponseMessage("");
  
    try {
      const userEmail = user.signInDetails?.loginId || '';
      // Modify the email
      const modifiedEmail = userEmail.replace('@', ':');
      // const base64Image = await convertFileToBase64(uploadedImage);
      // // Use the base64 string as needed
      // console.log(base64Image);

      // Make the API call to Lambda
      const response = await fetch(
      "https://v8c6qwk16b.execute-api.us-east-1.amazonaws.com/default/FaceDataCapture",
      {
        method: "POST",
                headers: {
                  'x-user-email': modifiedEmail, // Pass the email in a custom header
                },
        body:uploadedImage
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
  
 /* user.signInDetails?.loginId */
  return (
    <div className="App">
      <h2>Register Your Face</h2>
      <p>Email: {user.signInDetails?.loginId}</p> 
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload Image"}
      </button>
      {responseMessage && <p>{responseMessage}</p>}
    </div>
  );
}

export default App;
