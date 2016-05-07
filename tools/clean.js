var path = require("path");
var del = require("del");

var projectRoot = path.resolve(__dirname, "..");

// Make sure that we are in the correct directory!
var packageJson = require(path.resolve(projectRoot, "package.json"));
if (packageJson.name !== "skype-http") {
  throw new Error('tools/clean.js does not detect the correct package.json (expected name to be "skype-http")');
}

return del(
  [
    path.resolve(projectRoot, "build"),
    path.resolve(projectRoot, "dist")
  ],
  function (err) {
    if (err) {
      throw err;
    }
  }
);
