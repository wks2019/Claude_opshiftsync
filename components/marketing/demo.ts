/** The live 5STAR demo.
 *
 *  One place, because the URL is going to change. The app currently sits on a
 *  Lovable subdomain; it moves to a subdomain of the Chosen Workflow apex once
 *  the domain is wired up, and at that point the session will carry across from
 *  the platform. Until then this is a standalone demo and nothing more.
 *
 *  The credentials are seed data, not real guests. Guest entry checks the room
 *  number against the surname on the reservation, so a visitor who clicks
 *  through without them hits a form they cannot pass. Publishing the demo room
 *  alongside the link is the difference between a demo and a dead end. */
export const FIVE_STAR_DEMO = {
  url: 'https://room-service-order.lovable.app',
  room: '204',
  surname: 'Whitmore',
  property: 'The Marchmont',
} as const
