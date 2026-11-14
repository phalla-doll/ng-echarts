/** Keep native control focus when keyed DOM moves; never take it back from another control. */
export class ChartFocusKeeper {
  private remembered: HTMLElement | null = null;
  private readonly document: Document;
  private readonly onFocus = (event: FocusEvent): void => {
    const target = event.target;
    this.remembered = target instanceof HTMLElement && this.host.contains(target) ? target : null;
  };
  private readonly onPointer = (event: PointerEvent): void => {
    if (!(event.target instanceof Node) || !this.remembered?.contains(event.target))
      this.remembered = null;
  };

  constructor(private readonly host: HTMLElement) {
    this.document = host.ownerDocument;
    this.document.addEventListener('focusin', this.onFocus);
    this.document.addEventListener('pointerdown', this.onPointer);
  }

  restore(): void {
    const previous = this.remembered;
    if (
      !previous ||
      !this.document.hasFocus() ||
      this.document.activeElement !== this.document.body
    )
      return;
    if (this.available(previous)) {
      previous.focus({ preventScroll: true });
      return;
    }
    // The focused row/series disappeared, or ready UI changed to a status message.
    const selectors = [
      '.table-toggle',
      '.legend button',
      '[role="alert"], [role="status"]',
      '.chart-frame',
    ];
    let fallback: HTMLElement | undefined;
    for (const selector of selectors) {
      fallback = [...this.host.querySelectorAll<HTMLElement>(selector)].find((element) =>
        this.available(element),
      );
      if (fallback) break;
    }
    this.remembered = null;
    if (fallback) {
      if (fallback.tagName !== 'BUTTON') fallback.tabIndex = -1;
      fallback.focus({ preventScroll: true });
    }
  }

  private available(element: HTMLElement): boolean {
    return (
      element.isConnected &&
      this.host.contains(element) &&
      !element.matches(':disabled') &&
      !element.closest('[inert], [hidden], [aria-hidden="true"]')
    );
  }

  destroy(): void {
    this.document.removeEventListener('focusin', this.onFocus);
    this.document.removeEventListener('pointerdown', this.onPointer);
    this.remembered = null;
  }
}
