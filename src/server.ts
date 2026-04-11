import app from "./app";
import config from "./config/config";
import logger from "./utils/logger";

const port = config.PORT;

app.listen(port, () => {
  logger.info(`Server is running at http://localhost:${port}`);
});
