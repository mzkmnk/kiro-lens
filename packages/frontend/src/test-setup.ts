// Mock DOM APIs for jsdom
Object.defineProperty(window, "CSS", { value: null });
Object.defineProperty(window, "getComputedStyle", {
  value: () => {
    return {
      display: "none",
      appearance: ["-webkit-appearance"],
    };
  },
});

Object.defineProperty(document, "doctype", {
  value: "<!DOCTYPE html>",
});

Object.defineProperty(document.body.style, "transform", {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    };
  },
});

// Vitest setup completed
console.log("Vitest setup completed");
