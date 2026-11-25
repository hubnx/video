/** The footer every page shares (../../../docs/brand.md › Every app site carries). The maker is said once, here. */
export function renderFooter(): string {
  return `<footer class="site-footer">
      <a href="/about/">About Hub Nexus</a>
      <a href="/feedback/">Feedback</a>
      <a href="/privacy/">Privacy</a>
      <a href="/terms/">Terms</a>
      <a href="/licenses/">Licenses</a>
      <a href="https://github.com/hubnx/video">Source code</a>
    </footer>`;
}
