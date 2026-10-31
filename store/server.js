// SYSTEM 1: Online Store (for customers)
// This server ONLY serves the web page. The data comes from the API on port 3000.
const express = require("express");
const path = require("path");

const app = express();
const PORT = 4000;

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`System 1 (Store) running at http://localhost:${PORT}`);
});
