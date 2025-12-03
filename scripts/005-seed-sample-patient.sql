-- ============================================
-- Seed Sample Patient: Sarah Johnson
-- ============================================

-- Insert sample patient
INSERT INTO patients (
    id,
    first_name,
    middle_name,
    last_name,
    date_of_birth,
    gender,
    phone_primary,
    email,
    address_street,
    address_city,
    address_state,
    address_zip,
    address_country,
    blood_type,
    allergies,
    citizen_id,
    bhyt_card_number,
    bhyt_coverage_level,
    bhyt_registered_facility_name,
    bhyt_valid_to,
    bhyt_status,
    is_active
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Sarah',
    'Marie',
    'Johnson',
    '1985-03-15',
    'Female',
    '+1-555-0123',
    'sarah.johnson@email.com',
    '123 Main Street',
    'San Francisco',
    'CA',
    '94102',
    'USA',
    'O+',
    ARRAY['Penicillin', 'Sulfa drugs'],
    '123-45-6789',
    'US123456789',
    80,
    'SF General Hospital',
    '2025-12-31',
    'active',
    true
) ON CONFLICT (id) DO NOTHING;

-- Create visits for Sarah Johnson
INSERT INTO visits (
    id,
    patient_id,
    visit_date,
    visit_type,
    visit_reason,
    provider_name,
    provider_specialty,
    facility_name,
    status
) VALUES
('v001-2025-01', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-01-15 09:00:00', 'in-person', 'Annual physical examination', 'Dr. Emily Chen', 'Internal Medicine', 'SF Medical Center', 'completed'),
('v002-2025-04', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-04-20 10:30:00', 'follow-up', 'Thyroid follow-up', 'Dr. Emily Chen', 'Internal Medicine', 'SF Medical Center', 'completed'),
('v003-2025-07', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-07-10 14:00:00', 'telehealth', 'Lab review', 'Dr. Emily Chen', 'Internal Medicine', 'SF Medical Center', 'completed'),
('v004-2025-10', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-10-15 11:00:00', 'in-person', 'Routine check-up', 'Dr. Emily Chen', 'Internal Medicine', 'SF Medical Center', 'completed')
ON CONFLICT (id) DO NOTHING;

-- Insert vital signs for each visit
INSERT INTO vital_signs (
    visit_id,
    patient_id,
    temperature_f,
    heart_rate_bpm,
    blood_pressure_systolic,
    blood_pressure_diastolic,
    respiratory_rate,
    oxygen_saturation,
    height_inches,
    weight_lbs,
    bmi,
    recorded_at,
    recorded_by
) VALUES
('v001-2025-01', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 97.9, 72, 118, 78, 16, 98, 65, 185.2, 30.8, '2025-01-15 09:15:00', 'Nurse Williams'),
('v002-2025-04', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 98.2, 75, 122, 82, 18, 99, 65, 181.9, 30.3, '2025-04-20 10:45:00', 'Nurse Williams'),
('v003-2025-07', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 98.6, 70, 119, 79, 17, 98, 65, 177.9, 29.6, '2025-07-10 14:10:00', 'Self-reported'),
('v004-2025-10', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 98.1, 74, 120, 80, 16, 99, 65, 175.0, 29.1, '2025-10-15 11:15:00', 'Nurse Williams')
ON CONFLICT DO NOTHING;

-- Insert blood work / lab results for each visit
INSERT INTO blood_work (
    visit_id,
    patient_id,
    lab_name,
    specimen_collected_at,
    -- Thyroid panel
    tsh,
    t4,
    free_t4,
    -- Metabolism
    glucose,
    glucose_fasting,
    hba1c,
    -- Vitamins
    vitamin_d,
    -- Lipid Panel
    total_cholesterol,
    ldl_cholesterol,
    hdl_cholesterol,
    triglycerides,
    -- CBC
    wbc,
    rbc,
    hemoglobin,
    hematocrit,
    platelet_count,
    -- Kidney
    bun,
    creatinine,
    -- Electrolytes
    sodium,
    potassium,
    -- Liver
    ast,
    alt,
    status,
    notes
) VALUES
-- January 2025
('v001-2025-01', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Quest Diagnostics', '2025-01-15 09:30:00',
    2.8, 7.2, 1.2,  -- Thyroid
    95, true, 5.4,   -- Metabolism
    22,              -- Vitamin D (low)
    195, 120, 55, 110, -- Lipids
    7.2, 4.5, 13.8, 41, 245, -- CBC
    14, 0.9,         -- Kidney
    140, 4.2,        -- Electrolytes
    25, 28,          -- Liver
    'completed', 'TSH Receptor Ab: 1.9 IU/L'),
-- April 2025
('v002-2025-04', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Quest Diagnostics', '2025-04-20 11:00:00',
    2.9, 6.8, 1.3,  -- Thyroid
    98, true, 5.3,   -- Metabolism
    28,              -- Vitamin D (improving)
    188, 115, 58, 105, -- Lipids
    7.0, 4.6, 14.0, 42, 250, -- CBC
    13, 0.85,        -- Kidney
    141, 4.1,        -- Electrolytes
    23, 26,          -- Liver
    'completed', 'TSH Receptor Ab: 1.6 IU/L'),
-- July 2025
('v003-2025-07', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Quest Diagnostics', '2025-07-10 14:30:00',
    2.7, 5.9, 1.2,  -- Thyroid (T4 borderline)
    92, true, 5.2,   -- Metabolism
    35,              -- Vitamin D (better)
    182, 108, 60, 98, -- Lipids
    6.8, 4.7, 14.2, 43, 255, -- CBC
    12, 0.88,        -- Kidney
    139, 4.3,        -- Electrolytes
    22, 24,          -- Liver
    'completed', 'TSH Receptor Ab: 1.2 IU/L'),
-- October 2025
('v004-2025-10', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Quest Diagnostics', '2025-10-15 11:30:00',
    2.8, 5.2, 1.1,  -- Thyroid (T4 low)
    94, true, 5.1,   -- Metabolism (improving)
    42,              -- Vitamin D (normal)
    175, 100, 62, 90, -- Lipids (improving)
    7.1, 4.6, 14.1, 42, 248, -- CBC
    13, 0.9,         -- Kidney
    140, 4.2,        -- Electrolytes
    24, 25,          -- Liver
    'completed', 'TSH Receptor Ab: 0.8 IU/L')
ON CONFLICT DO NOTHING;
