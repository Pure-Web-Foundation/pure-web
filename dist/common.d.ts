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
