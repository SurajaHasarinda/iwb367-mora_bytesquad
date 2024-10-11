import React, { useEffect, useState } from 'react';
import {
    Box,
    CircularProgress,
    Typography,
    Select,
    MenuItem,
    FormControl,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Avatar,
    Paper,
    Tooltip,
    IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import { useNavigate } from 'react-router-dom';
import './Leaderboard.css';

// Import medal images
import goldMedal from '../../assets/images/medal-images/gold.png';
import silverMedal from '../../assets/images/medal-images/silver.png';
import bronzeMedal from '../../assets/images/medal-images/bronze.png';

function Leaderboard() {
    const [quizzes, setQuizzes] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState(true);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
    const [error, setError] = useState('');
    const [selectedQuizId, setSelectedQuizId] = useState(null);

    const navigate = useNavigate();

    const goBack = () => {
        navigate('/user-dashboard');
    };
  
    useEffect(() => {
        const fetchQuizzes = async () => {
            const apiUrl = 'http://localhost:8081/quiz/Quizzes';
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                console.log(data);

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
                console.log(data);

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
        setLeaderboard([]); // Clear previous leaderboard data
        setError(''); // Clear previous errors
    };

    if (loadingQuizzes) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress color='#695CFE'/>
            </Box>
        );
    }

    return (
        <div className="leaderboard">
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh">
                <Box p={3} display="flex" width="400px" flexDirection="column" alignItems="center" bgcolor="white" borderRadius={3} boxShadow={3}>
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        sx={{ marginTop: '20px' }}
                    >
                        <LeaderboardIcon sx={{ marginRight: '10px', color: '#695CFE' }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Leaderboard
                        </Typography>
                    </Box>

                    <FormControl fullWidth variant="outlined">
                        <Select
                            value={selectedQuizId || ""}
                            onChange={(e) => handleQuizSelect(e.target.value)}
                            sx={{ bgcolor: 'white', borderRadius: 2 }}
                            vocab='Select Quiz'
                            displayEmpty
                        >
                            <MenuItem value="" disabled>
                                Select Quiz
                            </MenuItem>
                            
                            {quizzes.map((quiz) => (
                                <MenuItem key={quiz.id} value={quiz.id}>
                                    {quiz.title}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {error && <Typography color="error" mt={2}>{error}</Typography>}

                    {selectedQuizId && (
                        <Box mt={4} width="100%">
                            {loadingLeaderboard ? (
                                <Box display="flex" justifyContent="center">
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableBody>
                                            {leaderboard.map((entry, index) => (
                                                <TableRow key={entry.username}>
                                                    <TableCell align="center">
                                                        <Avatar
                                                            src={getMedalImage(entry.rank_position)}
                                                            alt={getMedalAlt(entry.rank_position)}
                                                            sx={{ width: 40, height: 40 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography >{entry.username}</Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography >{entry.score}</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    )}
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
            </Box>
        </div>
    );
}

// Helper function to get medal image based on rank
const getMedalImage = (rank) => {
    switch (rank) {
        case 1:
            return goldMedal;
        case 2:
            return silverMedal;
        case 3:
            return bronzeMedal;
        default:
            return '';
    }
};

// Helper function to get alt text for medal images
const getMedalAlt = (rank) => {
    switch (rank) {
        case 1:
            return 'Gold';
        case 2:
            return 'Silver';
        case 3:
            return 'Bronze';
        default:
            return '';
    }
};

export default Leaderboard;
