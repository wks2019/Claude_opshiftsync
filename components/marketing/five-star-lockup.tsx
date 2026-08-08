/** The 5STAR lockup, typeset rather than served as an image.
 *
 *  Marcellus over a brass rule over a mono subline, the same construction as
 *  the Chosen Workflow masthead, because they should read as siblings. Setting
 *  it as text means it is sharp at every pixel density, costs nothing over the
 *  wire, scales with the type system, and is readable by anything that reads
 *  text. The gold star crest it replaces was a raster with metallic gradients,
 *  which breaks every rule in the palette. */
export function FiveStarLockup({
  subline = 'In-room dining ordering',
  size = 'lg',
  inverse = false,
}: {
  subline?: string | null
  size?: 'sm' | 'lg'
  inverse?: boolean
}) {
  const wordmark = size === 'lg' ? 'text-4xl sm:text-5xl' : 'text-2xl'
  const rule = size === 'lg' ? 'w-24' : 'w-14'

  return (
    <div>
      <p
        className={`display ${wordmark} leading-none tracking-[0.1em] ${
          inverse ? 'text-paper' : 'text-ink'
        }`}
      >
        5STAR
      </p>
      {subline && (
        <>
          <div className={`${rule} mt-3 h-[3px] bg-brass`} aria-hidden="true" />
          <p className={`eyebrow mt-3 ${inverse ? 'text-paper/60' : ''}`}>{subline}</p>
        </>
      )}
    </div>
  )
}
