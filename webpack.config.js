const path = require("path");

module.exports = {
  mode: "development",
  entry: "./app/scripts/main.js",
  output: {
    path: path.resolve(__dirname, "build"),
  },
  resolve: {
    modules: ["node_modules"],
    alias: {
      externals: './app/externals',
    },
  },
};
