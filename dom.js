const parser = new DOMParser();

const svgElements = new Set([
  "animate",
  "animateMotion",
  "animateTransform",
  "circle",
  "clipPath",
  "defs",
  "desc",
  "discard",
  "ellipse",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feDropShadow",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence",
  "filter",
  "foreignObject",
  "g",
  "image",
  "line",
  "linearGradient",
  "marker",
  "mask",
  "metadata",
  "mpath",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialGradient",
  "rect",
  "set",
  "stop",
  "svg",
  "switch",
  "symbol",
  "text",
  "textPath",
  "tspan",
  "use",
  "view",
]);

/** Create a new DOM element */
export function dom(tag, attrs, parent) {
  const isSvg = svgElements.has(tag);
  const el = isSvg
    ? document.createElementNS("http://www.w3.org/2000/svg", tag)
    : typeof tag === "string"
    ? document.createElement(tag)
    : tag;

  if (typeof attrs === "string" || Array.isArray(attrs)) {
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

    if (value === undefined) {
      continue;
    }

    // Class names
    if (key === "class" || key === "className") {
      const classes = Array.isArray(value) ? value : [value];
      for (const name of classes) {
        if (!name) continue;
        if (typeof name === "string") {
          el.classList.add(...name.split(" "));
          continue;
        }
        if (typeof name === "object") {
          // If it's an object, we assume it's a map of class names
          // to boolean values
          for (const [n, v] of Object.entries(name)) {
            if (v) el.classList.add(...n.split(" "));
          }
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
      if (typeof value === "string") {
        el.setAttribute(key, value);
        continue;
      }
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
    if (key === "html" || key === "children") {
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
          el.append(
            ...parser.parseFromString(child, "text/html").body
              .childNodes,
          );
        } else {
          el.append(child);
        }
      }

      continue;
    }

    // If it's a property
    if (!isSvg && key in el) {
      el[key] = value;
      continue;
    }

    el.setAttribute(key, value);
  }

  if (parent) parent.append(el);

  return el;
}

export default dom;
