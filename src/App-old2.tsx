import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);
const client = generateClient({
  authMode: "userPool",
});

function App() {
  const { user } = useAuthenticator((context) => [context.user]);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    fetchUserEmail();
  }, []);

  async function fetchUserEmail() {
    if (!user) return;
    try {
      // Fetch user profiles to get email
      const { data: profiles } = await client.models.UserProfile.list();
      const currentUser = profiles.find((profile) => profile.id === user.username);
      if (currentUser) {
        setUserEmail(currentUser.email || "Email not found");
      } else {
        setUserEmail("Email not found");
      }
    } catch (error) {
      console.error("Error fetching user email:", error);
      setUserEmail("Error fetching email");
    }
  }

  // Handles the file input change
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setUploadedImage(event.target.files[0]);
    }
  };

  // Handles the upload to Lambda
  const handleUpload = async () => {
    if (!uploadedImage || !userEmail) {
      alert("Please select an image and make sure you're logged in.");
      return;
    }

    setLoading(true);
    setResponseMessage("");

    try {
      // Read the file as binary data
      const reader = new FileReader();
      reader.readAsDataURL(uploadedImage);
      reader.onload = async () => {
        const base64Image = reader.result;

        // Make the API call to Lambda
        const response = await fetch(
          'https://v8c6qwk16b.execute-api.us-east-1.amazonaws.com/default/FaceDataCapture',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: userEmail,
              image: base64Image
            }),
          }
        );

        const responseData = await response.json();

        if (response.ok) {
          setResponseMessage("Registration Successful: " + JSON.stringify(responseData));
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

  return (
    <div className="App">
      <h2>Register Your Face</h2>
      <p>Email: {userEmail}</p>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload Image"}
      </button>
      {responseMessage && <p>{responseMessage}</p>}
    </div>
  );
}

export default App;
