export namespace config {
    let routes: {
        "/": {
            name: string;
            run: typeof PageHome;
        };
        "/about": {
            run: typeof PageAbout;
        };
        "/terms": {
            run: typeof PageTerms;
        };
    };
}
import { PageHome } from "./pages/page-home";
import { PageAbout } from "./pages/page-about";
import { PageTerms } from "./pages/page-terms";
