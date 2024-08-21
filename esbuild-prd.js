const esbuild = require("esbuild");
const copyPlugin = require("./lib/esbuild-plugin-copy");
const rebuildNotifyPlugin = require("./lib/esbuild-plugin-rebuild-notify");
const sassPlugin = require("esbuild-plugin-sass");
//const customElementsPlugin = require("./lib/custom-elements-plugin")

const config = {
  entryPoints: [
    "src/js/app.js",
    "src/js/polyfills/urlpattern-polyfill.js",
    "src/js/index.js",
    "src/js/spa.js",
    "src/js/autocomplete.js",
    "src/js/svg-icon.js"
  ],
  plugins: [
    rebuildNotifyPlugin(),
    copyPlugin({
      from: "src/polyfills/*",
      to: "public/assets/js/polyfills",
      exclude: ["src/polyfills/urlpattern-polyfill.js"],
    }),
    sassPlugin({
      type: "lit-css",
    }),
    // customElementsPlugin({

    // })
  ],
  platform: "node",
  outdir: "public/assets/js/",
  external: ["*.woff", "*.eot", "*.ttf", "*.svg"],
  bundle: true,
  minify: true,
  sourcemap: false,
  external: ["esbuild"],
};

const build = async () => {
  const result = await esbuild.build(config);
};

build();
console.log("Build completed");
