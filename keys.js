// Global keyboard monitor using uiohook-napi (no external .exe to spawn).
// Prints every key press and release plus the modifiers held at that moment.
// Exit with Ctrl+C.

const { uIOhook, UiohookKey } = require("uiohook-napi");

// Build a keycode -> name lookup from the library's name -> keycode table.
const names = {};
for (const [name, code] of Object.entries(UiohookKey)) {
  names[code] = name;
}

const held = new Set();

function describe(e) {
  const mods = [];
  if (e.ctrlKey) mods.push("Ctrl");
  if (e.shiftKey) mods.push("Shift");
  if (e.altKey) mods.push("Alt");
  if (e.metaKey) mods.push("Win");
  return mods;
}

function log(kind, e) {
  const time = new Date().toISOString().slice(11, 23);
  const name = names[e.keycode] || "Unknown";
  console.log(
    `${time}  ${kind}  key=${name}  mods=[${describe(e).join("+")}]  keycode=${e.keycode}`
  );
}

uIOhook.on("keydown", (e) => {
  // Skip auto-repeat so a held key prints one DOWN, not a stream.
  if (held.has(e.keycode)) return;
  held.add(e.keycode);
  log("DOWN", e);
});

uIOhook.on("keyup", (e) => {
  held.delete(e.keycode);
  log("UP  ", e);
});

console.log("Listening for key events... press Ctrl+C to quit.\n");
uIOhook.start();

process.on("SIGINT", () => {
  uIOhook.stop();
  process.exit(0);
});
