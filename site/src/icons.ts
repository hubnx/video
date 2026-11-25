/** The tab icon and the phone home-screen icon every page links (../../../docs/brand.md › Icons), drawn from
 * video/brand/icon.svg by app/scripts/render-icons.ts. */
export function renderIconLinks(): string {
  return `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />`;
}
