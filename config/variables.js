const SERVER = {
  PORT: 5000,
  DEV: process.env.DEV || false,
  API: {
    IS_PRODUCTION: process.env.NODE_ENV === "production",
    RATE_LIMITS: {
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 200, // limit each IP to 200 requests per windowMs
    },
  },
};

module.exports = SERVER
