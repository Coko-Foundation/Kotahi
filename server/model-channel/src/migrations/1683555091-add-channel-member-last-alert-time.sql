ALTER TABLE channel_members ADD COLUMN last_alert_triggered_time TIMESTAMP WITH TIME ZONE DEFAULT NULL;
CREATE INDEX channel_members_last_alert_triggered_time_idx ON channel_members (last_alert_triggered_time);
CREATE INDEX channel_members_last_viewed_idx ON channel_members (last_viewed);
