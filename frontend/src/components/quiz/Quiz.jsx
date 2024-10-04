import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Button from '@mui/material/Button';
import './Quiz.css';

const QuizPage = () => {
    const { quizId } = useParams();
    const [quizTitle, setQuizTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState({}); // To track selected options
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // To track the current question index

    const quizIdInt = parseInt(quizId, 10); // Convert quizId to integer

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await fetch(`http://localhost:8081/quiz/questions/${quizId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch quiz data');
                }
                const data = await response.json();
                console.log('Fetched quiz data:', data); // Log fetched quiz data

                if (data.length > 0) {
                    setQuizTitle(data[0].title);

                    const transformedQuestions = data.reduce((acc, currentItem) => {
                        const { question_id, question_text, option_text } = currentItem;
                        let question = acc.find(q => q.question_id === question_id);
                        if (!question) {
                            question = {
                                question_id,
                                question_text,
                                options: []
                            };
                            acc.push(question);
                        }
                        question.options.push(option_text);
                        return acc;
                    }, []);

                    setQuestions(transformedQuestions);
                } else {
                    setQuizTitle('');
                    setQuestions([]);
                }
            } catch (error) {
                console.error('Error fetching quiz data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [quizId]);

    if (loading) {
        return <div>Loading quiz...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const handleOptionClick = (questionId, selectedOption) => {
        setSelectedOptions(prevState => ({
            ...prevState,
            [questionId]: selectedOption
        }));
        console.log(`Question ID: ${questionId}, Selected Option: ${selectedOption}`);
        // Implement additional logic as needed (e.g., navigate to next question, submit answer, etc.)
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const currentQuestion = questions[currentQuestionIndex];

    const handleSubmitQuiz = async () => {
        // Implement the submit functionality here
        console.log('Quiz submitted with selected options:', selectedOptions);
        const finalSelectedOptions = questions.reduce((acc, question) => {
            acc[question.question_id] = selectedOptions[question.question_id] || "N/A"; // Set to selected option or "N/A" if not answered
            return acc;
        }, {});
        console.log(finalSelectedOptions);

        const submitData = {
            quizId: quizIdInt, // Assuming you have quizId available in your component
            userId: 1, // Replace with actual user ID from your auth context or state
            answers: finalSelectedOptions,
        };

        console.log(submitData);


        try { 
            const response = await axios.post('http://localhost:8081/quiz/submit', submitData);
            console.log('Quiz submitted successfully:', response.data);
            // Handle success scenario (e.g., show success message, redirect to dashboard, etc.)
        }
        catch (error) {
            console.error('Error submitting quiz:', error);
            // Handle error scenario (e.g., show error message, allow user to retry, etc.)
        }

    };

    return (
        <div className="quiz-container">
            <h1 className="quiz-title">{quizTitle || 'Quiz'}</h1>
            {questions.length === 0 ? (
                <p>No questions available for this quiz.</p>
            ) : (
                <div key={currentQuestion.question_id} className="question">
                    <h4 className="question-text">{currentQuestion.question_text}</h4>
                    <div className="options">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedOptions[currentQuestion.question_id] === option;
                            return (
                                <button
                                    key={index}
                                    className={`option-button ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleOptionClick(currentQuestion.question_id, option)}
                                >
                                    <span className="option-icon">
                                        {isSelected && <span></span>}
                                    </span>
                                    <span className="option-text">{option}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
            <div className="navigation-buttons">
            <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handlePreviousQuestion} 
                    disabled={currentQuestionIndex === 0}
                    style={{ marginRight: '10px' }}
                >
                    Previous
            </Button>

            {/* Conditionally render Next or Submit Button */}
            {currentQuestionIndex === questions.length - 1 ? (
                <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={handleSubmitQuiz}  // Submit logic here
                >
                    Submit Quiz
                </Button>
                ) : (
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleNextQuestion}
                >
                    Next
                </Button>
                )}
            </div>
        </div>
    );
};

export default QuizPage;