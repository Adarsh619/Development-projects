import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'calorie-track-v1'
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function shiftDate(dateKey, days) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const next = new Date(y, m - 1, d)
  next.setDate(next.getDate() + days)
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`
}

function formatDate(dateKey) {
  if (dateKey === todayKey()) return 'Today'
  const yesterday = shiftDate(todayKey(), -1)
  if (dateKey === yesterday) return 'Yesterday'
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { goal: 2000, days: {} }
    const parsed = JSON.parse(raw)
    return {
      goal: Number(parsed.goal) || 2000,
      days: parsed.days && typeof parsed.days === 'object' ? parsed.days : {},
    }
  } catch {
    return { goal: 2000, days: {} }
  }
}

function Ring({ eaten, goal }) {
  const pct = goal > 0 ? Math.min(eaten / goal, 1) : 0
  const over = eaten > goal
  const r = 54
  const c = 2 * Math.PI * r
  const offset = c - pct * c
  const color = over ? '#b42318' : '#2f6b4f'

  return (
    <svg className="ring" viewBox="0 0 140 140" aria-hidden="true">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#efe8d8" strokeWidth="12" />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
      />
      <text className="ring-label" x="70" y="68" textAnchor="middle">
        {Math.round(eaten)}
      </text>
      <text className="ring-sub" x="70" y="88" textAnchor="middle">
        of {goal} kcal
      </text>
    </svg>
  )
}

export default function App() {
  const [goal, setGoal] = useState(() => loadState().goal)
  const [days, setDays] = useState(() => loadState().days)
  const [date, setDate] = useState(todayKey)
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [meal, setMeal] = useState('Breakfast')
  const [formError, setFormError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [editingCalories, setEditingCalories] = useState('')
  const [editingMeal, setEditingMeal] = useState('Breakfast')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ goal, days }))
  }, [goal, days])

  const entries = days[date] ?? []
  const eaten = useMemo(
    () => entries.reduce((sum, item) => sum + item.calories, 0),
    [entries],
  )
  const remaining = goal - eaten

  function addFood(event) {
    event.preventDefault()
    const kcal = Number(calories)
    const trimmed = name.trim()
    if (!trimmed) {
  setFormError('Please enter a food name.')
  return
}

if (!Number.isFinite(kcal) || kcal <= 0) {
  setFormError('Please enter a calorie amount greater than 0.')
  return
}

setFormError('')

    const entry = {
      id: crypto.randomUUID(),
      name: trimmed,
      calories: Math.round(kcal),
      meal,
    }

    setDays((prev) => ({
      ...prev,
      [date]: [...(prev[date] ?? []), entry],
    }))
    setName('')
    setCalories('')
  }

  function removeFood(id) {
    setDays((prev) => ({
      ...prev,
      [date]: (prev[date] ?? []).filter((item) => item.id !== id),
    }))
  }

  function startEditing(item) {
    setEditingId(item.id)
    setEditingName(item.name)
    setEditingCalories(String(item.calories))
    setEditingMeal(item.meal)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditingName('')
    setEditingCalories('')
    setEditingMeal('Breakfast')
  }

  function saveEdit() {
    const kcal = Number(editingCalories)
    const trimmed = editingName.trim()

    if (!trimmed || !Number.isFinite(kcal) || kcal <= 0) return

    setDays((prev) => ({
      ...prev,
      [date]: (prev[date] ?? []).map((item) =>
        item.id === editingId
          ? { ...item, name: trimmed, calories: Math.round(kcal), meal: editingMeal }
          : item,
      ),
    }))

    cancelEditing()
  }

  return (
    <main className="app">
      <header className="header">
        <div>
          <h1>Calorie Track</h1>
          <p>Log what you eat. Stay on your daily goal.</p>
        </div>
        <div className="date-nav">
          <button type="button" onClick={() => setDate((d) => shiftDate(d, -1))} aria-label="Previous day">
            ‹
          </button>
          <div className="date-label">{formatDate(date)}</div>
          <button type="button" onClick={() => setDate((d) => shiftDate(d, 1))} aria-label="Next day">
            ›
          </button>
        </div>
      </header>

      <section className="summary">
        <Ring eaten={eaten} goal={goal} />
        <div className="stats">
          <div className="stat">
            <span>Eaten</span>
            <strong>{eaten} kcal</strong>
          </div>
          <div className={`stat ${remaining < 0 ? 'over' : ''}`}>
            <span>{remaining < 0 ? 'Over' : 'Left'}</span>
            <strong>{Math.abs(remaining)} kcal</strong>
          </div>
          <div className="stat goal-row">
            <span>Daily goal</span>
            <input
              type="number"
              min="1"
              step="50"
              value={goal}
              onChange={(e) => setGoal(Math.max(1, Number(e.target.value) || 1))}
              aria-label="Daily calorie goal"
            />
          </div>
        </div>
      </section>

      <form className="form" onSubmit={addFood}>
        <h2>Add food</h2>
        <div className="fields">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Food name"
            aria-label="Food name"
            required
          />
          <input
            type="number"
            min="1"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="kcal"
            aria-label="Calories"
            required
          />
          <select value={meal} onChange={(e) => setMeal(e.target.value)} aria-label="Meal">
            {MEALS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button className="add-btn" type="submit">
            Add
          </button>
        </div>
        {formError && (
  <p className="form-error" role="alert">
    {formError}
  </p>
)}
      </form>

      <section className="log">
        <h2>{formatDate(date)}’s log</h2>
        {entries.length === 0 ? (
          <div className="empty">Nothing logged yet. Add your first meal above.</div>
        ) : (
          MEALS.map((group) => {
            const items = entries.filter((item) => item.meal === group)
            if (items.length === 0) return null
            return (
              <div className="meal" key={group}>
                <h3>
                  {group} · {items.reduce((sum, item) => sum + item.calories, 0)} kcal
                </h3>
                {items.map((item) =>
  editingId === item.id ? (
    <article className="entry edit-entry" key={item.id}>
      <input
        value={editingName}
        onChange={(e) => setEditingName(e.target.value)}
        aria-label="Edit food name"
      />
      <input
        type="number"
        min="1"
        value={editingCalories}
        onChange={(e) => setEditingCalories(e.target.value)}
        aria-label="Edit calories"
      />
      <select
        value={editingMeal}
        onChange={(e) => setEditingMeal(e.target.value)}
        aria-label="Edit meal"
      >
        {MEALS.map((mealOption) => (
          <option key={mealOption} value={mealOption}>
            {mealOption}
          </option>
        ))}
      </select>
      <div className="entry-actions">
        <button className="edit-btn" type="button" onClick={saveEdit}>
          Save
        </button>
        <button className="cancel-btn" type="button" onClick={cancelEditing}>
          Cancel
        </button>
      </div>
    </article>
  ) : (
    <article className="entry" key={item.id}>
      <strong>{item.name}</strong>
      <span className="calories">{item.calories} kcal</span>
      <div className="entry-actions">
        <button className="edit-btn" type="button" onClick={() => startEditing(item)}>
          Edit
        </button>
        <button className="remove" type="button" onClick={() => removeFood(item.id)}>
          Remove
        </button>
      </div>
    </article>
  ),
)}
              </div>
            )
          })
        )}
      </section>
    </main>
  )
}
