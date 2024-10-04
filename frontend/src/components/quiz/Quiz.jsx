import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const QuizPage = () => {
    const { quizId } = useParams();
    const [quizTitle, setQuizTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>{quizTitle || 'Quiz'}</h1>
            {questions.length === 0 ? (
                <p>No questions available for this quiz.</p>
            ) : (
                questions.map((question) => (
                    <div key={question.question_id} style={{ marginBottom: '20px' }}>
                        <h4>{question.question_text}</h4>
                        <div>
                            {question.options.map((option, index) => (
                                <button
                                    key={index}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '10px',
                                        margin: '5px 0',
                                        cursor: 'pointer',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        backgroundColor: '#f9f9f9'
                                    }}
                                    onClick={() => handleOptionClick(question.question_id, option)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    // Example handler for option click (you can implement your own logic)
    function handleOptionClick(questionId, selectedOption) {
        console.log(`Question ID: ${questionId}, Selected Option: ${selectedOption}`);
        // Implement your logic (e.g., record the answer, navigate to the next question, etc.)
    }
};

export default QuizPage;
