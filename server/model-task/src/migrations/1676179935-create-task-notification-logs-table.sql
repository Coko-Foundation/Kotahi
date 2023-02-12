CREATE TABLE task_email_notifications_logs (
id UUID PRIMARY KEY,
task_id UUID NOT NULL,
sender_email TEXT,
recipient_email TEXT NOT NULL,
email_template_key TEXT NOT NULL,
content TEXT NOT NULL,
created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
updated TIMESTAMP WITH TIME ZONE
);