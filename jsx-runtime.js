import { dom } from "./dom.js";

export function jsx(type, props) {
  if (typeof type === "function") {
    return type(props);
  }

  const html = props?.dangerouslySetInnerHTML;

  if (html) {
    props.innerHTML = html.__html;
    delete props.dangerouslySetInnerHTML;
  }
  return dom(type, props);
}

export { jsx as jsxs };

export function Fragment(props) {
  return dom(document.createDocumentFragment(), props);
}
