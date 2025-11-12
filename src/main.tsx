import React from "react"; // ensure React in scope if JSX transformed to React.createElement
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
