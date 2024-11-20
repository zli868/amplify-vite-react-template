import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";
import React from "react";
import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";
import { Loader, ThemeProvider } from "@aws-amplify/ui-react";

const client = generateClient<Schema>();

function App() {
  const { signOut } = useAuthenticator();
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [createLivenessApiData, setCreateLivenessApiData] = useState<{
    sessionId: string;
  } | null>(null);
  const [isLivenessVerified, setIsLivenessVerified] = useState<boolean | null>(null);

  // Fetch todos
  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  // Fetch liveness session ID
  useEffect(() => {
    const fetchCreateLiveness: () => Promise<void> = async () => {
      // Replace this with a real call to your backend API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const mockResponse = { sessionId: "mockSessionId" };
      setCreateLivenessApiData(mockResponse);
      setLoading(false);
    };

    fetchCreateLiveness();
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  const handleAnalysisComplete: () => Promise<void> = async () => {
    // Replace this with your backend API call
    const response = await fetch(
      `/api/get?sessionId=${createLivenessApiData?.sessionId}`
    );
    const data = await response.json();

    if (data.isLive) {
      setIsLivenessVerified(true);
      console.log("User is live");
    } else {
      setIsLivenessVerified(false);
      console.log("User is not live");
    }
  };

  return (
    <ThemeProvider>
      <main>
        <h1>My todos</h1>
        <button onClick={createTodo}>+ new</button>
        <ul>
          {todos.map((todo) => (
            <li onClick={() => deleteTodo(todo.id)} key={todo.id}>
              {todo.content}
            </li>
          ))}
        </ul>
        <div>
          🥳 App successfully hosted. Try creating a new todo.
          <br />
          <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
            Review next step of this tutorial.
          </a>
        </div>
        <button onClick={signOut}>Sign out</button>

        <section style={{ marginTop: "20px" }}>
          <h2>Face Liveness Verification</h2>
          {loading ? (
            <Loader />
          ) : (
            <FaceLivenessDetector
              sessionId={createLivenessApiData?.sessionId}
              region="us-east-1"
              onAnalysisComplete={handleAnalysisComplete}
              onError={(error) => console.error(error)}
            />
          )}
          {isLivenessVerified === true && (
            <p style={{ color: "green" }}>User is live and verified! ✅</p>
          )}
          {isLivenessVerified === false && (
            <p style={{ color: "red" }}>User verification failed. ❌</p>
          )}
        </section>
      </main>
    </ThemeProvider>
  );
}

export default App;
