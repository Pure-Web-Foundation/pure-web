import { cmsData } from "./tiny-cms.data";

const createIndex = (root) => {
  const index = new Map();
  const recurse = (o, basePath = "") => {
    for (const [key, node] of Object.entries(o)) {
      const path = basePath + key;

      if (node && typeof node === "object") {
        node.fullSlug = path;
        index.set(path, node);
        if (node.children && typeof node.children === "object") {
          recurse(node.children, path);
        }
      }
    }
  };

  recurse(root);

  return index;
};

export class TinyCMS {
  constructor() {
    this.data = createIndex(cmsData);
  }

  getPage(fullSlug) {
    const node = this.data.get(fullSlug);
    if (node)
      return {
        ...node,
        childPages: Object.values(node.children ?? {}),
      };
  }
}
