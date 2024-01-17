CREATE OR REPLACE FUNCTION manuscripts_searchable_text_trigger() RETURNS trigger AS $$
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
  authors := COALESCE(NULLIF(new.submission->>'$authors',''), '[]')::JSON;
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
    new.submission->>'$title',
    new.submission->>'$abstract',
    new.submission->>'$doi'
  );
  b := concat_ws(E'\n',
    authorstext,
    memberstext,
    inviteestext,
    submittertext,
    new.short_id,
    new.submission->>'$sourceUri',
    new.submission->>'$doiSuffix'
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

update manuscripts set updated = updated; -- To force trigger to generate searchable_text on all rows

-- Manuscripts should now be efficiently searchable using e.g.:
-- select submission->>'$title' from manuscripts
--   where search_tsvector @@ to_tsquery('receptor & genome');
