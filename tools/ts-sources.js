/**
 * This module updates the `files` property in the tsconfig.json files.
 */

var fs = require("fs-extra");
var path = require("path");

var glob = require("glob");
var _ = require("lodash");

var projectRoot = path.resolve(__dirname, "..");

var libSources = _.union(
  glob.sync("../../typings/**/*.ts", {cwd: path.resolve(projectRoot, "src/lib")}),
  glob.sync("**/!(*.spec).ts", {cwd: path.resolve(projectRoot, "src/lib")})
);

var testSources = _.union(
  glob.sync("../../typings/**/*.ts", {cwd: path.resolve(projectRoot, "src/test")}),
  glob.sync("**/*.ts", {cwd: path.resolve(projectRoot, "src/test")}),
  glob.sync("../lib/**/*.ts", {cwd: path.resolve(projectRoot, "src/test")})
);

var demoSources = _.union(
  glob.sync("../../typings/**/*.ts", {cwd: path.resolve(projectRoot, "src/demo")}),
  glob.sync("**/*.ts", {cwd: path.resolve(projectRoot, "src/demo")}),
  glob.sync("../lib/**/!(*.spec).ts", {cwd: path.resolve(projectRoot, "src/demo")})
);

function readJson (relativePath) {
  return fs.readJsonSync(path.resolve(projectRoot, relativePath));
}

function writeJson (relativePath, data) {
  return fs.writeJsonSync(path.resolve(projectRoot, relativePath), data);
}

function updateFiles (tsconfigPath, files) {
  var tsConfig = readJson(tsconfigPath);
  tsConfig.files = files.sort();
  writeJson(tsconfigPath, tsConfig);
}

updateFiles("src/lib/tsconfig.json", libSources);
updateFiles("src/test/tsconfig.json", testSources);
updateFiles("src/demo/tsconfig.json", demoSources);
