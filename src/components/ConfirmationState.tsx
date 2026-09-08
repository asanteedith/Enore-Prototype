interface Props {
  items: string[]
}

export function ConfirmationState({ items }: Props) {
  return (
    <ul className="confirmation-list">
      {items.map((item) => (
        <li key={item} className="confirmation-item">
          <span className="confirmation-check">✓</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
