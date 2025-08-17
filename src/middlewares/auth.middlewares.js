import jwt from "jsonwebtoken";
import envConfig from "../configs/env.js";
import StandardError from "../utils/StandardError.js";

export const authenticateUserRequest = (req, res, next) => {
    try {
        let token;
        console.log(req.cookies)

        const authHeader = req.headers["authorization"]?.trim();
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        if (!token && req.cookies?.userAccessToken) {
            token = req.cookies.userAccessToken;
        }

        if (!token) {
            return next(new StandardError(401, "Access Token Missing"));
        }

        const decoded = jwt.verify(token, envConfig.accessTokenSecret);

        req.user = decoded;

        return next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return next(new StandardError(401, "Access Token Expired"));
        }

        if (err.name === "JsonWebTokenError") {
            return next(new StandardError(401, "Invalid Access Token"));
        }
        return next(err);
    }
};
