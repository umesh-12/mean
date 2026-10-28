import dns from "dns";
import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const PORT = process.env.PORT || 3100;

connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
});