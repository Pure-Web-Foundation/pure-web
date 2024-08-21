import {
  enQueue,
  throttle,
  isUrl,
  openCenteredWindow,
  parseHTML,
} from "./common";
/**
 * Generic Autocompletion class for enrichment of textboxes
 */
export class AutoComplete {
  cssClasses = {
    result: "ac-suggestion",
    item: "ac-itm",
  };

  constructor(parent, textInput, settings) {
    this.settings = {
      emptyResultsText: "No results",
      ...settings,
    };
    this.container = parent;
    this.input = textInput;
    this.input.setAttribute("autocomplete", "off");
    this.categories = settings.categories || {};

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
  }

  on(a, b) {
    this.input.addEventListener(a, b);
    return this;
  }

  attach() {
    this.resultsDiv = document.createElement("div");
    this.resultsDiv.title = ""; // block
    this.resultsDiv.classList.add(this.cssClasses.result);
    this.resultsDiv.style.width = this.container.offsetWidth;
    this.resultsDiv.addEventListener("mousedown", this.resultClick.bind(this));
    this.container.classList.add("ac-container");
    this.input.classList.add("ac-input");

    (this.container?.shadowRoot ?? this.container).appendChild(this.resultsDiv);

    this.clear();

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
      empty: () => {},
    };
  }

  moveResult(add) {
    this.controller().show();
    let length = this.acItems.length;
    this.rowIndex = this.rowIndex + add;

    if (this.rowIndex < 0) {
      this.rowIndex = length - 1;
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

      div.classList.add("active");

      setTimeout(() => {
        this.controller().hide();

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

        this.clear();

        const ev = new Event("result-selected");
        ev.detail = options;
        this.input.dispatchEvent(ev);
      }, 0);
    }
  }

  setText(options) {
    this.input.value = options.text;
    this.controller().hide();
  }

  resultClick(event) {
    this.selectResult(event.target.closest(`.${this.cssClasses.item}`));
  }

  blurHandler() {
    setTimeout(() => {
      if (!this.resultClicked) this.clear();

      this.resultClicked = false;
    }, 100);
  }

  clear() {
    if (this.settings.debug) return;

    if (!this.resultsDiv) return;
    this.resultsDiv.innerHTML = "";
    this.controller().hide();
  }

  show() {
    const rect = this.input.getBoundingClientRect();

    // check dropDown/dropUp
    this.settings.direction =
      rect.top + rect.height + 300 > window.innerHeight ? "up" : "down";

    this.container.setAttribute("data-direction", this.settings.direction);

    if (!this.container.classList.contains("ac-active")) {
      this.resultsDiv.style.width = `${rect.width}px`;
      this.acItems = this.resultsDiv.querySelectorAll(".ac-itm");

      if (this.settings.direction === "up") {
        this.resultsDiv.style.top = "unset";
        this.resultsDiv.style.bottom = `${rect.height}px`;
        this.rowIndex = this.acItems.length;
      } else {
        this.resultsDiv.style.bottom = "unset";
        this.resultsDiv.style.top = `${rect.height}px`;
        this.rowIndex = -1;
      }
      this.resultsDiv.style.maxWidth = "unset";
      this.container.classList.toggle("ac-active", true);
    }
  }

  hide() {
    this.container.classList.toggle("ac-active", false);
  }

  empty() {
    this.resultsDiv.innerHTML = `<div class="ac-empty">${this.settings.emptyResultsText}</div>`;
    this.controller().show();
  }

  inputHandler(e) {
    this.clear();

    let options = {
      search: e.target.value,
      categories: this.categories,
    };

    this.container.classList.add("search-running");
    this.getItems(options, e).then((r) => {
      this.clear();
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
        this.hide();
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
    this.clear();
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

  resultsHandler(r, options) {
    this.results = r;
    this.rowIndex = -1;
    let index = 0;

    const singleItemTemplate = (catHandler, i) => {
      return /*html*/ `
      <div title="${i.tooltip || ""}" data-index="${index}" class="${`${
        this.cssClasses.item
      } cat-${i.category} ${i.class ?? ""}`.trim()}">
        ${this.handleImageOrIcon(i)}
        <span class="text">${this.formatResultItem(
          i,
          options,
          catHandler
        )}</span>
        <span class="category">${i.category || ""}</span>
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
      this.controller().show();
    } else if (options.search.length) this.controller().empty();
  }

  handleImageOrIcon(i) {
    if (i.image) {
      return /*html*/ `<img src="${i.image}"/>`;
    }
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

    //if (typeof result === "string")
    //     this.resultsDiv.appendChild(parseHTML(/*html*/ `${itemResult}`));
    //   //else if (itemResult) this.resultsDiv.appendChild(itemResult);

    return result;
  }

  highlight(str, find) {
    var reg = new RegExp("(" + find + ")", "gi");
    return str.replace(reg, '<span class="txt-hl">$1</span>');
  }

  async getItems(options, e) {
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

    return new Promise((resolve) => {
      if (isUrl(this.items)) {
        if (this.settings.minlength > 0) {
          if (
            !options.search ||
            options.search.length < this.settings.minlength
          ) {
            resolve([]);
            return;
          }
        }
        let url = this.formatSearch(this.items, options);
        fetch(url).then((x) => {
          if (x.status === 200) {
            x.json().then((items) => {
              items = map(items);

              resolve(
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
        resolve(max(map(this.items)));
      } else if (typeof this.items === "function") {
        options.control = this.container;
        let ar = Promise.resolve(this.items(options, e));
        ar.then((ar) => {
          ar = ar.map((i) => {
            return normalizeItem(i);
          });

          ar = map(ar);

          resolve(ar);
        });
      } else {
        return resolve(Promise.resolve(this.items.apply(this, options)));
      }
    });
  }

  async items(options) {
    let arr = [];
    options.results = [];

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
