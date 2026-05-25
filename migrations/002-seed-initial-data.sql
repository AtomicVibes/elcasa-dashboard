-- 002-seed-initial-data.sql
-- Seed Owner, initial users, sample customers and jobs

-- ── Users ─────────────────────────────────────────────────────────────────
INSERT INTO users (email, full_name, phone, construction_function, permission_role, avatar_color, submit_photos, add_notes, upload_invoices, upload_blueprints)
VALUES
  ('akremarg@gmail.com', 'akremarg',         '+39 111 111 111', 'Owner',            'super_user',      '#FFB800', 1, 1, 1, 1),
  ('luca@elcasa.com',    'Luca Rossi',        '+39 333 000 001', 'Architect',        'modify_assigned', '#3B82F6', 1, 1, 0, 1),
  ('giulia@elcasa.com',  'Giulia Bianchi',    '+39 333 000 002', 'Project Manager',  'modify_assigned', '#10B981', 1, 1, 1, 0),
  ('marco@elcasa.com',   'Marco Verdi',       '+39 333 000 003', 'Engineer',         'view_only',       '#A855F7', 0, 1, 0, 0),
  ('anna@elcasa.com',    'Anna Neri',         '+39 333 000 004', 'Site Supervisor',  'modify_assigned', '#F97316', 1, 0, 0, 0);

-- ── Customers ──────────────────────────────────────────────────────────────
INSERT INTO customers (full_name, email, phone, role, address, notes)
VALUES
  ('Mario Esposito',  'mario@example.com',    '+39 02 1001', 'client',       'Via Roma 12, Milan, Italy',  'Primary contact for Via Roma renovation'),
  ('Sara Conte',      'sara@example.com',      '+39 02 1002', 'client',       'Via Torino 4, Rome, Italy',   'Prefers email updates only'),
  ('Paolo Romano',    'paolo@example.com',     '+39 02 1003', 'client',       'Corso Como, Milan, Italy',    'VIP customer — requires weekly progress report'),
  ('Elena Bianchi',   'elena@example.com',     '+39 02 1004', 'contractor',   'Via Montenapoleone 1, Milan','Lead contractor, full access'),
  ('Filippo Ricci',   'filippo@example.com',   '+39 02 1005', 'architect',    'Via Brera 5, Milan','Lead architect for structural projects');

-- ── Jobs ──────────────────────────────────────────────────────────────────
INSERT INTO jobs (title, description, location, category, budget, expenses, deadline, status, customer_id)
VALUES
  ('Ristrutturazione Via Roma 12',   'Full renovation of 120 sqm apartment inside Milan historical centre',       'Milan, Italy',    'renovation_remodeling',    128000,  57600,  '2026-08-15', 'in_progress',   1),
  ('New Office Palazzo Nuova',       'Build-out of a 4-floor modern office space with shared amenities',              'Rome, Italy',     'office_buildings',         450000, 324000,  '2026-07-01', 'in_progress',   2),
  ('Minimalist Villa Restyling',     'Interior redesign of lakeside villa — open floor plan, floor-to-ceiling glass', 'Lake Como, Italy', 'interior_design',       89000,   24920,  '2026-10-30', 'pending',      3),
  ('City Bridge Footbridge',         'Cantilever steel footbridge across urban canal — 42m span',                     'Turin, Italy',    'bridges',                  320000, 192000,  '2026-09-20', 'in_progress',   4),
  ('Apartment Core Punch',           'Demolition and rebuild of core apartment due to structural defects',             'Naples, Italy',   'demolition',               54000,    8100,  '2026-12-05', 'completed',    1),
  ('Hotel Lobby Concept',            'Concept design and build-out of 5-star hotel lobby including marble floors',     'Milan, Italy',    'hotels',                   210000, 189000,  '2026-06-25', 'cancelled',    5),
  ('Facade Restoration — Como',      'Full stone facade cleaning, repointing and protective coating restore legislative compliance.', 'Como, Italy', 'renovation_remodeling', 75000, null, '2026-10-01', 'pending', 3),
  ('Solar PV Installation Warehouse','3-storey warehouse solar-panel retrofit — 120 kW system including battery storage', 'Bologna, Italy', 'solar_systems', 95000, 23000, '2026-09-30', 'in_progress', 4),
  ('Garden Landscaping — Villa',     'Hard-landscaping and irrigation design of 800 sqm villa garden',                'Florence, Italy', 'misc',                    45000, null, '2026-11-15', 'pending', 2),
  ('Office Partitioning — Cagliari','Modular dry-wall partition and acoustic ceiling refit — open-plan office',      'Cagliari, Italy', 'apartments',         38000, 14200, '2026-07-20', 'in_progress', 1);
