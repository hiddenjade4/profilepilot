-- ProfilePilot — Row Level Security check
--
-- Pretends to be a signed-in user who does NOT own any data, then tries to
-- read, change, delete, and forge other people's rows. Every attempt must
-- fail. Any change that sneaks through is rolled back, so this script never
-- alters real data.
--
-- How to run: Supabase dashboard → SQL Editor → New query → paste → Run.
-- Expected result: one row saying "PASS: …". Anything else is a failure.

-- Act as the app's "authenticated" role with a made-up user id, exactly the
-- way requests from the website reach the database.
select set_config('role', 'authenticated', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}',
  true
);
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);

do $$
declare
  n int;
begin
  -- Sanity check: we really are the fake user now.
  if auth.uid() <> '11111111-1111-1111-1111-111111111111'::uuid then
    raise exception 'SETUP ERROR: could not impersonate the test user';
  end if;

  -- 1. Reading
  select count(*) into n from public.career_questionnaires;
  if n <> 0 then
    raise exception 'FAIL: another user can READ % questionnaire(s)', n;
  end if;

  select count(*) into n from public.profiles;
  if n <> 0 then
    raise exception 'FAIL: another user can READ % profile(s)', n;
  end if;

  -- 2. Changing and deleting. Wrapped so that, even if the policy were
  -- broken, the change is undone immediately afterwards.
  begin
    with changed as (
      update public.career_questionnaires set answers = '{}'::jsonb returning 1
    ) select count(*) into n from changed;
    raise exception using errcode = 'P0001', message = 'undo';
  exception when sqlstate 'P0001' then null;
  end;
  if n <> 0 then
    raise exception 'FAIL: another user can CHANGE % questionnaire(s)', n;
  end if;

  begin
    with removed as (
      delete from public.career_questionnaires returning 1
    ) select count(*) into n from removed;
    raise exception using errcode = 'P0001', message = 'undo';
  exception when sqlstate 'P0001' then null;
  end;
  if n <> 0 then
    raise exception 'FAIL: another user can DELETE % questionnaire(s)', n;
  end if;

  begin
    with changed as (
      update public.profiles set display_name = 'hacked' returning 1
    ) select count(*) into n from changed;
    raise exception using errcode = 'P0001', message = 'undo';
  exception when sqlstate 'P0001' then null;
  end;
  if n <> 0 then
    raise exception 'FAIL: another user can CHANGE % profile(s)', n;
  end if;

  -- 3. Forging: create a questionnaire that claims to belong to someone else.
  begin
    insert into public.career_questionnaires (user_id)
    values ('22222222-2222-2222-2222-222222222222');
    raise exception using errcode = 'P0002', message = 'forged';
  exception
    when insufficient_privilege then null; -- blocked by RLS: good
    when sqlstate 'P0002' then
      raise exception 'FAIL: another user can CREATE rows for someone else';
    when others then
      raise exception 'FAIL: insert was not blocked by security rules (got: %)', sqlerrm;
  end;

  -- 4. Resumes (added in migration 2) — skipped if not applied yet.
  if to_regclass('public.resumes') is not null then
    select count(*) into n from public.resumes;
    if n <> 0 then
      raise exception 'FAIL: another user can READ % resume record(s)', n;
    end if;

    select count(*) into n from storage.objects where bucket_id = 'resumes';
    if n <> 0 then
      raise exception 'FAIL: another user can SEE % resume file(s)', n;
    end if;

    begin
      with removed as (
        delete from public.resumes returning 1
      ) select count(*) into n from removed;
      raise exception using errcode = 'P0001', message = 'undo';
    exception when sqlstate 'P0001' then null;
    end;
    if n <> 0 then
      raise exception 'FAIL: another user can DELETE % resume record(s)', n;
    end if;

    begin
      with removed as (
        delete from storage.objects where bucket_id = 'resumes' returning 1
      ) select count(*) into n from removed;
      raise exception using errcode = 'P0001', message = 'undo';
    exception when sqlstate 'P0001' then null;
    end;
    if n <> 0 then
      raise exception 'FAIL: another user can DELETE % resume file(s)', n;
    end if;

    -- Put a file into someone else's folder.
    begin
      insert into storage.objects (bucket_id, name)
      values ('resumes', '22222222-2222-2222-2222-222222222222/forged.pdf');
      raise exception using errcode = 'P0002', message = 'forged';
    exception
      when insufficient_privilege then null;
      when sqlstate 'P0002' then
        raise exception 'FAIL: another user can UPLOAD into someone else''s folder';
      when others then
        raise exception 'FAIL: file upload was not blocked by security rules (got: %)', sqlerrm;
    end;
  end if;
end $$;

select 'PASS: a different signed-in user could not read, change, delete, or forge anyone else''s data or files.' as result;
