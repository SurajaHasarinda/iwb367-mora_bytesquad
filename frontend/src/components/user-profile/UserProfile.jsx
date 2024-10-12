import React, { useState, useEffect } from 'react';
import { Box, Card, Avatar, Typography, Tooltip, IconButton, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChecklistIcon from '@mui/icons-material/Checklist';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const userId = localStorage.getItem('userId');
const userName = localStorage.getItem('username');

function stringAvatar(name) {
    const initials = name.split(' ').map((word) => word[0]).join('').toUpperCase();
    return {
        sx: {
            bgcolor: '#A020F0',
            fontSize: '1.5rem',
            width: 60,
            height: 60,
        },
        children: initials,
    };
}

const UserProfile = () => {
    const [quizzes, setQuizzes] = useState([
        {
            quizName: '',
            score: '',
        },
    ]);

    const navigate = useNavigate();

    const goBack = () => {
        navigate('/user-dashboard');
    };

    const fetchQuizzes = async () => {
        try {
            const response = await axios.get(`http://localhost:8081/quiz/all/user/${userId}`);
            const quizData = response.data
                .filter((quiz) => quiz.score !== 'N/A') // Exclude quizzes with score 'N/A'
                .map((quiz) => ({
                    quizName: quiz.quiz_title,
                    score: quiz.score,
                }));
            setQuizzes(quizData);
        } catch (error) {
            console.error('Error fetching quiz data:', error);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    return (
        <div className="user-profile-container">
            <Box>
                <Card
                    sx={{
                        width: '500px',
                        padding: '30px',
                        borderRadius: '15px',
                        backgroundColor: '#FFFFFF',
                        textAlign: 'center',
                        margin: '50px auto 0',
                    }}
                >
                    <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
                        <Avatar {...stringAvatar(userName)} />
                    </Box>

                    <Typography
                        variant="h6"
                        sx={{
                            marginTop: '10px',
                            fontWeight: 'bold',
                        }}
                    >
                        {userName}
                    </Typography>

                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        sx={{ marginTop: '20px' }}
                    >
                        <ChecklistIcon sx={{ marginRight: '10px', color: '#695CFE' }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            My Score
                        </Typography>
                    </Box>

                    {/* Quiz Scores - Using Table */}
                    <TableContainer component={Paper} sx={{ marginTop: '10px' }}>
                        <Table aria-label="quiz table">
                            <TableBody>
                                {quizzes.map((quiz, index) => (
                                    <TableRow key={index}>
                                        <TableCell component="th" scope="row">
                                            {quiz.quizName}
                                        </TableCell>
                                        <TableCell align="right">{quiz.score}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Box>

            <div className="back-button">
                <Tooltip title="Go Back">
                    <IconButton
                        color="primary"
                        sx={{
                            color: 'white',
                            backgroundColor: '#695CFE',
                            ':hover': { backgroundColor: '#5648CC' },
                        }}
                        onClick={goBack}
                    >
                        <ArrowBackIcon fontSize="large" />
                    </IconButton>
                </Tooltip>
            </div>
        </div>
    );
};

export default UserProfile;
