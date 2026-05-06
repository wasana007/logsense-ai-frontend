import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import LoginSuccess from "./LoginSuccess";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/login-success" element={<LoginSuccess />} />
      <Route path="/" element={<App />} />
    </Routes>
  </BrowserRouter>
);