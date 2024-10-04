import ballerina/crypto;
import ballerina/http;
import ballerina/sql;
import ballerina/time;
import ballerinax/mysql;
import ballerinax/mysql.driver as _;



// import ballerina/log;
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
listener http:Listener authListener = new (8080);
listener http:Listener quizListener = new (8081);

listener http:Listener scoreListener = new (8082);

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

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"]
    }
}

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
        User|sql:Error user = dbClient->queryRow(`SELECT id, username FROM users WHERE id = ${Userid}`);
        if user is sql:NoRowsError {
            UserNotFound userNotFound = {
                body: {message: string `id: ${Userid}`, details: string `user/${Userid}`, timeStamp: time:utcNow()}
            };
            return userNotFound;
        }
        return user;
    }

    // create a user with hashed password using procedure
    resource function post signup(http:Caller caller, http:Request req) returns error? {
        json payload;
        var jsonResult = req.getJsonPayload();
        if (jsonResult is json) {
            payload = jsonResult;
        } else {
            // Invalid JSON payload
            check caller->respond({"message": "Invalid JSON format"});
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
            http:Response successResponse = new;
            successResponse.statusCode = http:STATUS_CREATED; // 201 Created
            successResponse.setPayload({"message": "User registered successfully!"});
            check caller->respond(successResponse);
        } else {
            http:Response conflictResponse = new;
            conflictResponse.statusCode = http:STATUS_CONFLICT; // 409 Conflict
            conflictResponse.setPayload({"message": "User already exists!"});
            check caller->respond(conflictResponse);
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
            check caller->respond({"message": "Invalid JSON format"});
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
                http:Response successResponse = new;
                successResponse.statusCode = http:STATUS_OK; // 200 OK
                successResponse.setPayload({"message": "Login successful!"});
                check caller->respond(successResponse);
            } else {
                http:Response invalidPasswordResponse = new;
                invalidPasswordResponse.statusCode = http:STATUS_UNAUTHORIZED; // 401 Unauthorized
                invalidPasswordResponse.setPayload({"message": "Invalid password!"});
                check caller->respond(invalidPasswordResponse);
            }

        } else {
            http:Response userNotFoundResponse = new;
            userNotFoundResponse.statusCode = http:STATUS_NOT_FOUND; // 404 Not Found
            userNotFoundResponse.setPayload({"message": "User not found!"});
            check caller->respond(userNotFoundResponse);
        }
    }
}

//-------------------------------------------- Quiz Service --------------------------------------------

type QuizQuestion record {
    int id;
    readonly string title;
    readonly int question_id;
    readonly string question_text;
    string option_text;
};

type Quiz record {
    int id;
    string title;
};

//quiz_details_view

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"]
    }
}
service /quiz on quizListener {
    resource function get questions/[int quizId]() returns QuizQuestion[]|error {
        stream<QuizQuestion, sql:Error?> quizStream = dbClient->query(
            `SELECT id, title, question_id, question_text, option_text 
             FROM quiz_details_view 
             WHERE id = ${quizId}`
        );
        
    
        QuizQuestion[] questions = [];
        check from QuizQuestion question in quizStream
            do {
                questions.push(question);
            };
        check quizStream.close();
        return questions;
    }

   resource function get list() returns Quiz[]|error {
        // Create a stream to fetch quiz records
        stream<Quiz, sql:Error?> quizStream = dbClient->query(`SELECT id, title FROM quizzes`); // Adjust the SQL as necessary

        Quiz[] quizzes = []; // Array to hold the quizzes

        // Process the stream
        check from Quiz quiz in quizStream
            do {
                quizzes.push(quiz); // Add each quiz to the array
            };

        // Close the stream
        check quizStream.close();

        // Return the accumulated list of quizzes
        return quizzes;
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


@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"]
    }
}
service /quizscore on scoreListener {
    // get all scores
    // ! for testing
    resource function get scores() returns Score[]|error {
        stream<Score, sql:Error?> scoreStream = dbClient->query(`SELECT * FROM scores`);
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
        stream<Score, sql:Error?> scoreStream = dbClient->query(`SELECT * FROM scores WHERE user_id = ${Userid}`);
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
        stream<Score, sql:Error?> scoreStream = dbClient->query(`SELECT * FROM scores WHERE quiz_id = ${Quizid}`);
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