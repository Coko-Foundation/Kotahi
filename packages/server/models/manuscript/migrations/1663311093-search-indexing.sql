ALTER TABLE manuscripts ADD COLUMN IF NOT EXISTS searchable_text TEXT DEFAULT '' NOT NULL;
ALTER TABLE manuscripts ADD COLUMN IF NOT EXISTS search_tsvector tsvector DEFAULT ''::tsvector NOT NULL;

DROP FUNCTION IF EXISTS manuscripts_searchable_text_trigger;

CREATE FUNCTION manuscripts_searchable_text_trigger() RETURNS trigger AS $$
DECLARE
  a TEXT;
  b TEXT;
  c TEXT;
  authors JSON;
  author JSON;
  authorstext TEXT := '';
  member RECORD;
  memberstext TEXT := '';
  invitee RECORD;
  inviteestext TEXT := '';
  submittertext TEXT := '';
BEGIN
  authors := COALESCE(NULLIF(new.submission->>'authors',''), NULLIF(new.submission->>'authorNames',''), '[]')::JSON;
  FOR author IN SELECT * FROM json_array_elements(authors) LOOP
    authorstext = concat(
      authorstext,
      concat_ws(', ',
        concat_ws(' ', author->>'firstName', author->>'lastName'),
        author->>'email',
        author->>'affiliation'
      ),
      '; '
    );
  END LOOP;

  FOR member IN SELECT username, email
    FROM teams t, team_members tm, users u
    WHERE t.object_id = new.id AND tm.team_id = t.id AND u.id = tm.user_id
  LOOP
    memberstext := concat(
      memberstext,
      member.username, ' ', member.email,
      '; '
    );
  END LOOP;

  FOR invitee IN SELECT invited_person_name, to_email
    FROM invitations i
    WHERE i.manuscript_id = new.id
  LOOP
    inviteestext := concat(
      inviteestext,
      invitee.invited_person_name, ' ', invitee.to_email,
      '; '
    );
  END LOOP;

  submittertext := (SELECT concat_ws(', ', username, email)
    FROM users
    WHERE users.id = new.submitter_id);

  a := concat_ws(E'\n',
    new.meta->>'title',
    new.submission->>'description',
    new.submission->>'title',
    new.meta->>'abstract',
    new.submission->>'abstract',
    new.submission->>'doi',
    new.submission->>'DOI',
    new.submission->>'articleURL'
  );
  b := concat_ws(E'\n',
    authorstext,
    memberstext,
    inviteestext,
    submittertext,
    new.short_id,
    new.submission->>'articleId',
    new.submission->>'link',
    new.submission->>'biorxivURL'
  );
  c := concat(
    new.meta->>'source'
  );

  new.search_tsvector :=
    setweight(to_tsvector('english', a), 'A') ||
    setweight(to_tsvector('english', b), 'B') ||
    setweight(to_tsvector('english', c), 'C');
  new.searchable_text := concat_ws(E'\n', a, b, c);

  RETURN new;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER searchable_text_update BEFORE INSERT OR UPDATE
  ON manuscripts FOR EACH ROW EXECUTE PROCEDURE manuscripts_searchable_text_trigger();

DROP FUNCTION IF EXISTS team_members_trigger;

CREATE FUNCTION team_members_trigger() RETURNS trigger AS $$
BEGIN
  UPDATE manuscripts SET updated = manuscripts.updated -- Cause trigger function to regenerate searchable_text
    FROM teams
    WHERE new.team_id = teams.id AND teams.object_id = manuscripts.id;
  RETURN new;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_member_update AFTER INSERT OR UPDATE
  ON team_members FOR EACH ROW EXECUTE PROCEDURE team_members_trigger();

DROP FUNCTION IF EXISTS invitations_trigger;

CREATE FUNCTION invitations_trigger() RETURNS trigger AS $$
BEGIN
  UPDATE manuscripts SET updated = manuscripts.updated -- Cause trigger function to regenerate searchable_text
    WHERE new.manuscript_id = manuscripts.id;
  RETURN new;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER invitation_update AFTER INSERT OR UPDATE
  ON invitations FOR EACH ROW EXECUTE PROCEDURE invitations_trigger();


CREATE INDEX IF NOT EXISTS manuscripts_search_idx ON manuscripts
  USING GIN (search_tsvector);

update manuscripts set updated = updated; -- To force trigger to generate searchable_text on all rows

-- Manuscripts should now be efficiently searchable using e.g.:
-- select meta->>'title' from manuscripts
--   where search_tsvector @@ to_tsquery('receptor & genome');
