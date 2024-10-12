import ballerina/crypto;
import ballerina/http;
import ballerina/jwt;
import ballerina/log;
import ballerina/sql;
import ballerina/time;

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"]
    }
}

service /auth on new http:Listener(8080) {
    // get specific user
    isolated resource function get user/[string username]() returns User|UserNotFound|error {
        return getUserByUsername(username);
    }

    // user registration
    isolated resource function post signup(http:Caller caller, http:Request req) returns error? {
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
            log:printInfo("User registered successfully!");
            check caller->respond(successResponse);
        } else {
            http:Response conflictResponse = new;
            conflictResponse.statusCode = http:STATUS_CONFLICT; // 409 Conflict
            conflictResponse.setPayload({"message": "User already exists!"});
            log:printInfo("User already exists!");
            check caller->respond(conflictResponse);
        }
    }

    // user login
    isolated resource function post login(http:Caller caller, http:Request req) returns error? {
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
        UserPassword|sql:Error userPassword = dbClient->queryRow(query, UserPassword);

        User|UserNotFound|error user = getUserByUsername(username);

        if (userPassword is UserPassword && user is User) {
            string storedHashedPassword = userPassword.password;
            string userRole = user.role;

            // Hash the incoming password using the same hashing algorithm (SHA-256)
            byte[] hashedPasswordBytes = crypto:hashSha256(password.toBytes());
            string hashedPassword = hashedPasswordBytes.toBase16();

            jwt:IssuerConfig issuerConfig = {
                issuer: "Mora_ByteSquad",
                audience: "QuizApp",
                expTime: 3600,
                signatureConfig: {
                    config: {
                        keyFile: "private.key",
                        keyPassword: "Mora"
                    }
                },
                customClaims: {
                    username: username,
                    role: userRole,
                    id: user.id
                }
            };
            // Generate a JWT token
            string jwt = check jwt:issue(issuerConfig);

            // Compare the provided hashed password with the stored hashed password
            if (hashedPassword == storedHashedPassword) {
                http:Response successResponse = new;
                successResponse.statusCode = http:STATUS_OK; // 200 OK
                successResponse.setPayload({"message": "Login successful!", "token": jwt});
                log:printInfo("Login successful!");
                check caller->respond(successResponse);
            } else {
                http:Response invalidPasswordResponse = new;
                invalidPasswordResponse.statusCode = http:STATUS_UNAUTHORIZED; // 401 Unauthorized
                invalidPasswordResponse.setPayload({"message": "Invalid password!"});
                log:printInfo("Invalid password!");
                check caller->respond(invalidPasswordResponse);
            }

        } else {
            http:Response userNotFoundResponse = new;
            userNotFoundResponse.statusCode = http:STATUS_NOT_FOUND; // 404 Not Found
            userNotFoundResponse.setPayload({"message": "User not found!"});
            log:printInfo("User not found!");
            check caller->respond(userNotFoundResponse);
        }
    }
}

isolated function getUserByUsername(string username) returns User|UserNotFound|error {
    User|sql:Error user = dbClient->queryRow(`SELECT id, username, role FROM users WHERE username = ${username}`);
    if (user is sql:NoRowsError) {
        UserNotFound userNotFound = {
            body: {message: string `username: ${username}`, details: string `user/${username}`, timeStamp: time:utcNow()}
        };
        return userNotFound;
    }
    return user;
}
