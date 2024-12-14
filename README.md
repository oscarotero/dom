# DOM

Micro frontend library to create DOM elements easily.

- ESM and native DOM API
- Less than 1K (minified)

## Installation

This library is just a single file that you can copy to your repo or load it
from jsdelivr using an import map:

```json
{
  "imports": {
    "dom.js": "https://cdn.jsdelivr.net/gh/oscarotero/dom@v0.1.0/dom.js"
  }
}
```

```js
import dom from "dom.js";

// <button></button>
dom("button");

// <button>Click me</button>
dom("button", "Click me");

// <button type="button">Click me</button>
dom("button", {
  type: "button",
  text: "Click me",
});

// <button type="button"><strong>Click me</strong></button>
dom("button", {
  type: "button",
  html: "<strong>Click me</strong>",
});

// <button type="button"><strong>Click me</strong></button>
dom("button", {
  type: "button",
  html: dom("strong", "Click me!"),
});

// <button type="button">Click <strong>me</strong></button>
dom("button", {
  type: "button",
  html: ["Click", " ", dom("strong", "me!")],
});

// Add event listeners
dom("button", {
  type: "button",
  text: "Click me",
  onclick() {
    alert("You clicked me!");
  },
});

// Properties start with dot
dom("button", {
  ".className": "my-button",
  text: "Click me",
});

// <button data-foo="bar">Click me</button>
dom("button", {
  text: "Click me",
  data: {
    foo: "bar",
  },
});

// CSS style can be a string...
dom("button", {
  text: "Click me",
  style: "--color: red, color: var(--red)",
});

// ...or an object
dom("button", {
  text: "Click me",
  style: {
    "--color": "red",
    color: "var(--color)",
  },
});

// CSS custom properties starts with "--"
dom("button", {
  text: "Click me",
  "--color": "red",
});

// CSS classes can be a string...
dom("button", {
  text: "Click me",
  class: "my-button is-primary",
});

// ...array...
dom("button", {
  text: "Click me",
  class: ["my-button", "is-primary"],
});

// ...object...
dom("button", {
  text: "Click me",
  class: {
    "my-button": true,
    "is-primary": true,
  },
});

// ...and everything mixed
dom("button", {
  text: "Click me",
  class: [
    "my-button",
    { "is-primary": true },
  ],
});

// Append the element to body
dom("button", "Click me", document.body);

// This is the same as
document.body.append(dom("button", "Click me"));

// The content/attributes argument is optional
dom("div", document.body);
```

## Basic example:

```js
const app = dom("div", document.body);
const input = dom("input", { type: "number" });

app.append(
  dom("button", {
    text: "-1",
    onclick: () => --input.value,
  }),
  input,
  dom("button", {
    text: "+1",
    onclick: () => ++input.value,
  }),
);
```
