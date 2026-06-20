import { RECURRENCE_LABELS } from '../lib/recurrence';
import './RecurrencePicker.css'; // badge CSS lives here

export default function RecurrenceBadge({ type }) {
  if (!type || type === 'none') return null;
  return (
    <span className="recurrence-badge" title={RECURRENCE_LABELS[type]}>
      🔁 {RECURRENCE_LABELS[type]}
    </span>
  );
}
