import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import './QuizCards.css';
import QuizIcon from '@mui/icons-material/Quiz';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const userId = localStorage.getItem('userId');

const determineIconColor = (score) => {
    if (score === 'N/A') return 'gray';
    if (score >= 75) return 'green';
    if (score >= 40) return 'orange';
    return 'red';
};

const QuizCards = () => {
  const [gridSize, setGridSize] = useState(3); // Initial grid size (3x3)
    
  const [quizData, setQuizData] = useState([]);

  const getQuizData = async () => {
    try {
          const response = await axios.get(`http://localhost:8081/quiz/all/user/${userId}`);
          const quizData = response.data;
          console.log(quizData);
          setQuizData(quizData); // Update state with fetched data
    } catch (error) {
          console.error('Error fetching quiz data:', error);
        }
    };

    const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setGridSize(1);
      } else if (window.innerWidth <= 1024) {
        setGridSize(2);
      } else {
        setGridSize(3);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    getQuizData();
  }, []);

  const selectQuiz = (quizId) => {
    console.log('Selected quiz:', quizId);
    navigate(`./quiz/${quizId}`); // Navigate to the selected quiz
  }

  return (
    <div className="quiz-cards-container">
      {quizData.map((quiz) => (
        <Card 
          className="quiz-card"
          variant="outlined" 
          key={quiz.quiz_id} 
          onClick={() => { selectQuiz(quiz.quiz_id) }}
          style={{ 
            flex: `0 1 calc(${100 / gridSize}% - 20px)`,
            margin: '20px',
            borderRadius: '15px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          }}
        >
          <CardContent style={{ textAlign: 'center' }}>
            <Typography variant="h6" component="div" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QuizIcon style={{ marginRight: '8px', color: determineIconColor(quiz.score) }} /> {/* Adjust icon color */}
              {quiz.quiz_title}
            </Typography>
            <Typography variant="body2" color="text.secondary" style={{ marginTop: '8px' }}>
              Score: {quiz.score}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuizCards;