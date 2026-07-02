'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/toast-provider'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface ModuleRow {
  id: string
  title: string
  sequence: number
}

interface LessonRow {
  id: string
  course_module_id: string
  title: string
  content: { text?: string } | null
  sequence: number
}

interface QuizRow {
  id: string
  lesson_id: string
  passing_score: number
}

interface QuestionRow {
  id: string
  quiz_id: string
  question: string
  options: string[]
  correct_option_index: number
  sequence: number
}

interface CourseContentEditorProps {
  courseId: string
  modules: ModuleRow[]
  lessons: LessonRow[]
  quizzes: QuizRow[]
  questions: QuestionRow[]
}

export function CourseContentEditor({
  courseId,
  modules,
  lessons,
  quizzes,
  questions,
}: CourseContentEditorProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [newModuleTitle, setNewModuleTitle] = useState('')

  async function callApi(path: string, method: 'POST', body: unknown) {
    const response = await fetch(path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const payload = await response.json()
    if (!response.ok || payload.error) {
      throw new Error(payload.error?.message ?? 'Request failed')
    }
    return payload.data
  }

  async function addModule(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setIsBusy(true)
    try {
      await callApi(`/api/v1/admin/courses/${courseId}/modules`, 'POST', {
        title: newModuleTitle,
      })
      setNewModuleTitle('')
      router.refresh()
      showToast('Module added.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add module')
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className="space-y-10">
      {modules.map((module) => (
        <Card key={module.id} className="fade-in">
          <p className="text-ink-soft">{module.title}</p>
          <div className="mt-4 space-y-4">
            {lessons
              .filter((lesson) => lesson.course_module_id === module.id)
              .map((lesson) => (
                <LessonRow key={lesson.id} lesson={lesson} quizzes={quizzes} questions={questions} />
              ))}
          </div>
          <AddLessonForm moduleId={module.id} />
        </Card>
      ))}

      {modules.length === 0 && <p className="text-stone">No modules yet.</p>}

      {error && (
        <p role="alert" className="text-sm text-claret">
          {error}
        </p>
      )}

      <form onSubmit={addModule} className="flex items-end gap-4">
        <div className="flex-1">
          <label htmlFor="newModuleTitle" className="eyebrow mb-1.5 block">
            New module
          </label>
          <Input
            id="newModuleTitle"
            required
            value={newModuleTitle}
            onChange={(event) => setNewModuleTitle(event.target.value)}
          />
        </div>
        <Button type="submit" isLoading={isBusy} loadingLabel="Adding…">
          Add module
        </Button>
      </form>
    </div>
  )
}

function LessonRow({
  lesson,
  quizzes,
  questions,
}: {
  lesson: LessonRow
  quizzes: QuizRow[]
  questions: QuestionRow[]
}) {
  const quiz = quizzes.find((q) => q.lesson_id === lesson.id)
  const quizQuestions = quiz ? questions.filter((q) => q.quiz_id === quiz.id) : []

  return (
    <div className="border-t hairline pt-4">
      <p className="text-ink-soft">{lesson.title}</p>
      {lesson.content?.text && <p className="mt-1 text-sm text-stone">{lesson.content.text}</p>}

      {quiz ? (
        <p className="eyebrow mt-3 text-stone">
          Quiz, pass at {quiz.passing_score}%, {quizQuestions.length} question
          {quizQuestions.length === 1 ? '' : 's'}
        </p>
      ) : (
        <AddQuizForm lessonId={lesson.id} />
      )}

      {quiz && <AddQuestionForm quizId={quiz.id} />}
    </div>
  )
}

function AddLessonForm({ moduleId }: { moduleId: string }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/v1/admin/modules/${moduleId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      })
      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Could not add lesson')
      }
      setTitle('')
      setBody('')
      router.refresh()
      showToast('Lesson added.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add lesson')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t hairline pt-4">
      <Input
        required
        placeholder="Lesson title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <Textarea
        required
        rows={2}
        placeholder="Lesson text"
        value={body}
        onChange={(event) => setBody(event.target.value)}
      />
      {error && (
        <p role="alert" className="text-sm text-claret">
          {error}
        </p>
      )}
      <Button type="submit" variant="subtle" tone="brass" isLoading={isSubmitting} loadingLabel="Adding…">
        Add lesson
      </Button>
    </form>
  )
}

function AddQuizForm({ lessonId }: { lessonId: string }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [passingScore, setPassingScore] = useState(70)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/v1/admin/lessons/${lessonId}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passingScore }),
      })
      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Could not add quiz')
      }
      router.refresh()
      showToast('Quiz added.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add quiz')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex items-end gap-3">
      <div>
        <label className="eyebrow mb-1 block">Passing score</label>
        <Input
          type="number"
          min={0}
          max={100}
          value={passingScore}
          onChange={(event) => setPassingScore(Number(event.target.value))}
          fullWidth={false}
        />
      </div>
      <Button type="submit" variant="subtle" tone="stone" isLoading={isSubmitting} loadingLabel="Adding…">
        Add quiz
      </Button>
      {error && (
        <p role="alert" className="text-sm text-claret">
          {error}
        </p>
      )}
    </form>
  )
}

function AddQuestionForm({ quizId }: { quizId: string }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [question, setQuestion] = useState('')
  const [optionsText, setOptionsText] = useState('')
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    const options = optionsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    if (options.length < 2) {
      setError('Add at least two options, one per line.')
      return
    }
    if (correctOptionIndex >= options.length) {
      setError('Correct option index is out of range.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/v1/admin/quizzes/${quizId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, options, correctOptionIndex }),
      })
      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Could not add question')
      }
      setQuestion('')
      setOptionsText('')
      setCorrectOptionIndex(0)
      router.refresh()
      showToast('Question added.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add question')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 border-t hairline pt-3">
      <Input
        required
        placeholder="Question"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
      />
      <Textarea
        required
        rows={3}
        placeholder={'Option A\nOption B\nOption C'}
        value={optionsText}
        onChange={(event) => setOptionsText(event.target.value)}
      />
      <div>
        <label className="eyebrow mb-1 block">Correct option (0-indexed)</label>
        <Input
          type="number"
          min={0}
          value={correctOptionIndex}
          onChange={(event) => setCorrectOptionIndex(Number(event.target.value))}
          fullWidth={false}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-claret">
          {error}
        </p>
      )}
      <Button type="submit" variant="subtle" tone="sage" isLoading={isSubmitting} loadingLabel="Adding…">
        Add question
      </Button>
    </form>
  )
}
