import Link from 'next/link'
import { createClient } from '@/services/supabase/server'
import { CreateCourseForm } from '@/components/create-course-form'
import { SimulationsList } from '@/components/simulations-list'
import { StatusBadge } from '@/components/ui/status-badge'

export default async function AdminContentPage() {
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, status, updated_at')
    .order('updated_at', { ascending: false })

  const { data: simulations } = await supabase
    .from('simulations')
    .select('id, title, status, type')
    .order('title', { ascending: true })

  return (
    <section className="fade-in">
      <p className="eyebrow mb-2">Content</p>
      <h1 className="display mb-10 text-2xl text-ink">Courses and simulations</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="border hairline bg-paper-raised p-6">
          <p className="eyebrow mb-4">Courses</p>

          <ol className="mb-8">
            {(courses ?? []).map((course) => (
              <li key={course.id} className="border-t hairline">
                <Link
                  href={`/admin/cms/courses/${course.id}`}
                  className="flex items-baseline justify-between gap-4 py-3 transition-colors hover:text-brass"
                >
                  <span className="text-ink-soft">{course.title}</span>
                  <StatusBadge status={course.status} />
                </Link>
              </li>
            ))}
            {(!courses || courses.length === 0) && (
              <li className="border-t hairline py-3 text-stone">No courses yet.</li>
            )}
            <li className="border-t hairline" aria-hidden="true" />
          </ol>

          <p className="eyebrow mb-4">New course</p>
          <CreateCourseForm />
        </div>

        <div className="border hairline bg-paper-raised p-6">
          <p className="eyebrow mb-4">Simulations</p>
          <SimulationsList simulations={simulations ?? []} />
          <Link
            href="/admin/cms/simulations/new"
            className="mt-6 inline-block border border-ink px-5 py-2 text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            New simulation
          </Link>
        </div>
      </div>
    </section>
  )
}
