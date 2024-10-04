import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginSignupForm from './components/user-login-and-singup/LoginSignupForm';
import UserDashboard from './components/user-dashboard/UserDashboard';
import Quiz from './components/quiz/Quiz';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignupForm />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        
        <Route path="/quiz/:quizId" element={<Quiz />} /> {/* Add route for Quiz */}
      </Routes>
    </Router>
  );
}

export default App;
