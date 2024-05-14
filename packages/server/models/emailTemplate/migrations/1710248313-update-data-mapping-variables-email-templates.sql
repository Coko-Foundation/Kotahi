-- email_content - subject and body key replace placeholder text 
UPDATE email_templates
SET email_content = jsonb_set(
    jsonb_set(
        email_content,
        '{subject}', -- Path to the key within the JSONB object for subject
        replace(
            replace(
                replace(
                    (email_content #> '{subject}')::text,
                    '{{ currentUser }}',
                    '{{ senderName }}'
                ),
                '{{ shortId }}',
                '{{ manuscriptNumber }}'
            ),
            '{{ articleTitle }}',
            '{{ manuscriptTitle }}'
        )::jsonb,
        true
    ),
    '{body}', -- Path to the key within the JSONB object for body
    replace(
        replace(
            replace(
                replace(
                    replace(
                        replace(
                            replace(
                                (email_content #> '{body}')::text,
                                '{{ currentUser }}',
                                '{{ senderName }}'
                            ),
                            '{{ receiverName }}',
                            '{{ recipientName }}'
                        ),
                        '{{ shortId }}',
                        '{{ manuscriptNumber }}'
                    ),
                    '{{ articleTitle }}',
                    '{{ manuscriptTitle }}'
                ),
                '{{{ appUrl }}}',
                '{{{ loginLink }}}'
            ),
            '{{{ manuscriptPageUrl }}}', 
            '{{{ manuscriptLink }}}'
        ),
        '{{{ submissionLink }}}', 
        '{{{ manuscriptTitleLink }}}'
    )::jsonb,
    true
);