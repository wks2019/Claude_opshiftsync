import { notFound } from 'next/navigation'
import { createClient } from '@/services/supabase/server'
import { CourseEditor } from '@/components/course-editor'
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

  return (
    <section className="max-w-xl">
      <p className="eyebrow mb-2">Course</p>
      <h1 className="display mb-10 text-2xl text-ink">{course.title}</h1>

      <CourseEditor
        courseId={course.id}
        initialTitle={course.title}
        initialDescription={course.description ?? ''}
        initialStatus={course.status}
      />

      {course.status === 'published' && (
        <div className="mt-16 border-t hairline pt-8">
          <p className="eyebrow mb-4">Issue certificate</p>
          <IssueCertificateForm courseId={course.id} />
        </div>
      )}
    </section>
  )
}
