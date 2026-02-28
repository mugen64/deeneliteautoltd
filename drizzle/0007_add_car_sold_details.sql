ALTER TABLE cars ADD COLUMN sold_amount numeric(12,2);
ALTER TABLE cars ADD COLUMN sold_customer_details text;
ALTER TABLE cars ADD COLUMN sold_at timestamp;

CREATE INDEX cars_sold_at_idx ON cars(sold_at);
