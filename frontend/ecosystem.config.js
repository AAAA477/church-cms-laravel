module.exports = {
  apps: [
    {
      name: "church-cms-frontend",
      script: ".next/standalone/server.js",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        HOSTNAME: "127.0.0.1",
        API_URL: "http://127.0.0.1:8000",
        CHURCH_ID: "1",
        SITE_URL: "http://localhost:8090",
      },
    },
  ],
};
