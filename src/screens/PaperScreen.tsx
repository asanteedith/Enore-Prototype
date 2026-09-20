import { useRef, useState } from 'react'
import { useApp } from '../state/AppContext'
import type { PaperTarget } from '../state/types'
import { eraseSelectionFormatting, highlightSelection, wrapSelectionWithClass } from '../state/paperTools'

const TABS: { key: PaperTarget; label: string }[] = [
  { key: 'P-001', label: 'Bed 4' },
  { key: 'P-002', label: 'Bed 9' },
  { key: 'P-003', label: 'Bed 12' },
  { key: 'NONE', label: 'Nothing' },
]

export function PaperScreen() {
  const { state, setPaper, push } = useApp()
  const [target, setTarget] = useState<PaperTarget>('P-002')
  const editorRef = useRef<HTMLDivElement>(null)

  function persist() {
    if (editorRef.current) setPaper(target, editorRef.current.innerHTML)
  }

  function selectTab(next: PaperTarget) {
    persist()
    setTarget(next)
  }

  function focusEditor() {
    editorRef.current?.focus()
  }

  function addToWork() {
    const sel = window.getSelection()
    let text = ''
    if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) {
      text = sel.toString().trim()
    } else if (editorRef.current) {
      text = editorRef.current.innerText.trim()
    }
    if (!text) return
    push({
      name: 'capture',
      patientId: target === 'NONE' ? undefined : target,
      prefillText: text,
      source: 'paper',
    })
  }

  return (
    <>
      <div className="screen-title">Paper</div>
      <p className="paper-intro">
        Your personal notes. Nothing here becomes work until you choose to add it.
      </p>

      <div className="paper-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`paper-tab ${target === t.key ? 'paper-tab-active' : ''}`}
            type="button"
            onClick={() => selectTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="paper-toolbar">
        <button className="paper-tool" type="button" onClick={focusEditor}>
          Write
        </button>
        <button
          className="paper-tool"
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => document.execCommand('underline')}
        >
          Underline
        </button>
        <button
          className="paper-tool"
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => wrapSelectionWithClass('paper-circle')}
        >
          Circle
        </button>
        <button
          className="paper-tool"
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => highlightSelection()}
        >
          Highlight
        </button>
        <button
          className="paper-tool"
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => eraseSelectionFormatting()}
        >
          Erase
        </button>
      </div>

      <div
        key={target}
        ref={editorRef}
        className="paper-sheet"
        contentEditable
        suppressContentEditableWarning
        onBlur={persist}
        dangerouslySetInnerHTML={{ __html: state.paperNotes[target] }}
      />

      <button className="btn btn-secondary btn-full" type="button" onClick={addToWork}>
        Add to Work
      </button>
    </>
  )
}
