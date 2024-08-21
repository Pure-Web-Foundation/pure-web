import { PageAbout } from "./pages/page-about";
import { PageHome } from "./pages/page-home";

export const config = {
  routes: {
    "/": {
      name: "Home",
      run: PageHome
    },
    "/about": {
      run: PageAbout
    },
  }
};
