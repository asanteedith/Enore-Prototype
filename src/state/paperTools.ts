export function wrapSelectionWithClass(className: string) {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return
  const range = sel.getRangeAt(0)
  const span = document.createElement('span')
  span.className = className
  try {
    range.surroundContents(span)
    sel.removeAllRanges()
  } catch {
    // selection spans multiple elements; skip rather than corrupt the DOM
  }
}

export function eraseSelectionFormatting() {
  document.execCommand('removeFormat')
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return
  const range = sel.getRangeAt(0)
  const container = range.commonAncestorContainer
  const root = container.nodeType === 1 ? (container as Element) : container.parentElement
  root?.querySelectorAll('span.paper-circle, span.paper-highlight').forEach((span) => {
    const parent = span.parentNode
    if (!parent) return
    while (span.firstChild) parent.insertBefore(span.firstChild, span)
    parent.removeChild(span)
  })
}

export function highlightSelection() {
  const applied = document.execCommand('hiliteColor', false, 'rgba(138, 92, 8, 0.22)')
  if (!applied) wrapSelectionWithClass('paper-highlight')
}
