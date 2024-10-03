-- Active: 1725907957738@@127.0.0.1@3306@quiz_db
-- Create the database
CREATE DATABASE IF NOT EXISTS quiz_db;

-- Ensure to use the created database
USE quiz_db;  

-- Create tables
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES admins(id)
);

CREATE TABLE questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT,
    question_text TEXT NOT NULL,
    correct_option INT NOT NULL,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

CREATE TABLE options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT,
    option_text TEXT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES questions(question_id)
);

CREATE TABLE scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    quiz_id INT,
    score INT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

-- Add some data to the tables
INSERT INTO users (username, password) VALUES 
('user1', 'password1'),
('user2', 'password2'),
('user3', 'password3');

-- Insert data into admins
INSERT INTO admins (username, password) VALUES
('admin1', 'adminpass1'),
('admin2', 'adminpass2');

-- Insert data into quizzes
INSERT INTO quizzes (title, created_by) VALUES 
('Operating Systems Quiz', 1),      -- created by admin1 (ID 1)
('Data Structures Quiz', 2),        -- created by admin2 (ID 2)
('Computer Networks Quiz', 1),      -- created by admin1 (ID 1)
('Database Management Systems Quiz', 2),  -- created by admin2 (ID 2)
('Digital Logic Quiz', 1);          -- created by admin1 (ID 1)

-- Insert data into questions
INSERT INTO questions (quiz_id, question_text, correct_option) VALUES 
(1, 'What is the primary purpose of an Operating System?', 1),  -- Operating Systems Quiz
(1, 'What is a context switch?', 2),                           -- Operating Systems Quiz
(2, 'Which data structure uses LIFO principle?', 1),           -- Data Structures Quiz
(3, 'What protocol is used for reliable data transmission in TCP/IP?', 1),  -- Computer Networks Quiz
(4, 'What is a foreign key in a database?', 1),               -- DBMS Quiz
(5, 'Which gate is known as a universal gate?', 1);           -- Digital Logic Quiz

-- Insert data into options
INSERT INTO options (question_id, option_text) VALUES
-- Operating Systems Quiz (Questions 1 and 2)
(1, 'Manage computer hardware and software resources'),  -- Correct for Q1
(1, 'To compile programs'),
(1, 'To handle spreadsheets'),
(2, 'Switching between processes'),  -- Correct for Q2
(2, 'Changing programming languages'),
(2, 'Restarting the system'),
-- Data Structures Quiz (Question 3)
(3, 'Stack'),  -- Correct for Q3
(3, 'Queue'),
(3, 'Graph'),
-- Computer Networks Quiz (Question 4)
(4, 'TCP'),  -- Correct for Q4
(4, 'UDP'),
(4, 'IP'),
-- Database Management Systems Quiz (Question 5)
(5, 'A key that links two tables together'),  -- Correct for Q5
(5, 'A key that identifies all rows in a table'),
(5, 'A key used for encryption'),
-- Digital Logic Quiz (Question 6)
(6, 'NAND'),  -- Correct for Q6
(6, 'XOR'),
(6, 'OR');

-- Insert data into scores
INSERT INTO scores (user_id, quiz_id, score) VALUES
(1, 1, 2),    -- user1 took the Operating Systems Quiz and scored 2
(1, 2, 1),    -- user1 took the Data Structures Quiz and scored 1
(2, 1, 1),    -- user2 took the Operating Systems Quiz and scored 1
(2, 3, 3),    -- user2 took the Computer Networks Quiz and scored 3
(3, 4, 2),    -- user3 took the Database Management Systems Quiz and scored 2
(3, 5, 1),    -- user3 took the Digital Logic Quiz and scored 1
(1, 4, 3),    -- user1 took the DBMS Quiz and scored 3
(2, 5, 1);    -- user2 took the Digital Logic Quiz and scored 1

-- -----------------------------Views----------------------------------

-- Create a view to get the quizId, title, userId and score
CREATE VIEW user_quiz_data AS
SELECT 
    q.id AS quiz_id, 
    q.title AS quiz_title, 
    u.id AS user_id, 
    COALESCE(s.score, 'NA') AS score -- Use 'NA' if no score exists
FROM 
    quizzes q
CROSS JOIN 
    users u
LEFT JOIN 
    scores s ON q.id = s.quiz_id AND u.id = s.user_id
ORDER BY u.id, q.id ASC;


CREATE VIEW quiz_details_view AS
SELECT 
    qz.id,
    qz.title,
    qs.question_id,
    qs.question_text,
    opt.option_text
FROM 
    quizzes qz
cross JOIN 
    questions qs ON qz.id = qs.quiz_id
left JOIN 
    options opt ON qs.question_id = opt.question_id;


-----------------------------Procedure--------------------------------

-- Create a procedure to create a new user
DELIMITER $$

CREATE PROCEDURE CreateUser(
    IN p_username VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    INSERT INTO users (username, password)
    VALUES (p_username, p_password);
END $$

DELIMITER ;
