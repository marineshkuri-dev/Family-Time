import './RecurrencePicker.css';

// 0=Sun … 6=Sat, matching JS Date.getDay()
const WEEKDAYS = [
  { value: 0, label: 'א׳' },
  { value: 1, label: 'ב׳' },
  { value: 2, label: 'ג׳' },
  { value: 3, label: 'ד׳' },
  { value: 4, label: 'ה׳' },
  { value: 5, label: 'ו׳' },
  { value: 6, label: 'ש׳' },
];

/**
 * Props:
 *   value    — { recurrence_type, recurrence_days, recurrence_end_date }
 *   onChange — (updatedValue) => void
 *   disabled — boolean
 */
export default function RecurrencePicker({ value, onChange, disabled }) {
  const {
    recurrence_type     = 'none',
    recurrence_days     = [],
    recurrence_end_date = '',
  } = value;

  const update = (patch) => onChange({ recurrence_type, recurrence_days, recurrence_end_date, ...patch });

  const handleTypeChange = (e) => {
    const t = e.target.value;
    // Clear days when switching to a type that doesn't use them
    update({ recurrence_type: t, recurrence_days: (t === 'monthly' || t === 'none') ? [] : recurrence_days });
  };

  const toggleDay = (dayNum) => {
    const next = recurrence_days.includes(dayNum)
      ? recurrence_days.filter((d) => d !== dayNum)
      : [...recurrence_days, dayNum].sort((a, b) => a - b);
    update({ recurrence_days: next });
  };

  const showDays    = recurrence_type === 'weekly' || recurrence_type === 'twice_weekly';
  const showEndDate = recurrence_type !== 'none';

  return (
    <div className="recurrence-picker">
      <div className="form-group">
        <label htmlFor="rec-type">חזרתיות</label>
        <select
          id="rec-type"
          className="input"
          value={recurrence_type}
          onChange={handleTypeChange}
          disabled={disabled}
        >
          <option value="none">ללא חזרתיות</option>
          <option value="weekly">כל שבוע</option>
          <option value="twice_weekly">פעמיים בשבוע</option>
          <option value="monthly">כל חודש</option>
        </select>
      </div>

      {showDays && (
        <div className="form-group">
          <label>ימים בשבוע</label>
          <div className="weekday-picker">
            {WEEKDAYS.map(({ value: dayNum, label }) => (
              <button
                key={dayNum}
                type="button"
                className={`weekday-btn${recurrence_days.includes(dayNum) ? ' selected' : ''}`}
                onClick={() => toggleDay(dayNum)}
                disabled={disabled}
                aria-pressed={recurrence_days.includes(dayNum)}
              >
                {label}
              </button>
            ))}
          </div>
          {recurrence_type === 'twice_weekly' && recurrence_days.length !== 2 && (
            <small className="rec-hint">בחר בדיוק 2 ימים</small>
          )}
        </div>
      )}

      {showEndDate && (
        <div className="form-group">
          <label htmlFor="rec-end">תאריך סיום חזרה (אופציונלי)</label>
          <input
            id="rec-end"
            type="date"
            className="input"
            value={recurrence_end_date}
            onChange={(e) => update({ recurrence_end_date: e.target.value })}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
