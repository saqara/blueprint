// happy-dom rejects a cancelled animation's `finished` promise without marking it handled; browsers mark it
// handled (Web Animations spec). Motion cancels animations as the fluid hover moves, so mirror the browser.
const Anim = (globalThis as { Animation?: { prototype: { cancel(): void; finished: Promise<unknown> } } }).Animation
if (Anim) {
  const cancel = Anim.prototype.cancel
  Anim.prototype.cancel = function (this: { finished: Promise<unknown> }) {
    this.finished.catch(() => {})
    return cancel.call(this)
  }
}
