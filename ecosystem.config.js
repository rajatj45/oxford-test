module.exports = {
  apps: [
    {
      name: "shopsquareone-dev",
      cwd: "/home/node24/shopsquareone/shopsquareone-fe",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: 4002
      },
    },
  ],
};
