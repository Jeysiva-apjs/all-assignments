import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";

import "./style.css";

/// File is incomplete. You need to add input boxes to take input for users to login.
function Login() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = () => {
    if (email.trim() === "" || password.trim() == "") {
      setMessage("Email/Password field cannot be empty.");
      return;
    } else {
      fetch("http://localhost:3000/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          localStorage.setItem("token", data.token);
          if (data.message === "Invalid username or password") {
            setMessage(data.message);
            return;
          }
          setEmail("");
          setPassword("");
          window.location.reload();
          // navigate("/login");
        });
    }
  };

  return (
    <div className="page">
      <div className="title">
        <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
          Login to admin dashboard
        </Typography>

        <p style={{ textAlign: "center", color: "red" }}>{message}</p>
      </div>
      <Card className="form">
        <TextField
          id="email"
          label="Email"
          variant="outlined"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          id="password"
          label="Password"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button className="button" variant="contained" onClick={handleLogin}>
          Login
        </Button>
        <br></br>
        <div>
          <h3 style={{ fontWeight: "500" }}>
            New here? Click here to register new account.
          </h3>
          <Button
            className="button"
            variant="contained"
            onClick={() => navigate("/register")}
          >
            Register
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default Login;
