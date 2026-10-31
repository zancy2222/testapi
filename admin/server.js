// SYSTEM 2: Admin Panel (for the store owner)
// This server ONLY serves the web page. The data comes from the API on port 3000.
const express = require("express");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`System 2 (Admin) running at http://localhost:${PORT}`);
});
