-- Service-only application schema. All functions are SECURITY INVOKER.
create type public.request_status as enum ('NEW','QUALIFIED','UNDER REVIEW','ENGINEERING REVIEW','SOLUTION READY','PROPOSAL','WON','LOST');
create sequence public.request_reference_seq;
create table public.admin_users (id uuid primary key references auth.users(id) on delete cascade, display_name text not null, role text not null default 'Admin' check (role in ('Admin','Engineer','Sales','Reviewer')), active boolean not null default true);
create table public.conversations (id uuid primary key default gen_random_uuid(), token_hash text not null unique, created_at timestamptz not null default now(), expires_at timestamptz not null default now()+interval '7 days', assessment jsonb, lease uuid, lease_until timestamptz, submitted boolean not null default false, turn_count integer not null default 0);
create table public.messages (id uuid primary key default gen_random_uuid(), sequence bigint generated always as identity, conversation_id uuid not null references public.conversations(id) on delete cascade, role text not null check(role in ('user','assistant')), content text not null check(length(content) between 1 and 4000), client_id uuid not null, created_at timestamptz not null default now(), unique(conversation_id,client_id,role));
create index messages_conversation_sequence_idx on public.messages(conversation_id,sequence);
create table public.submissions(id uuid primary key default gen_random_uuid(),conversation_id uuid not null unique references public.conversations(id),reference text not null unique,name text not null,email text not null,phone text not null,company text,request_type text not null,problem_summary text not null,desired_outcome text not null,status public.request_status not null default 'NEW',priority text not null default 'Unknown',potential_value text not null default 'Unknown',complexity text not null default 'Unknown',assigned_to uuid references public.admin_users(id),consultation_requested boolean not null default false,consent_at timestamptz not null default now(),consent_version text not null default 'privacy-v1',created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index submissions_status_created_idx on public.submissions(status,created_at desc);
create index submissions_assigned_idx on public.submissions(assigned_to);
create table public.assessments(submission_id uuid primary key references public.submissions(id) on delete cascade,data jsonb not null,created_at timestamptz not null default now());
create table public.opportunity_reports(submission_id uuid primary key references public.submissions(id) on delete cascade,data jsonb not null,created_at timestamptz not null default now());
create table public.engineering_briefs(submission_id uuid primary key references public.submissions(id) on delete cascade,data jsonb not null,created_at timestamptz not null default now());
create table public.internal_notes(id uuid primary key default gen_random_uuid(),submission_id uuid not null references public.submissions(id) on delete cascade,author_id uuid not null references public.admin_users(id),content text not null check(length(content) between 1 and 8000),created_at timestamptz not null default now());
create index internal_notes_submission_idx on public.internal_notes(submission_id,created_at);
create index internal_notes_author_idx on public.internal_notes(author_id);
create table public.status_history(id uuid primary key default gen_random_uuid(),submission_id uuid not null references public.submissions(id) on delete cascade,actor_id uuid references public.admin_users(id),old_status public.request_status,new_status public.request_status not null,created_at timestamptz not null default now());
create index status_history_submission_idx on public.status_history(submission_id,created_at);
create index status_history_actor_idx on public.status_history(actor_id);
create table public.notifications(id uuid primary key default gen_random_uuid(),submission_id uuid not null references public.submissions(id) on delete cascade,kind text not null check(kind in ('NEW_REQUEST','HIGH_VALUE','CONSULTATION')),read_at timestamptz,created_at timestamptz not null default now(),unique(submission_id,kind));
create index notifications_unread_idx on public.notifications(created_at desc) where read_at is null;
create table public.rate_limits(key text primary key,hits integer not null,reset_at timestamptz not null);
create index rate_limits_expiry_idx on public.rate_limits(reset_at);

create function public.take_rate_limit(p_key text,p_limit integer,p_window integer) returns boolean language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 delete from public.rate_limits where reset_at<now()-interval '1 day';
 insert into public.rate_limits as r(key,hits,reset_at) values(p_key,1,now()+make_interval(secs=>p_window))
 on conflict(key) do update set hits=case when r.reset_at<=now() then 1 else r.hits+1 end,reset_at=case when r.reset_at<=now() then now()+make_interval(secs=>p_window) else r.reset_at end returning hits into n;
 return n<=p_limit;
end;$$;

create function public.begin_turn(p_id uuid,p_client uuid,p_content text,p_lease uuid) returns text language plpgsql security invoker set search_path='' as $$
declare c public.conversations; existing text;
begin
 select * into c from public.conversations where id=p_id and expires_at>now() for update;
 if not found then raise exception 'Session unavailable'; end if;
 if c.submitted then return 'submitted';end if;
 if exists(select 1 from public.messages where conversation_id=p_id and client_id=p_client and role='assistant') then return 'done';end if;
 if c.lease_until>now() then return 'busy';end if;
 select content into existing from public.messages where conversation_id=p_id and client_id=p_client and role='user';
 if existing is not null and existing<>p_content then return 'conflict';end if;
 if existing is null then
   if c.turn_count>=24 then return 'limit';end if;
   if exists(select 1 from public.messages m where m.conversation_id=p_id and m.role='user' and not exists(select 1 from public.messages a where a.conversation_id=p_id and a.client_id=m.client_id and a.role='assistant')) then return 'conflict';end if;
   insert into public.messages(conversation_id,role,content,client_id) values(p_id,'user',p_content,p_client);
   update public.conversations set turn_count=turn_count+1,assessment=null where id=p_id;
 end if;
 update public.conversations set lease=p_lease,lease_until=now()+interval '90 seconds' where id=p_id;
 return 'ready';
end;$$;
create function public.finish_turn(p_id uuid,p_client uuid,p_lease uuid,p_content text,p_assessment jsonb) returns void language plpgsql security invoker set search_path='' as $$
begin
 perform 1 from public.conversations where id=p_id and lease=p_lease and not submitted for update;
 if not found then raise exception 'Lease unavailable';end if;
 insert into public.messages(conversation_id,role,content,client_id) values(p_id,'assistant',p_content,p_client);
 update public.conversations set assessment=p_assessment,lease=null,lease_until=null where id=p_id;
end;$$;
create function public.release_conversation(p_id uuid,p_lease uuid) returns void language sql security invoker set search_path='' as $$ update public.conversations set lease=null,lease_until=null where id=p_id and lease=p_lease; $$;
create function public.lock_submission(p_id uuid,p_lease uuid) returns boolean language plpgsql security invoker set search_path='' as $$
begin
 update public.conversations set lease=p_lease,lease_until=now()+interval '90 seconds' where id=p_id and expires_at>now() and not submitted and (lease_until is null or lease_until<=now()) and assessment->>'enough_information'='true' and not exists(select 1 from public.messages m where m.conversation_id=p_id and m.role='user' and not exists(select 1 from public.messages a where a.conversation_id=p_id and a.client_id=m.client_id and a.role='assistant'));
 return found;
end;$$;
create function public.submit_request(p_conversation uuid,p_lease uuid,p_contact jsonb,p_assessment jsonb,p_opportunity jsonb,p_brief jsonb) returns text language plpgsql security invoker set search_path='' as $$
declare c public.conversations;s uuid;r text;
begin
 select * into c from public.conversations where id=p_conversation and expires_at>now() for update;
 if not found then raise exception 'Session unavailable';end if;
 select reference into r from public.submissions where conversation_id=p_conversation;
 if r is not null then return r;end if;
 if c.lease is distinct from p_lease or c.assessment->>'enough_information' is distinct from 'true' then raise exception 'Not ready';end if;
 if c.assessment is distinct from p_assessment then raise exception 'Assessment changed';end if;
 if p_contact->>'consent' is distinct from 'true' then raise exception 'Consent required';end if;
 r:='ANM-'||to_char(now(),'YYYY')||'-'||lpad(nextval('public.request_reference_seq')::text,6,'0');
 insert into public.submissions(conversation_id,reference,name,email,phone,company,request_type,problem_summary,desired_outcome,priority,potential_value,complexity)
 values(p_conversation,r,p_contact->>'name',p_contact->>'email',p_contact->>'phone',nullif(p_contact->>'company',''),p_assessment->>'request_type',p_assessment->>'problem_summary',p_assessment->>'desired_outcome',p_opportunity->>'internal_priority',p_opportunity->>'potential_business_value',p_opportunity->>'implementation_complexity') returning id into s;
 insert into public.assessments values(s,p_assessment,now());
 insert into public.opportunity_reports values(s,p_opportunity,now());
 insert into public.engineering_briefs values(s,p_brief,now());
 insert into public.status_history(submission_id,new_status) values(s,'NEW');
 insert into public.notifications(submission_id,kind) values(s,'NEW_REQUEST');
 if p_opportunity->>'potential_business_value'='High' and p_opportunity->>'internal_priority' in ('High','Critical') then insert into public.notifications(submission_id,kind) values(s,'HIGH_VALUE');end if;
 update public.conversations set submitted=true,lease=null,lease_until=null where id=p_conversation;
 return r;
end;$$;
create function public.request_consultation(p_submission uuid) returns void language plpgsql security invoker set search_path='' as $$
begin
 update public.submissions set consultation_requested=true,updated_at=now() where id=p_submission;
 if not found then raise exception 'Request unavailable';end if;
 insert into public.notifications(submission_id,kind) values(p_submission,'CONSULTATION') on conflict(submission_id,kind) do nothing;
end;$$;
create function public.update_request_status(p_submission uuid,p_actor uuid,p_status public.request_status,p_assignee uuid) returns void language plpgsql security invoker set search_path='' as $$
declare prior public.request_status;
begin
 if not exists(select 1 from public.admin_users where id=p_actor and active) then raise exception 'Not authorized';end if;
 if p_assignee is not null and not exists(select 1 from public.admin_users where id=p_assignee and active) then raise exception 'Invalid assignee';end if;
 select status into prior from public.submissions where id=p_submission for update;
 if not found then raise exception 'Request unavailable';end if;
 update public.submissions set status=p_status,assigned_to=p_assignee,updated_at=now() where id=p_submission;
 if prior<>p_status then insert into public.status_history(submission_id,actor_id,old_status,new_status) values(p_submission,p_actor,prior,p_status);end if;
end;$$;

-- No public or authenticated direct access. Admin access is through verified server routes only.
do $$ declare t text;begin
 foreach t in array array['admin_users','conversations','messages','submissions','assessments','opportunity_reports','engineering_briefs','internal_notes','status_history','notifications','rate_limits'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from public,anon,authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 end loop;
end;$$;
revoke all on sequence public.request_reference_seq,public.messages_sequence_seq from public,anon,authenticated;
grant usage,select on sequence public.request_reference_seq,public.messages_sequence_seq to service_role;
revoke all on function public.take_rate_limit(text,integer,integer),public.begin_turn(uuid,uuid,text,uuid),public.finish_turn(uuid,uuid,uuid,text,jsonb),public.release_conversation(uuid,uuid),public.lock_submission(uuid,uuid),public.submit_request(uuid,uuid,jsonb,jsonb,jsonb,jsonb),public.request_consultation(uuid),public.update_request_status(uuid,uuid,public.request_status,uuid) from public,anon,authenticated;
grant execute on function public.take_rate_limit(text,integer,integer),public.begin_turn(uuid,uuid,text,uuid),public.finish_turn(uuid,uuid,uuid,text,jsonb),public.release_conversation(uuid,uuid),public.lock_submission(uuid,uuid),public.submit_request(uuid,uuid,jsonb,jsonb,jsonb,jsonb),public.request_consultation(uuid),public.update_request_status(uuid,uuid,public.request_status,uuid) to service_role;
