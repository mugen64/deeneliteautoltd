CREATE TABLE contact_form_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_form_id uuid NOT NULL REFERENCES contact_forms(id) ON DELETE CASCADE,
  car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT NOW(),
  UNIQUE(contact_form_id, car_id)
);

CREATE INDEX contact_form_vehicles_contact_form_id_idx ON contact_form_vehicles(contact_form_id);
CREATE INDEX contact_form_vehicles_car_id_idx ON contact_form_vehicles(car_id);

ALTER TABLE contact_forms DROP COLUMN selected_cars;
