// Leaderboard.js
import React, { useEffect, useState } from 'react';
import './Leaderboard.css'; // Import CSS for styling

function Leaderboard() {
    const [quizzes, setQuizzes] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState(true);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
    const [error, setError] = useState('');
    const [selectedQuizId, setSelectedQuizId] = useState(null);

    // Fetch quizzes on component mount
    useEffect(() => {
        const fetchQuizzes = async () => {
            const apiUrl = 'http://localhost:8081/quiz/Quizzes';
            try {
                const response = await fetch(apiUrl);
                const data = await response.json();

                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error("No quizzes found.");
                }

                setQuizzes(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoadingQuizzes(false);
            }
        };

        fetchQuizzes();
    }, []);

    // Fetch leaderboard whenever selectedQuizId changes
    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (!selectedQuizId) return;

            const apiUrl = `http://localhost:8081/quiz/LeaderboardByQuizTitle/${selectedQuizId}`;
            setLoadingLeaderboard(true);
            try {
                const response = await fetch(apiUrl);
                const data = await response.json();

                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error("No leaderboard data found for this quiz.");
                }

                setLeaderboard(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoadingLeaderboard(false);
            }
        };

        fetchLeaderboard();
    }, [selectedQuizId]);

    const handleQuizSelect = (quizId) => {
        setSelectedQuizId(quizId);
    };

    if (loadingQuizzes) {
        return <div className="loader"></div>;
    }

    if (error) {
        return <div id="errorMessage">{error}</div>;
    }

    return (
        <div>
            <h2>Select a Quiz</h2>
            <div className="quiz-list">
                <ul className="scrollable-list">
                    {quizzes.map((quiz) => (
                        <li key={quiz.id} onClick={() => handleQuizSelect(quiz.id)}>
                            {quiz.title}
                        </li>
                    ))}
                </ul>
            </div>
            {selectedQuizId && (
                <div>
                    <h2>Leaderboard</h2>
                    {loadingLeaderboard ? (
                        <div className="loader"></div>
                    ) : (
                        <table id="leaderboardTable">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Username</th>
                                    <th>Score</th>
                                    <th>Quiz Title</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((entry) => (
                                    <tr key={entry.id}>
                                        <td>{entry.rank_position}</td>
                                        <td>{entry.username}</td>
                                        <td>{entry.score}</td>
                                        <td>{entry.quiz_title}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

export default Leaderboard;
