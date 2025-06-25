import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4">
      <div className="absolute top-4 right-4">
  <ThemeToggle />
</div>


      <h1 className="text-4xl font-bold mb-10">Task Manager</h1>

      <p className="text-base mb-5">
        Organize your tasks. Stay productive. Simple and secure.
      </p>

      <div className="flex gap-2">
        <Link to="/login">
          <button className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Login
          </button>
        </Link>
        <Link to="/register">
          <button className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
            Register
          </button>
        </Link>
      </div>
    </div>
  )
}
