// Starts the API + both systems with one command: npm start
const { spawn } = require("child_process");

const apps = ["api/server.js", "store/server.js", "admin/server.js"];

for (const file of apps) {
  const child = spawn(process.execPath, [file], { stdio: "inherit" });
  child.on("exit", (code) => console.log(`${file} stopped (code ${code})`));
}
