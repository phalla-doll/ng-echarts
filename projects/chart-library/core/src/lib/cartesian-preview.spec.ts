import { observeTablePreviews } from './cartesian-browser';

it('delegates keyboard and fine-pointer table previews, ignores touch, and releases every listener', () => {
  const host = document.createElement('div');
  host.innerHTML =
    '<table><tbody><tr><td><button data-preview-row="zero" data-preview-series="visits"><span>0</span></button></td></tr></tbody></table>';
  document.body.append(host);
  const button = host.querySelector('button')!;
  const label = host.querySelector('span')!;
  const preview = vi.fn();
  const add = vi.spyOn(host, 'addEventListener');
  const remove = vi.spyOn(host, 'removeEventListener');
  button.focus();
  const dispose = observeTablePreviews(host, preview);
  expect(preview).toHaveBeenLastCalledWith({ rowId: 'zero', seriesId: 'visits' }, 'focus');
  button.blur();
  preview.mockClear();
  const pointer = (type: string, pointerType: string, relatedTarget: EventTarget | null = null) =>
    label.dispatchEvent(
      Object.assign(new Event(type, { bubbles: true }), { pointerType, relatedTarget }),
    );
  pointer('pointerover', 'touch');
  expect(preview).not.toHaveBeenCalled();
  pointer('pointerover', 'mouse');
  expect(preview).toHaveBeenLastCalledWith({ rowId: 'zero', seriesId: 'visits' }, 'pointer');
  pointer('pointerout', 'mouse', button);
  expect(preview).toHaveBeenCalledTimes(1);
  pointer('pointerout', 'mouse');
  expect(preview).toHaveBeenLastCalledWith(null, 'pointer');
  button.focus();
  expect(preview).toHaveBeenLastCalledWith({ rowId: 'zero', seriesId: 'visits' }, 'focus');
  button.blur();
  expect(preview).toHaveBeenLastCalledWith(null, 'focus');
  const count = preview.mock.calls.length;
  dispose();
  expect(add).toHaveBeenCalledTimes(4);
  expect(remove.mock.calls).toEqual(add.mock.calls);
  pointer('pointerover', 'mouse');
  button.focus();
  expect(preview).toHaveBeenCalledTimes(count);
  host.remove();
  vi.restoreAllMocks();
});
