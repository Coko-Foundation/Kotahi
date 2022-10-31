CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,
--  task_list_id uuid NOT NULL REFERENCES task_lists(id) ON DELETE CASCADE,
  manuscript_id uuid REFERENCES manuscripts(id) ON DELETE CASCADE,
  title TEXT,
  assignee_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  default_duration_days INTEGER,
  due_date TIMESTAMP WITH TIME ZONE,
  reminder_period_days INTEGER,
  status TEXT,
  sequence_index INTEGER NOT NULL
);

CREATE INDEX tasks_manuscript_id_idx ON tasks (manuscript_id);
CREATE INDEX tasks_user_id_idx ON tasks (assignee_user_id);
