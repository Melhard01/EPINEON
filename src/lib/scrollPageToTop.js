/** Scroll the window to the top (legal pages, route changes, footer links). */
export function scrollPageToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
}
