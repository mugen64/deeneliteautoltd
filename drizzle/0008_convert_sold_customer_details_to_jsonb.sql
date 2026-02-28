ALTER TABLE cars
ALTER COLUMN sold_customer_details TYPE jsonb
USING CASE
  WHEN sold_customer_details IS NULL THEN NULL
  ELSE jsonb_build_object('notes', sold_customer_details)
END;
