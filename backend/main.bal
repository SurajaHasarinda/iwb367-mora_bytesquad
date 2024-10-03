import ballerina/time;
import ballerinax/mysql;
import ballerinax/mysql.driver as _;
import ballerina/http;
import ballerina/sql;
import ballerina/crypto;


 //import ballerina/log;
// import ballerina/lang.regexp;

// to cofingure the database
type DatabaseConfig record {|
    string host;
    int port;
    string user;
    string password;
    string database;
|};
// get the database configuration from the Config.toml file
configurable DatabaseConfig databaseConfig = ?;
// create a new mysql client using the database configuration
mysql:Client dbClient = check new (...databaseConfig);
  

listener http:Listener authListener = new(8080);
listener http:Listener quizListener= new(8081);
listener http:Listener scoreListener = new(8082);


//-------------------------------------------- Auth Service --------------------------------------------
type User record {
    readonly int id;
    string userName;
};

type UserNotFound record {|
    *http:NotFound;
    ErrorDetails body;
|};

type UserPassword record {
    string password;
};

service /auth on authListener {
    // get all users
    // ! for testing
    resource function get users() returns User[]|error { 
        stream<User, sql:Error?> userStream = dbClient->query(`SELECT id, username FROM quiz_db.users`);
        return from var user in userStream
            select user;
    }

    // get specific user
    resource function get user/[int Userid]() returns User|UserNotFound|error {
        User|sql:Error user = dbClient->queryRow(`SELECT id, username FROM quiz_db.users WHERE id = ${Userid}`);
        if user is sql:NoRowsError {
            UserNotFound userNotFound = {
                body: {message: string `id: ${Userid}`, details: string `user/${Userid}`, timeStamp: time:utcNow()}
            };
            return userNotFound;
        }
        return user;
    }

    // create a user
    // ! for testing
    resource function post signup1(http:Caller caller, http:Request req) returns error? {
        json payload = check req.getJsonPayload();
        string username = (check payload.username).toString();
        string password = (check payload.password).toString();
        string role = (check payload.role).toString(); // 'user' or 'admin'

        // Insert new user into the database using parameterized query
        sql:ParameterizedQuery query = `INSERT INTO users (username, password, role) 
                                        VALUES (${username}, ${password}, ${role})`;
        var result = dbClient->execute(query);

        if (result is sql:ExecutionResult && result.affectedRowCount > 0) {
            check caller->respond({ "message": "User registered successfully!" });
        } else {
            check caller->respond({ "message": "User registration failed!" });
        }
    }

    // create a user with hashed password
    // ! for testing
    resource function post signup2(http:Caller caller, http:Request req) returns error? {
        json payload = check req.getJsonPayload();
        string username = (check payload.username).toString();
        string password = (check payload.password).toString();
        string role = (check payload.role).toString(); // 'user' or 'admin'

        byte[] hashedPasswordBytes = crypto:hashSha256(password.toBytes());
        string hashedPassword = hashedPasswordBytes.toBase16();

        // Insert new user into the database using parameterized query
        sql:ParameterizedQuery query = `INSERT INTO users (username, password, role) 
                                        VALUES (${username}, ${hashedPassword}, ${role})`;
        var result = dbClient->execute(query);

        if (result is sql:ExecutionResult && result.affectedRowCount > 0) {
            check caller->respond({ "message": "User registered successfully!" });
        } else {
            check caller->respond({ "message": "User registration failed!" });
        }
    }

    // create a user with hashed password using procedure
    resource function post signup(http:Caller caller, http:Request req) returns error? {
        json payload;
        var jsonResult = req.getJsonPayload();
        if (jsonResult is json) {
            payload = jsonResult;
        } else {
            // Invalid JSON payload
            check caller->respond({ "message": "Invalid JSON format" });
            return;
        }

        string username = (check payload.username).toString();
        string password = (check payload.password).toString();

        byte[] hashedPasswordBytes = crypto:hashSha256(password.toBytes());
        string hashedPassword = hashedPasswordBytes.toBase16();

        // Insert new user into the database using parameterized query
        sql:ParameterizedQuery query = `CALL CreateUser(${username}, ${hashedPassword})`;
        var result = dbClient->execute(query);

        if (result is sql:ExecutionResult && result.affectedRowCount > 0) {
            check caller->respond({ "message": "User registered successfully!" });
        } else {
            check caller->respond({ "message": "User registration failed!" });
        }
    }
    
    // user login
    resource function post login(http:Caller caller, http:Request req) returns error? {
    // Extract JSON payload from the request
        json payload;
        var jsonResult = req.getJsonPayload();
        if (jsonResult is json) {
            payload = jsonResult;
        } else {
            // Invalid JSON payload
            check caller->respond({ "message": "Invalid JSON format" });
            return;
        }

        // Get username and password from the request
        string username = (check payload.username).toString();
        string password = (check payload.password).toString();

        // Query to retrieve the hashed password from the database
        sql:ParameterizedQuery query = `SELECT password FROM users WHERE username = ${username}`;
        
        // Use `query` to fetch the result with the defined row type
        UserPassword|sql:Error result = dbClient->queryRow(query, UserPassword);

        if (result is UserPassword) {
            string storedHashedPassword = result.password;

            // Hash the incoming password using the same hashing algorithm (SHA-256)
            byte[] hashedPasswordBytes = crypto:hashSha256(password.toBytes());
            string hashedPassword = hashedPasswordBytes.toBase16();

                    // Compare the provided hashed password with the stored hashed password
            if (hashedPassword == storedHashedPassword) {
                check caller->respond({ "message": "Login successful!" });
            } else {
                check caller->respond({ "message": "Invalid username or password!" });
            }
        
        } else {
                // Error occurred while executing the query
                check caller->respond({ "message": "Query failed!" });
        }
    }

    
}

//-------------------------------------------- Quiz Service --------------------------------------------



type Quiz record {|
    readonly int id;
    string title;
|};

type Option record {|
    string option_text;
|};

type Question record {|
    int id;
    string question_text;
|};

// Extend the Question type to include options
type QuestionWithOptions record {|
    int id;
    string question_text;
    Option[] options; // Options related to the question
|};


service /quiz on quizListener {
    

    resource function get quizzes() returns Quiz[]|error {
        // Query to select all quizzes from the `quizzes` table
        stream<Quiz, sql:Error?> quizStream = dbClient->query(`SELECT id, title FROM quiz_db.quizzes`);
        
        // Initialize an empty array to store the quizzes
        Quiz[] quizzes = [];
        
        // Iterate over the quiz stream and collect all quizzes
        check from Quiz quiz in quizStream
            do {
                quizzes.push(quiz);
            };
        
        // Ensure that the stream is closed after fetching the data
        check quizStream.close();
        
        // Return the list of quizzes
        return quizzes;
    
    
   
    }
   
    
    resource function get questions/[int Quizid]() returns QuestionWithOptions[]|error {
    // Query to fetch questions for the given quizId
    stream<Question, sql:Error?> questionStream = dbClient->query(
        `SELECT id, question_text FROM quiz_db.questions WHERE quiz_id = ${Quizid}`
    );

    // Initialize an empty array to store the questions with options
    QuestionWithOptions[] questionsWithOptions = [];

    // Iterate over the question stream and collect all questions
    check from Question question in questionStream
        do {
            // Fetch options for each question
            stream<Option, sql:Error?> optionStream = dbClient->query(
                `SELECT option_text FROM quiz_db.options WHERE question_id = ${question.id}`
            );

            // Initialize an empty array to store the options for the current question
            Option[] options = [];

            // Iterate over the option stream and collect options
            check from Option opt in optionStream
                do {
                    options.push(opt);
                };

            // Close the option stream
            check optionStream.close();

            // Create a new QuestionWithOptions record and add it to the result
            questionsWithOptions.push({
                id: question.id,
                question_text: question.question_text,
                options: options
            });
        };

    // Close the question stream
    check questionStream.close();

    // Return the list of questions along with their options
    return questionsWithOptions;
   
    }


}

//-------------------------------------------- Score Service --------------------------------------------

type Score record {|
    readonly int id;
    @sql:Column {name: "user_id"}
    readonly int userId;
    @sql:Column {name: "quiz_id"}
    readonly int quizId;
    int score;
    @sql:Column {name: "submitted_at"}
    string submittedAt;
|};

type ErrorDetails record {
    string message;
    string details;
    time:Utc timeStamp;
};

type ScoreNotFound record {|
    *http:NotFound;
    ErrorDetails body;
|};

service /quizscore on scoreListener {
    // get all scores
    // ! for testing
    resource function get scores() returns Score[]|error {
        stream<Score, sql:Error?> scoreStream = dbClient->query(`SELECT * FROM quiz_db.scores`);
        Score[] scores = [];
        check from Score score in scoreStream
            do {
                scores.push(score);
            };
        check scoreStream.close();
        return scores;
    }

    // get all scores of a specific user
    resource function get scores/user/[int Userid]() returns Score[]|error {
        stream<Score, sql:Error?> scoreStream = dbClient->query(`SELECT * FROM quiz_db.scores WHERE user_id = ${Userid}`);
        Score[] scores = [];
        check from Score score in scoreStream
            do {
                scores.push(score);
            };
        check scoreStream.close();
        return scores;
    }

    // get all scores of a specific quiz
    resource function get scores/quiz/[int Quizid]() returns Score[]|error {
        stream<Score, sql:Error?> scoreStream = dbClient->query(`SELECT * FROM quiz_db.scores WHERE quiz_id = ${Quizid}`);
        Score[] scores = [];
        check from Score score in scoreStream
            do {
                scores.push(score);
            };
        check scoreStream.close();
        return scores;
    }

    // get a specific score of a specific user
    resource function get score/user/[int Userid]/quiz/[int Quizid]() returns Score|ScoreNotFound|error {
        Score|error scores = dbClient->queryRow(`SELECT * FROM quiz_db.scores WHERE user_id = ${Userid} AND quiz_id = ${Quizid}`);
        if scores is sql:NoRowsError {
            ScoreNotFound scoreNotFound = {
                body: {message: string `id: ${Userid}`, details: string `scores/user/${Userid}`, timeStamp: time:utcNow()}
            };
            return scoreNotFound;
        }
        return scores;
    }

    // resource function get scores/user/[int Userid]() returns Score|ScoreNotFound|error {
    //     Score|error scores = dbClient->queryRow(`SELECT * FROM quiz_db.scores WHERE user_id = ${Userid}`);
    //     if scores is sql:NoRowsError {
    //         ScoreNotFound scoreNotFound = {
    //             body: {message: string `id: ${Userid}`, details: string `scores/user/${Userid}`, timeStamp: time:utcNow()}
    //         };
    //         return scoreNotFound;
    //     }
    //     return scores;
    // }

}

function buildErrorPayload(string msg, string path) returns ErrorDetails => {
    message: msg,
    timeStamp: time:utcNow(),
    details: string `uri=${path}`
};