const express = require("express");
const session = require("express-session");
const { staticDir, indexHtml, srvConfig } = require("./config");

const userRouter = require("./routes/user/user");
const adminRouter = require("./routes/admin/admin");
const apiRouter = require("./routes/user/api");

const app = express();

// Настройка сессий
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(express.json());

app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/api", apiRouter);

app.use(express.static(staticDir));

app.get("/", (req, res) => {
  res.send(indexHtml);
});

// docs file

const path = require("path");
const fs = require("fs");

const docsHtml = fs.readFileSync(
  path.join(staticDir, "../docs/docs.html"),
  "utf8"
);

app.get("/docs", (req, res) => {
  res.send(docsHtml);
});

app.use("/admin/*", (req, res, next) => {
  if (!req.session.isAuthenticated) {
    return res.status(403).json({ error: "Access denied. Please log in." });
  }
  next();
});

const PORT = srvConfig.port || 3001;

app.listen(PORT, () => {
  console.log(`Server is started on port: ${PORT}`);
  console.log(`Site is available at http://localhost:${PORT}`);
});
