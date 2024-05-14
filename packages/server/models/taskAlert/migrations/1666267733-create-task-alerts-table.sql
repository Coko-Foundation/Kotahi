CREATE TABLE task_alerts (
  id UUID PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX task_alerts_alerts_task_id_user_id_uniq_idx ON task_alerts(task_id, user_id);
CREATE INDEX task_alerts_task_id_idx ON task_alerts (task_id);
CREATE INDEX task_alerts_user_id_idx ON task_alerts (user_id);
