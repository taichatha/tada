import React from "react";
import { render } from "ink";
import { App } from "./App.js";

export function startTui() {
  const { waitUntilExit } = render(<App />);
  return waitUntilExit();
}
