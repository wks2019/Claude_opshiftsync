import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/services/supabase/server'
import { CourseEditor } from '@/components/course-editor'
import { CourseContentEditor } from '@/components/course-content-editor'
import { IssueCertificateForm } from '@/components/issue-certificate-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, description, status')
    .eq('id', id)
    .single()

  if (!course) {
    notFound()
  }

  const { data: modules } = await supabase
    .from('course_modules')
    .select('id, title, sequence')
    .eq('course_id', id)
    .order('sequence', { ascending: true })

  const moduleIds = (modules ?? []).map((m) => m.id)

  const { data: lessons } =
    moduleIds.length > 0
      ? await supabase
          .from('lessons')
          .select('id, course_module_id, title, content, sequence')
          .in('course_module_id', moduleIds)
          .order('sequence', { ascending: true })
      : { data: [] }

  const lessonIds = (lessons ?? []).map((l) => l.id)

  const { data: quizzes } =
    lessonIds.length > 0
      ? await supabase
          .from('quizzes')
          .select('id, lesson_id, passing_score')
          .in('lesson_id', lessonIds)
      : { data: [] }

  const quizIds = (quizzes ?? []).map((q) => q.id)

  const { data: questions } =
    quizIds.length > 0
      ? await supabase
          .from('quiz_questions')
          .select('id, quiz_id, question, options, correct_option_index, sequence')
          .in('quiz_id', quizIds)
          .order('sequence', { ascending: true })
      : { data: [] }

  return (
    <section className="max-w-xl">
      <Link
        href="/admin/cms"
        className="eyebrow mb-6 inline-block text-stone transition-colors hover:text-ink"
      >
        ← Content
      </Link>
      <p className="eyebrow mb-2">Course</p>
      <h1 className="display mb-10 text-2xl text-ink">{course.title}</h1>

      <CourseEditor
        courseId={course.id}
        initialTitle={course.title}
        initialDescription={course.description ?? ''}
        initialStatus={course.status}
      />

      <div className="mt-16 border-t hairline pt-8">
        <p className="eyebrow mb-6">Modules and lessons</p>
        <CourseContentEditor
          courseId={course.id}
          modules={modules ?? []}
          lessons={lessons ?? []}
          quizzes={quizzes ?? []}
          questions={questions ?? []}
        />
      </div>

      {course.status === 'published' && (
        <div className="mt-16 border-t hairline pt-8">
          <p className="eyebrow mb-4">Issue certificate</p>
          <IssueCertificateForm courseId={course.id} />
        </div>
      )}
    </section>
  )
}
