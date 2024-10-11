import ballerina/crypto;
import ballerina/http;
import ballerina/sql;
import ballerina/time;
import ballerinax/mysql;
import ballerinax/mysql.driver as _;
import ballerina/log;
import ballerina/jwt;

// get the database configuration from the Config.toml file
configurable DatabaseConfig databaseConfig = ?;

// create a new mysql client using the database configuration
mysql:Client dbClient = check new (...databaseConfig);

listener http:Listener authListener = new (8080);
listener http:Listener quizListener = new (8081);
listener http:Listener scoreListener = new (8082);

//-------------------------------------------- Auth Service --------------------------------------------
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
    resource function get user/[string username]() returns User|UserNotFound|error {
        User|sql:Error user = dbClient->queryRow(`SELECT id, username FROM users WHERE username = ${username}`);
        if user is sql:NoRowsError {
            UserNotFound userNotFound = {
                body: {message: string `username: ${username}`, details: string `user/${username}`, timeStamp: time:utcNow()}
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

        UserPassword|sql:Error result = dbClient->queryRow(query, UserPassword);

        if (result is UserPassword) {
            string storedHashedPassword = result.password;

            // Hash the incoming password using the same hashing algorithm (SHA-256)
            byte[] hashedPasswordBytes = crypto:hashSha256(password.toBytes());
            string hashedPassword = hashedPasswordBytes.toBase16();

            jwt:IssuerConfig issuerConfig = {
                username: username,
                issuer: "Mora_ByteSquad",
                audience: "QuizApp",
                expTime: 3600,
                signatureConfig: {
                    config: {
                        keyFile: "private.key",
                        keyPassword: "Mora"
                    }
                }
            };

            string jwt = check jwt:issue(issuerConfig);

            // Compare the provided hashed password with the stored hashed password
            if (hashedPassword == storedHashedPassword) {
                http:Response successResponse = new;
                successResponse.statusCode = http:STATUS_OK; // 200 OK
                successResponse.setPayload({"message": "Login successful!", "token": jwt});
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
@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"]
    }
}

service /quiz on quizListener {
    // get all quizzes with user scores
    resource function get all/user/[int Userid]() returns QuizWithScore[]|error {
        stream<QuizWithScore, sql:Error?> dataStream = dbClient->query(`SELECT quiz_id, quiz_title, score FROM user_quiz_data WHERE user_id = ${Userid}`);
        QuizWithScore[] quizWithScore = [];
        check from QuizWithScore data in dataStream
            do {
                quizWithScore.push(data);
            };
        check dataStream.close();
        return quizWithScore;
    }

    // get questions of a specific quiz
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

    // handle quiz submission
    resource function post submit(http:Caller caller, http:Request req) returns error? {
        json payload;
        var jsonResult = req.getJsonPayload();
        if (jsonResult is json) {
            payload = jsonResult;
        } else {
            // Invalid JSON payload
            check caller->respond({"message": "Invalid JSON format"});
            return;
        }
        QuizSubmission submission = check payload.cloneWithType(QuizSubmission);
        int userId = submission.userId;
        int quizId = submission.quizId;

        // Log the received submission data
        log:printInfo("Received quiz submission: " + submission.toString()); // ! testing

        int score = 0; // Initialize the score

        // check each answer against the database
        foreach var [questionId, answer] in submission.answers.entries() {
            int|error result = check dbClient->queryRow(`SELECT CheckAnswer(${questionId}, ${answer})`);
            if (result == 1) {
                score += result;
            } 
            log:printInfo(score.toString()); // ! testing
        }
        
        int percentage = (score * 100) / submission.answers.length();
        log:printInfo(percentage.toString()); // ! testing

        // Insert the score into the database
        sql:ParameterizedQuery query = `CALL UpdateScore(${userId}, ${quizId}, ${percentage})`;
        var result = dbClient->execute(query);

        if (result is sql:ExecutionResult && result.affectedRowCount > 0) {
            log:printInfo("Quiz submitted successfully"); // ! testing
            check caller->respond({ message: "Quiz submitted successfully" });
        } else {
            log:printError("Failed to submit the quiz"); // ! testing
            check caller->respond({ message: "Quiz submission failed" });
        } 
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

    resource function get LeaderboardByQuizTitle/[int quizId]() returns LeaderboardEntry[]|error {
        stream<LeaderboardEntry, sql:Error?> leaderboardStream = dbClient->query(
            `SELECT username, quiz_id,quiz_title, score, rank_position 
            FROM leaderboard_view 
            WHERE quiz_id = ${quizId}`
        );
        
        LeaderboardEntry[] leaderboard = [];
        check from LeaderboardEntry entry in leaderboardStream
            do {
                leaderboard.push(entry);
            };
        check leaderboardStream.close();
        return leaderboard;
    }

    resource function get Quizzes() returns QuizInfo[]|error {
        // Query to select the id and title from the quizzes table
        stream<QuizInfo, sql:Error?> quizzesStream = dbClient->query(
            `SELECT id, title 
            FROM quizzes`
        );

        QuizInfo[] quizzes = [];
        
        // Iterate through the stream and collect results
        check from QuizInfo quiz in quizzesStream
            do {
                quizzes.push(quiz);
            };

        // Close the stream after processing
        check quizzesStream.close();
        
        return quizzes;
    }
  
}
//-------------------------------------------- Score Service --------------------------------------------
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

}
