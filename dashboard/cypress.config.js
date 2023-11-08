const { defineConfig } = require("cypress");

module.exports = defineConfig({
  fixturesFolder: false,
  defaultCommandTimeout: 8000,
  e2e: {
    baseUrl: "http://localhost:30000",
  },
});
