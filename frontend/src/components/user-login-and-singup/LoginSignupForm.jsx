import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./LoginSignupForm.css";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const LoginSignupForm = () => {
  const [isLoginActive, setIsLoginActive] = useState(true);

  // State for login form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // State for signup form
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupMessage, setSignupMessage] = useState('');

  // State for Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // To navigate to another page
  const navigate = useNavigate();

  // Toggle between Login and Signup forms
  const toggleForm = () => {
    setIsLoginActive(!isLoginActive);
    // clear text fields
    setUsername('');
    setPassword('');
    setSignupUsername('');
    setSignupPassword('');
    setConfirmPassword('');
    setSignupMessage('');
  };

  const showMessage = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post('http://localhost:8080/auth/login', {
          username,
          password
        });

        if (response.status === 200) {
          showMessage(response.data.message || "Login successful!", "success");
          navigate('/user-dashboard');
          // navigate('/quiz');
        } else {
          showMessage(response.data.message || "Login failed!", "error");
        }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          showMessage(error.response.data.message || "Invalid credentials!", "error");
        } else if (error.response.status === 404) {
          showMessage(error.response.data.message || "User not found!", "error");
        } else {
          showMessage(error.response.data.message || "Login failed!", "error");
        }
        console.error(error.response.data);
        console.error(error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        showMessage('No response received from the server. Please try again.', "error");
        console.error(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        showMessage('An error occurred. Please try again.', "error");
        console.error('Error', error.message);
      }
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Check if passwords match
    if (signupPassword !== confirmPassword) {
      showMessage("Passwords do not match", "error");
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/auth/signup', {
        username: signupUsername,
        password: signupPassword
      });
    
      if (response.status === 201) {
        showMessage(response.data.message || "Signup successful!", "success");
      } else {
        showMessage(response.data.message || "Signup failed!", "error");
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        if (error.response.status === 409) {
          showMessage(error.response.data.message || "User already exists!", "error");
        } else {
          showMessage(error.response.data.message || "Signup failed!", "error");
        }
      } else if (error.request) {
        // The request was made but no response was received
        showMessage('No response received from the server. Please try again.', "error");
      } else {
        // Something happened in setting up the request that triggered an Error
        showMessage('An error occurred. Please try again.', "error");
      }
    }
  };

  return (
    <section className={`wrapper ${isLoginActive ? "active" : ""}`}>
      {/* Signup Form */}
      <div className={`form signup ${isLoginActive ? "" : "show"}`}>
        <header onClick={toggleForm}>Signup</header>
        <form onSubmit={handleSignup}>
          <input 
            type="text" 
            placeholder="Username" 
            value={signupUsername}
            onChange={(e) => setSignupUsername(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder="Confirm Password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <div className="checkbox">
            <input type="checkbox" id="signupCheck" required />
            <label htmlFor="signupCheck">I accept all terms & conditions</label>
          </div>
          <input type="submit" value="Signup" />
        </form>
        {signupMessage && <p>{signupMessage}</p>}
      </div>

      {/* Login Form */}
      <div className={`form login ${isLoginActive ? "show" : ""}`}>
        <header onClick={toggleForm}>Login</header>
        <form onSubmit={handleLogin}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <input type="submit" value="Login"/>
        </form>
      </div>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
      </Snackbar>
    </section>
  );
};

export default LoginSignupForm;