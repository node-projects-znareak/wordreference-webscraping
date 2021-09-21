const selector = (node, select) => node?.querySelector(select);
const selectorAll = (node, select) => node?.querySelectorAll(select);
const remove = (node) => node?.remove();
const removeSelectorNode = (parent, select) => remove(selector(parent, select));
const removeSelectorNodes = (parent, ...selects) => {
  for (const select of selects) {
    removeSelectorNode(parent, select);
  }
};
const text = (node) => node?.textContent;

module.exports = {
  selector,
  selectorAll,
  removeSelectorNode,
  removeSelectorNodes,
  remove,
  text,
};
