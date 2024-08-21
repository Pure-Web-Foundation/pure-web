/**
 * Generic Autocompletion class for enrichment of textboxes
 */
export class AutoComplete {
    /**
     * Connector logic to call on @focus events.
     * Lit example:
     * <input type="search" @focus=${(e) => {AutoComplete.connect(e, this.autoComplete); }} />
     *
     * @param {*} event focus event
     * @param {*} options AutoComplete options
     */
    static connect(event: any, options: any): void;
    static textFilter(options: any, propertyName: any): (i: any) => any;
    constructor(parent: any, textInput: any, settings: any);
    cssClasses: {
        result: string;
        item: string;
    };
    settings: any;
    container: any;
    input: any;
    categories: any;
    on(a: any, b: any): this;
    attach(): void;
    resultsDiv: HTMLDivElement | undefined;
    controller(): {
        show: () => void;
        hide: () => void;
        empty: () => void;
    };
    internalController(): {
        show: () => void;
        hide: () => void;
        empty: () => void;
    };
    moveResult(add: any): void;
    rowIndex: any;
    getSelectedDiv(): Element | null;
    selectResult(div: any): void;
    resultClicked: boolean | undefined;
    tabWindow: Window | null | undefined;
    setText(options: any): void;
    resultClick(event: any): void;
    blurHandler(): void;
    clear(): void;
    show(): void;
    acItems: NodeListOf<Element> | undefined;
    hide(): void;
    empty(): void;
    inputHandler(e: any): void;
    keyDownHandler(e: any): void;
    keyUpHandler(e: any): void;
    focusHandler(e: any): void;
    /**
     * Shows suggestion box
     * @param {string} value - String to suggest results for
     */
    suggest(value: string, e: any): void;
    resultsHandler(r: any, options: any): void;
    results: any;
    handleImageOrIcon(i: any): string;
    formatResultItem(item: any, options: any, catHandler: any): any;
    highlight(str: any, find: any): any;
    getItems(options: any, e: any): Promise<any>;
    items(options: any): Promise<any[]>;
    formatSearch(url: any, options: any): any;
    createQueryParam(options: any): string;
    isMatch(options: any, i: any): any;
}
