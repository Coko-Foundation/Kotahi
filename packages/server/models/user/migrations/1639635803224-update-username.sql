UPDATE users
SET username=COALESCE(NULLIF(TRIM(identities.name), ''), NULLIF(users.email, ''), identities.identifier)
FROM identities
WHERE identities.user_id=users.id AND identities.is_default
AND (username IS NULL OR username='' OR username~'^[0-9]' OR username LIKE '%@%');
