import envConfig from "../configs/env.js";

export const corsOptions = {
    origin: [envConfig.clientURL], // Allowed origins
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed custom headers
    credentials: true, // Allow cookies/auth headers
    preflightContinue: false, // Pass OPTIONS to next middleware? false is safe
    optionsSuccessStatus: 204 // Legacy browsers (IE11) require 200/204
};

export const expressJSONOptions = {
    limit: '10mb',           // Maximum body size to prevent DoS attacks
    strict: true,            // Only parse objects and arrays, reject primitives
    inflate: true,           // Accept deflated (compressed) bodies
    type: 'application/json',// Only parse requests with this Content-Type
    verify: (req, res, buf) => {
        // Optional: custom verification, e.g., logging raw body
        req.rawBody = buf.toString();
    }
};

export const urlEncodedOptions = {
    extended: true,       // Allows nested objects & arrays in form data
    limit: '10mb',        // Max request body size to prevent DoS attacks
    parameterLimit: 10000,// Max number of URL-encoded parameters allowed
    inflate: true,        // Accept compressed bodies (gzip/deflate)
    type: 'application/x-www-form-urlencoded', // Only parse this Content-Type
    verify: (req, res, buf) => {
        // Optional: save raw body for logging or HMAC validation
        req.rawBody = buf.toString();
    }
};

export const staticFolderOptions = {
    dotfiles: 'ignore',       // Ignore hidden files like .env
    etag: true,               // Enable ETag headers for caching
    lastModified: true,       // Add Last-Modified header
    maxAge: '7d',             // Cache static assets in browsers for 7 days
    immutable: true,          // Indicates assets won't change (good for hashed files)
    index: false,             // Prevent serving index.html automatically
    redirect: false           // Avoid redirecting directory requests
}