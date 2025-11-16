/**
 * The code for signals is adapted from:
 * https://github.com/WebReflection/dom-cue
 */
let computing = null;

class Signal extends Set {
  #value;

  static set(signal, value) {
    signal.#value = value;
  }

  constructor(value) {
    super();
    this.#value = value;
  }

  get value() {
    if (computing) {
      this.add(computing.add(this));
    }
    return this.#value;
  }

  set value(value) {
    if (!Object.is(this.#value, value)) {
      this.#value = value;
      for (const computed of cleared(this)) {
        ComputedSignal.update(computed);
      }
    }
  }

  peek() {
    return this.#value;
  }

  toString() {
    return String(this.value);
  }

  valueOf() {
    return this.value;
  }
}

export function signal(value) {
  return new Signal(value);
}

class ComputedSignal extends Signal {
  #compute = true;
  #subscribe;
  #valueFn;

  static update(computed) {
    computed.#compute = true;
    computed.#subscribe || computed.#run();
  }

  constructor(valueFn, isEffect = false) {
    super(undefined);
    this.#valueFn = valueFn;
    this.#subscribe = !isEffect;
  }

  get value() {
    this.#run();

    if (this.#subscribe && computing) {
      for (const signal of cleared(this)) {
        signal.add(computing.add(signal));
      }
    }

    return super.peek();
  }

  peek() {
    this.#run();
    return super.peek();
  }

  #run() {
    if (this.#compute) {
      const previously = computing;
      computing = this;
      this.#compute = false;
      this.clear();
      try {
        Signal.set(this, this.#valueFn());
      } finally {
        computing = previously;
      }
    }
  }
}

export function computed(value) {
  return new ComputedSignal(value);
}

export function effect(callback) {
  new ComputedSignal(callback, true).value;
}

function cleared(self) {
  const computed = [...self];
  self.clear();
  return computed;
}

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

  // HTML content is added first because it's needed for some elements like select/options
  if (attrs.innerHTML) {
    apply(attrs.innerHTML, (value) => el.innerHTML = value);
    delete attrs.innerHTML;
  }
  if (attrs.html) {
    addChildren(el, attrs.html);
    delete attrs.html;
  }
  if (attrs.children) {
    addChildren(el, attrs.children);
    delete attrs.children;
  }

  for (const [key, value] of Object.entries(attrs ?? {})) {
    // Value special case
    if (key === "value") {
      apply(value, (v) => el.value = v ?? null);
      continue;
    }

    // Properties
    if (key.startsWith(".")) {
      apply(value, (v) => el[key.slice(1)] = v);
      continue;
    }

    if (value === undefined) {
      continue;
    }

    // Class names
    if (key === "class" || key === "className") {
      apply(value, (v) => {
        const classes = Array.isArray(v) ? v : [v];
        for (const name of classes) {
          if (!name) continue;
          if (typeof name === "string") {
            el.classList.add(...name.split(" "));
            continue;
          }
          if (typeof name === "object") {
            // If it's an object, assume it's a map of class names to boolean
            for (const [n, v] of Object.entries(name)) {
              if (v) el.classList.add(...n.split(" "));
            }
          }
        }
      });
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
      apply(value, (v) => {
        for (const [name, vv] of Object.entries(v)) {
          apply(vv, (vvv) => el.dataset[name] = vvv);
        }
      });
      continue;
    }

    // style attribute
    if (key === "style") {
      apply(value, (v) => {
        if (typeof v === "string") {
          el.style = v;
          return;
        }

        for (const [name, v] of Object.entries(value)) {
          if (name.startsWith("--")) {
            apply(v, (vv) => el.style.setProperty(name, vv));
            continue;
          }

          apply(v, (vv) => el.style[name] = vv);
        }
      });
      continue;
    }

    // Custom properties
    if (key.startsWith("--")) {
      apply(value, (v) => el.style.setProperty(key, v));
      continue;
    }

    // Text content
    if (key === "text") {
      apply(value, (v) => el.textContent = v);
      continue;
    }

    // If it's a property
    if (!isSvg && key in el) {
      apply(value, (v) => el[key] = v);
      continue;
    }

    apply(value, (v) => el.setAttribute(key, v));
  }

  if (parent) parent.append(el);
  return el;
}

function apply(value, callback) {
  if (value instanceof Signal) {
    return effect(() => apply(value.value, callback));
  }
  callback(value);
}

function addChildren(el, value) {
  const children = Array.isArray(value) ? value : [value];

  for (const child of children) {
    if (child === null || child === undefined) {
      continue;
    }

    if (child instanceof Signal) {
      const c = document.createComment("");
      el.append(c);
      const nodes = getNodes(child.value);
      c.nodes = nodes;
      c.after(...nodes);

      effect(() => {
        // Remove previous nodes and add new ones
        for (const n of c.nodes) {
          n.remove();
        }
        const newNodes = getNodes(child.value);
        c.nodes = newNodes;
        c.after(...newNodes);
      });

      continue;
    }

    el.append(...getNodes(child));
  }
}

function getNodes(child) {
  if (typeof child === "string" || typeof child === "number") {
    return Array.from(
      parser.parseFromString(child, "text/html").body
        .childNodes,
    );
  }
  return [child];
}

export default dom;
