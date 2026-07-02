-- =============================================================================
-- CHOSEN WORKFLOW LXP - SEED: IN-ROOM DINING REFERENCE SIMULATION
-- Seed: seed_in_room_dining.sql
-- Depends on: 001_initial_schema.sql
-- Replace :hotel_group_id with the target tenant before running,
-- or run via the seed script which injects it.
-- =============================================================================

-- Deterministic UUIDs for the reference content (b1 = simulation, a1 = states, c1 = choices)

insert into simulations (id, hotel_group_id, title, type, status, difficulty, generated_by_ai)
values (
  'b1000000-0000-4000-8000-000000000001',
  :'hotel_group_id',
  'In-Room Dining: The Gluten-Free Breakfast',
  'in_room_dining',
  'published',
  'standard',
  false
);

insert into simulation_states (id, simulation_id, name, guest_context, is_terminal) values
('a1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'The call',
 '{"mood":"neutral","request":"Room 412 is calling In-Room Dining at 07:12.","backstory":"Mrs Ashworth, a returning guest on her third stay. Profile notes a preference for window-side table setup."}', false),
('a1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000001', 'The order and the allergy',
 '{"mood":"neutral","request":"Mrs Ashworth orders eggs Benedict, fruit, and coffee, then adds: Do remember I have a gluten allergy, the muffin will need replacing."}', false),
('a1000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000001', 'Allergy challenge',
 '{"mood":"frustrated","request":"Mrs Ashworth presses: You did note my gluten allergy, yes?"}', false),
('a1000000-0000-4000-8000-000000000004', 'b1000000-0000-4000-8000-000000000001', 'The recommendation',
 '{"mood":"pleased","request":"The order is confirmed. A natural pause opens before closing the call."}', false),
('a1000000-0000-4000-8000-000000000005', 'b1000000-0000-4000-8000-000000000001', 'The time commitment',
 '{"mood":"pleased","request":"Mrs Ashworth asks: How long will it be? I have a call at eight."}', false),
('a1000000-0000-4000-8000-000000000006', 'b1000000-0000-4000-8000-000000000001', 'The delivery',
 '{"mood":"pleased","request":"You arrive at Room 412 with the trolley at 07:34."}', false),
('a1000000-0000-4000-8000-000000000007', 'b1000000-0000-4000-8000-000000000001', 'The close',
 '{"mood":"pleased","request":"The table is set. Mrs Ashworth is seated."}', false),
('a1000000-0000-4000-8000-000000000008', 'b1000000-0000-4000-8000-000000000001', 'Service complete',
 '{"mood":"pleased","request":"The interaction has concluded."}', true),
('a1000000-0000-4000-8000-000000000009', 'b1000000-0000-4000-8000-000000000001', 'Allergy incident',
 '{"mood":"angry","request":"A guest safety incident has occurred. The scenario ends here: allergy confirmation is never optional."}', true);

update simulations
set entry_state_id = 'a1000000-0000-4000-8000-000000000001'
where id = 'b1000000-0000-4000-8000-000000000001';

insert into simulation_choices
(id, state_id, label, next_state_id, forbes_delta, lqa_delta, sop_delta, ei_delta, guest_reaction) values

-- s1: The call
('c1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001',
 'Answer within three rings: "Good morning, In-Room Dining, this is Daniel speaking. How may I assist you, Mrs Ashworth?"',
 'a1000000-0000-4000-8000-000000000002', 18, 16, 16, 16,
 '{"dialogue":"Oh, good morning Daniel. How lovely that you know it is me.","moodShift":"pleased"}'),
('c1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001',
 'Answer promptly: "In-Room Dining, good morning."',
 'a1000000-0000-4000-8000-000000000002', 10, 8, 10, 6,
 '{"dialogue":"Good morning. I would like to order breakfast, please.","moodShift":"neutral"}'),
('c1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001',
 'Answer after six rings: "Room service."',
 'a1000000-0000-4000-8000-000000000002', 2, 0, 2, 0,
 '{"dialogue":"Finally. I was about to hang up.","moodShift":"impatient"}'),

-- s2: The order and the allergy
('c1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000002',
 'Repeat the full order back, confirm the gluten allergy explicitly, state it will be flagged to the kitchen, and offer the gluten-free muffin alternative.',
 'a1000000-0000-4000-8000-000000000004', 18, 18, 20, 18,
 '{"dialogue":"Thank you for taking that seriously. The gluten-free muffin will be perfect.","moodShift":"pleased"}'),
('c1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000002',
 'Note the order quickly and move on: "Certainly, anything else?"',
 'a1000000-0000-4000-8000-000000000003', 6, 4, 2, 4,
 '{"dialogue":"Hold on. Did you actually note the allergy? This matters.","moodShift":"frustrated"}'),

-- s2b: Allergy challenge
('c1000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000003',
 'Apologise sincerely, read the full order back including the allergy, and confirm it is being flagged to the kitchen and the chef personally.',
 'a1000000-0000-4000-8000-000000000004', 8, 8, 12, 10,
 '{"dialogue":"Alright. Thank you for double-checking rather than guessing.","moodShift":"neutral"}'),
('c1000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000003',
 'Reassure her without verifying: "Yes of course, all noted."',
 'a1000000-0000-4000-8000-000000000009', 0, 0, 0, 0,
 '{"dialogue":"The muffin that arrived was not gluten-free. Mrs Ashworth had a reaction and the duty manager has been called.","moodShift":"angry"}'),

-- s3: The recommendation
('c1000000-0000-4000-8000-000000000008', 'a1000000-0000-4000-8000-000000000004',
 'Offer a personalised recommendation: "May I suggest our fresh Valencia orange juice this morning, Mrs Ashworth? It pairs beautifully with the Benedict."',
 'a1000000-0000-4000-8000-000000000005', 14, 16, 14, 16,
 '{"dialogue":"You know, why not. Do add the juice.","moodShift":"delighted"}'),
('c1000000-0000-4000-8000-000000000009', 'a1000000-0000-4000-8000-000000000004',
 'Close the order without any recommendation.',
 'a1000000-0000-4000-8000-000000000005', 6, 8, 6, 4,
 '{"dialogue":"That will be all then.","moodShift":"neutral"}'),

-- s4: The time commitment
('c1000000-0000-4000-8000-000000000010', 'a1000000-0000-4000-8000-000000000005',
 'Quote a specific, achievable time with a margin: "Twenty-five minutes, Mrs Ashworth, so with you comfortably before half past seven."',
 'a1000000-0000-4000-8000-000000000006', 16, 16, 16, 14,
 '{"dialogue":"Perfect, that gives me plenty of time.","moodShift":"pleased"}'),
('c1000000-0000-4000-8000-000000000011', 'a1000000-0000-4000-8000-000000000005',
 'Give a vague answer: "It should not be too long."',
 'a1000000-0000-4000-8000-000000000006', 4, 4, 4, 2,
 '{"dialogue":"That is not really an answer. Please be quick.","moodShift":"impatient"}'),

-- s5: The delivery
('c1000000-0000-4000-8000-000000000012', 'a1000000-0000-4000-8000-000000000006',
 'Knock, announce "In-Room Dining", greet by name, ask where she would like the table, set up by the window per her profile, present each dish, and confirm the muffin is the gluten-free bake.',
 'a1000000-0000-4000-8000-000000000007', 18, 18, 18, 18,
 '{"dialogue":"By the window, exactly as I like it. And thank you for confirming the muffin.","moodShift":"delighted"}'),
('c1000000-0000-4000-8000-000000000013', 'a1000000-0000-4000-8000-000000000006',
 'Hand the tray over at the door: "Your breakfast, enjoy."',
 'a1000000-0000-4000-8000-000000000007', 6, 6, 4, 4,
 '{"dialogue":"I see. I shall carry it myself then.","moodShift":"frustrated"}'),

-- s6: The close
('c1000000-0000-4000-8000-000000000014', 'a1000000-0000-4000-8000-000000000007',
 'Ask if there is anything further, advise when the table will be cleared, and close warmly: "Enjoy your breakfast, Mrs Ashworth, and best of luck with your call."',
 'a1000000-0000-4000-8000-000000000008', 16, 16, 16, 18,
 '{"dialogue":"How thoughtful of you to remember the call. Thank you, Daniel.","moodShift":"delighted"}'),
('c1000000-0000-4000-8000-000000000015', 'a1000000-0000-4000-8000-000000000007',
 'Leave with a quick "Enjoy" on the way out.',
 'a1000000-0000-4000-8000-000000000008', 4, 4, 4, 4,
 '{"dialogue":"Hm. Well, at least the food is here.","moodShift":"neutral"}');
