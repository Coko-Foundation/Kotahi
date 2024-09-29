DROP FUNCTION IF EXISTS get_uuid_v4;

CREATE FUNCTION get_uuid_v4() RETURNS uuid AS $$
BEGIN
  -- See https://stackoverflow.com/a/21327318/6505513
  RETURN (SELECT uuid_in(overlay(overlay(md5(random()::text || ':' || random()::text) placing '4' from 13) placing to_hex(floor(random()*(11-8+1) + 8)::int)::text from 17)::cstring));
END
$$ LANGUAGE plpgsql VOLATILE;

INSERT INTO teams (id, object_id, object_type, name, role, global, type)
  values (get_uuid_v4(), null, null, 'Group Manager', 'groupManager', true, 'team');

INSERT INTO team_members (id, team_id, user_id)
  SELECT get_uuid_v4(), teams.id, users.id
  FROM users, teams
  WHERE teams.role = 'groupManager' AND users.admin IS TRUE;
