/**
 * This module expects to be called as part of the `npm run prepublish` command.
 *
 * It copies the local build to the dist directory exposed to npm.
 */

var path = require("path");
var fs = require("fs-extra");

var projectRoot = path.resolve(__dirname, "..");

var localBuild = path.resolve(projectRoot, "build/local");
var dist = path.resolve(projectRoot, "dist");

fs.copy(localBuild, dist, function (err) {
  if (err) {
    throw err;
  }
});
