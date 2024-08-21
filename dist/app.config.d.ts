export namespace config {
    let routes: {
        "/": {
            name: string;
            run: typeof PageHome;
        };
        "/about": {
            run: typeof PageAbout;
        };
    };
}
import { PageHome } from "./pages/page-home";
import { PageAbout } from "./pages/page-about";
