const parser = new DOMParser();

/** Create a new DOM element */
export function dom(tag, attrs, parent) {
  const el = document.createElement(tag);

  if (typeof attrs === "string") {
    attrs = { html: attrs };
  } else if (attrs instanceof Node) {
    parent = attrs;
    attrs = {};
  }

  for (const [key, value] of Object.entries(attrs ?? {})) {
    // Value special case
    if (key === "value") {
      el[key] = value ?? null;
      continue;
    }

    // Class names
    if (key === "class" || key === "className") {
      const classes = Array.isArray(value) ? value : [value];
      for (const name of classes) {
        if (typeof name === "string") {
          el.classList.add(...name.split(" "));
          continue;
        }
        for (const [n, v] of Object.entries(name)) {
          if (v) el.classList.add(...n.split(" "));
        }
      }
      continue;
    }

    // Properties
    if (key.startsWith(".")) {
      el[key.slice(1)] = value;
      continue;
    }

    // Event listeners
    if (key.startsWith("on")) {
      el.addEventListener(key.slice(2), value);
      continue;
    }

    // data-* attributes
    if (key === "data") {
      for (const [name, v] of Object.entries(value)) {
        el.dataset[name] = v;
      }
      continue;
    }

    // style attribute
    if (key === "style") {
      if (typeof value === "string") {
        el.setAttribute("style", value);
        continue;
      }

      for (const [name, v] of Object.entries(value)) {
        if (name.startsWith("--")) {
          el.style.setProperty(name, v);
        } else {
          el.style[name] = v;
        }
      }
      continue;
    }

    // Custom properties
    if (key.startsWith("--")) {
      el.style.setProperty(key, value);
      continue;
    }

    // Text content
    if (key === "text") {
      el.textContent = value;
      continue;
    }

    // HTML content
    if (key === "html") {
      if (typeof value === "string") {
        el.innerHTML = value;
        continue;
      }

      const children = Array.isArray(value) ? value : [value];

      for (const child of children) {
        if (child === null || child === undefined) {
          continue;
        }

        if (typeof child === "string" || typeof child === "number") {
          if (child.includes("<") && child.includes(">")) {
            el.append(
              ...parser.parseFromString(child, "text/html").body
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

    if (value !== undefined) {
      // If it's a property
      if (key in el) {
        el[key] = value;
        continue;
      }

      el.setAttribute(key, value);
    }
  }

  if (parent) parent.append(el);

  return el;
}

export default dom;
