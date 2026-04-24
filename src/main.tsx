import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import App from "./App";
import "./index.css";
import { router } from "./router";
import { AuthProvider } from "./contexts/AuthContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <App>
        <RouterProvider router={router} />
      </App>
    </AuthProvider>
  </React.StrictMode>,
);