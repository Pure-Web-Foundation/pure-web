export namespace config {
    let routes: {
        "/": {
            name: any;
            run: typeof PageHome;
            hidden: boolean;
        };
        "/about": {
            run: typeof PageAbout;
        };
        "/spa": {
            run: typeof PageSPA;
        };
        "/examples": {
            run: any;
            routes: {
                "/masonry": {
                    run: typeof PageMasonry;
                };
                "/enhancements": {
                    run: typeof PageEnhancements;
                    name: string;
                };
            };
        };
    };
}
import { PageHome } from "./pages/page-home";
import { PageAbout } from "./pages/page-about";
import { PageSPA } from "./pages/spa/index";
import { PageMasonry } from "./pages/examples/page-masonry";
import { PageEnhancements } from "./pages/examples/page-enhancements";
