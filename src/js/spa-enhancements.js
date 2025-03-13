/**
 * Progressive enhancers registry
 */
export class PureSPAEnhancementRegistry {
  #list = new Map();

  add(selector, enhancementFn) {
    this.#list.set(selector, enhancementFn);
  }

  run(element) {
    requestAnimationFrame(() => {
      const length = this.#list.size;
      if (length === 0) return;
      for (const [selector, fn] of this.#list) {
        const enhance = (n, s, fn) => {
          if (n.hasAttribute("data-enhanced")) return;
          const result = fn(n);
          n.setAttribute("data-enhanced", result?.toString() ?? "");
        };
  
        if (element.matches(selector)) enhance(element, selector, fn);
  
        const nodes = [...element.querySelectorAll(selector)];
  
        for (const node of nodes) enhance(node, selector, fn);
      }
    });
    
  }
}
