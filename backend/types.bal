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
};

public type UserNotFound record {| 
    *http:NotFound; 
    ErrorDetails body; 
|};

public type UserPassword record { 
    string password; 
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
