/**
 * Returns a contextual unique identifier with the given prefix
 * @param {String} prefix
 * @param {Number} radix
 * @returns { String} unique identifier
 */
export function getUniqueName(prefix?: string, radix?: number): string;
/**
 * Generates an HTML NodeList by parsing the given HTML string
 * @param {String} html
 * @returns {NodeListOf<ChildNode>} DOM element
 */
export function parseHTML(html: string): NodeListOf<ChildNode>;
/**
 * Debounces events that occur repeatedly, such as resize and mousemove events.
 * @param {Function} fn
 */
export function debounce(fn: Function): (...params: any[]) => void;
/**
 * Throttles execution of any function
 * @param {Function} fn - Function to fire
 * @param {Number} timeoutMs - time in milliseconds to buffer all calls to fn.
 */
export function throttle(fn: Function, timeoutMs?: number): (...args: any[]) => void;
/**
 * Queues a call for when the main thread is free.
 * @param {Function} fn - the function to call
 */
export function enQueue(fn: Function): void;
/**
 * Returns true if the given string is a valid URL.
 * @param {String} str
 * @returns { Boolean }
 */
export function isUrl(str: string): boolean;
/**
 * Opens a window and returns the handle.
 * @param {String} url
 * @param {Number} width
 * @param {Number} height
 * @returns window handle reference
 */
export function openCenteredWindow(url: string, width: number, height: number): Window | null;
/**
 * Enhance inputs having data-label attribute.
 *
 * @param {HTMLElement|Document|null} root On which root element we should apply it.
 */
export function enhanceInputWithLabel(input: any): void;
/**
 * Enhances a <nav data-dropdown><button></button><menu></menu></nav> structure
 * to become a dropdown button.
 * @param {HTMLElement} nav
 * @returns {String} return value indicating the enhancement has been applied.
 */
export function enhanceNavDropdownButton(nav: HTMLElement): string;
/**
 * Returns a string that displays the element in a CSS-type,
 * readable way, following CSS selector syntax.
 * @param {HTMLElement} element
 * @returns {String} human readable string that identifies the element.
 */
export function getElementSelector(element: HTMLElement): string;
/**
 * Enhances a regular grid to become a masonry grid
 * @param {HTMLElement} element
 */
export function enhanceMasonryGrid(element: HTMLElement): string;
/**
 * Returns a Promise that resolves when all images in the given container have downloaded.
 */
export function waitForImages(container: any): Promise<any[]>;
/**
 * Creates
 * @param {String} cssText
 * @returns {String} id of the style element
 */
export function addStyleSheet(cssText: string): string;
/**
 * Generates a hash that uniquely identifies a string
 * @param {String} str
 * @param {Number} seed
 * @returns {String }
 */
export function generateHash(str: string, seed?: number): string;
