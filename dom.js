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
}

export function computed(value) {
  return new ComputedSignal(value);
}

export function effect(callback) {
  new ComputedSignal(callback, true).value;
}

function isSignal(value) {
  return value instanceof Signal;
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

  for (const [key, value] of Object.entries(attrs ?? {})) {
    // Value special case
    if (key === "value") {
      setValue(el, "value", value ?? null);
      continue;
    }

    // Properties
    if (key.startsWith(".")) {
      setProperty(el, key.slice(1), value);
      continue;
    }

    if (value === undefined) {
      continue;
    }

    // Class names
    if (key === "class" || key === "className") {
      setClassNames(el, value);
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
      setDataAttribute(el, value);
      continue;
    }

    // style attribute
    if (key === "style") {
      setStyles(el, value);
      continue;
    }

    // Custom properties
    if (key.startsWith("--")) {
      setStyleProperty(el, key, value);
      continue;
    }

    // Text content
    if (key === "text") {
      setProperty(el, "textContent", value);
      continue;
    }

    // HTML content
    if (key === "html" || key === "children") {
      if (typeof value === "string") {
        setProperty(el, "innerHTML", value);
        continue;
      }

      setChildren(el, value);
      continue;
    }

    // If it's a property
    if (!isSvg && key in el) {
      setProperty(el, key, value);
      continue;
    }

    setAttribute(el, key, value);
  }

  if (parent) parent.append(el);
  return el;
}

function setValue(el, key, value) {
  if (isSignal(value)) {
    effect(() => setValue(el, key, value.value));
    el.addEventListener("input", () => value.value = el.value);
    return;
  }
  el.value = value;
}

function setProperty(el, key, value) {
  if (isSignal(value)) {
    return effect(() => setProperty(el, key, value.value));
  }
  el[key] = value;
}

function setSubProperty(el, key, subkey, value) {
  if (isSignal(value)) {
    return effect(() => setSubProperty(el, key, subkey, value.value));
  }
  el[key][subkey] = value;
}

function setAttribute(el, key, value) {
  if (isSignal(value)) {
    return effect(() => setAttribute(el, key, value.value));
  }
  el.setAttribute(key, value);
}

function setDataAttribute(el, value) {
  if (isSignal(value)) {
    return effect(() => setDataAttribute(el, value.value));
  }
  for (const [name, v] of Object.entries(value)) {
    setSubProperty(el, "dataset", name, v);
  }
}

function setStyles(el, value) {
  if (isSignal(value)) {
    return effect(() => setStyles(el, value.value));
  }

  if (typeof value === "string") {
    return setAttribute(el, "style", value);
  }

  for (const [name, v] of Object.entries(value)) {
    if (name.startsWith("--")) {
      setStyleProperty(el, name, v);
      continue;
    }
    setSubProperty(el, "style", name, v);
  }
}

function setStyleProperty(el, key, value) {
  if (isSignal(value)) {
    return effect(() => setStyleProperty(el, key, value.value));
  }
  el.style.setProperty(key, value);
}

function setClassNames(el, value) {
  if (isSignal(value)) {
    return effect(() => setClassNames(el, value.value));
  }
  const classes = Array.isArray(value) ? value : [value];
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
}

function setChildren(el, value) {
  const children = Array.isArray(value) ? value : [value];

  for (const child of children) {
    if (child === null || child === undefined) {
      continue;
    }

    if (isSignal(child)) {
      const c = document.createComment("signal");
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
