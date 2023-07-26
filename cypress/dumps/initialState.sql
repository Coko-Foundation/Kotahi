-- TODO is this dump still used?

INSERT INTO "public"."files" ("id", "created", "updated", "type", "name", "stored_objects", "tags", "reference_id", "object_id", "alt", "upload_status", "caption") VALUES
('4aded767-78f0-4bd1-857e-1569f2f7b265', '2022-05-13 10:56:32.657+00', '2022-05-13 10:56:32.657+00', 'file', 'sample pdf.pdf', '[{"id": "42dbd180-a78b-4b14-9e7e-74ac6838dba1", "key": "52ce9cf9c7a8.pdf", "size": 3028, "type": "original", "mimetype": "application/pdf", "extension": "pdf", "imageMetadata": null}]', '["manuscript"]', NULL, '8f05064b-b00d-4aec-a98f-f7ba3656cc2f', NULL, NULL, NULL);

INSERT INTO "public"."identities" ("id", "user_id", "created", "updated", "type", "identifier", "name", "aff", "oauth", "is_default") VALUES
('bdd063ba-1acc-4b92-80a5-f8711587aeea', 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', '2022-05-13 10:55:50.525+00', '2022-05-13 10:55:50.525+00', 'orcid', '0000-0003-3483-9210', 'Emily Clay', '', '{"accessToken": "67cdb60a-7713-45df-8004-ca4ab38e9014", "refreshToken": "6c54414e-8b88-4814-84f9-f3067ad3078e"}', 't'),
('e462e79a-9fb4-45cb-a5b8-a2735a7aeb69', 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', '2022-05-13 10:54:12.655+00', '2022-05-13 10:54:12.655+00', 'orcid', '0000-0002-1851-1103', 'Elaine Barnes', '', '{"accessToken": "e85acf35-dcbf-45b1-9bc3-5efb80a95ca9", "refreshToken": "3bd13cb6-b0c5-42df-98da-c0037185d085"}', 't');

INSERT INTO "public"."manuscripts" ("id", "created", "updated", "parent_id", "submitter_id", "status", "decision", "authors", "meta", "submission", "published", "type", "evaluations_hypothesis_map", "is_imported", "import_source", "import_source_server", "short_id", "submitted_date", "group_id") VALUES
('8f05064b-b00d-4aec-a98f-f7ba3656cc2f', '2022-05-13 10:56:32.642+00', '2022-05-13 10:57:43.627+00', NULL, 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', 'accepted', 'accepted', NULL, '{"title": "sample pdf"}', '{"DOI": "", "cover": "", "title": "", "topics": [], "Funding": "", "abstract": "", "datacode": "", "objectType": "", "references": "", "authorNames": "", "dateAccepted": "", "dateReceived": "", "copyrightYear": "", "datePublished": "", "DecisionLetter": "", "copyrightHolder": "", "reviewingEditor": "", "EditorsEvaluation": "", "competingInterests": "", "copyrightStatement": "", "authorContributions": "", "AuthorCorrespondence": ""}', '2022-05-13 10:57:43.509+00', 'Manuscript', NULL, NULL, NULL, NULL, 1, '2022-05-13 10:57:09.868+00', 'a6303daa-fc03-4257-99e5-f4579fea4be8');

INSERT INTO "public"."review_comments" ("id", "created", "updated", "review_id", "user_id", "content", "comment_type", "type") VALUES
('d636e220-20bf-4ec1-96a0-c610f5612586', '2022-05-13 10:57:38.576+00', '2022-05-13 10:57:38.576+00', 'a9d0ddb5-0518-4bab-bb15-fdaeb9e60696', NULL, '<p class="paragraph">hbkj</p>', 'decision', 'ReviewComment');

INSERT INTO "public"."reviews" ("id", "created", "updated", "recommendation", "is_decision", "user_id", "manuscript_id", "type", "is_hidden_from_author", "is_hidden_reviewer_name", "can_be_published_publicly") VALUES
('a9d0ddb5-0518-4bab-bb15-fdaeb9e60696', '2022-05-13 10:57:38.571+00', '2022-05-13 10:57:39.963+00', 'accepted', 't', 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', '8f05064b-b00d-4aec-a98f-f7ba3656cc2f', 'Review', NULL, NULL, NULL),
('c7a95df9-32d8-4bc5-812c-468c18cf53ca', '2022-05-13 10:58:32.521+00', '2022-05-13 10:58:41.719+00', 'accepted', 'f', 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', '8f05064b-b00d-4aec-a98f-f7ba3656cc2f', 'Review', 't', 't', NULL);

INSERT INTO "public"."teams" ("id", "created", "updated", "name", "role", "members", "owners", "global", "type", "object_id", "object_type") VALUES
('2eb4335a-0037-415c-abab-ec3aa8bf7e79', '2022-05-13 10:57:28.837+00', '2022-05-13 10:57:28.837+00', 'Senior Editor', 'seniorEditor', NULL, NULL, NULL, 'team', '8f05064b-b00d-4aec-a98f-f7ba3656cc2f', 'manuscript'),
('9816ff49-1641-4ef0-a60d-4d85bd7a044b', '2022-05-13 10:56:32.656+00', '2022-05-13 10:56:32.656+00', 'Author', 'author', NULL, NULL, NULL, 'team', '8f05064b-b00d-4aec-a98f-f7ba3656cc2f', 'manuscript'),
('a4ee7976-e7f6-42ea-93fe-9798e531f532', '2022-05-13 10:58:23.403+00', '2022-05-13 10:58:23.403+00', 'Reviewers', 'reviewer', NULL, NULL, NULL, 'team', '8f05064b-b00d-4aec-a98f-f7ba3656cc2f', 'manuscript'),
('eb61876a-fee2-44cf-a6a9-9cdca2f1b398', '2022-08-10 02:15:29.063+00', '2022-08-10 02:15:29.063+00', 'Group Manager', 'groupManager', NULL, NULL, false, 'team', 'a6303daa-fc03-4257-99e5-f4579fea4be8', 'Group');

INSERT INTO "public"."users" ("id", "created", "updated", "admin", "email", "username", "password_hash", "teams", "password_reset_token", "password_reset_timestamp", "type", "profile_picture", "online", "last_online", "recent_tab") VALUES
('ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', '2022-05-13 10:55:50.523+00', '2022-05-13 10:56:32.666+00', NULL, NULL, 'Emily Clay', NULL, NULL, NULL, NULL, 'user', NULL, NULL, NULL, 'submissions'),
('5b861dfb-02df-4be1-bc67-41a21611f5e7', '2022-05-14 10:31:35.715+00', '2022-05-14 10:32:14.133+00', 't', 'joanep@example.com', 'Joane Pilger', NULL, NULL, NULL, NULL, 'user', NULL, NULL, NULL, 'submissions'),
('f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', '2022-05-13 10:54:12.651+00', '2022-05-13 10:58:26.686+00', 't', 'elaineb@example.com', 'Elaine Barnes', NULL, NULL, NULL, NULL, 'user', NULL, NULL, NULL, 'submissions');

INSERT INTO "public"."team_members" ("id", "created", "updated", "status", "team_id", "user_id", "alias_id", "is_shared") VALUES
('19dd1446-a8fb-4a4a-8c3b-2babcd8108ab', '2022-05-13 10:58:26.685+00', '2022-05-13 10:58:26.685+00', NULL, '2eb4335a-0037-415c-abab-ec3aa8bf7e79', 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', NULL, NULL),
('bc3eefda-143f-4208-b666-cb6f3790d4e2', '2022-05-13 10:58:23.404+00', '2022-05-13 10:58:42.896+00', 'completed', 'a4ee7976-e7f6-42ea-93fe-9798e531f532', 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', NULL, NULL),
('c0707ae1-a927-4709-9b25-600d7b76404d', '2022-05-13 10:56:32.664+00', '2022-05-13 10:56:32.664+00', NULL, '9816ff49-1641-4ef0-a60d-4d85bd7a044b', 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', NULL, NULL),
('3c01cb4a-27ed-53e2-ca03-a4593cb0434e', '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', NULL, 'eb61876a-fee2-44cf-a6a9-9cdca2f1b398', '5b861dfb-02df-4be1-bc67-41a21611f5e7', NULL, NULL),
('4d12dc5b-38fe-64f3-db14-b56a4dc1545f', '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', NULL, 'eb61876a-fee2-44cf-a6a9-9cdca2f1b398', 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', NULL, NULL);
