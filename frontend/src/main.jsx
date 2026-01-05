import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"
import { BrowserRouter } from "react-router-dom";

import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(

 <GoogleOAuthProvider clientId="24617494428-bgrs5iedrqoug4eq0um21mni5bug0shn.apps.googleusercontent.com">
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
);
