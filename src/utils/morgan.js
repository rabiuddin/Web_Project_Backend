import morgan from "morgan";
import chalk from "chalk";

// Custom Morgan token for request body
morgan.token("body", (req) => {
  if (req.method === "POST" || req.method === "PUT") {
    return JSON.stringify(req.body);
  }
  return "-";
});

morgan.token("response-time", (req, res) => {
  const time = res.getHeader("X-Response-Time") || "0"; // Fallback if header is not set
  return `${time} ms`;
});

// Custom token for colorized status code
morgan.token("colored-status", (req, res) => {
  const status = res.statusCode;
  let color;
  if (status >= 500) color = chalk.red;
  else if (status >= 400) color = chalk.yellow;
  else if (status >= 300) color = chalk.cyan;
  else color = chalk.green;
  return color(status);
});

// Custom Morgan format
const customMorgan = morgan((tokens, req, res) => {
  return [
    chalk.blue(tokens.method(req, res)),
    chalk.white(tokens.url(req, res)),
    tokens["colored-status"](req, res),
    tokens["response-time"](req, res),
    chalk.gray(`- ${tokens["remote-addr"](req, res)}`),
    chalk.gray("${tokens['user-agent'](req, res)}"),
    chalk.magenta(`Body: ${tokens.body(req, res)}`),
  ].join(" ");
});

export default customMorgan;
