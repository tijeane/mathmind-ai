import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Vitest doesn't expose `afterEach` as a global (test.globals is not set),
// which is what @testing-library/react's automatic cleanup relies on to
// unmount components between tests. Without this, DOM from one test's
// render leaks into the next test in the same file.
afterEach(() => {
  cleanup();
});
