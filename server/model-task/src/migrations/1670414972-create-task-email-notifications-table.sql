CREATE TABLE task_email_notifications (
  id UUID PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  recipient_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  recipient_type TEXT,
  recipient_name TEXT, 
  recipient_email TEXT, 
  notification_elapsed_days INTEGER,
  email_template_key TEXT, 
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX task_email_notifications_task_id_recipient_user_id_uniq_idx ON task_email_notifications(task_id, recipient_user_id);
CREATE INDEX task_email_notifications_task_id_idx ON task_email_notifications (task_id);
CREATE INDEX task_email_notifications_recipient_user_id_idx ON task_email_notifications (recipient_user_id);