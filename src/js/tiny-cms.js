// generate Map with index being full slug to each object.
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
  constructor(cmsData) {
    if (!cmsData) throw Error("No CMS data passed");

    this.data = createIndex(cmsData);
  }

  getPage(fullSlug) {
    const node = this.data.get(fullSlug);
    if (node)
      return {
        ...node,
        childPages: Object.values(node.children ?? {})
      };
  }
}
