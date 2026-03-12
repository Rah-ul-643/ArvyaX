import React, { useState } from "react";
import Journal from "./pages/Journal";
import "./App.css";

function App() {
  const [userId] = useState("user_123");

  return (
    <div className="app">
      <Journal userId={userId} />
    </div>
  );
}

export default App;