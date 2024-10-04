// src/components/QuizPage.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Quizpage.css'; // Import the CSS file

const QuizPage = () => {
    const { quizId } = useParams();
    const [quizTitle, setQuizTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState({}); // To track selected options

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

    return (
        <div className="quiz-container">
            <h1 className="quiz-title">{quizTitle || 'Quiz'}</h1>
            {questions.length === 0 ? (
                <p>No questions available for this quiz.</p>
            ) : (
                questions.map((question) => (
                    <div key={question.question_id} className="question">
                        <h4 className="question-text">{question.question_text}</h4>
                        <div className="options">
                            {question.options.map((option, index) => {
                                const isSelected = selectedOptions[question.question_id] === option;
                                return (
                                    <button
                                        key={index}
                                        className={`option-button ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleOptionClick(question.question_id, option)}
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
                ))
            )}
        </div>
    );
};

export default QuizPage;
