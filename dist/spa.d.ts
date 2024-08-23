/**
 * Light-DOM Lit Container Base Class for SPA routing.
 *
 * - Uses URLPattern for routing with expressions
 * - Uses View Transitions between routes
 * - Uses Navigator.navigate Event for route switching
 * - Facilitates Progressive enhancement by applying your enhancement rules at DOM changes
 */
export class PureSPA {
    static get properties(): {
        config: {
            type: ObjectConstructor;
        };
        activeRoute: {
            type: ObjectConstructor;
        };
    };
    /**
     * @returns {WidgetEnabledPage} Class that can be extended from in Routes that also have a Widget.
     */
    static get WidgetEnabledPage(): WidgetEnabledPage;
    /**
     * @returns {RoutePage} Class that can be extended from in Routes.
     */
    static get Page(): RoutePage;
    /**
     * Returns Lit Safe html to render any Web Component
     * @param {String} tagName
     * @param {Object} keyValuePairs
     * @returns { html }
     */
    static createCustomTagLitHtml(tagName: string, keyValuePairs: Object): html;
    /**
     * Generates an attribute string dynamically.
     * @param {Object} keyValuePairs
     * @returns { String } html attribute string
     */
    static generateAttributeString(keyValuePairs: Object): string;
    /**
     * Maps routing UrlPattern variables for Lit element dynamic rendering
     * @param {String} tagName
     * @param {Object} properties
     * @param {Object} routeData
     * @returns
     */
    static mapRouterVariables(tagName: string, properties: Object, routeData: Object): Object;
    connectedCallback(): void;
    routerReady: Promise<void> | undefined;
    /**
     * @returns { PureSPAEnhancementRegistry } enhancers registry
     */
    get enhancers(): PureSPAEnhancementRegistry;
    /**
     * @returns {PureSPAConfig} configuration
     */
    get config(): PureSPAConfig;
    /**
     * Gets the transition type for the view transition,
     * by comparing the current and future URLs.
     */
    getTransitionType(): "forwards" | "backwards" | undefined;
    /**
     * Dispatch app-level event
     * @param {String} eventName
     * @param {Object} detail Optional details to pass along with event
     */
    fire(eventName: string, detail?: Object): void;
    /**
     * Listen for app-level event
     * @param {String} eventName
     * @param {Function} func
     */
    on(eventName: string, func: Function): this;
    /**
     * Stop listening to app-level event
     * @param {String} eventName
     * @param {Function} func
     */
    off(eventName: string, func: Function): this;
    /**
     * Subclass this
     */
    beforeRouting(): Promise<void>;
    activeRoute: any;
    fireRouteComplete(): void;
    matchRouteWhenReady(): Promise<any>;
    matchRoute(): any;
    /**
     * Subclass this to set the 404 page
     */
    get notFoundPage(): any;
    updated(): void;
    waitForFullRendering(): Promise<void>;
    firstUpdated(): void;
    /**
     * Sublass this to set the loading page html.
     */
    get loadingPage(): any;
    goBack(fallback: any): void;
    /**
     * Called from router
     * @param {Object} content - route data to render
     */
    setRouteContent(content: Object): void;
    content: Object | Promise<any> | undefined;
    /**
     * Called when a route change is completed.
     */
    routeComplete(): void;
    /**
     * Called on first page request.
     * On route changes (via router), setRouteContent()
     * is called from router, which forces re-render.
     */
    getRouteContent(): void;
    render(): any;
    createRenderRoot(): this;
    /**
     * Subclass this for any initialization stuff that needs to run before the first route is rendered.
     * @returns {Boolean}
     */
    readyToRoute(): boolean;
    /**
     * Gets the breadcrumps of the given route
     * @param {Object} route
     * @returns {Array} array with the breadcrumbs.
     */
    getBreadCrumbs(route: Object): any[];
    #private;
}
/**
 * Progressive enhancers registry
 */
declare class PureSPAEnhancementRegistry {
    add(selector: any, enhancementFn: any): void;
    run(element: any): void;
    #private;
}
/**
 * Pure App Configuration
 */
declare class PureSPAConfig {
    constructor(rawConfig: any);
    readConfig(): void;
    /**
     * Returns all widgets (either custom ones defined in the config,
     * or page classes extending WidgetEnabledPage)
     */
    get widgets(): any;
    get routes(): {};
    get pages(): any;
    #private;
}
declare class RoutePage {
    static get properties(): {
        routeKey: {
            type: StringConstructor;
        };
        routeData: {
            type: ObjectConstructor;
        };
    };
    /**
     * Returns the current route's properties as defined in the configuration
     */
    get routeProperties(): any;
    createRenderRoot(): this;
}
export {};
