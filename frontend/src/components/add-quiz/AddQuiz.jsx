import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Typography, IconButton, Tooltip, Divider, Select, MenuItem, InputLabel, FormControl, Box, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import QuizIcon from '@mui/icons-material/Quiz';
import './AddQuiz.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const userId = localStorage.getItem('userId');

const AddQuiz = () => {
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([
    { question: '', option1: '', option2: '', option3: '', option4: '', correctOption: '' }
  ]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  const showMessage = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const navigate = useNavigate();

  const goBack = () => {
      navigate('/user-dashboard');
  };

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

  const handleSaveClick = () => {
    if (!quizTitle.trim()) {
      showMessage('Quiz title is required!', 'error');
      return;
    }
  
    // Validate each question and its options
    for (let i = 0; i < questions.length; i++) {
      const { question, option1, option2, option3, option4, correctOption } = questions[i];
  
      if (!question.trim()) {
        showMessage(`Question ${i + 1} is required!`, 'error');
        return;
      }
  
      if (!option1.trim() || !option2.trim() || !option3.trim() || !option4.trim()) {
        showMessage(`All options for Question ${i + 1} are required!`, 'error');
        return;
      }
  
      if (!correctOption) {
        showMessage(`Correct option for Question ${i + 1} must be selected!`, 'error');
        return;
      }
    }
    // If all fields are valid, open the confirmation dialog
    setConfirmationDialogOpen(true);
  };

  const handleConfirmSave  = async () => {
    setConfirmationDialogOpen(false); // Close the dialog

    try {
      const response = await axios.post(`http://localhost:8081/quiz/addQuiz/user/${userId}`, {
        quizTitle,
        questions
      });
      showMessage(response.data.message || 'Quiz added successfully!', 'success');
      // Reset the form after successful submission
      setQuizTitle('');
      setQuestions([{ question: '', option1: '', option2: '', option3: '', option4: '', correctOption: '' }]);
    } catch (error) {
      showMessage(error.response.data.message || 'Failed to add quiz!', 'error');
    }
  };

  const handleCancelSave = () => {
    setConfirmationDialogOpen(false); // Close the dialog without saving
  };

  return (
    <div className='add-quiz-container'>
      <div className="form-container">
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ marginTop: '20px' }}
        >
          <QuizIcon sx={{ marginRight: '10px', color: '#695CFE' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Add New Quiz
          </Typography>
        </Box>

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
              {index === questions.length - 1 && (
                <div className="add-remove-buttons-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Add (+) Button aligned to the left */}
                {index === questions.length - 1 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <Tooltip title="Add">
                      <IconButton
                        color="primary"
                        sx={{ color: '#695CFE', ':hover': { color: '#5648CC' } }}
                        onClick={handleAddQuestion}
                      >
                        <AddCircleIcon fontSize="large" />
                      </IconButton>
                    </Tooltip>
                  </div>
                )}
                {/* Remove (-) Button aligned to the right */}
                {questions.length > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Tooltip title="Remove">
                      <IconButton color="secondary" onClick={() => handleRemoveQuestion(index)}>
                        <RemoveCircleIcon fontSize="large" />
                      </IconButton>
                    </Tooltip>
                  </div>
                )}
              </div>
              )}

              {index < questions.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end'}}>
                {questions.length > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Tooltip title="Remove">
                      <IconButton color="secondary" onClick={() => handleRemoveQuestion(index)}>
                        <RemoveCircleIcon fontSize="large" />
                      </IconButton>
                    </Tooltip>
                  </div>
                )}
              </div>
              )}

              {/* Add Divider between questions */}
              {index < questions.length - 1 && <Divider sx={{ margin: '20px 0' }} />}
            </div>
          ))}

          <div className="button-container"  style={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title="Cancel">
              <IconButton color="primary" sx={{ color: '#695CFE', ':hover': { color: '#5648CC' } }} onClick={handleCancel}>
                <CancelIcon fontSize="large" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Save">
              <IconButton color="primary" sx={{ color: '#695CFE', ':hover': { color: '#5648CC' } }} onClick={handleSaveClick}>
                <SaveIcon fontSize="large" />
              </IconButton>
            </Tooltip>
          </div>
        </form>
      </div>
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
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationDialogOpen}
        onClose={handleCancelSave}
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
      >
        <DialogTitle id="confirmation-dialog-title">Save Quiz</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to save the quiz?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelSave} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmSave} color="primary" autoFocus>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddQuiz;
