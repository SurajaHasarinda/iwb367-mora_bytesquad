import ballerina/http;
import ballerina/sql;
import ballerina/time;

public type DatabaseConfig record {| 
    string host; 
    int port; 
    string user; 
    string password; 
    string database; 
|};

public type User record { 
    readonly int id; 
    string userName; 
    string role;
};

public type UserNotFound record {| 
    *http:NotFound; 
    ErrorDetails body; 
|};

public type UserPassword record { 
    string password; 
};

public type UserRole record { 
    string role; 
};

public type QuizQuestion record { 
    int id; 
    readonly string title; 
    readonly int question_id; 
    readonly string question_text; 
    string option_text; 
};

public type Quiz record { 
    int id; 
    string title; 
};

public type QuizWithScore record { 
    readonly int quiz_id; 
    string quiz_title; 
    string|int score; 
};

public type QuizSubmission record { 
    int quizId; 
    int userId; 
    map<string> answers; 
};

public type Score record {|
    readonly int id;
    @sql:Column {name: "user_id"}
    readonly int userId;
    @sql:Column {name: "quiz_id"}
    readonly int quizId;
    int score;
    @sql:Column {name: "submitted_at"}
    string submittedAt;
|};

public type ErrorDetails record {
    string message;
    string details;
    time:Utc timeStamp;
};

public type ScoreNotFound record {|
    *http:NotFound;
    ErrorDetails body;
|};

public type NewQuestion record {
    string question;
    string option1;
    string option2;
    string option3;
    string option4;
    string correctOption;
};

public type NewQuiz record {
    string quizTitle;
    NewQuestion[] questions;
};

public type LeaderboardEntry record {
    string username;
    string quiz_title;
    int score;
    int rank_position;
};

public type QuizInfo record {
    int id;
    string title;
};