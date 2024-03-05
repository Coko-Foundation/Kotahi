-- This trigger function is called whenever a manuscript record is inserted or updated.
-- It compiles three chunks of searchable plain text with different 'importance' rankings (A, B and C),
-- and generates the search_tsvector column from these. This is what postgres uses for keyword search.
-- It also concatenates all three texts into the searchable_text column, from which 'match snippets' can
-- be retrieved.
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
  -- Concatenate all authors into a semicolon-separated string
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

  -- Concatenate all team members into a semicolon-separated string
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

  -- Concatenate all invited authors/reviewers into a semicolon-separated string
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

  -- Get the submitter's username and email as text
  submittertext := (SELECT concat_ws(', ', username, email)
    FROM users
    WHERE users.id = new.submitter_id);

  -- Highest ranking ('A') searchable text includes title, abstract, DOI
  a := concat_ws(E'\n',
    new.submission->>'$title',
    new.submission->>'$abstract',
    new.submission->>'$doi'
  );
  -- Middle ranking ('B') searchable text includes names of authors, team members, invitees and submitter,
  -- plus the manuscript's short ID, source URI and DOI suffix.
  b := concat_ws(E'\n',
    authorstext,
    memberstext,
    inviteestext,
    submittertext,
    new.short_id,
    new.submission->>'$sourceUri',
    new.submission->>'$doiSuffix'
  );
  -- Lowest ranking searchable text includes the manuscript source
  c := concat(
    new.meta->>'source'
  );

  -- Here we modify the `new` record prior to its insertion/update, by setting search_tsvector and searchable_text columns.
  new.search_tsvector :=
    setweight(to_tsvector('english', a), 'A') ||
    setweight(to_tsvector('english', b), 'B') ||
    setweight(to_tsvector('english', c), 'C');
  new.searchable_text := concat_ws(E'\n', a, b, c);

  RETURN new; -- The trigger uses this value for the insert/update.
END
$$ LANGUAGE plpgsql;

update manuscripts set updated = updated; -- To force trigger to generate searchable_text on all rows

-- Manuscripts should now be efficiently searchable using e.g.:
-- select submission->>'$title' from manuscripts
--   where search_tsvector @@ to_tsquery('receptor & genome');
