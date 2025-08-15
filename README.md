# My Learnings From This Project

## Why we need `Prettier`?

If a team does not use a shared Prettier config, each developer’s editor may format code differently.
One person’s editor might add extra spaces or new lines, while another’s might keep everything compact.
When these changes are committed, Git will show large diffs even though the actual logic did not change.
This creates merge conflicts, wastes time in code reviews, and makes the commit history messy.

```javascript
{
  "semi": true,                  // Always end statements with semicolons for clarity
  "singleQuote": true,           // Use single quotes for strings
  "tabWidth": 2,                  // Two spaces per indentation level
  "useTabs": false,               // Use spaces instead of tabs
  "trailingComma": "es5",         // Trailing commas where valid in ES5 (objects, arrays, etc.)
  "printWidth": 100,              // Wrap lines at 100 characters for readability
  "bracketSpacing": true,         // Space between brackets in object literals: { foo: bar }
  "arrowParens": "always",        // Always include parens around arrow function arguments
  "endOfLine": "lf",              // Enforce LF line endings for cross-platform consistency
  "quoteProps": "as-needed",      // Only quote object properties when required
  "jsxSingleQuote": false,        // Use double quotes in JSX for better readability
  "proseWrap": "preserve"         // Preserve line breaks in markdown/text
}
```

Without a Prettier ignore file, Prettier will try to format every file it finds.
This includes large auto-generated or minified files that should not be changed.
When these are reformatted, it results in huge and unnecessary changes in version control.
It also increases the time taken to format code and can even break files that rely on a specific structure.

```javascript
# Ignore system & dependency folders
node_modules
dist
build
coverage

# Ignore environment & config files
.env
.env.*
package-lock.json
yarn.lock
pnpm-lock.yaml

# Ignore logs & temporary files
*.log
*.tmp

# Ignore compiled or output files
*.min.js
*.min.css

# Ignore images, binaries, etc.
*.png
*.jpg
*.jpeg
*.gif
*.svg
*.ico
*.pdf

# Ignore IDE/project settings
.vscode
.idea

# Ignore documentation builds
docs/**/*.html

# Ignore any generated files
public/**/*.*

```

## Closer look on `dotenv.config({})`

```javascript
import dotenev from "dotenv";
dotenv.config();


Backend
|    |_ src
|    |     |_ config
|    |         |_ envConfig.js
|    |_ index.js
.env
package.json
```

If the first 2 lines is written inside `envConfig.js` and if we try to run `npm run dev` from the `Backend` folder where `dev: nodemon src/index.js` then the `.env` file gets loaded even without the `options` object.

This is because by default `npm` makes the `cwd()` point to the location where `package.json` is located and if the `options` object is not provided then `dotenev` looks for the `.env` file inside `cwd()` and it finds it and loads it.

If we just move into `src` folder and then try to run `node index.js` it won't work because the `cwd()` has changed. However, the script will still work because npm resolves `cwd()` to folder where `package.json` is present.

This way of laoding is not considered as good practise because the file may be present somewhere else or some random places. To fix this or to properly implement this we should follow this code.

```javascript
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import dotenv from "dotenv";

const filename = fileURLToPath(import.meta.url);
const dirname = dirname(filename);

dotenv.config({
  path: resolve(dirname, "../../.env"),
});
```

The `import.meta.url` contains the current file location but served using `file`protocol so we need to resolve it into proper path. After that we use `dirname` to get the directory name in which the file exists.

The resolve function helps us to get back to the original `.env` location and it is very helpful and will never give error no matter from where the file is opened the `path` key always points to the exact location of the `.env` file.

## Why `NODE_ENV=development` is Helpful?

`NODE_ENV=development` in `.env` is important because it tells your application what mode it’s running in so it can adjust its behavior accordingly.
In development, you usually want detailed error messages, verbose logging, hot reloading, and other tools that make debugging easier — but these same features would be a security and performance risk in production.

By explicitly setting `NODE_ENV`, your code and dependencies can check the environment and enable or disable certain features automatically.
Without it, the app might run with default settings that are unsafe for production or inconvenient for development, leading to issues like exposing stack traces to users, accidentally connecting to live databases, or not having access to debugging tools.

## Why create a `envConfig` object and Freeze?

```javascript
const envConfig = Object.freeze({
  port: process.env.PORT,
  mongoDB: process.env.MONGO_URI,
  clientURL: process.env.CLIENT_URL,
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: (process.env.NODE_ENV || "development") === "development",
  isProd: (process.env.NODE_ENV || "development") === "production",
});

export default envConfig;
```

Creating an `envConfig` object like this helps because it centralizes all environment variables in one place.
Instead of calling `process.env` in multiple files (which can lead to typos, inconsistent default values, and repetitive code), you have a single, frozen configuration object that holds all the important environment data.

`Freezing` the object ensures no one can accidentally overwrite these values during runtime, which avoids bugs caused by unexpected changes.

It also makes the app `easier to maintain` — if you ever change an environment variable name or add a default value, you only update it in one place.

The `NODE_ENV` part in this object is especially useful because it lets you `control environment-specific behavior` in a clean way.

**For example:** `isDev` can be used to enable verbose logging, detailed error messages, and dev-only tools. `isProd` can be used to enable optimizations, stricter security settings, and connect to production services.

Without this, you’d need to repeatedly write something like:

```javascript
if (process.env.NODE_ENV === "production") { ... }
```

everywhere in your code, which is repetitive and error-prone.

By precomputing `isDev` and `isProd`, you make your code more readable, safer, and easier to maintain.

```javascript
import envConfig from "./configs/envConfig.js";

function log(message) {
  if (envConfig.isDev) {
    console.log(`[DEV LOG] ${message}`); // verbose logging in dev
  }
}

export default log;
```

In `development`, this will print every debug log to your console so you can see what’s happening. In `production`, since isDev is false, those logs won’t show up — which keeps the logs clean and avoids leaking sensitive info.

## Closer look on `cors({})`

CORS stands for `Cross Origin Resource Sharing`. It is a **browser security** feature to protect applications. Let us first understand the term `origin`. CORS only applies to browsers, `server-to-server communication` is not restricted by it.

> http://localhost:3000 → protocol (http) + host (localhost) + port (3000)

Changing any of these makes it a different origin.

Whenever we make a `request` it reaches the server and the server sends a `response`. However, if the Client and Server URL are same then the browser accepts the response. If they are different and the `cors()` is not defined in that case the browser rejects the `response` because the response is untrusted.

The browser sends the request with an Origin header `(e.g., goodurl.com)`. The server responds with an `Access-Control-Allow-Origin` header `(e.g., badurl.com)`. When the browser sees that the origin in the request and the allowed origin in the response don’t match, it blocks JavaScript on the page from reading the response. The request still reached the server and may have been processed, but the browser enforces `CORS` on the client side.

### Simple Requests

In these types of requests the browser doesn't asks for permission from the server and directly sends the requests. Simple requests are those that use “safe” HTTP methods like `GET` or `POST` with standard headers such as `Content-Type: text/plain`. These requests are considered low-risk, so the browser sends them directly to the server without any extra checks. This makes them faster and suitable for reading public data or submitting basic HTML forms.

```javascript
import cors from "cors";
import express from "express";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Only allow this origin
    methods: ["GET", "POST"], // Simple request methods
    allowedHeaders: ["Content-Type"], // Only simple headers
  }),
);
```

### Preflighted Requests

In this an `OPTIONS` request is sent to the server first to get confirmation. Preflighted requests are considered potentially risky because they use methods like `PUT`, `PATCH`, or `DELETE`, include custom headers like `Authorization` or `X-Custom-Header`, or have content types such as `application/json`. For these requests, the browser first sends an `OPTIONS` preflight request to the server to verify that it explicitly allows the requested method, headers, and origin. This mechanism ensures that sensitive operations or requests carrying authentication data are not performed by malicious websites without the server’s consent. In practice, simple requests are used when speed and minimal security checks are sufficient, while preflighted requests are necessary whenever the request might modify data or include sensitive information, enforcing an additional layer of protection.

```javascript
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Includes risky methods
    allowedHeaders: ["Content-Type", "Authorization"], // Custom headers
    credentials: true, // Allow cookies/auth
    optionsSuccessStatus: 200, // For legacy browsers
  }),
);
```
