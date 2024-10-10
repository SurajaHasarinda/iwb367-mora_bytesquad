import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginSignupForm from './components/user-login-and-singup/LoginSignupForm';
import UserDashboard from './components/user-dashboard/UserDashboard';
import PrivateRoute from './components/auth/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignupForm />} />
        <Route path="/user-dashboard/*" element={<PrivateRoute><UserDashboard /></PrivateRoute>}>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
