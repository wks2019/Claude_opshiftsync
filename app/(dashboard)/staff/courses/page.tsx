import { createClient } from '@/services/supabase/server'

export default async function StaffCoursesPage() {
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, description')
    .eq('status', 'published')
    .order('title', { ascending: true })

  return (
    <section className="fade-in">
      <p className="eyebrow mb-2">Courses</p>
      <h1 className="display mb-8 text-2xl text-ink">Learning</h1>

      {!courses || courses.length === 0 ? (
        <p className="text-stone">
          No courses are published for your property yet. Check back once your administrator has
          added one.
        </p>
      ) : (
        <ol>
          {courses.map((course) => (
            <li key={course.id} className="border-t hairline py-4">
              <p className="text-ink-soft">{course.title}</p>
              {course.description && <p className="mt-1 text-sm text-stone">{course.description}</p>}
            </li>
          ))}
          <li className="border-t hairline" aria-hidden="true" />
        </ol>
      )}

      <p className="mt-10 text-sm text-stone">
        Lesson content, videos, and quizzes inside each course are on the way. This list shows
        what has been published so far.
      </p>
    </section>
  )
}
