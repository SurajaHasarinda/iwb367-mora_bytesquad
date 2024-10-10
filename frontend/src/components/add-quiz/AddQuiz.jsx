import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Typography, IconButton, Tooltip, Divider, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import QuizIcon from '@mui/icons-material/Quiz';
import './AddQuiz.css';

const userId = 1; // TODO: make this dynamic

const AddQuiz = () => {
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([
    { question: '', option1: '', option2: '', option3: '', option4: '', correctOption: '' }
  ]);

  // Add a new empty question object
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { question: '', option1: '', option2: '', option3: '', option4: '', correctOption: '' }
    ]);
  };

  // Remove a question at a specific index
  const handleRemoveQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  // Remove all questions (reset to a single empty question)
  const handleCancel = () => {
    setQuizTitle('');
    setQuestions([{ question: '', option1: '', option2: '', option3: '', option4: '', correctOption: '' }]);
  };

  // Update the specific question object at index
  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedQuestions = [...questions];
    updatedQuestions[index][name] = value;
    setQuestions(updatedQuestions);
  };

  // Update the correct option for the question
  const handleCorrectOptionChange = (index, e) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].correctOption = e.target.value;
    setQuestions(updatedQuestions);
  };

  const handleSave = async () => {
    // TODO: check if the title is empty
    console.log(quizTitle, questions);
    try {
      const response = await axios.post(`http://localhost:8800/user_info/${userId}`, {
        quizTitle,
        questions
      });
      console.log('Questions added successfully:', response.data);
      setQuizTitle('');
      setQuestions([{ question: '', option1: '', option2: '', option3: '', option4: '', correctOption: '' }]);
    } catch (error) {
      console.error('Error adding questions:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className='add-quiz-container'>
      <div className="form-container">
        <Typography variant="h6" sx={{display: 'flex', alignItems: 'center'}}>
            <QuizIcon style={{ marginRight: '8px' }} />
            Add New Quiz
        </Typography>
        <form noValidate>
          <TextField
            label="Quiz Title"
            id="quizTitle"
            name="quizTitle"
            value={quizTitle}
            fullWidth
            margin="normal"
            required
            onChange={(e) => setQuizTitle(e.target.value)}
          />

          {/* Question Fields */}
          {questions.map((question, index) => (
            <div key={index} className="question-container">
              <Typography variant="subtitle1">Question {index + 1}</Typography>

              <TextField
                label="Question"
                id={`question-${index}`}
                name="question"
                value={question.question}
                fullWidth
                margin="normal"
                required
                onChange={(e) => handleInputChange(index, e)}
              />

              <TextField
                label="Option 1"
                id={`option1-${index}`}
                name="option1"
                value={question.option1}
                fullWidth
                margin="normal"
                required
                onChange={(e) => handleInputChange(index, e)}
              />

              <TextField
                label="Option 2"
                id={`option2-${index}`}
                name="option2"
                value={question.option2}
                fullWidth
                margin="normal"
                required
                onChange={(e) => handleInputChange(index, e)}
              />

              <TextField
                label="Option 3"
                id={`option3-${index}`}
                name="option3"
                value={question.option3}
                fullWidth
                margin="normal"
                required
                onChange={(e) => handleInputChange(index, e)}
              />

              <TextField
                label="Option 4"
                id={`option4-${index}`}
                name="option4"
                value={question.option4}
                fullWidth
                margin="normal"
                required
                onChange={(e) => handleInputChange(index, e)}
              />

              {/* Dropdown to select the correct option */}
              <FormControl fullWidth margin="normal" required>
                <InputLabel id={`correct-option-label-${index}`}>Correct Option</InputLabel>
                <Select
                  labelId={`correct-option-label-${index}`}
                  id={`correctOption-${index}`}
                  value={question.correctOption}
                  onChange={(e) => handleCorrectOptionChange(index, e)}
                  label="Correct Option"
                >
                  <MenuItem value="1">Option 1</MenuItem>
                  <MenuItem value="2">Option 2</MenuItem>
                  <MenuItem value="3">Option 3</MenuItem>
                  <MenuItem value="4">Option 4</MenuItem>
                </Select>
              </FormControl>

              {/* Remove Button (-) */}
              {questions.length > 1 && (
                <div className="remove-question-container">
                  <Tooltip title="Remove">
                    <IconButton color="secondary" onClick={() => handleRemoveQuestion(index)}>
                      <RemoveCircleIcon fontSize="large" />
                    </IconButton>
                  </Tooltip>
                </div>
              )}

              {/* Add Divider between questions */}
              {index < questions.length - 1 && <Divider sx={{ margin: '20px 0' }} />}
            </div>
          ))}

          <div className="button-container">
            <Tooltip title="Add">
              <IconButton color="primary" sx={{ color: '#695CFE', ':hover': { color: '#5648CC' } }} onClick={handleAddQuestion}>
                <AddCircleIcon fontSize="large" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Cancel">
              <IconButton color="primary" sx={{ color: '#695CFE', ':hover': { color: '#5648CC' } }} onClick={handleCancel}>
                <CancelIcon fontSize="large" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Save">
              <IconButton color="primary" sx={{ color: '#695CFE', ':hover': { color: '#5648CC' } }} onClick={handleSave}>
                <SaveIcon fontSize="large" />
              </IconButton>
            </Tooltip>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuiz;
