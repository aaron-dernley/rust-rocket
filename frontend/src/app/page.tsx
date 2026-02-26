'use client'

import { useEffect, useState } from 'react'
import TaskList from '@/components/TaskList'

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

  useEffect(() => {
    fetch(`${apiUrl}/api/tasks`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<Task[]>
      })
      .then((data) => {
        setTasks(data)
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
  }, [apiUrl])

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            🚀 RustRocket
          </h1>
          <p className="text-gray-500 mt-1">
            Rust/Axum + Next.js — CI/CD benchmark app
          </p>
        </header>

        {loading && (
          <div className="text-center py-12 text-gray-400">Loading tasks…</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            <p className="font-medium">Could not reach the API</p>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
        )}

        {!loading && !error && <TaskList tasks={tasks} />}
      </div>
    </main>
  )
}
