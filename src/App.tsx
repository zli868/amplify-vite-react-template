import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';

function App() {
  const { user } = useAuthenticator((context) => [context.user]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  // Handles the file input change
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setUploadedImage(event.target.files[0]);
    }
  };

  // // Handles the upload to Lambda
  // const handleUpload = async () => {
  //   if (!uploadedImage || !user) {
  //     alert("Please select an image and make sure you're logged in.");
  //     return;
  //   }

  //   setLoading(true);
  //   setResponseMessage("");

  //   try {
  //     const userEmail = user.signInDetails?.loginId || '';
  //     // Modify the email
  //     const modifiedEmail = userEmail.replace('@', ':');
  //     // Read the file as binary data
  //     const reader = new FileReader();
  //     reader.readAsDataURL(uploadedImage);
  //     reader.onload = async () => {
  //       const base64Image = reader.result;

  //       // Make the API call to Lambda
  //       const response = await fetch(
  //         'https://v8c6qwk16b.execute-api.us-east-1.amazonaws.com/default/FaceDataCapture',
  //         {
  //           method: 'POST',
  //           headers: {
  //             'x-user-email': modifiedEmail, // Pass the email in a custom header
  //           },
  //           body: JSON.stringify({
  //             email: modifiedEmail,
  //             image: base64Image
  //           }),
  //         }
  //       );

  //       const responseData = await response.json();

  //       if (response.ok) {
  //         setResponseMessage("Registration Successful: " + JSON.stringify(responseData));
  //       } else {
  //         setResponseMessage("Registration Error: " + JSON.stringify(responseData));
  //       }
  //     };

  //     reader.onerror = (error) => {
  //       console.error("File reading error", error);
  //       setResponseMessage("File reading error");
  //     };
  //   } catch (error) {
  //     console.error("Upload error", error);
  //     setResponseMessage("Upload error: " + error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


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
      const reader = new FileReader();
      reader.readAsDataURL(uploadedImage);
      reader.onload = async () => {
        const base64Image = reader.result?.toString().split(",")[1]; // Remove the prefix (e.g., `data:image/jpeg;base64,`)
      console.log("Base64 Encoded Image:", base64Image);
        // Make the API call to Lambda
        const response = await fetch(
          "https://v8c6qwk16b.execute-api.us-east-1.amazonaws.com/default/FaceDataCapture",
          {
            method: "POST",
                    headers: {
                      'x-user-email': modifiedEmail, // Pass the email in a custom header
                    },
            body: JSON.stringify({
              email: modifiedEmail,
              image: base64Image,
            }),
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
      };
  
      reader.onerror = (error) => {
        console.error("File reading error", error);
        setResponseMessage("File reading error");
      };
    } catch (error) {
      console.error("Upload error", error);
      setResponseMessage("Upload error: " + error.message);
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
