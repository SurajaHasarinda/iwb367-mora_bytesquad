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
    option_number INT NOT NULL,
    option_text VARCHAR(255) NOT NULL,
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
-- Operating Systems Quiz
(1, 'What is the primary purpose of an Operating System?', 1),  
(1, 'What is a context switch?', 2),                           
(1, 'What is the primary function of an operating system?', 1),  
(1, 'What is a process in the context of an operating system?', 1),
(1, 'What is virtual memory?', 2),
(1, 'What is the main purpose of the kernel in an operating system?', 3),
(1, 'Which of the following is an example of an interrupt?', 4),
(1, 'What is a context switch in an operating system?', 3),
(1, 'Which of the following scheduling algorithms gives priority to the shortest job first?', 2),
(1, 'What is deadlock?', 1),
-- Data Structures Quiz
(2, 'Which data structure uses LIFO principle?', 1),       
-- Computer Networks Quiz    
(3, 'What protocol is used for reliable data transmission in TCP/IP?', 1),  
-- DBMS Quiz
(4, 'What is a foreign key in a database?', 1),               
-- Digital Logic Quiz
(5, 'Which gate is known as a universal gate?', 1);           


-- Insert data into options
INSERT INTO options (question_id, option_number, option_text) VALUES
-- Operating Systems Quiz (Questions 1 and 2)
(1, 1, 'Manage computer hardware and software resources'),  -- Correct
(1, 2,'To compile programs'),
(1, 3,'To handle spreadsheets'),
(2, 1,'Switching between processes'),  -- Correct
(2, 2,'Changing programming languages'),
(2, 3,'Restarting the system'),
(3, 1,'To manage hardware resources'),  -- Correct
(3, 2,'To compile code'),
(3, 3,'To create websites'),
(3, 4,'To write applications'),
(4, 1,'A running instance of a program'),  -- Correct
(4, 2,'A sequence of instructions'),
(4, 3,'A type of memory'),
(4, 4,'A hardware device'),
(5, 1,'A type of secondary storage'),
(5, 2,'A technique that provides an application the illusion of a large memory'),  -- Correct
(5, 3,'Memory used by the operating system to store system files'),
(5, 4,'The memory used by network applications'),
(6, 1,'It manages I/O operations'),
(6, 2,'It compiles applications'),
(6, 3,'It acts as an intermediary between hardware and software'),  -- Correct
(6, 4,'It provides memory management only'),
(7, 1,'Dividing by zero in a program'),
(7, 2,'Closing a browser window'),
(7, 3,'A hardware failure like disk crash'),
(7, 4,'All of the above'),
(8, 1,'The process of switching between programming languages'),
(8, 2,'Changing from user mode to kernel mode'),
(8, 3,'The process of switching between processes or threads'),  -- Correct
(8, 4,'Restarting the computer'),
(9, 1,'First-Come, First-Served (FCFS)'),
(9, 2,'Shortest Job First (SJF)'),  -- Correct
(9, 3,'Round-Robin'),
(9, 4,'Priority Scheduling'),
(10, 1,'When processes are blocked because each process holds a resource that another process needs'),  -- Correct
(10, 2,'When processes execute without synchronization'),
(10, 3,'When there is an error in a program causing it to crash'),
(10, 4,'A condition where a process finishes executing'),
-- Data Structures Quiz
(11, 1,'Stack'),  -- Correct
(11, 2,'Queue'),
(11, 3,'Graph'),
-- Computer Networks Quiz
(12, 1,'TCP'),  -- Correct
(12, 2,'UDP'),
(12, 3,'IP'),
-- Database Management Systems Quiz
(13, 1,'A key that links two tables together'),  -- Correct
(13, 2,'A key that identifies all rows in a table'),
(13, 3,'A key used for encryption'),
-- Digital Logic Quiz
(14, 1,'NAND'),  -- Correct
(14, 2,'XOR'),
(14, 3,'OR');

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
    COALESCE(s.score, 'N/A') AS score -- Use 'NA' if no score exists
FROM 
    quizzes q
CROSS JOIN 
    users u
LEFT JOIN 
    scores s ON q.id = s.quiz_id AND u.id = s.user_id
ORDER BY u.id, q.id ASC;

-- Create a view to get the quiz details including questions and options
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

---- view for leaderboard
    CREATE OR REPLACE VIEW leaderboard_view AS
SELECT
    u.username,
    q.id AS quiz_id,
    q.title AS quiz_title,
    qs.score,
    RANK() OVER (PARTITION BY q.id ORDER BY qs.score DESC) AS rank_position
FROM
    scores qs
JOIN
    users u ON qs.user_id = u.id
JOIN
    quizzes q ON qs.quiz_id = q.id;



-----------------------------Procedures--------------------------------

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

-- Create a procedure to create a new admin
DELIMITER $$
CREATE PROCEDURE UpdateScore(
    IN p_user_id INT,
    IN p_quiz_id INT,
    IN p_score INT
)
BEGIN
    -- If exist update, else insert
    IF EXISTS (SELECT * FROM scores WHERE user_id = p_user_id AND quiz_id = p_quiz_id) THEN
        UPDATE scores
        SET score = p_score
        WHERE user_id = p_user_id AND quiz_id = p_quiz_id;
    ELSE
        INSERT INTO scores (user_id, quiz_id, score)
        VALUES (p_user_id, p_quiz_id, p_score);
    END IF;
END $$
DELIMITER ;
    

------------------------------Functions--------------------------------

-- Create a function to check if the answer is correct
DROP FUNCTION IF EXISTS CheckAnswer;
DELIMITER $$

CREATE FUNCTION CheckAnswer(
    p_question_id INT,
    p_answer VARCHAR(255)
)
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE correct_answer VARCHAR(255);
    DECLARE result BOOLEAN;

    -- Retrieve the correct answer for the given question
    SELECT o.option_text INTO correct_answer
    FROM questions q
    JOIN options o ON q.question_id = o.question_id
    WHERE q.question_id = p_question_id AND o.option_number = q.correct_option;

    -- Compare the provided answer with the correct answer
    SET result = (TRIM(LOWER(correct_answer)) = TRIM(LOWER(p_answer))); 

    RETURN result; -- Return the result (TRUE or FALSE)
END $$

DELIMITER ;
