# DOM

Micro frontend library to create DOM elements easily.

- ESM and native DOM API
- Less than 4KB
- Include Signals for reactive code
- Can be used as a JSX library

## Installation

This library is just a single file that you can copy to your repo or load it
from jsdelivr using an import map:

```json
{
  "imports": {
    "dom.js": "https://cdn.jsdelivr.net/gh/oscarotero/dom/dom.js"
  }
}
```

## Usage

```js
import { dom } from "dom.js";

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

## Reactive code

The library includes a minimalistic implementation of Signals:

- `signal(value)`: Create a signal value
- `computed(callback)`: Create a computed value
- `effect(callback)`: Run code when any signal or computed value changes

Example of the previous code using a reactive approach:

```js
import { dom, signal } from "dom.js";

const app = dom("div", document.body);
const value = signal(0); // Create the signal

app.append(
  dom("button", {
    text: "-1",
    onclick: () => --value.value,
  }),
  dom("input", { type: "number", value }),
  dom("button", {
    text: "+1",
    onclick: () => ++value.value,
  }),
);
```

Signals can be used for any attribute, property or content:

```js
import { computed, dom, signal } from "./dom.js";

const app = dom("div", document.body);

// Create the signal
const value = signal(0.5);

// Create a computed signal
const color = computed(() => `rgba(0, 0, 0, ${value})`);

app.append(
  dom("p", {
    style: {
      "font-size": "2em",
      "color": color, // Signals can be used as attributes and properties
    },
    html: [
      "The opacity value is: ",
      value, // Signals can be used as the content, mixed with static values
    ],
  }),
  dom("label", "Change color:"),
  dom("input", {
    type: "range",
    step: 0.1,
    min: 0,
    max: 1,
    value, // Signal used as value
    oninput: (e) => value.value = e.target.value, // Update the signal on input
  }),
);
```

## JSX

The `jsx-runtime.js` file allows to use DOM as a JSX library. This is an example
using Deno:

```json
{
  "imports": {
    "dom": "./dom/dom.js",
    "dom/jsx-runtime": "./dom/jsx-runtime.js"
  },
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "dom"
  }
}
```

Create an HTML file that imports the main JSX code:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <script type="module" src="./main.jsx"></script>
  </head>
  <body></body>
</html>
```

Add the following code to the main.jsx file:

```jsx
import { signal } from "dom";

function App() {
  const counter = signal(10);

  // Create an Input component
  const Input = () => (
    <input
      value={counter}
      oninput={(ev) => counter.value = ev.target.value}
    />
  );

  // The component returns a real HTML element that you can modify
  const input = <Input />;
  input.classList.add("mola");

  return (
    <>
      {input}
      <button type="button" onclick={() => counter.value++}>Increment</button>
      <button type="button" onclick={() => counter.value--}>Decrement</button>
    </>
  );
}

// Add the app to the body
document.body.appendChild(<App />);
```

Run the `bundle` command of Deno to compile the code and watch changes:

```
deno bundle index.html --watch --outdir=out
```
