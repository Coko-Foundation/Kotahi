CREATE TABLE email_templates (
  id UUID PRIMARY KEY,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,
  email_template_type TEXT,
  email_content JSONB NOT NULL
);
