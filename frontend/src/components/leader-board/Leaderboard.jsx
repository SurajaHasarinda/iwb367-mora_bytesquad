// Leaderboard.js
import React, { useEffect, useState } from 'react';
import './Leaderboard.css'; // Import CSS for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMedal } from '@fortawesome/free-solid-svg-icons';

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
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
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
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
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
        return <div className="loader">Loading quizzes...</div>;
    }

    if (error) {
        return <div id="errorMessage">{error}</div>;
    }

    return (
        <div className="l-wrapper">
            <h2 id="leaderboard-title">Leaderboard</h2> {/* Added id here */}
            <select
                className="quiz-dropdown c-select"
                onChange={(e) => handleQuizSelect(e.target.value)}
                value={selectedQuizId || ""}
            >
            
                {quizzes.map((quiz) => (
                    <option key={quiz.id} value={quiz.id}>
                        {quiz.title}
                    </option>
                ))}
            </select>

            {selectedQuizId && (
                <div className="leaderboard-container">
                    <h2>Leaderboard</h2>
                    {loadingLeaderboard ? (
                        <div className="loader">Loading leaderboard...</div>
                    ) : (
                        <div className="leaderboard">
                            <div className="leaderboard-header">
                                <span className="header-item">Place</span>
                                <span className="header-item">Username</span>
                                <span className="header-item">Score</span>
                            </div>
                            {leaderboard.map((entry, index) => (
                                <div key={entry.username} className="leaderboard-card">
                                    <span className="place">
                                        {index < 3 ? (
                                            <FontAwesomeIcon
                                                icon={faMedal}
                                                className={`medal-icon medal-${index + 1}`}
                                            />
                                        ) : (
                                            index + 1
                                        )}
                                    </span>
                                    <span className="username">{entry.username}</span>
                                    <span className="score">{entry.score}</span>
                                </div>
                            ))}
                        </div>
                    )}
                   
                </div>
            )}
        </div>
    );
}

export default Leaderboard;
