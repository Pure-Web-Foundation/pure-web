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
 * Enhance inputs from simple syntax to the syntax described in the input story.
 *
 * @param {HTMLElement|Document|null} root On which root element we should apply it.
 */
export function enhanceInputs(root?: HTMLElement | Document | null): void;
export function enhanceNavDropdownButton(nav: any): string;
export function friendlyElement(element: any): string;
