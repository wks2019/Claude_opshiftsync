interface PageHeaderProps {
  eyebrow: string
  title: string
  standfirst: string
}

/** Opening block for every page in the (marketing) group. Left aligned,
 *  in contrast to the centred home hero, so a section page never reads
 *  like a second landing page. */
export function PageHeader({ eyebrow, title, standfirst }: PageHeaderProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 pt-20">
      <p className="eyebrow mb-4">{eyebrow}</p>
      <h1 className="display max-w-3xl text-3xl leading-tight text-ink sm:text-4xl">{title}</h1>
      <p className="mt-6 max-w-2xl text-lg text-ink-soft">{standfirst}</p>
    </section>
  )
}
