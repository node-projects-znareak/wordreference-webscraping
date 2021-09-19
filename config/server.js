const { PORT } = require("./variables");
const { message } = require("../helpers/utils");
const wrapServerErrors = require("../middlewares");

async function startServer(app, routers) {
  try {
    console.clear();
    app.use("/api", routers);
    app.use((req, res, next) => {
      res.status(404).json({ status: 404, body: "Not Found" });
      next();
    });

    wrapServerErrors(app);

    const server = app.listen(PORT, async () => {
      message.success(`Server has started in http://localhost:${PORT}/`);
      process.on("SIGINT", () => server.close());
      process.on("SIGTERM", () => server.close());
    });
  } catch (err) {
    message.error("Error Ocurred while starting the server", err);
  }
}

module.exports = startServer;
