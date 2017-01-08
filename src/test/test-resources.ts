import * as fs from "fs";
import * as path from "path";

const testResourcesRoot: string = path.join(__dirname, "test-resources");

export function readTextTestResource(filePath: string) {
  return fs.readFileSync(path.resolve(testResourcesRoot, filePath), "utf8");
}
