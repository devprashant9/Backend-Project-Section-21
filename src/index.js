import envConfig from "./configs/env.js";
import app from "./app.js";
import connectToDatabase from "./configs/db.js";

const PORT = envConfig.port || 3000;

(async () => {
    try {
        await connectToDatabase();

        app.listen(PORT, () => {
            console.log(`✅ Server started at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
})();
