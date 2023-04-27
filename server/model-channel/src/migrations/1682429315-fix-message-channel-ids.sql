-- Replacing the child manuscript channels with the parent channels.

UPDATE messages SET channel_id = t2.parent_channel_id
FROM (
SELECT channels.id, parent_channels.id as parent_channel_id,  m2.id as message_id, channels."type" from messages m2 
join channels on channels.id = m2.channel_id
join manuscripts on channels.manuscript_id = manuscripts.id 
join manuscripts parent_manuscripts on parent_manuscripts.id = manuscripts.parent_id
join channels parent_channels on parent_channels.manuscript_id = parent_manuscripts.id and parent_channels.type = channels.type
where manuscripts.parent_id is not null and channels.manuscript_id is not null and channels.id is not null
) as t2;


-- Deleting the channels that don't belong to a child manuscript.
DELETE FROM channels USING manuscripts
WHERE channels.manuscript_id = manuscripts.id
and channels.manuscript_id is not null 
and manuscripts.parent_id is not null;