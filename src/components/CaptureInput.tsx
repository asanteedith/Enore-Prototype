import { useState } from 'react'

type Mode = 'TYPE' | 'RECORD' | 'PHOTO' | 'WRITE'

const MODE_HINTS: Record<Mode, string | null> = {
  TYPE: null,
  RECORD: 'Voice capture — speak what happened and Enore will transcribe it here.',
  PHOTO: 'Photo capture — attach an image and Enore will read the relevant detail.',
  WRITE: 'Handwriting capture — write on screen and Enore will convert it to text.',
}

interface Props {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
}

export function CaptureInput({ value, onChange, onSubmit, placeholder }: Props) {
  const [mode, setMode] = useState<Mode>('TYPE')

  return (
    <div className="capture-input">
      <div className="capture-modes">
        {(['TYPE', 'RECORD', 'PHOTO', 'WRITE'] as Mode[]).map((m) => (
          <button
            key={m}
            className={`capture-mode ${mode === m ? 'capture-mode-active' : ''}`}
            onClick={() => setMode(m)}
            type="button"
          >
            {m}
            {m !== 'TYPE' && <span className="capture-mode-soon">Soon</span>}
          </button>
        ))}
      </div>

      {mode === 'TYPE' ? (
        <>
          <textarea
            className="capture-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? 'What happened?'}
            rows={3}
            autoFocus
          />
          <button className="btn btn-primary btn-full" onClick={onSubmit} disabled={value.trim().length === 0} type="button">
            Continue
          </button>
        </>
      ) : (
        <>
          <div className="capture-alt-mode">
            <div className="capture-alt-mode-text">{MODE_HINTS[mode]}</div>
            <div className="capture-alt-mode-tag">Coming soon</div>
          </div>
          <button className="capture-alt-mode-switch" onClick={() => setMode('TYPE')} type="button">
            Switch to typing
          </button>
        </>
      )}
    </div>
  )
}
