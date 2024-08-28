INSERT INTO teams (id, object_id, object_type, name, role, global, type)
  values (get_uuid_v4(), null, null, 'Admin', 'admin', true, 'team');

-- Add all users with admin IS TRUE to the admin team.
-- Not all of these may be appropriate as admins,
-- but the users must manually remove privileges
-- as appropriate.
INSERT INTO team_members (id, team_id, user_id)
  SELECT get_uuid_v4(), teams.id, users.id
  FROM users, teams
  WHERE teams.role = 'admin' AND users.admin IS TRUE;
