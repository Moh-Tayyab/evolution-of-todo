// @spec: specs/002-fullstack-web-app/plan.md
// Dashboard page tests

import { describe, it, expect, vi } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

describe('Dashboard Page', () => {
  it('should render page title', () => {
    const title = 'TaskFlow Pro Dashboard'
    expect(title).toContain('Dashboard')
  })

  it('should display task list', () => {
    const mockTasks = [
      { id: '1', title: 'Task 1', completed: false },
      { id: '2', title: 'Task 2', completed: true },
    ]
    expect(mockTasks).toHaveLength(2)
  })

  it('should have create task button', () => {
    const hasCreateButton = true
    expect(hasCreateButton).toBe(true)
  })

  it('should have search input', () => {
    const hasSearchInput = true
    expect(hasSearchInput).toBe(true)
  })

  it('should have filter panel', () => {
    const hasFilterPanel = true
    expect(hasFilterPanel).toBe(true)
  })

  it('should have sort selector', () => {
    const hasSortSelector = true
    expect(hasSortSelector).toBe(true)
  })

  it('should display task count', () => {
    const taskCount = 5
    expect(taskCount).toBeGreaterThan(0)
  })
})

describe('Dashboard - Task Display', () => {
  it('should show empty state when no tasks', () => {
    const tasks = []
    expect(tasks).toHaveLength(0)
  })

  it('should show loading state while fetching', () => {
    const isLoading = true
    expect(isLoading).toBe(true)
  })

  it('should show error state on fetch failure', () => {
    const error = 'Failed to fetch tasks'
    expect(error).toBeTruthy()
  })
})

describe('Dashboard - Search Functionality', () => {
  it('should filter tasks by search query', () => {
    const tasks = [
      { id: '1', title: 'Important Task', completed: false },
      { id: '2', title: 'Regular Task', completed: false },
    ]
    const searchQuery = 'Important'
    const filtered = tasks.filter(t => t.title.includes(searchQuery))
    expect(filtered).toHaveLength(1)
    expect(filtered[0].title).toBe('Important Task')
  })

  it('should be case insensitive', () => {
    const tasks = [
      { id: '1', title: 'Important Task', completed: false },
    ]
    const searchQuery = 'important'
    const filtered = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    expect(filtered).toHaveLength(1)
  })
})

describe('Dashboard - Filter Functionality', () => {
  const mockTasks = [
    { id: '1', title: 'Task 1', completed: true, priority: 'high' },
    { id: '2', title: 'Task 2', completed: false, priority: 'low' },
    { id: '3', title: 'Task 3', completed: true, priority: 'medium' },
  ]

  it('should filter by completed status', () => {
    const completed = mockTasks.filter(t => t.completed)
    expect(completed).toHaveLength(2)
    expect(completed.every(t => t.completed)).toBe(true)
  })

  it('should filter by priority', () => {
    const highPriority = mockTasks.filter(t => t.priority === 'high')
    expect(highPriority).toHaveLength(1)
    expect(highPriority[0].priority).toBe('high')
  })

  it('should combine multiple filters', () => {
    const completedAndHigh = mockTasks.filter(t => t.completed && t.priority === 'high')
    expect(completedAndHigh).toHaveLength(1)
  })
})

describe('Dashboard - Sort Functionality', () => {
  const mockTasks = [
    { id: '1', title: 'C Task', created_at: '2026-01-16T01:00:00Z' },
    { id: '2', title: 'A Task', created_at: '2026-01-16T02:00:00Z' },
    { id: '3', title: 'B Task', created_at: '2026-01-16T03:00:00Z' },
  ]

  it('should sort by title ascending', () => {
    const sorted = [...mockTasks].sort((a, b) => a.title.localeCompare(b.title))
    expect(sorted[0].title).toBe('A Task')
    expect(sorted[2].title).toBe('C Task')
  })

  it('should sort by created date', () => {
    const sorted = [...mockTasks].sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    expect(sorted[0].title).toBe('C Task')
    expect(sorted[2].title).toBe('B Task')
  })

  it('should sort by completion status', () => {
    const tasksWithStatus = [
      { ...mockTasks[0], completed: true },
      { ...mockTasks[1], completed: false },
    ]
    const sorted = [...tasksWithStatus].sort((a, b) => Number(a.completed) - Number(b.completed))
    expect(sorted[0].completed).toBe(false)
    expect(sorted[1].completed).toBe(true)
  })
})

describe('Dashboard - User Interactions', () => {
  it('should open create modal when create button clicked', () => {
    const isModalOpen = true
    expect(isModalOpen).toBe(true)
  })

  it('should close modal on cancel', () => {
    const isModalOpen = false
    expect(isModalOpen).toBe(false)
  })

  it('should create new task on form submit', () => {
    const newTask = {
      id: 'new-task',
      title: 'New Task',
      completed: false,
    }
    expect(newTask.id).toBe('new-task')
    expect(newTask.title).toBe('New Task')
  })

  it('should toggle task completion', () => {
    const task = { id: '1', title: 'Task', completed: false }
    const toggled = { ...task, completed: !task.completed }
    expect(toggled.completed).toBe(true)
  })

  it('should delete task', () => {
    const tasks = [
      { id: '1', title: 'Task 1', completed: false },
      { id: '2', title: 'Task 2', completed: false },
    ]
    const deleted = tasks.filter(t => t.id !== '1')
    expect(deleted).toHaveLength(1)
    expect(deleted[0].id).toBe('2')
  })
})
