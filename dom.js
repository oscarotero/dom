const props = ["value"];

/** Create a new DOM element */
export function dom(tag, attrs, parent) {
  const el = document.createElement(tag);

  if (typeof attrs === "string") {
    attrs = { html: attrs };
  } else if (attrs instanceof Node) {
    parent = attrs;
    attrs = {};
  }

  for (const [k, v] of Object.entries(attrs ?? {})) {
    // Properties (or some special attributes)
    if (k.startsWith(".") || props.includes(k)) {
      el[k.slice(1)] = v;
      continue;
    }

    // Event listeners
    if (k.startsWith("on")) {
      el.addEventListener(k.slice(2), v);
      continue;
    }

    // data-* attributes
    if (k === "data") {
      for (const [name, value] of Object.entries(v)) {
        el.dataset[name] = value;
      }
      continue;
    }

    // style attribute
    if (k === "style") {
      if (typeof v === "string") {
        el.setAttribute("style", v);
        continue;
      }

      for (const [name, value] of Object.entries(v)) {
        if (name.startsWith("--")) {
          el.style.setProperty(name, value);
        } else {
          el.style[name] = value;
        }
      }
      continue;
    }

    // Custom properties
    if (k.startsWith("--")) {
      el.style.setProperty(k, v);
      continue;
    }

    // Text content
    if (k === "text") {
      el.textContent = v;
      continue;
    }

    // HTML content
    if (k === "html") {
      if (typeof v === "string") {
        el.innerHTML = v;
        continue;
      }

      const children = Array.isArray(v) ? v : [v];

      for (const child of children) {
        if (child === null || child === undefined) {
          continue;
        }

        if (typeof child === "string" || typeof child === "number") {
          if (child.includes("<") && child.includes(">")) {
            el.append(
              ...new DOMParser().parseFromString(child, "text/html").body
                .childNodes,
            );
            continue;
          }
          el.append(document.createTextNode(child));
        } else {
          el.append(child);
        }
      }

      continue;
    }

    if (v !== undefined) el.setAttribute(k, v);
  }

  if (parent) parent.append(el);

  return el;
}

export default dom;
