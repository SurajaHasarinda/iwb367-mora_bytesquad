import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import LoginSignupForm from './components/user-login-and-singup/LoginSignupForm';
//import UserDashboard from './components/user-dashboard/UserDashboard';
//import PrivateRoute from './components/auth/PrivateRoute';

//import AddQuiz from './components/add-quiz/AddQuiz.jsx'
//import ScoreCard from './components/score/ScoreCard.jsx';
import Leaderboard from './components/leader-board/Leaderboard'; // Import your Leaderboard component


function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<LoginSignupForm />} /> 
        <Route path="/" element={<ScoreCard score={10} />} />
        <Route path="/user-dashboard/*" element={<PrivateRoute><UserDashboard /></PrivateRoute>}> 
       
        </Route> */}
         <Route path="leaderboard" element={<Leaderboard />} />
        
      </Routes>
    </Router>
  );
}

export default App;
