CREATE TABLE page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path varchar(255) NOT NULL,
  created_at timestamp DEFAULT NOW()
);

CREATE INDEX page_views_page_path_idx ON page_views(page_path);
CREATE INDEX page_views_created_at_idx ON page_views(created_at);

CREATE TABLE car_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT NOW()
);

CREATE INDEX car_views_car_id_idx ON car_views(car_id);
CREATE INDEX car_views_created_at_idx ON car_views(created_at);
