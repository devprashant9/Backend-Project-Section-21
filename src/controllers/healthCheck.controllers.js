import Response from "../utils/standardResponse.js";

export const healthCheck = async (req, res) => {
    const response = new Response(200, "API is running", { timestamp: new Date() });
    res.status(response.statusCode).json(response.toJSON());
};

