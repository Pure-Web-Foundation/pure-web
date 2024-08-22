import { PageAbout } from "./pages/page-about";
import { PageHome } from "./pages/page-home";
import { PageTerms } from "./pages/page-terms";

export const config = {
  routes: {
    "/": {
      name: "Home",
      run: PageHome
    },
    "/about": {
      run: PageAbout
    },
    "/terms": {
      run: PageTerms
    }
  }
};
