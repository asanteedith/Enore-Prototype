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
          </button>
        ))}
      </div>

      {mode === 'TYPE' ? (
        <textarea
          className="capture-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'What happened?'}
          rows={3}
          autoFocus
        />
      ) : (
        <div className="capture-alt-mode">{MODE_HINTS[mode]}</div>
      )}

      <button
        className="btn btn-primary btn-full"
        onClick={mode === 'TYPE' ? onSubmit : () => setMode('TYPE')}
        disabled={mode === 'TYPE' && value.trim().length === 0}
        type="button"
      >
        {mode === 'TYPE' ? 'Continue' : 'Use Type for this demo'}
      </button>
    </div>
  )
}
