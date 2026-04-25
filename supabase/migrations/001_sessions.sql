create table sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  student_name text not null,
  grade int not null,
  summary text,
  parent_note text,
  topics_covered text[],
  message_count int,
  i_dont_know_count int,
  parent_rating text check (parent_rating in ('up', 'down'))
);
