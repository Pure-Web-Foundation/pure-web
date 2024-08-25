import { PageAbout } from "./pages/page-about";
import { PageHome } from "./pages/page-home";
import { PageMasonry } from "./pages/examples/page-masonry";
import { PageExamples } from "./pages/examples/";
import { PageEnhancements } from "./pages/examples/page-enhancements";
import { name } from "../../package.json";
import { PageCMS } from "./pages/cms-page";

export const config = {
  routes: {
    "/": {
      name: name,
      run: PageHome,
      hidden: true,
    },
    "/about": {
      run: PageAbout,
    },
    "/publications": {
      run: PageCMS,
      routes: {
        "/*" : {},
      },
    },
    "/examples": {
      run: PageExamples,
      routes: {
        "/masonry": {
          run: PageMasonry,
        },
        "/enhancements": {
          run: PageEnhancements,
          name: "Other enhancements",
        },
      },
    },
  },
};
