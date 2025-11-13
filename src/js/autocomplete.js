import {
  enQueue,
  throttle,
  isUrl,
  openCenteredWindow,
  parseHTML,
} from "./common";

const cssClasses = {
  result: "ac-suggestion",
  item: "ac-itm",
};

/**
 * Generic Autocompletion class for enrichment of textboxes
 */
export class AutoComplete extends EventTarget {
  constructor(parent, textInput, settings) {
    super();
    this.settings = {
      emptyResultsText: "",
      ...settings,
    };
    this.container = parent;
    this.input = textInput;
    this.input.setAttribute("autocomplete", "off");
    this.categories = settings.categories || {};
    this.caches = new Map();

    enQueue(this.attach.bind(this));
  }

  /**
   * Connector logic to call on @focus events.
   * Lit example:
   * <input type="search" @focus=${(e) => {AutoComplete.connect(e, this.autoComplete); }} />
   *
   * @param {*} event focus event
   * @param {*} options AutoComplete options
   */
  static connect(event, options) {
    const input = event.target;
    if (!input._autoComplete) {
      if (!options?.categories) throw Error("Missing autocomplete settings");
      input._autoComplete = new AutoComplete(input.parentNode, input, options);

      if (event.type === "focus") {
        setTimeout(() => {
          input._autoComplete.focusHandler(event);
        }, 100);
      }
    }
    return input._autoComplete;
  }

  on(a, b) {
    this.input.addEventListener(a, b);
    return this;
  }

  attach() {
    this.resultsDiv = document.createElement("div");
    this.resultsDiv.title = ""; // block
    this.resultsDiv.classList.add(cssClasses.result);
    this.resultsDiv.style.width = this.container.offsetWidth;
    this.resultsDiv.addEventListener("mousedown", this.resultClick.bind(this));
    this.container.classList.add("ac-container");
    this.input.classList.add("ac-input");
    const inputStyle = getComputedStyle(this.input);
    this.container.style.setProperty(
      "--ac-bg-default",
      inputStyle.backgroundColor
    );
    this.container.style.setProperty("--ac-color-default", inputStyle.color);
    const acc = getComputedStyle(this.input).accentColor;
    if (acc !== "auto")
      this.container.style.setProperty("--ac-accent-color", acc);

    (this.container?.shadowRoot ?? this.container).appendChild(this.resultsDiv);

    this.controller().clear("attach");

    this.on(
      "input",
      throttle(
        this.inputHandler.bind(this),
        this.settings.throttleInputMs ?? 300
      )
    )
      .on("focus", this.focusHandler.bind(this))
      .on("focusout", this.blurHandler.bind(this))
      .on("keyup", this.keyUpHandler.bind(this))
      .on("keydown", this.keyDownHandler.bind(this));
  }

  controller() {
    let c = this.internalController();

    if (typeof this.settings.controller === "function")
      c = this.settings.controller(this) ?? c;

    return c;
  }

  internalController() {
    return {
      show: this.show.bind(this),
      hide: this.hide.bind(this),
      clear: this.clear.bind(this),
      empty: () => {},
    };
  }

  moveResult(add) {
    this.controller().show();
    let length = this.acItems.length;
    this.rowIndex = this.rowIndex + add;

    if (this.rowIndex <= 0) {
      this.rowIndex = 0;
    } else if (this.rowIndex > length - 1) {
      this.rowIndex = 0;
    }
    for (const r of this.acItems) {
      r.classList.remove("selected");
    }

    let div = this.getSelectedDiv();
    if (div) {
      div.classList.add("selected");
      div.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    } else {
      this.focusHandler({
        target: this.input,
      });
    }
  }

  getSelectedDiv() {
    return this.resultsDiv.querySelector(`div:nth-child(${this.rowIndex + 1})`);
  }

  // execute action
  selectResult(div) {
    div = div || this.getSelectedDiv();

    if (div) {
      let index = parseInt(div.getAttribute("data-index"));
      this.resultClicked = true;
      let result = this.results[index];

      let handlingCategory = this.categories[result.category] ?? {};
      handlingCategory.action =
        handlingCategory.action ?? this.setText.bind(this);

      if (handlingCategory.newTab) {
        this.tabWindow = openCenteredWindow("about:blank");
      }

      let options = {
        ...result,
        search: this.input.value,
      };

      div.classList.add("ac-active");

      setTimeout(() => {
        this.controller().hide("result-selected");

        if (options.action) {
          options.action(options);
        } else {
          handlingCategory.action(options);
          if (handlingCategory.newTab) {
            if (options.url) {
              this.tabWindow.location.href = options.url;
            } else {
              this.tabWindow.close();
            }
          }
        }
        var event = new Event("change", { bubbles: true });
        this.input.dispatchEvent(event);

        this.controller().clear("result-selected");

        const ev = new Event("result-selected");
        ev.detail = options;
        this.input.dispatchEvent(ev);
      }, 0);
    }
  }

  setText(options) {
    if (this.container.autoCompleteInput) {
      //this.control.autoCompleteInput.value = options.text;
    } else {
      this.container.value = options.text;
    }
    this.controller().hide("settext");
  }

  resultClick(event) {
    this.selectResult(event.target.closest(`.${cssClasses.item}`));
  }

  blurHandler() {
    setTimeout(() => {
      if (!this.resultClicked) this.controller().clear("blurred");

      this.resultClicked = false;
    }, 100);
  }

  clear() {
    if (this.settings.debug) return;

    if (!this.resultsDiv) return;
    this.resultsDiv.innerHTML = "";
    this.controller().hide("clear");

    if (this.cacheTmr) clearTimeout(this.cacheTmr);

    this.cacheTmr = setTimeout(() => {
      this.caches.clear();
    }, 60 * 1000 * 5); // 5 minutes
  }

  show() {
    // check dropDown/dropUp

    if (!this.resultsDiv.classList.contains("ac-active")) {
      const viewBounds = this.getViewBounds();

      this.resultsDiv.style.position = "absolute";
      this.resultsDiv.style.width = `${viewBounds.rect.width}px`;

      this.settings.direction = this.settings.direction ?? viewBounds.suggestedDirection;
      this.resultsDiv.setAttribute("data-direction", this.settings.direction);

      if (this.settings.direction === "up") {
        this.resultsDiv.style.top = "unset";
        this.resultsDiv.style.bottom = `${viewBounds.rect.height + 20}px`;
        this.rowIndex = this.acItems.length;
      } else {
        this.resultsDiv.style.bottom = "unset";
        this.resultsDiv.style.top = `${viewBounds.rect.height}px`;
        this.rowIndex = -1;
      }
      this.resultsDiv.style.maxWidth = "unset";
      this.resultsDiv.classList.toggle("ac-active", true);
    }
  }

  getViewBounds() {
    const rect = this.input.getBoundingClientRect();

    return {
      rect,
      suggestedDirection:
        rect.top + rect.height + 500 > window.innerHeight ? "up" : "down",
    };
  }

  hide() {
    this.resultsDiv.classList.toggle("ac-active", false);
  }

  empty() {
    this.resultsDiv.innerHTML = `<div class="ac-empty">${this.settings.emptyResultsText}</div>`;
    this.controller().show();
  }

  inputHandler(e) {
    if (this.cacheTmr) clearTimeout(this.cacheTmr);

    let options = {
      search: e.target.value,
      categories: this.categories,
    };

    this.container.classList.add("search-running");

    this.getItems(options, e).then((r) => {
      this.controller().clear("new-results");
      this.resultsHandler(r, options);
      this.container.classList.remove("search-running");
    });
  }

  keyDownHandler(e) {
    switch (e.key) {
      case "Enter":
        e.stopPropagation();
        e.preventDefault();
        break;
      case "ArrowDown":
        enQueue(this.moveResult(1));
        break;
      case "ArrowUp":
        enQueue(this.moveResult(-1));
        break;
    }
  }

  keyUpHandler(e) {
    switch (e.key) {
      case "Escape":
        this.controller().hide("escape");
        break;
      case "Enter":
        if (this.getSelectedDiv()) {
          this.container.preventEnter = true;
          e.stopPropagation();
          e.preventDefault();
          this.selectResult();
          setTimeout(() => {
            this.container.preventEnter = false;
          }, 10);
        }

        break;
      default:
        //this.toggle();
        break;
    }
  }

  focusHandler(e) {
    this.controller().clear("focus");
    let value = e.target.value;
    this.suggest(value, e);
  }

  /**
   * Shows suggestion box
   * @param {string} value - String to suggest results for
   */
  suggest(value, e) {
    this.input.focus();

    const options = {
      suggest: true,
      search: value || "",
      categories: this.categories,
    };
    this.getItems(options, e).then((r) => {
      this.input.dispatchEvent(
        new CustomEvent("show-results", {
          detail: {
            results: r,
          },
        })
      );

      this.resultsHandler(r, options);
    });
  }

  // Sort results based on static (integer) or dynamic (function) sortIndex in category.
  sort(r, options) {
    return r.sort((a, b) => {
      const aCat = options.categories[a.category];
      const bCat = options.categories[b.category];
      const aIndex =
        typeof aCat.sortIndex === "function"
          ? aCat.sortIndex(options)
          : aCat.sortIndex ?? 0;
      const bIndex =
        typeof bCat.sortIndex === "function"
          ? bCat.sortIndex(options)
          : bCat.sortIndex ?? 0;
      return bIndex > aIndex ? 1 : -1;
    });
  }

  resultsHandler(r, options) {
    this.results = r;
    this.rowIndex = -1;
    let index = 0;

    const singleItemTemplate = (catHandler, i) => {
      return /*html*/ `
      <div title="${i.tooltip || ""}" data-index="${index}" class="${`${
        cssClasses.item
      } cat-${i.category} ${i.class ?? ""}`.trim()}">
        ${this.handleImageOrIcon(i)}
        <span class="text">${this.formatResultItem(
          i,
          options,
          catHandler
        )}</span>
        ${
          !this.settings.hideCategory
            ? `<span class="category">${i.category || ""}</span>`
            : ""
        }
      </div>`;
    };

    r.forEach((i) => {
      let catHandler = options.categories[i.category] || {};
      if (i.element) {
        this.resultsDiv.appendChild(i.element);
      } else {
        i = typeof i === "string" ? { text: i } : i;
        this.resultsDiv.appendChild(
          parseHTML(singleItemTemplate(catHandler, i))[0]
        );
      }

      index++;
    });
    if (r.length) {
      this.acItems = this.resultsDiv.querySelectorAll(".ac-itm");
      this.controller().show();
    } else if (options.search.length) this.controller().empty();
  }

  handleImageOrIcon(i) {
    if (i.image) {
      return /*html*/ `<img src="${i.image}"/>`;
    }

    if(typeof(this.settings.iconHandler) === "function") 
      return this.settings.iconHandler(i);

    return /*html*/ `<svg-icon icon="${i.icon}"></svg-icon>`;
  }

  formatResultItem(item, options, catHandler) {
    const i = typeof item === "string" ? { text: item } : item;
    let result = i.text;

    if (options.search) {
      result = result.replace("%search%", options.search);
      i.description = i.description?.replace("%search%", options.search);
    }

    result = this.highlight(result, options.search);

    if (i.description) {
      result = `<div>${result}</div><small>${i.description}</small>`;
    }

    if (catHandler.format) {
      result = catHandler.format({
        item: i,
        result: result,
        options: options,
      });
    }
    return result;
  }

  highlight(str, find) {
    var reg = new RegExp("(" + find + ")", "gi");
    return str.replace(reg, '<span class="txt-hl">$1</span>');
  }

  async getItems(options, e) {
    if (this.aborter) {
      this.aborter.abort();
    }

    let cache = this.caches.get(options.search);
    if (cache) return cache;

    const prop = this.settings.map;

    const normalizeItem = (i) => {
      if (typeof i === "string") i = { text: i };

      return i;
    };

    const map = (list) => {
      if (!prop) {
        return list.map((i) => {
          return normalizeItem(i);
        });
      }
      return list.map((i) => {
        return { text: i[prop] };
      });
    };

    const max = (list) => {
      if (this.settings.max && this.settings.max > 0) {
        list.length = this.settings.max;
      }
      return list;
    };

    // Create a new AbortController instance
    this.aborter = new AbortController();
    this.aborterSignal = this.aborter.signal;

    return new Promise((resolve) => {
      const internalResolve = (data) => {
        data = this.sort(data, options);

        if (this.settings.cache !== false)
          this.caches.set(options.search, data);

        resolve(data);
      };

      if (isUrl(this.items)) {
        if (this.settings.minlength > 0) {
          if (
            !options.search ||
            options.search.length < this.settings.minlength
          ) {
            internalResolve([]);
            return;
          }
        }
        let url = this.formatSearch(this.items, options);
        fetch(url).then((x) => {
          if (x.status === 200) {
            x.json().then((items) => {
              items = map(items);

              internalResolve(
                max(
                  items.filter((i) => {
                    return this.isMatch(options, i);
                  })
                )
              );
            });
            return;
          }
          throw Error(`HTTP error ${x.status} - ${url}`);
        });
      } else if (Array.isArray(this.items)) {
        let simple = true;

        this.items = this.items.map((i) => {
          if (typeof i === "string") {
            return { text: i };
          }
          simple = false;
          return i;
        });
        if (simple) {
          this.container.classList.add("simple");
        }
        internalResolve(max(map(this.items)));
      } else if (typeof this.items === "function") {
        options.control = this.container;
        let ar = Promise.resolve(this.items(options, e));
        ar.then((ar) => {
          ar = ar.map((i) => {
            return normalizeItem(i);
          });

          ar = map(ar);

          internalResolve(ar);
        });
      } else {
        return internalResolve(
          Promise.resolve(this.items.apply(this, options))
        );
      }
    });
  }

  async items(options) {
    let arr = [];
    options.results = [];
    options.signal = this.aborterSignal;

    for (var c in options.categories) {
      let catHandler = options.categories[c];
      catHandler.trigger =
        catHandler.trigger ??
        (() => {
          return true;
        });
      options.results = arr;

      if (catHandler.trigger(options)) {
        let catResults = [];
        try {
          catResults = await catHandler.getItems(options);
        } catch (ex) {
          console.warn(`Error loading items for omniBox category '${c}'.`, ex);
        }

        arr = arr.concat(
          catResults.map((i) => {
            i.category = c;
            return i;
          })
        );
      }
    }

    return arr;
  }

  formatSearch(url, options) {
    if (url.indexOf("%search%")) {
      return url.replace("%search%", options.search || "");
    }

    return url + "?" + this.createQueryParam(options);
  }

  createQueryParam(options) {
    let suggest = options.suggest ? "&suggest=true" : "";
    return `q=${options.text}${suggest}`;
  }

  isMatch(options, i) {
    if (i.text?.indexOf("%search%") >= 0) return true;

    return options.search
      ? i.text?.toLowerCase().indexOf(options.search.toLowerCase()) >= 0
      : options.suggest;
  }

  static textFilter(options, propertyName) {
    return function (i) {
      if (!options.search) return true;

      if (i.hidden) return false;

      const prop = propertyName ? i[propertyName] : i;
      const isMatch = prop.match(new RegExp(options.search, "gi"));

      if (isMatch) return isMatch;

      if (i.config?.tags) {
        return i.config.tags.some((tag) => {
          return tag.match(new RegExp(options.search, "gi"));
        });
      }
    };
  }
}
