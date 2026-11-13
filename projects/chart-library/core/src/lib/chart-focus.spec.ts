import { ChartFocusKeeper } from './chart-focus';
it('restores a removed retry control to a named frame when no chart actions exist, without taking external focus', () => {
  const host = document.createElement('div');
  const frame = document.createElement('section');
  frame.className = 'chart-frame';
  frame.setAttribute('aria-label', 'Goal');
  const retry = document.createElement('button');
  retry.textContent = 'Retry';
  frame.append(retry);
  host.append(frame);
  document.body.append(host);
  const external = document.createElement('button');
  document.body.append(external);
  const focused = vi.spyOn(document, 'hasFocus').mockReturnValue(true);
  const keeper = new ChartFocusKeeper(host);
  try {
    retry.focus();
    retry.remove();
    keeper.restore();
    expect(document.activeElement).toBe(frame);
    expect(frame.tabIndex).toBe(-1);
    external.focus();
    keeper.restore();
    expect(document.activeElement).toBe(external);
  } finally {
    keeper.destroy();
    host.remove();
    external.remove();
    focused.mockRestore();
  }
});
