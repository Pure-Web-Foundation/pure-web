import { PageAbout } from "./pages/page-about";
import { PageHome } from "./pages/page-home";
import { PageMasonry } from "./pages/examples/page-masonry";
import { PageExamples } from "./pages/examples/";
import { PageEnhancements } from "./pages/examples/page-enhancements";
import { name } from "../../package.json";
import { PageSPA } from "./pages/spa/index";
export const config = {
  routes: {
    "/": {
      name: name,
      run: PageHome,
      hidden: true
    },
    "/about": {
      run: PageAbout
    },
    "/spa":{
      run: PageSPA
    },
    "/examples": {
      run: PageExamples,
      routes: {
        "/masonry":{
          run: PageMasonry
        },
        "/enhancements":{
          run: PageEnhancements,
          name: "Other enhancements"
        }
      }
    }
  }
};
