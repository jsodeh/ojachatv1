CREATE TRIGGER on_order_placed
AFTER INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request(
  'http://localhost:54321/functions/v1/order-placed',
  'POST',
  '{"Content-Type": "application/json"}',
  '{}', -- This empty object might need to be NEW::jsonb depending on your trigger needs
  '1000'
);
