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
 * Enhance inputs from simple syntax to the syntax described in the input story.
 *
 * @param {HTMLElement|Document|null} root On which root element we should apply it.
 */
export function enhanceInputs(root = null) {
  if (!root) root = window.document;

  // Loop over inputs and enhance them.
  for (const input of root.querySelectorAll("[data-label]")) {
    const labelText = input.getAttribute("data-label") || "";
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
}

let uniqueNavId;
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

export function friendlyElement(element) {
  const id = element.id ? "#" + element.id : "";
  let cls = [...element.classList].join(".");
  if (cls) cls = "." + cls;
  return `${element.nodeName.toLowerCase()}${id}${cls}`;
}

