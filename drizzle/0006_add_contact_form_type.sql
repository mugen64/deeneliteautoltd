ALTER TABLE contact_forms ADD COLUMN type varchar(50) NOT NULL DEFAULT 'contact-form';

CREATE INDEX contact_forms_type_idx ON contact_forms(type);
