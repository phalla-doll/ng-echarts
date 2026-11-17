import { expect, test } from '@playwright/test';
import { collectBrowserErrors } from './resource-audit';

const panels = [
  ['/playground', '.settings-panel'],
  ['/formatting', '.validation-controls'],
  ['/updates', '.validation-controls'],
  ['/validation', '.validation-controls'],
  ['/line-validation', '.validation-controls'],
  ['/area-validation', '.validation-controls'],
  ['/pie-validation', '.validation-controls'],
  ['/composed-validation', '.validation-controls'],
  ['/linked-validation', '.validation-controls'],
  ['/retention', '.validation-controls'],
  ['/radar', '.radar-controls'],
  ['/radar-validation', '.radar-controls'],
  ['/radial', '.radial-controls'],
  ['/calendar', '.calendar-toolbar, .radial-controls'],
  ['/calendar-validation', '.calendar-toolbar, .radial-controls'],
  ['/sankey', '.radial-controls'],
  ['/sankey-validation', '.radial-controls'],
  ['/pie', '.legend-layout'],
  ['/comparison', '.controls'],
  ['/line-comparison', '.controls'],
  ['/area-comparison', '.controls'],
  ['/pie-comparison', '.controls'],
  ['/linked', '.linked-toolbar'],
  ['/linked-example-validation', '.linked-toolbar'],
  ['/linked-dashboard', '.dashboard-window-controls, .dashboard-controls'],
  ['/dashboard-validation', '.dashboard-window-controls, .dashboard-controls'],
] as const;

for (const [route, selector] of panels) {
  test(`${route} keeps customization controls readable and separate across themes and widths`, async ({
    page,
  }) => {
    const errors = collectBrowserErrors(page);
    await page.goto(route);
    const panel = page.locator(selector).first();
    await expect(panel).toBeVisible();
    for (const surface of await page.locator(selector).all()) {
      if (await surface.evaluate((element) => element.tagName === 'DETAILS')) {
        await surface.locator('summary').click();
      }
    }
    for (const theme of ['light', 'dark']) {
      const toggle = page.getByRole('button', { name: `Use ${theme} theme`, exact: true });
      if (await toggle.count()) await toggle.click();
      for (const width of [320, 390, 768, 900, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        // Legacy scoped flex rules used to turn every full-width action into its own row.
        for (const group of await page.locator('.radial-actions, .radar-actions').all()) {
          const buttons = group.getByRole('button');
          const first = await buttons.nth(0).boundingBox();
          const second = await buttons.nth(1).boundingBox();
          const third = await buttons.nth(2).boundingBox();
          const groupWidth = (await group.boundingBox())!.width;
          if (groupWidth > 580) {
            expect(second!.y).toBe(first!.y);
            expect(third!.y).toBe(first!.y);
          } else if (groupWidth <= 380) {
            expect(second!.y).toBeGreaterThanOrEqual(first!.y + first!.height);
          }
          expect(Math.abs(first!.width - second!.width)).toBeLessThanOrEqual(1);
        }
        await expect
          .poll(() =>
            page.locator(selector).evaluateAll((panels) =>
              panels.flatMap((panel) => {
                const bounds = panel.getBoundingClientRect();
                const controls = [...panel.querySelectorAll('button, select, input')].filter(
                  (control) => control.getClientRects().length,
                );
                const problems: string[] = [];
                for (const control of controls) {
                  const box = control.getBoundingClientRect();
                  if (
                    box.height < 44 ||
                    box.left < bounds.left ||
                    box.right > bounds.right ||
                    control.scrollWidth > control.clientWidth + 1
                  )
                    problems.push(`Clipped control: ${control.textContent?.trim()}`);
                  for (const other of controls) {
                    if (other === control) continue;
                    const next = other.getBoundingClientRect();
                    if (
                      box.left < next.right - 1 &&
                      box.right > next.left + 1 &&
                      box.top < next.bottom - 1 &&
                      box.bottom > next.top + 1
                    )
                      problems.push(`Overlapping controls: ${control.textContent?.trim()}`);
                  }
                }
                return problems;
              }),
            ),
          )
          .toEqual([]);
        await expect
          .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
          .toBeLessThanOrEqual(width);
      }
    }
    expect(errors).toEqual([]);
  });
}

test('keeps numeric fields centered in one surface after client navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/calendar');
  for (const theme of ['light', 'dark']) {
    const toggle = page.getByRole('button', { name: `Use ${theme} theme`, exact: true });
    if (await toggle.count()) await toggle.click();
    // Revisit after other components have attached their scoped styles.
    for (const name of ['Calendar Heatmap', 'Radial Progress', 'Calendar Heatmap']) {
      await page
        .getByRole('navigation', { name: 'Playground pages' })
        .getByRole('link', { name, exact: true })
        .click();
      const radial = name === 'Radial Progress';
      if (radial) await page.locator('.radial-controls summary').first().click();
      const field = page.locator(radial ? '.value-field' : '.calendar-toolbar').first();
      const input = field.getByRole('spinbutton');
      await expect(input).toBeVisible();
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        const geometry = await input.evaluate((input) => {
          const parent = input.parentElement!.getBoundingClientRect();
          const box = input.getBoundingClientRect();
          return {
            centerOffset: Math.abs(box.top + box.height / 2 - parent.top - parent.height / 2),
            background: getComputedStyle(input).backgroundColor,
            border: getComputedStyle(input).borderTopWidth,
          };
        });
        expect(geometry.centerOffset).toBeLessThanOrEqual(1);
        expect(geometry.background).toBe('rgba(0, 0, 0, 0)');
        expect(geometry.border).toBe('0px');
      }
      const initialValue = await input.inputValue();
      await input.focus();
      await page.keyboard.press('ArrowUp');
      await expect(input).toHaveValue(String(Number(initialValue) + 1));
      await expect(input).toBeFocused();
      if (radial)
        await page
          .locator('.radial-controls')
          .first()
          .getByRole('button', { name: 'Restore sample', exact: true })
          .click();
      else
        await page.getByRole('button', { name: 'Reset Daily contributions', exact: true }).click();
      await expect(input).toHaveValue(initialValue);
    }
  }
});

test('keeps native disclosure and form controls usable before JavaScript loads', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  for (const route of ['/radial', '/radar', '/calendar', '/sankey']) {
    await page.goto(route);
    const details = page.locator('.radial-controls, .radar-controls').first();
    await details.locator('summary').click();
    await expect(details).toHaveAttribute('open', '');
    await expect(details.getByRole('button').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      390,
    );
  }
  await context.close();
});

test('keeps dashboard fields readable when its theme differs from the site', async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/linked-dashboard');
  const dashboard = page.locator('app-composed-dashboard');
  const field = dashboard.locator('.dashboard-controls label').first();
  const month = dashboard.getByRole('combobox', { name: 'Month', exact: true });
  for (const siteTheme of ['dark', 'light']) {
    const toggle = page.getByRole('button', { name: `Use ${siteTheme} theme`, exact: true });
    if (await toggle.count()) await toggle.click();
    await expect(dashboard).toHaveAttribute('data-theme', siteTheme);
    for (const theme of ['light', 'dark']) {
      if ((await dashboard.getAttribute('data-theme')) !== theme)
        await page.getByRole('button', { name: 'Dark theme', exact: true }).click();
      await expect(dashboard).toHaveAttribute('data-theme', theme);
      await expect(field).toHaveCSS(
        'background-color',
        theme === 'light' ? 'rgb(243, 243, 243)' : 'rgb(23, 23, 23)',
      );
      // Measure the actual select foreground against its painted label/hover background.
      for (const hover of [false, true]) {
        if (hover) await month.hover();
        else await page.mouse.move(0, 0);
        await expect
          .poll(() =>
            month.evaluate((select) => {
              const canvas = document.createElement('canvas');
              canvas.width = canvas.height = 1;
              const context = canvas.getContext('2d')!;
              const luminance = (color: string) => {
                context.fillStyle = color;
                context.fillRect(0, 0, 1, 1);
                const channels = [...context.getImageData(0, 0, 1, 1).data]
                  .slice(0, 3)
                  .map((value) => {
                    const channel = value / 255;
                    return channel <= 0.04045
                      ? channel / 12.92
                      : ((channel + 0.055) / 1.055) ** 2.4;
                  });
                return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
              };
              const style = getComputedStyle(select);
              const background =
                style.backgroundColor === 'rgba(0, 0, 0, 0)'
                  ? getComputedStyle(select.parentElement!).backgroundColor
                  : style.backgroundColor;
              const foregroundLuminance = luminance(style.color);
              const backgroundLuminance = luminance(background);
              return (
                (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
                (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
              );
            }),
          )
          .toBeGreaterThanOrEqual(4.5);
      }
    }
  }
  expect(errors).toEqual([]);
});

test('retains selected choices and switch positions in forced colors', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/comparison');
  const choices = page.getByRole('group', { name: 'Bar variants' });
  const grouped = choices.getByRole('button', { name: 'Grouped reference', exact: true });
  const stacked = choices.getByRole('button', { name: 'Stacked reference', exact: true });
  await expect(grouped).toHaveCSS('text-decoration-line', 'underline');
  await stacked.focus();
  await page.keyboard.press('Space');
  await expect(stacked).toHaveAttribute('aria-pressed', 'true');
  await expect(stacked).toHaveCSS('text-decoration-line', 'underline');
  await expect(grouped).toHaveCSS('text-decoration-line', 'none');
  await expect(stacked).toBeFocused();
  await page.goto('/radar');
  await page.locator('.radar-controls summary').click();
  const fill = page.getByRole('button', { name: 'Fill polygons', exact: true });
  const appearance = () =>
    fill.evaluate((button) => getComputedStyle(button, '::after').backgroundImage);
  const selectedAppearance = await appearance();
  await fill.focus();
  await page.keyboard.press('Space');
  await expect(fill).toHaveAttribute('aria-pressed', 'false');
  expect(await appearance()).not.toBe(selectedAppearance);
  expect(await appearance()).not.toBe('none');
  await expect(fill).toBeFocused();
});
