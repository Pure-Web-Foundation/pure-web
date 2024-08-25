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
        "/publications": {
            run: typeof PageCMS;
            routes: {
                "/*": {};
            };
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
import { PageCMS } from "./pages/cms-page";
import { PageMasonry } from "./pages/examples/page-masonry";
import { PageEnhancements } from "./pages/examples/page-enhancements";
