import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

// Make sure to adjust the import path based on your file structure
import moodImage1 from '../../assets/images/mood-face-images/mood-1.jpg';
import moodImage2 from '../../assets/images/mood-face-images/mood-2.jpg';
import moodImage3 from '../../assets/images/mood-face-images/mood-3.jpg';
import moodImage4 from '../../assets/images/mood-face-images/mood-4.jpg';
import moodImage5 from '../../assets/images/mood-face-images/mood-5.jpg';

const ScoreCard = ({ score }) => {
  let MoodIconComponent;

  // Determine which icon or image to show based on the score
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
        {/* Display the mood icon/image based on the score */}
        {MoodIconComponent}
        <Typography variant="h5" style={{ margin: '10px 0' }}>
          {score}/100
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ScoreCard;
