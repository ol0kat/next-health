-- Fix script for Sarah Johnson lab data
-- This script ensures all required data exists and fixes any issues

-- First, verify/create the guardian
INSERT INTO guardians (
  id,
  first_name,
  last_name,
  relationship,
  phone_primary,
  email,
  is_emergency_contact,
  is_legal_guardian,
  address_street,
  address_city,
  address_state,
  address_zip,
  address_country
) VALUES (
  'a1b2c3d4-e5f6-4890-abcd-ef1234567890',
  'Michael',
  'Johnson',
  'Spouse',
  '+1-555-0102',
  'michael.johnson@email.com',
  true,
  false,
  '123 Oak Street',
  'San Francisco',
  'CA',
  '94102',
  'USA'
) ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name;

-- Verify/create Sarah Johnson patient record
INSERT INTO patients (
  id,
  first_name,
  middle_name,
  last_name,
  date_of_birth,
  gender,
  blood_type,
  phone_primary,
  email,
  address_street,
  address_city,
  address_state,
  address_zip,
  address_country,
  ssn_last_four,
  allergies,
  medical_notes,
  insurance_provider,
  insurance_policy_number,
  insurance_group_number,
  primary_guardian_id,
  is_active
) VALUES (
  'b2c3d4e5-f6a7-4901-bcde-f23456789012',
  'Sarah',
  'Marie',
  'Johnson',
  '1983-03-15',
  'Female',
  'A+',
  '+1-555-0101',
  'sarah.johnson@email.com',
  '123 Oak Street',
  'San Francisco',
  'CA',
  '94102',
  'USA',
  '4567',
  ARRAY['Penicillin', 'Sulfa drugs'],
  'Patient has history of hypothyroidism, well-controlled with Levothyroxine. Family history of cardiovascular disease.',
  'Blue Cross Blue Shield',
  'BCB123456789',
  'GRP001',
  'a1b2c3d4-e5f6-4890-abcd-ef1234567890',
  true
) ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  is_active = true;

-- Delete existing visits, vital signs, and blood work to avoid duplicates
DELETE FROM blood_work WHERE patient_id = 'b2c3d4e5-f6a7-4901-bcde-f23456789012';
DELETE FROM vital_signs WHERE patient_id = 'b2c3d4e5-f6a7-4901-bcde-f23456789012';
DELETE FROM visits WHERE patient_id = 'b2c3d4e5-f6a7-4901-bcde-f23456789012';

-- Create 4 visits for Sarah Johnson (quarterly in 2025)
INSERT INTO visits (id, patient_id, visit_date, visit_type, visit_reason, provider_name, provider_specialty, facility_name, chief_complaint, subjective_notes, objective_notes, assessment, plan, status, billing_code, copay_amount, copay_collected) VALUES
  -- Visit 1: January 2025
  ('01a2b3c4-d5e6-4890-abcd-111111111111', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '2025-01-15 09:00:00', 'Follow-up', 'Quarterly thyroid check', 'Dr. Emily Chen', 'Endocrinology', 'NeXT Health Clinic', 'Routine thyroid follow-up', 'Patient reports feeling well. Energy levels stable.', 'Alert and oriented. Thyroid not palpable.', 'Hypothyroidism - well controlled. Vitamin D deficiency noted.', 'Continue Levothyroxine 88mcg. Start Vitamin D 2000 IU daily.', 'completed', '99214', 40.00, true),
  -- Visit 2: April 2025
  ('02a2b3c4-d5e6-4890-abcd-222222222222', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '2025-04-20 10:30:00', 'Follow-up', 'Quarterly thyroid check', 'Dr. Emily Chen', 'Endocrinology', 'NeXT Health Clinic', 'Routine thyroid follow-up', 'Patient reports increased energy since starting Vitamin D.', 'Alert and oriented. BP slightly elevated.', 'Hypothyroidism - stable. Vitamin D improving.', 'Continue current medications.', 'completed', '99214', 40.00, true),
  -- Visit 3: July 2025
  ('03a2b3c4-d5e6-4890-abcd-333333333333', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '2025-07-10 14:00:00', 'Follow-up', 'Quarterly thyroid check', 'Dr. Emily Chen', 'Endocrinology', 'NeXT Health Clinic', 'Routine thyroid follow-up', 'Patient reports weight loss of 3kg since last visit.', 'Alert and oriented. Weight down. BP improved.', 'Hypothyroidism - stable. Good progress.', 'Continue current regimen.', 'completed', '99214', 40.00, true),
  -- Visit 4: October 2025
  ('04a2b3c4-d5e6-4890-abcd-444444444444', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '2025-10-15 11:00:00', 'Follow-up', 'Quarterly thyroid check', 'Dr. Emily Chen', 'Endocrinology', 'NeXT Health Clinic', 'Routine thyroid follow-up', 'Patient doing well. Weight continues to improve.', 'Vital signs stable. Good overall condition.', 'Hypothyroidism - well controlled. Vitamin D optimal.', 'Continue Levothyroxine. Reduce Vitamin D to maintenance.', 'completed', '99214', 40.00, true);

-- Create vital signs for each visit
INSERT INTO vital_signs (id, patient_id, visit_id, recorded_at, blood_pressure_systolic, blood_pressure_diastolic, blood_pressure_position, heart_rate_bpm, heart_rate_rhythm, respiratory_rate, oxygen_saturation, temperature_f, temperature_method, height_inches, weight_lbs, bmi, pain_level, recorded_by, notes) VALUES
  -- Visit 1: January 2025
  ('aa1a2b3c-d5e6-4890-abcd-111111111111', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '01a2b3c4-d5e6-4890-abcd-111111111111', '2025-01-15 08:45:00', 118, 78, 'sitting', 72, 'regular', 16, 98, 97.9, 'oral', 66, 185, 28.5, 0, 'RN Sarah Mitchell', 'Patient appears comfortable'),
  -- Visit 2: April 2025
  ('aa2a2b3c-d5e6-4890-abcd-222222222222', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '02a2b3c4-d5e6-4890-abcd-222222222222', '2025-04-20 10:15:00', 122, 82, 'sitting', 75, 'regular', 18, 99, 98.2, 'oral', 66, 182, 28.0, 0, 'RN Sarah Mitchell', 'BP slightly elevated'),
  -- Visit 3: July 2025
  ('aa3a2b3c-d5e6-4890-abcd-333333333333', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '03a2b3c4-d5e6-4890-abcd-333333333333', '2025-07-10 13:45:00', 119, 79, 'sitting', 70, 'regular', 17, 98, 98.6, 'oral', 66, 178, 27.4, 0, 'RN Sarah Mitchell', 'Good improvement in weight'),
  -- Visit 4: October 2025
  ('aa4a2b3c-d5e6-4890-abcd-444444444444', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '04a2b3c4-d5e6-4890-abcd-444444444444', '2025-10-15 10:45:00', 120, 80, 'sitting', 74, 'regular', 16, 99, 98.1, 'oral', 66, 175, 26.9, 0, 'RN Sarah Mitchell', 'Excellent progress');

-- Create blood work for each visit (thyroid panel, vitamins, glucose)
INSERT INTO blood_work (
  id, patient_id, visit_id, specimen_collected_at, results_received_at, order_number, lab_name, status,
  wbc, rbc, hemoglobin, hematocrit, platelet_count,
  glucose, glucose_fasting, bun, creatinine, sodium, potassium, calcium,
  total_cholesterol, ldl_cholesterol, hdl_cholesterol, triglycerides,
  ast, alt,
  tsh, t3, t4, free_t4,
  vitamin_d, vitamin_b12, iron, ferritin,
  hba1c, interpretation, notes
) VALUES
  -- Visit 1: January 2025 - Vitamin D LOW, TSH Receptor Ab HIGH
  ('bb1a2b3c-d5e6-4890-abcd-111111111111', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '01a2b3c4-d5e6-4890-abcd-111111111111', 
   '2025-01-15 09:15:00', '2025-01-16 14:00:00', 'LAB-2025-001', 'Quest Diagnostics', 'completed',
   7.2, 4.5, 13.8, 41.2, 245000,
   95, true, 14, 0.9, 140, 4.2, 9.4,
   198, 118, 58, 142,
   22, 19,
   2.8, 1.2, 7.2, 1.2,
   22, 450, 85, 78,
   5.4, 'Thyroid well-controlled. Vitamin D deficiency noted - recommend supplementation.',
   'Fasting specimen. TSH Receptor Ab: 1.9 IU/L (elevated)'),
  
  -- Visit 2: April 2025 - Vitamin D improving, TSH Receptor Ab improving
  ('bb2a2b3c-d5e6-4890-abcd-222222222222', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '02a2b3c4-d5e6-4890-abcd-222222222222', 
   '2025-04-20 10:45:00', '2025-04-21 15:00:00', 'LAB-2025-002', 'Quest Diagnostics', 'completed',
   7.0, 4.6, 14.0, 42.0, 238000,
   98, true, 15, 0.88, 141, 4.1, 9.5,
   195, 115, 60, 138,
   20, 18,
   2.9, 1.25, 6.8, 1.3,
   28, 465, 88, 82,
   5.3, 'Thyroid stable. Vitamin D improving with supplementation.',
   'Fasting specimen. TSH Receptor Ab: 1.6 IU/L (improving)'),
  
  -- Visit 3: July 2025 - Vitamin D borderline, T4 borderline low, TSH Receptor Ab borderline
  ('bb3a2b3c-d5e6-4890-abcd-333333333333', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '03a2b3c4-d5e6-4890-abcd-333333333333', 
   '2025-07-10 14:15:00', '2025-07-11 16:00:00', 'LAB-2025-003', 'Quest Diagnostics', 'completed',
   7.4, 4.55, 13.9, 41.8, 242000,
   92, true, 13, 0.85, 139, 4.3, 9.6,
   188, 108, 62, 130,
   21, 17,
   2.7, 1.18, 5.9, 1.2,
   35, 480, 90, 85,
   5.2, 'Thyroid stable. Vitamin D approaching optimal range.',
   'Fasting specimen. TSH Receptor Ab: 1.2 IU/L (borderline)'),
  
  -- Visit 4: October 2025 - All optimal, T4 low end but acceptable, TSH Receptor Ab normal
  ('bb4a2b3c-d5e6-4890-abcd-444444444444', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '04a2b3c4-d5e6-4890-abcd-444444444444', 
   '2025-10-15 11:15:00', '2025-10-16 14:30:00', 'LAB-2025-004', 'Quest Diagnostics', 'completed',
   7.1, 4.52, 14.1, 42.2, 248000,
   94, true, 14, 0.87, 140, 4.2, 9.5,
   182, 102, 65, 125,
   19, 16,
   2.8, 1.15, 5.2, 1.1,
   42, 495, 92, 88,
   5.1, 'Thyroid well-controlled. Vitamin D now optimal. TSH Receptor Ab normalized.',
   'Fasting specimen. TSH Receptor Ab: 0.8 IU/L (normal)');
