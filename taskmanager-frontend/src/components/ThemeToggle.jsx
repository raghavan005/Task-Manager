import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() =>
    localStorage.getItem('theme') === 'dark'
  )

  useEffect(() => {
    const root = window.document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {dark ? 'Dark' : 'Light'}
      </span>
      <button
        onClick={() => setDark(!dark)}
        className={`relative w-12 h-6 flex items-center bg-gray-300 dark:bg-gray-600 rounded-full p-1 transition duration-300`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
            dark ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
