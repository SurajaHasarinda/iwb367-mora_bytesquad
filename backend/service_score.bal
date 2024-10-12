import ballerina/http;
import ballerina/sql;
import ballerina/time;

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"]
    }
}

service /quizscore on new http:Listener(8082) {
    // get all scores of a specific user
    isolated resource function get scores/user/[int Userid]() returns Score[]|error {
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
    isolated resource function get scores/quiz/[int Quizid]() returns Score[]|error {
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
