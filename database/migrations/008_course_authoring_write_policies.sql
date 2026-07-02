-- =============================================================================
-- CHOSEN WORKFLOW LXP - COURSE AUTHORING WRITE POLICIES
-- Migration: 008_course_authoring_write_policies.sql
--
-- 001_initial_schema.sql added select-only policies for course_modules,
-- lessons, quizzes, and quiz_questions. Same recurring gap documented in
-- 006_sop_write_policies.sql, found again while building the course
-- authoring UI (RC1 Section 4.1). No update/insert path existed for any
-- of these four tables before this migration.
-- =============================================================================

create policy course_modules_insert on course_modules
  for insert with check (
    course_id in (
      select id from courses
      where hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
    )
  );

create policy course_modules_update on course_modules
  for update using (
    course_id in (
      select id from courses
      where hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
    )
  );

create policy course_modules_delete on course_modules
  for delete using (
    course_id in (
      select id from courses
      where hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
    )
  );

create policy lessons_insert on lessons
  for insert with check (
    course_module_id in (
      select cm.id from course_modules cm
      join courses c on c.id = cm.course_id
      where c.hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
    )
  );

create policy lessons_update on lessons
  for update using (
    course_module_id in (
      select cm.id from course_modules cm
      join courses c on c.id = cm.course_id
      where c.hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
    )
  );

create policy lessons_delete on lessons
  for delete using (
    course_module_id in (
      select cm.id from course_modules cm
      join courses c on c.id = cm.course_id
      where c.hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
    )
  );

create policy quizzes_insert on quizzes
  for insert with check (
    lesson_id in (
      select l.id from lessons l
      join course_modules cm on cm.id = l.course_module_id
      join courses c on c.id = cm.course_id
      where c.hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
    )
  );

create policy quizzes_update on quizzes
  for update using (
    lesson_id in (
      select l.id from lessons l
      join course_modules cm on cm.id = l.course_module_id
      join courses c on c.id = cm.course_id
      where c.hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
    )
  );

create policy quiz_questions_insert on quiz_questions
  for insert with check (
    quiz_id in (
      select q.id from quizzes q
      join lessons l on l.id = q.lesson_id
      join course_modules cm on cm.id = l.course_module_id
      join courses c on c.id = cm.course_id
      where c.hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
    )
  );

create policy quiz_questions_update on quiz_questions
  for update using (
    quiz_id in (
      select q.id from quizzes q
      join lessons l on l.id = q.lesson_id
      join course_modules cm on cm.id = l.course_module_id
      join courses c on c.id = cm.course_id
      where c.hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
    )
  );

create policy quiz_questions_delete on quiz_questions
  for delete using (
    quiz_id in (
      select q.id from quizzes q
      join lessons l on l.id = q.lesson_id
      join course_modules cm on cm.id = l.course_module_id
      join courses c on c.id = cm.course_id
      where c.hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
    )
  );
