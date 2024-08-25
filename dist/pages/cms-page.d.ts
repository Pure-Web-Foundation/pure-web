export class PageCMS {
    static get properties(): {
        cms_id: {
            type: StringConstructor;
            routeOrigin: string;
        };
    };
    connectedCallback(): void;
    cms: TinyCMS | undefined;
    render(): any;
}
import { TinyCMS } from "../tiny-cms";
