import Config from "config";
import Routes from "./routes.js";
import Server from "./common/server.js";

const dbUser = Config.get("databaseUser");
const dbPassword = Config.get("databasePassword");
const dbHost = Config.get("databaseHost");
const dbPort = Config.get("databasePort");
const dbName = Config.get("databaseName");

// Determine environment and authentication requirements
const isProd = process.env.NODE_ENV === 'production';
const requiresAuth = isProd || process.env.MONGODB_AUTH === 'true';

// Construct MongoDB URL based on environment and auth requirements
const dbUrl = requiresAuth && dbUser && dbPassword
  ? `mongodb://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPassword)}@${dbHost}:${dbPort}/${dbName}?authSource=admin`
  : `mongodb://${dbHost}:${dbPort}/${dbName}`;

console.log('Environment:', process.env.NODE_ENV);
console.log('Database Host:', dbHost);
console.log('Database Name:', dbName);
console.log('Authentication Required:', requiresAuth);
// Don't log credentials in production
if (!isProd) {
  console.log('Database URL:', dbUrl.replace(/\/\/.*@/, '//<credentials>@'));
}

const serverInstance = new Server();

serverInstance
  .router(Routes)
  .configureSwagger(Config.get("swaggerDefinition"))
  .handleError()
  .configureDb(dbUrl)
  .then((instance) => {
    instance.listen(Config.get("port"));
  })
  .catch((error) => {
    console.error('Server startup error:', error);
    if (error.name === 'MongoServerError' && error.code === 18) {
      console.error('Authentication failed. Please check database credentials and make sure authentication is properly configured.');
    }
    process.exit(1);
  });

export default serverInstance;
