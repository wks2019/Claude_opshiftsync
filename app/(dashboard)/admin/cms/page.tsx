import Link from 'next/link'
import { createClient } from '@/services/supabase/server'
import { CreateCourseForm } from '@/components/create-course-form'

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
    <section>
      <p className="eyebrow mb-2">Content</p>
      <h1 className="display mb-10 text-2xl text-ink">Courses and simulations</h1>

      <div className="grid gap-16 sm:grid-cols-2">
        <div>
          <p className="eyebrow mb-4">Courses</p>

          <ol className="mb-8">
            {(courses ?? []).map((course) => (
              <li key={course.id} className="border-t hairline py-3">
                <Link
                  href={`/admin/cms/courses/${course.id}`}
                  className="flex items-baseline justify-between gap-4 transition-colors hover:text-brass"
                >
                  <span className="text-ink-soft">{course.title}</span>
                  <span className="eyebrow shrink-0">{course.status}</span>
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

        <div>
          <p className="eyebrow mb-4">Simulations</p>
          <ol>
            {(simulations ?? []).map((sim) => (
              <li key={sim.id} className="border-t hairline py-3">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-ink-soft">{sim.title}</span>
                  <span className="eyebrow shrink-0">{sim.status}</span>
                </div>
              </li>
            ))}
            {(!simulations || simulations.length === 0) && (
              <li className="border-t hairline py-3 text-stone">No simulations yet.</li>
            )}
            <li className="border-t hairline" aria-hidden="true" />
          </ol>
          <p className="mt-4 text-sm text-stone">
            Simulation authoring (states, choices, scoring) is created via seed data for now;
            full visual authoring is a larger build planned separately.
          </p>
        </div>
      </div>
    </section>
  )
}
