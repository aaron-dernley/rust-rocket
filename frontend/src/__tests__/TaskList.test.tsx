import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import TaskList from '@/components/TaskList'

const makeTask = (overrides: Partial<Parameters<typeof TaskList>[0]['tasks'][0]> = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Test task',
  completed: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

describe('TaskList', () => {
  it('shows empty state when there are no tasks', () => {
    render(<TaskList tasks={[]} />)
    expect(screen.getByText('No tasks yet.')).toBeTruthy()
  })

  it('renders task titles', () => {
    const tasks = [
      makeTask({ id: '1', title: 'Buy milk' }),
      makeTask({ id: '2', title: 'Write tests' }),
    ]
    render(<TaskList tasks={tasks} />)
    expect(screen.getByText('Buy milk')).toBeTruthy()
    expect(screen.getByText('Write tests')).toBeTruthy()
  })

  it('marks completed tasks visually', () => {
    const tasks = [makeTask({ completed: true, title: 'Done task' })]
    render(<TaskList tasks={tasks} />)
    const indicator = screen.getByLabelText('completed')
    expect(indicator).toBeTruthy()
  })
})
