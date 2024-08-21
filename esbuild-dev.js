const esbuild = require("esbuild");
const copyPlugin = require("./lib/esbuild-plugin-copy");
const rebuildNotifyPlugin = require("./lib/esbuild-plugin-rebuild-notify");
const sassPlugin = require("esbuild-plugin-sass");

const config = {
  entryPoints: [
    "src/js/app.js",
    "src/js/polyfills/urlpattern-polyfill.js",
    "src/js/index.js",
    "src/js/spa.js",
    "src/js/autocomplete.js",
  ],
  plugins: [
    rebuildNotifyPlugin(),
    copyPlugin({
      from: "src/polyfills/*",
      to: "public/assets/js/polyfills",
      exclude: ["src/polyfills/urlpattern-polyfill.js"],
    }),
    sassPlugin({
      type: "css-text",
    }),
  ],
  platform: "node",
  outdir: "public/assets/js/",
  external: ["*.woff", "*.eot", "*.ttf", "*.svg"],
  bundle: true,
  sourcemap: true,
  external: ["esbuild"],
  loader: {
    ".scss": "css",
  },
};

const run = async () => {
  const ctx = await esbuild.context(config);
  await ctx.watch();
};

run();
