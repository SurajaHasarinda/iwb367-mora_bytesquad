import ballerina/http;
import ballerina/log;
import ballerina/sql;

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"]
    }
}

service /quiz on new http:Listener(8081) {
    // get all quizzes with user scores
    isolated resource function get all/user/[int Userid]() returns QuizWithScore[]|error {
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
    isolated resource function get questions/[int quizId]() returns QuizQuestion[]|error {
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

    // submit a quiz and calculate the score
    isolated resource function post submit(http:Caller caller, http:Request req) returns error? {
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

        int score = 0; // Initialize the score

        // check each answer against the database
        foreach var [questionId, answer] in submission.answers.entries() {
            int|error result = check dbClient->queryRow(`SELECT CheckAnswer(${questionId}, ${answer})`);
            if (result == 1) {
                score += result;
            }
        }

        // Calculate the percentage
        int percentage = (score * 100) / submission.answers.length();
        log:printInfo("Score: " + score.toString() + ", Percentage: " + percentage.toString());

        // Insert the score into the database
        sql:ParameterizedQuery query = `CALL UpdateScore(${userId}, ${quizId}, ${percentage})`;
        var result = dbClient->execute(query);

        if (result is sql:ExecutionResult && result.affectedRowCount > 0) {
            log:printInfo("Quiz submitted successfully");
            check caller->respond({message: "Quiz submitted successfully"});
        } else {
            log:printError("Failed to submit the quiz");
            check caller->respond({message: "Quiz submission failed"});
        }
    }

    isolated resource function get list() returns Quiz[]|error {
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

    // get leaderboard by quiz title
    isolated resource function get LeaderboardByQuizTitle/[int quizId]() returns LeaderboardEntry[]|error {
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

    // get quiz id and title
    isolated resource function get Quizzes() returns QuizInfo[]|error {
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

        check quizzesStream.close();

        return quizzes;
    }

    // Add a new quiz
    isolated resource function post addQuiz/user/[int Userid](http:Caller caller, http:Request req) returns error? {
        json payload;
        var jsonResult = req.getJsonPayload();
        if (jsonResult is json) {
            payload = jsonResult;
        } else {
            // Invalid JSON payload
            check caller->respond({"message": "Invalid JSON format"});
            return;
        }

        NewQuiz newQuiz;
        var conversionResult = payload.cloneWithType(NewQuiz);
        if (conversionResult is NewQuiz) {
            newQuiz = conversionResult;
        } else {
            // Conversion error
            check caller->respond({"message": "Invalid data format"});
            return;
        }

        int creatorId = Userid;
        string title = newQuiz.quizTitle;

        int|error quizId = check dbClient->queryRow(`SELECT CreateQuiz(${title}, ${creatorId})`);

        if (quizId is int) {
            NewQuestion[] questions = newQuiz.questions;
            foreach var question in questions {
                sql:ParameterizedQuery query = (
                    `CALL AddQuestion(
                        ${quizId}, 
                        ${question.question}, 
                        ${question.correctOption},
                        ${question.option1}, 
                        ${question.option2}, 
                        ${question.option3}, 
                        ${question.option4})`);

                sql:ExecutionResult result = check dbClient->execute(query);

                if (result.affectedRowCount > 0) {
                    continue;
                } else {
                    log:printError("Failed to add the question");
                    check caller->respond({message: "Failed to add the question"});
                }
            }
            log:printInfo("Quiz created successfully");
            check caller->respond({message: "Quiz created successfully"});
        } else {
            log:printError("Failed to fetch the quiz ID");
            check caller->respond({message: "Failed to create the quiz"});
        }
    }
}
