ALTER TABLE cms_layouts
ADD COLUMN partners jsonb NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN published TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN edited TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
ADD COLUMN footer_text TEXT;


ALTER TABLE cms_pages
ADD COLUMN flax_header_config jsonb NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN flax_footer_config jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE cms_pages DROP COLUMN IF EXISTS shortcode;