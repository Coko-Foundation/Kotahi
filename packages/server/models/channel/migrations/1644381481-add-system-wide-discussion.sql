INSERT INTO channels ( 
  id, topic, type 
) VALUES (  
  '9fd7774c-11e5-4802-804c-ab64aefd5080', 'System-wide discussion', 'editorial'
) ON CONFLICT DO NOTHING;
