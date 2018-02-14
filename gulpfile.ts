import * as buildTools from "turbo-gulp";

import gulp from "gulp";
import minimist, { ParsedArgs } from "minimist";

interface Options {
  devDist?: string;
}

const options: Options & ParsedArgs = minimist(process.argv.slice(2), {
  string: ["devDist"],
  default: {devDist: undefined},
  alias: {devDist: "dev-dist"},
});

const project: buildTools.Project = {
  root: __dirname,
  packageJson: "package.json",
  buildDir: "build",
  distDir: "dist",
  srcDir: "src",
  tslint: {
    configuration: {
      rules: {
        "number-literal-format": false,
      },
    },
  },
};

const lib: buildTools.LibTarget = {
  project,
  name: "lib",
  srcDir: "src/lib",
  scripts: ["**/*.ts"],
  mainModule: "index",
  dist: {
    packageJsonMap: (old: buildTools.PackageJson): buildTools.PackageJson => {
      const version: string = options.devDist !== undefined ? `${old.version}-build.${options.devDist}` : old.version;
      return <any> {...old, version, scripts: undefined, private: false};
    },
    npmPublish: {
      tag: options.devDist !== undefined ? "next" : "latest",
    },
  },
  customTypingsDir: "src/custom-typings",
  tscOptions: {
    skipLibCheck: true,
  },
  typedoc: {
    dir: "typedoc",
    name: "Skype Http",
    deploy: {
      repository: "git@github.com:ocilo/skype-http.git",
      branch: "gh-pages",
    },
  },
  clean: {
    dirs: ["build/lib", "dist/lib"],
  },
};

const example: buildTools.NodeTarget = {
  project,
  name: "example",
  srcDir: "src",
  scripts: ["example/**/*.ts", "lib/**/*.ts"],
  tsconfigJson: "src/example/tsconfig.json",
  mainModule: "example/main",
  customTypingsDir: "src/custom-typings",
  outModules: buildTools.OutModules.Both,
  tscOptions: {
    skipLibCheck: true,
  },
  clean: {
    dirs: ["build/example", "dist/example"],
  },
};

const test: buildTools.MochaTarget = {
  project,
  name: "test",
  srcDir: "src",
  scripts: ["test/**/*.ts", "lib/**/*.ts"],
  customTypingsDir: "src/custom-typings",
  tsconfigJson: "src/test/tsconfig.json",
  outModules: buildTools.OutModules.Both,
  tscOptions: {
    skipLibCheck: true,
  },
  copy: [{files: ["test/test-resources/**/*"]}],
  clean: {
    dirs: ["build/test"],
  },
};

const libTasks: any = buildTools.registerLibTasks(gulp, lib);
buildTools.registerMochaTasks(gulp, test);
buildTools.registerNodeTasks(gulp, example);
buildTools.projectTasks.registerAll(gulp, project);

gulp.task("all:tsconfig.json", gulp.parallel("lib:tsconfig.json", "test:tsconfig.json", "example:tsconfig.json"));
gulp.task("dist", libTasks.dist);
