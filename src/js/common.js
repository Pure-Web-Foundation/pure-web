let ctlNr = 1000;

/**
 * Returns a contextual unique identifier with the given prefix
 * @param {String} prefix
 * @param {Number} radix
 * @returns { String} unique identifier
 */
export function getUniqueName(prefix = "df", radix = 16) {
  return `${prefix}${(ctlNr++).toString(radix)}`;
}

/**
 * Generates an HTML NodeList by parsing the given HTML string
 * @param {String} html
 * @returns {NodeListOf<ChildNode>} DOM element
 */
export function parseHTML(html) {
  return new DOMParser().parseFromString(html, "text/html").body.childNodes;
}

/**
 * Debounces events that occur repeatedly, such as resize and mousemove events.
 * @param {Function} fn
 */
export function debounce(fn) {
  // This holds the requestAnimationFrame reference, so we can cancel it if we wish
  let frame;

  // The debounce function returns a new function that can receive a variable number of arguments
  return (...params) => {
    // If the frame variable has been defined, clear it now, and queue for next frame
    if (frame) {
      cancelAnimationFrame(frame);
    }

    // Queue our function call for the next frame
    frame = requestAnimationFrame(() => {
      // Call our function and pass any params we received
      fn(...params);
    });
  };
}

/**
 * Throttles execution of any function
 * @param {Function} fn - Function to fire
 * @param {Number} timeoutMs - time in milliseconds to buffer all calls to fn.
 */
export function throttle(fn, timeoutMs = 100) {
  let handle;
  return function executedFunction(...args) {
    const fire = () => {
      clearTimeout(handle);
      fn(...args);
    };
    clearTimeout(handle);
    handle = setTimeout(fire, timeoutMs);
  };
}

/**
 * Queues a call for when the main thread is free.
 * @param {Function} fn - the function to call
 */
export function enQueue(fn) {
  setTimeout(fn, 0);
}

/**
 * Returns true if the given string is a valid URL.
 * @param {String} str
 * @returns { Boolean }
 */
export function isUrl(str) {
  try {
    if (typeof str !== "string") return false;
    if (str.indexOf("\n") !== -1 || str.indexOf(" ") !== -1) return false;
    if (str.startsWith("#/")) return false;
    const newUrl = new URL(str, window.location.origin);
    return newUrl.protocol === "http:" || newUrl.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Opens a window and returns the handle.
 * @param {String} url
 * @param {Number} width
 * @param {Number} height
 * @returns window handle reference
 */
export function openCenteredWindow(url, width, height) {
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  return window.open(
    url,
    "",
    `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=${width}, height=${height}, top=${top}, left=${left}`
  );
}

/**
 * Input Template.
 * @type {string}
 */
const inputTemplate = /*html*/ `
<label>
  <span data-label></span>
  <span class="placeholder"></span>
</label>`;

/**
 * Enhance inputs having data-label attribute.
 *
 * @param {HTMLElement|Document|null} root On which root element we should apply it.
 */
export function enhanceInputWithLabel(input) {
  const labelText = input.getAttribute("data-label") ?? "";
  if (labelText.length) {
    const label = parseHTML(inputTemplate)[0];
    const type = input.getAttribute("type") || "text";
    input.insertAdjacentElement("beforebegin", label);
    label.querySelector(".placeholder").replaceWith(input);
    label.querySelector("span[data-label]").textContent = labelText;
    input.removeAttribute("data-label");
    input.setAttribute("type", type);
  }

  const icon = input.getAttribute("data-icon") || "";
  if (icon) {
    const iconColor = input.getAttribute("data-icon-color") || "";
    const iconSize = input.getAttribute("data-icon-size") || "";
    const iconHtml = /*html*/ `<svg-icon icon="${icon}" color="${iconColor}" size="${iconSize}"></svg-icon>`;
    input.insertAdjacentElement("afterend", parseHTML(iconHtml)[0]);
  }
}

let uniqueNavId;
/**
 * Enhances a <nav data-dropdown><button></button><menu></menu></nav> structure
 * to become a dropdown button.
 * @param {HTMLElement} nav
 * @returns {String} return value indicating the enhancement has been applied.
 */
export function enhanceNavDropdownButton(nav) {
  const button = nav.querySelector("button");
  if (button.textContent.trim().length === 0) {
    const span = document.createElement("span");
    span.innerHTML = "&nbsp;";
    span.setAttribute("data-label", "");
    span.setAttribute("hidden", "");
    button.appendChild(span);
  }
  const menu = nav.querySelector("menu");
  menu.setAttribute("role", "menu");
  menu.setAttribute("hidden", "");

  uniqueNavId = getUniqueName("nav");

  nav.setAttribute("aria-controls", uniqueNavId);
  nav.setAttribute("aria-haspopup", "true");
  nav.setAttribute("aria-expanded", "false");
  menu.setAttribute("id", uniqueNavId);
  [...menu.children].forEach((li) => {
    li.setAttribute("role", "menuitem");
  });

  button.addEventListener("click", () => {
    const hidden = menu.hasAttribute("hidden");
    if (hidden) {
      menu.removeAttribute("hidden");

      setTimeout(() => {
        document.addEventListener(
          "click",
          (e) => {
            if (!nav.contains(e.target)) button.click();
          },
          {
            once: true,
          }
        );
      }, 100);
    } else menu.setAttribute("hidden", "");
  });
  return "nav";
}

/**
 * Returns a string that displays the element in a CSS-type,
 * readable way, following CSS selector syntax.
 * @param {HTMLElement} element
 * @returns {String} human readable string that identifies the element.
 */
export function getElementSelector(element) {
  const id = element.id ? "#" + element.id : "";
  let cls = [...element.classList].join(".");
  if (cls) cls = "." + cls;
  return `${element.nodeName.toLowerCase()}${id}${cls}`;
}

/**
 * Enhances a regular grid to become a masonry grid
 * @param {HTMLElement} element
 */
export function enhanceMasonryGrid(element) {
  element.style.setProperty("grid-auto-rows", "20px");

  addStyleSheet(/*css*/ `
    .masonry {
      opacity: 0;
    }

    .masonry-applied {
      opacity: 1;
      transition: opacity .2s ease
    }
    `);

  const resizeGridItem = (item) => {
    const rowHeight = parseInt(
      window.getComputedStyle(element).getPropertyValue("grid-auto-rows")
    );
    const rowGap = parseInt(
      window.getComputedStyle(element).getPropertyValue("grid-row-gap")
    );
    const rowSpan = Math.ceil(
      (item.querySelector(".content").getBoundingClientRect().height + rowGap) /
        (rowHeight + rowGap)
    );
    item.style.gridRowEnd = "span " + rowSpan;
  };

  const resizeAllGridItems = () => {
    try {
      element.classList.remove("masonry-applied");
      for (const item of element.children) resizeGridItem(item);
    } finally {
      element.classList.add("masonry-applied");
    }
  };

  window.addEventListener("resize", throttle(resizeAllGridItems, 100));
  waitForImages(element).then(resizeAllGridItems);

  return "masonry";
}

/**
 * Returns a Promise that resolves when all images in the given container have downloaded.
 */
export function waitForImages(container) {
  const imgElements = container.querySelectorAll("img");

  const imgPromises = Array.from(imgElements).map((img) => {
    return new Promise((resolve, reject) => {
      const imgSrc = img.src;
      const image = new Image();
      image.onload = () => resolve(imgSrc);
      image.onerror = (error) => reject(error);
      image.src = imgSrc;
    });
  });
  return Promise.all(imgPromises);
}

/**
 * Creates
 * @param {String} cssText
 * @returns {String} id of the style element
 */
export function addStyleSheet(cssText) {
  const id = generateHash(cssText);
  let styleElement = document.getElementById(id);
  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = id;
    styleElement.textContent = cssText;
    document.querySelector("head").appendChild(styleElement);
  }
  return id;
}

/**
 * Generates a hash that uniquely identifies a string
 * @param {String} str
 * @param {Number} seed
 * @returns {String }
 */
export function generateHash(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hashNr = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  const radix = 16;
  return `h${hashNr.toString(radix)}`;
}
