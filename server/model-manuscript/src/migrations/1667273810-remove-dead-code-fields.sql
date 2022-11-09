UPDATE manuscripts set meta = meta - 'articleSections' - 'declarations' - 'articleType'
 - 'articleIds' - 'publicationDates' - 'notes' - 'keywords';
ALTER TABLE manuscripts DROP COLUMN suggestions;