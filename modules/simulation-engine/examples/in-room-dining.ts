import type { SimulationDefinition } from '../engine/types'

/**
 * Full reference simulation: "The Gluten-Free Breakfast".
 * Six decision points across the Forbes/LQA In-Room Dining cycle.
 * Optimal path scores exactly 100 in every dimension.
 * The allergy bluff path terminates in an incident.
 */
export const inRoomDiningExample: SimulationDefinition = {
  id: 'b1000000-0000-4000-8000-000000000001',
  title: 'In-Room Dining: The Gluten-Free Breakfast',
  type: 'in_room_dining',
  difficulty: 'standard',
  entryStateId: 's1_call',
  states: {
    s1_call: {
      id: 's1_call',
      name: 'The call',
      guestContext: {
        mood: 'neutral',
        request: 'Room 412 is calling In-Room Dining at 07:12.',
        backstory:
          'Mrs Ashworth, a returning guest on her third stay. Profile notes a preference for window-side table setup.',
      },
      isTerminal: false,
      choices: [
        {
          id: 'c1_warm',
          label:
            'Answer within three rings: "Good morning, In-Room Dining, this is Daniel speaking. How may I assist you, Mrs Ashworth?"',
          nextStateId: 's2_order',
          deltas: { forbes: 18, lqa: 16, sop: 16, ei: 16 },
          guestReaction: {
            dialogue: 'Oh, good morning Daniel. How lovely that you know it is me.',
            moodShift: 'pleased',
          },
        },
        {
          id: 'c1_adequate',
          label: 'Answer promptly: "In-Room Dining, good morning."',
          nextStateId: 's2_order',
          deltas: { forbes: 10, lqa: 8, sop: 10, ei: 6 },
          guestReaction: {
            dialogue: 'Good morning. I would like to order breakfast, please.',
            moodShift: 'neutral',
          },
        },
        {
          id: 'c1_flat',
          label: 'Answer after six rings: "Room service."',
          nextStateId: 's2_order',
          deltas: { forbes: 2, lqa: 0, sop: 2, ei: 0 },
          guestReaction: {
            dialogue: 'Finally. I was about to hang up.',
            moodShift: 'impatient',
          },
        },
      ],
    },

    s2_order: {
      id: 's2_order',
      name: 'The order and the allergy',
      guestContext: {
        mood: 'neutral',
        request:
          'Mrs Ashworth orders eggs Benedict, fruit, and coffee, then adds: "Do remember I have a gluten allergy, the muffin will need replacing."',
      },
      isTerminal: false,
      choices: [
        {
          id: 'c2_confirm',
          label:
            'Repeat the full order back, confirm the gluten allergy explicitly, state it will be flagged to the kitchen, and offer the gluten-free muffin alternative.',
          nextStateId: 's3_upsell',
          deltas: { forbes: 18, lqa: 18, sop: 20, ei: 18 },
          guestReaction: {
            dialogue: 'Thank you for taking that seriously. The gluten-free muffin will be perfect.',
            moodShift: 'pleased',
          },
        },
        {
          id: 'c2_rush',
          label: 'Note the order quickly and move on: "Certainly, anything else?"',
          nextStateId: 's2b_allergy_check',
          deltas: { forbes: 6, lqa: 4, sop: 2, ei: 4 },
          guestReaction: {
            dialogue: 'Hold on. Did you actually note the allergy? This matters.',
            moodShift: 'frustrated',
          },
        },
      ],
    },

    s2b_allergy_check: {
      id: 's2b_allergy_check',
      name: 'Allergy challenge',
      guestContext: {
        mood: 'frustrated',
        request: 'Mrs Ashworth presses: "You did note my gluten allergy, yes?"',
      },
      isTerminal: false,
      choices: [
        {
          id: 'c2b_recover',
          label:
            'Apologise sincerely, read the full order back including the allergy, and confirm it is being flagged to the kitchen and the chef personally.',
          nextStateId: 's3_upsell',
          deltas: { forbes: 8, lqa: 8, sop: 12, ei: 10 },
          guestReaction: {
            dialogue: 'Alright. Thank you for double-checking rather than guessing.',
            moodShift: 'neutral',
          },
        },
        {
          id: 'c2b_bluff',
          label: 'Reassure her without verifying: "Yes of course, all noted."',
          nextStateId: 't_incident',
          deltas: { forbes: 0, lqa: 0, sop: 0, ei: 0 },
          guestReaction: {
            dialogue:
              'The muffin that arrived was not gluten-free. Mrs Ashworth had a reaction and the duty manager has been called.',
            moodShift: 'angry',
          },
        },
      ],
    },

    s3_upsell: {
      id: 's3_upsell',
      name: 'The recommendation',
      guestContext: {
        mood: 'pleased',
        request: 'The order is confirmed. A natural pause opens before closing the call.',
      },
      isTerminal: false,
      choices: [
        {
          id: 'c3_personal',
          label:
            'Offer a personalised recommendation: "May I suggest our fresh Valencia orange juice this morning, Mrs Ashworth? It pairs beautifully with the Benedict."',
          nextStateId: 's4_time',
          deltas: { forbes: 14, lqa: 16, sop: 14, ei: 16 },
          guestReaction: {
            dialogue: 'You know, why not. Do add the juice.',
            moodShift: 'delighted',
          },
        },
        {
          id: 'c3_skip',
          label: 'Close the order without any recommendation.',
          nextStateId: 's4_time',
          deltas: { forbes: 6, lqa: 8, sop: 6, ei: 4 },
          guestReaction: {
            dialogue: 'That will be all then.',
            moodShift: 'neutral',
          },
        },
      ],
    },

    s4_time: {
      id: 's4_time',
      name: 'The time commitment',
      guestContext: {
        mood: 'pleased',
        request: 'Mrs Ashworth asks: "How long will it be? I have a call at eight."',
      },
      isTerminal: false,
      choices: [
        {
          id: 'c4_precise',
          label:
            'Quote a specific, achievable time with a margin: "Twenty-five minutes, Mrs Ashworth, so with you comfortably before half past seven."',
          nextStateId: 's5_delivery',
          deltas: { forbes: 16, lqa: 16, sop: 16, ei: 14 },
          guestReaction: {
            dialogue: 'Perfect, that gives me plenty of time.',
            moodShift: 'pleased',
          },
        },
        {
          id: 'c4_vague',
          label: 'Give a vague answer: "It should not be too long."',
          nextStateId: 's5_delivery',
          deltas: { forbes: 4, lqa: 4, sop: 4, ei: 2 },
          guestReaction: {
            dialogue: 'That is not really an answer. Please be quick.',
            moodShift: 'impatient',
          },
        },
      ],
    },

    s5_delivery: {
      id: 's5_delivery',
      name: 'The delivery',
      guestContext: {
        mood: 'pleased',
        request: 'You arrive at Room 412 with the trolley at 07:34.',
      },
      isTerminal: false,
      choices: [
        {
          id: 'c5_full',
          label:
            'Knock, announce "In-Room Dining", greet by name, ask where she would like the table, set up by the window per her profile, present each dish, and confirm the muffin is the gluten-free bake.',
          nextStateId: 's6_close',
          deltas: { forbes: 18, lqa: 18, sop: 18, ei: 18 },
          guestReaction: {
            dialogue: 'By the window, exactly as I like it. And thank you for confirming the muffin.',
            moodShift: 'delighted',
          },
        },
        {
          id: 'c5_door',
          label: 'Hand the tray over at the door: "Your breakfast, enjoy."',
          nextStateId: 's6_close',
          deltas: { forbes: 6, lqa: 6, sop: 4, ei: 4 },
          guestReaction: {
            dialogue: 'I see. I shall carry it myself then.',
            moodShift: 'frustrated',
          },
        },
      ],
    },

    s6_close: {
      id: 's6_close',
      name: 'The close',
      guestContext: {
        mood: 'pleased',
        request: 'The table is set. Mrs Ashworth is seated.',
      },
      isTerminal: false,
      choices: [
        {
          id: 'c6_warm',
          label:
            'Ask if there is anything further, advise when the table will be cleared, and close warmly: "Enjoy your breakfast, Mrs Ashworth, and best of luck with your call."',
          nextStateId: 't_complete',
          deltas: { forbes: 16, lqa: 16, sop: 16, ei: 18 },
          guestReaction: {
            dialogue: 'How thoughtful of you to remember the call. Thank you, Daniel.',
            moodShift: 'delighted',
          },
        },
        {
          id: 'c6_abrupt',
          label: 'Leave with a quick "Enjoy" on the way out.',
          nextStateId: 't_complete',
          deltas: { forbes: 4, lqa: 4, sop: 4, ei: 4 },
          guestReaction: {
            dialogue: 'Hm. Well, at least the food is here.',
            moodShift: 'neutral',
          },
        },
      ],
    },

    t_complete: {
      id: 't_complete',
      name: 'Service complete',
      guestContext: {
        mood: 'pleased',
        request: 'The interaction has concluded.',
      },
      isTerminal: true,
      choices: [],
    },

    t_incident: {
      id: 't_incident',
      name: 'Allergy incident',
      guestContext: {
        mood: 'angry',
        request:
          'A guest safety incident has occurred. The scenario ends here: allergy confirmation is never optional.',
      },
      isTerminal: true,
      choices: [],
    },
  },
}
