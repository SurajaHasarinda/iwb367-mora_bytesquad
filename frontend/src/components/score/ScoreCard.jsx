import React from 'react';
import { Card, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './ScoreCard.css';
import { useNavigate } from 'react-router-dom';

import moodImage1 from '../../assets/images/mood-face-images/mood-1.jpg';
import moodImage2 from '../../assets/images/mood-face-images/mood-2.jpg';
import moodImage3 from '../../assets/images/mood-face-images/mood-3.jpg';
import moodImage4 from '../../assets/images/mood-face-images/mood-4.jpg';
import moodImage5 from '../../assets/images/mood-face-images/mood-5.jpg';

const ScoreCard = ({ score }) => {

  const navigate = useNavigate();

  const goBack = () => {
    navigate('/user-dashboard');
  };

  let MoodIconComponent;

  if (score > 75) {
    MoodIconComponent = <img src={moodImage1} alt="Happy Mood" style={{ width: '200px', height: '200px' }} />;
  } else if (score > 60) {
    MoodIconComponent = <img src={moodImage2} alt="Happy Mood" style={{ width: '200px', height: '200px' }} />;
  } else if (score > 40) {
    MoodIconComponent = <img src={moodImage3} alt="Happy Mood" style={{ width: '200px', height: '200px' }} />;
  } else if (score > 0) {
    MoodIconComponent = <img src={moodImage4} alt="Happy Mood" style={{ width: '200px', height: '200px' }} />;
  } else {
    MoodIconComponent = <img src={moodImage5} alt="Happy Mood" style={{ width: '200px', height: '200px' }} />;
  }

  return (
    <div className='score-card-container'>
      <Card
        variant="outlined"
        style={{
          margin: '20px',
          textAlign: 'center',
          width: '400px',
          height: '300px',
          borderRadius: '20px'
        }}
      >
        <CardContent>
          {MoodIconComponent}
          <Typography variant="h5" fontWeight="bold" style={{ margin: '10px 0' }}>
            {score}/100
          </Typography>
        </CardContent>
      </Card>
      <div className='back-button'>
        <Tooltip title="Go Back">
          <IconButton color="primary" sx={{ color: 'white', backgroundColor: '#695CFE' ,':hover': { backgroundColor: '#5648CC' } }}  onClick={goBack}>
            <ArrowBackIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default ScoreCard;
