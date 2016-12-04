import * as fs from "fs";
import * as path from "path";

const testResourcesRoot = path.join(__dirname, "test-resources");

export function readTestResourceSync(filePath: string) {
  return fs.readFileSync(path.resolve(testResourcesRoot, filePath), "utf8");
}
