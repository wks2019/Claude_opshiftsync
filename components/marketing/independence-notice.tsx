/** Single source of truth for the independence disclaimer.
 *
 *  Rendered in the site footer, on the About page, and on the Academy
 *  (training overview) page. The third-party names appear here and nowhere
 *  else in the product: naming them is what makes the disclaimer meaningful,
 *  so this string must not be paraphrased or split across surfaces. Change it
 *  in one place or not at all. */
export const INDEPENDENCE_NOTICE =
  'This platform is an independent luxury hospitality training tool. It is not affiliated with, endorsed by, certified by or approved by Forbes Travel Guide, LQA, Leading Quality Assurance or any third-party inspection body.'

interface IndependenceNoticeProps {
  className?: string
}

export function IndependenceNotice({ className = '' }: IndependenceNoticeProps) {
  return <p className={className}>{INDEPENDENCE_NOTICE}</p>
}
