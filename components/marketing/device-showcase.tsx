import Image from 'next/image'

/** Phone-over-tablet composition for the 5STAR hero.
 *
 *  Both images are real screenshots of the live application, signed in as
 *  the published demo guest (Room 204, Whitmore, The Marchmont), not a
 *  mockup or stock photography. Anyone who doubts the picture can open the
 *  same demo and see the same menu, which is the whole argument of the "Try
 *  it yourself" section further down this page: a working property, not a
 *  render of one.
 *
 *  The frame is a flat hairline border and a soft shadow, not glass or a
 *  gloss highlight, matching the rest of the palette's refusal of gradients
 *  and specular effects.
 *
 *  The tablet is inset from the left so the phone has somewhere to sit: at
 *  full width the phone overlapped the tablet's own header and made both
 *  unreadable. Phone width is held low deliberately, since the phone crop is
 *  the taller aspect and will dominate the composition if given more. */
export function DeviceShowcase() {
  return (
    <div className="relative">
      <div className="ml-14 overflow-hidden rounded-[1.75rem] border border-ink/15 shadow-[0_24px_60px_-24px_rgb(16_32_27_/_0.35)] sm:ml-20">
        <Image
          src="/images/5star/guest-menu-tablet.png"
          alt="The 5STAR menu, All Day service, Starters category, showing the Oysters dish at £34.00"
          width={834}
          height={700}
          className="h-auto w-full"
          priority
        />
      </div>

      <div className="absolute -bottom-10 left-0 w-[26%] min-w-[7rem] overflow-hidden rounded-[1.25rem] border-4 border-ink bg-ink shadow-[0_20px_44px_-16px_rgb(16_32_27_/_0.45)] sm:w-[24%]">
        <Image
          src="/images/5star/guest-menu-phone.png"
          alt="The same menu on a phone, signed in as Room 204, Whitmore"
          width={390}
          height={610}
          className="h-auto w-full"
          priority
        />
      </div>
    </div>
  )
}
