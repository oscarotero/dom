# DOM

Micro frontend library to create DOM elements easily.

- ESM and native DOM API
- Less than 1K (minified)

```js
import dom from "./dom.js";

// Create an element
const button = dom("button");

// Element with content
const button = dom("button", "Click me");

// With attributes and text content
const button = dom("button", {
  class: "my-button",
  text: "Click me",
});

// With attributes and HTML content
const button = dom("button", {
  class: "my-button",
  html: "<strong>Click me</strong>",
});

// With attributes and DOM children
const button = dom("button", {
  class: "my-button",
  html: dom("strong", "Click me!"),
});

// Array of children
const button = dom("button", {
  type: "button",
  html: ["Click", dom("strong", "me!")],
});

// Add event listeners
const button = dom("button", {
  class: "my-button",
  text: "Click me",
  onclick() {
    alert("You clicked me!");
  },
});

// Properties start with underscore
const button = dom("button", {
  _className: "my-button",
  text: "Click me",
});

// data-* attributes
const button = dom("button", {
  text: "Click me",
  data: {
    foo: "bar",
  },
});

// CSS style can be a string...
const button = dom("button", {
  text: "Click me",
  style: "--color: red, color: var(--red)",
});

// ...or an object
const button = dom("button", {
  text: "Click me",
  style: {
    "--color": "red",
    color: "var(--color)",
  },
});

// CSS custom properties starts with "--"
const button = dom("button", {
  text: "Click me",
  "--color": "red",
});

// Append the element to body
dom("button", "Click me", document.body);

// Append empty elements
dom("div", document.body);
```

## Basic example:

```js
const app = dom("div", document.body);
const input = dom("input", { type: "number" });

app.append(
  input,
  dom("button", {
    text: "+1",
    onclick: () => ++input.value,
  }),
  dom("button", {
    text: "-1",
    onclick: () => --input.value,
  }),
);
```
