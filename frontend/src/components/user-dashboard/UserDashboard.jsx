import * as React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Logout from '@mui/icons-material/Logout';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './UserDashboard.css';

import QuizCards from '../quiz-cards/QuizCards';
import Quiz from '../quiz/Quiz';
import UserProfile from '../user-profile/UserProfile';
import Leaderboard from '../leader-board/Leaderboard';

const username = localStorage.getItem('username');

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

export default function AccountMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    handleClose();
    navigate(`/`);
    window.location.reload();
  };

  const gotoProfile = () => {
    handleClose();
    navigate(`./profile`);
  };

  const gotoLeaderboard = () => {
    handleClose();
    navigate(`./leaderboard`);
  };

  return (
    <div> 
      <div className='account-container'>
          <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
            <Tooltip title="Account">
              <IconButton
                onClick={handleClick}
                size="small"
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <Avatar {...stringAvatar(username)} />
              </IconButton>
            </Tooltip>
          </Box>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&::before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={gotoProfile}>
              <Avatar /> Profile
            </MenuItem>
            <MenuItem onClick={gotoLeaderboard}>
              <ListItemIcon>
                <LeaderboardIcon fontSize="small" />
              </ListItemIcon>
              Leaderboard
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
      </div>
      <div className='main-container'>
      <Routes>
        <Route path="/" element={ <QuizCards />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="quiz/:quizId" element={<Quiz />} />
      </Routes>
      </div>
    </div>
  );
}
