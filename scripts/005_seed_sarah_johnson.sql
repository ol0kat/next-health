-- Seed script for Sarah Johnson - Complete Patient Record
-- Run this after 001_create_healthcare_schema.sql

-- First, create a guardian for Sarah Johnson
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
) ON CONFLICT (id) DO NOTHING;

-- Create Sarah Johnson patient record
INSERT INTO patients (
  id,
  first_name,
  middle_name,
  last_name,
  date_of_birth,
  gender,
  blood_type,
  phone_primary,
  phone_secondary,
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
  '+1-555-0103',
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
) ON CONFLICT (id) DO NOTHING;

-- Create ICD-10 codes for Sarah's conditions
INSERT INTO icd10_codes (id, code, short_description, long_description, category, is_billable, is_active) VALUES
  ('c3d4e5f6-a7b8-4012-cdef-345678901234', 'E03.9', 'Hypothyroidism, unspecified', 'Hypothyroidism, unspecified - includes myxedema NOS', 'Endocrine', true, true),
  ('d4e5f6a7-b8c9-4123-defa-456789012345', 'E55.9', 'Vitamin D deficiency, unspecified', 'Vitamin D deficiency, unspecified', 'Nutritional', true, true),
  ('e5f6a7b8-c9d0-4234-efab-567890123456', 'I10', 'Essential hypertension', 'Essential (primary) hypertension', 'Cardiovascular', true, true),
  ('f6a7b8c9-d0e1-4345-fabc-678901234567', 'R73.03', 'Prediabetes', 'Prediabetes - impaired fasting glucose', 'Metabolic', true, true)
ON CONFLICT (id) DO NOTHING;

-- Create diseases linked to ICD-10 codes
INSERT INTO diseases (id, name, common_name, description, primary_icd10_id, symptoms, risk_factors, body_system, severity_level, is_active) VALUES
  ('d1a2b3c4-e5f6-4890-abcd-111111111111', 'Hypothyroidism', 'Underactive Thyroid', 'A condition where the thyroid gland does not produce enough thyroid hormones', 'c3d4e5f6-a7b8-4012-cdef-345678901234', ARRAY['Fatigue', 'Weight gain', 'Cold intolerance', 'Dry skin', 'Constipation'], ARRAY['Family history', 'Autoimmune disease', 'Age over 60', 'Female gender'], 'Endocrine', 'moderate', true),
  ('d2a2b3c4-e5f6-4890-abcd-222222222222', 'Vitamin D Deficiency', 'Low Vitamin D', 'Insufficient levels of vitamin D in the blood', 'd4e5f6a7-b8c9-4123-defa-456789012345', ARRAY['Bone pain', 'Muscle weakness', 'Fatigue', 'Depression'], ARRAY['Limited sun exposure', 'Dark skin', 'Obesity', 'Age'], 'Nutritional', 'mild', true)
ON CONFLICT (id) DO NOTHING;

-- Create patient diagnoses for Sarah
INSERT INTO patient_diagnoses (id, patient_id, icd10_id, disease_id, diagnosis_date, diagnosed_by, status, severity, is_primary, notes) VALUES
  ('e1f2a3b4-c5d6-4890-efab-111111111111', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', 'c3d4e5f6-a7b8-4012-cdef-345678901234', 'd1a2b3c4-e5f6-4890-abcd-111111111111', '2020-06-15', 'Dr. Emily Chen', 'active', 'moderate', true, 'Well-controlled with Levothyroxine 88mcg daily'),
  ('e2f2a3b4-c5d6-4890-efab-222222222222', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', 'd4e5f6a7-b8c9-4123-defa-456789012345', 'd2a2b3c4-e5f6-4890-abcd-222222222222', '2025-01-15', 'Dr. Emily Chen', 'improving', 'mild', false, 'Started supplementation, levels improving')
ON CONFLICT (id) DO NOTHING;

-- Create 4 visits for Sarah Johnson (quarterly in 2025)
INSERT INTO visits (id, patient_id, visit_date, visit_type, visit_reason, provider_name, provider_specialty, facility_name, chief_complaint, subjective_notes, objective_notes, assessment, plan, status, billing_code, copay_amount, copay_collected) VALUES
  -- Visit 1: January 2025
  ('01a2b3c4-d5e6-4890-abcd-111111111111', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '2025-01-15 09:00:00', 'Follow-up', 'Quarterly thyroid check', 'Dr. Emily Chen', 'Endocrinology', 'NeXT Health Clinic', 'Routine thyroid follow-up', 'Patient reports feeling well. Energy levels stable. No new symptoms. Compliant with medication.', 'Alert and oriented. Thyroid not palpable. No tremor.', 'Hypothyroidism - well controlled. Vitamin D deficiency noted.', 'Continue Levothyroxine 88mcg. Start Vitamin D 2000 IU daily. Recheck labs in 3 months.', 'completed', '99214', 40.00, true),
  -- Visit 2: April 2025
  ('02a2b3c4-d5e6-4890-abcd-222222222222', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '2025-04-20 10:30:00', 'Follow-up', 'Quarterly thyroid check', 'Dr. Emily Chen', 'Endocrinology', 'NeXT Health Clinic', 'Routine thyroid follow-up', 'Patient reports increased energy since starting Vitamin D. Mild BP concerns.', 'Alert and oriented. BP slightly elevated.', 'Hypothyroidism - stable. Vitamin D improving. Borderline hypertension.', 'Continue current medications. Monitor BP at home. Lifestyle modifications discussed.', 'completed', '99214', 40.00, true),
  -- Visit 3: July 2025
  ('03a2b3c4-d5e6-4890-abcd-333333333333', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '2025-07-10 14:00:00', 'Follow-up', 'Quarterly thyroid check', 'Dr. Emily Chen', 'Endocrinology', 'NeXT Health Clinic', 'Routine thyroid follow-up', 'Patient reports weight loss of 3kg since last visit. Feeling more energetic.', 'Alert and oriented. Weight down. BP improved.', 'Hypothyroidism - stable. Good progress on weight and vitamin D.', 'Continue current regimen. Great progress on lifestyle changes.', 'completed', '99214', 40.00, true),
  -- Visit 4: October 2025
  ('04a2b3c4-d5e6-4890-abcd-444444444444', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '2025-10-15 11:00:00', 'Follow-up', 'Quarterly thyroid check', 'Dr. Emily Chen', 'Endocrinology', 'NeXT Health Clinic', 'Routine thyroid follow-up', 'Patient doing well. Weight continues to improve. No complaints.', 'Alert and oriented. Vital signs stable. Good overall condition.', 'Hypothyroidism - well controlled. Vitamin D now optimal. Weight in normal range.', 'Continue Levothyroxine. Vitamin D levels optimal - can reduce to 1000 IU maintenance. Annual labs in January.', 'completed', '99214', 40.00, true)
ON CONFLICT (id) DO NOTHING;

-- Create vital signs for each visit
INSERT INTO vital_signs (id, patient_id, visit_id, recorded_at, blood_pressure_systolic, blood_pressure_diastolic, blood_pressure_position, heart_rate_bpm, heart_rate_rhythm, respiratory_rate, oxygen_saturation, temperature_f, temperature_method, height_inches, weight_lbs, bmi, pain_level, recorded_by, notes) VALUES
  -- Visit 1: January 2025
  ('aa1a2b3c-d5e6-4890-abcd-111111111111', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '01a2b3c4-d5e6-4890-abcd-111111111111', '2025-01-15 08:45:00', 118, 78, 'sitting', 72, 'regular', 16, 98, 97.9, 'oral', 66, 185, 28.5, 0, 'RN Sarah Mitchell', 'Patient appears comfortable'),
  -- Visit 2: April 2025
  ('aa2a2b3c-d5e6-4890-abcd-222222222222', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '02a2b3c4-d5e6-4890-abcd-222222222222', '2025-04-20 10:15:00', 122, 82, 'sitting', 75, 'regular', 18, 99, 98.2, 'oral', 66, 182, 28.0, 0, 'RN Sarah Mitchell', 'BP slightly elevated - will recheck'),
  -- Visit 3: July 2025
  ('aa3a2b3c-d5e6-4890-abcd-333333333333', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '03a2b3c4-d5e6-4890-abcd-333333333333', '2025-07-10 13:45:00', 119, 79, 'sitting', 70, 'regular', 17, 98, 98.6, 'oral', 66, 178, 27.4, 0, 'RN Sarah Mitchell', 'Good improvement in weight'),
  -- Visit 4: October 2025
  ('aa4a2b3c-d5e6-4890-abcd-444444444444', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '04a2b3c4-d5e6-4890-abcd-444444444444', '2025-10-15 10:45:00', 120, 80, 'sitting', 74, 'regular', 16, 99, 98.1, 'oral', 66, 175, 26.9, 0, 'RN Sarah Mitchell', 'Excellent progress')
ON CONFLICT (id) DO NOTHING;

-- Create blood work for each visit (thyroid panel, vitamins, metabolic)
INSERT INTO blood_work (
  id, patient_id, visit_id, specimen_collected_at, results_received_at, order_number, lab_name, status,
  -- CBC
  wbc, rbc, hemoglobin, hematocrit, platelet_count, mcv, mch, mchc, rdw,
  -- BMP
  glucose, glucose_fasting, bun, creatinine, sodium, potassium, chloride, co2, calcium,
  -- Lipids
  total_cholesterol, ldl_cholesterol, hdl_cholesterol, triglycerides,
  -- Liver
  ast, alt, alp, bilirubin_total, albumin,
  -- Thyroid
  tsh, t3, t4, free_t4,
  -- Vitamins
  vitamin_d, vitamin_b12, iron, ferritin,
  -- Other
  hba1c, interpretation, notes, critical_values
) VALUES
  -- Visit 1: January 2025
  ('bb1a2b3c-d5e6-4890-abcd-111111111111', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '01a2b3c4-d5e6-4890-abcd-111111111111', '2025-01-15 09:15:00', '2025-01-16 14:00:00', 'LAB-2025-001', 'Quest Diagnostics', 'completed',
   -- CBC: Normal values
   7.2, 4.5, 13.8, 41.2, 245000, 91.5, 30.7, 33.5, 13.2,
   -- BMP: Normal glucose
   95, true, 14, 0.9, 140, 4.2, 102, 24, 9.4,
   -- Lipids: Borderline
   198, 118, 58, 142,
   -- Liver: Normal
   22, 19, 68, 0.8, 4.2,
   -- Thyroid: TSH normal, T4 normal
   2.8, 1.2, 7.2, 1.2,
   -- Vitamins: Vitamin D LOW
   22, 450, 85, 78,
   -- HbA1c normal
   5.4, 'Thyroid well-controlled. Vitamin D deficiency noted - recommend supplementation.', 'Fasting specimen. TSH Receptor Ab: 1.9 IU/L (elevated)', false),
  
  -- Visit 2: April 2025
  ('bb2a2b3c-d5e6-4890-abcd-222222222222', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '02a2b3c4-d5e6-4890-abcd-222222222222', '2025-04-20 10:45:00', '2025-04-21 15:00:00', 'LAB-2025-002', 'Quest Diagnostics', 'completed',
   -- CBC
   7.0, 4.6, 14.0, 42.0, 238000, 91.3, 30.4, 33.3, 13.0,
   -- BMP
   98, true, 15, 0.88, 141, 4.1, 101, 25, 9.5,
   -- Lipids
   195, 115, 60, 138,
   -- Liver
   20, 18, 65, 0.7, 4.3,
   -- Thyroid: Stable
   2.9, 1.25, 6.8, 1.3,
   -- Vitamins: D improving
   28, 465, 88, 82,
   -- HbA1c
   5.3, 'Thyroid stable. Vitamin D improving with supplementation.', 'Fasting specimen. TSH Receptor Ab: 1.6 IU/L (improving)', false),
  
  -- Visit 3: July 2025
  ('bb3a2b3c-d5e6-4890-abcd-333333333333', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '03a2b3c4-d5e6-4890-abcd-333333333333', '2025-07-10 14:15:00', '2025-07-11 16:00:00', 'LAB-2025-003', 'Quest Diagnostics', 'completed',
   -- CBC
   7.4, 4.55, 13.9, 41.8, 242000, 91.9, 30.5, 33.2, 12.9,
   -- BMP
   92, true, 13, 0.85, 139, 4.3, 103, 24, 9.6,
   -- Lipids: Improving
   188, 108, 62, 130,
   -- Liver
   21, 17, 62, 0.75, 4.4,
   -- Thyroid: T4 borderline low
   2.7, 1.18, 5.9, 1.2,
   -- Vitamins: D borderline normal
   35, 480, 90, 85,
   -- HbA1c
   5.2, 'Thyroid stable. Vitamin D approaching optimal range. Excellent metabolic improvement.', 'Fasting specimen. TSH Receptor Ab: 1.2 IU/L (borderline)', false),
  
  -- Visit 4: October 2025
  ('bb4a2b3c-d5e6-4890-abcd-444444444444', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '04a2b3c4-d5e6-4890-abcd-444444444444', '2025-10-15 11:15:00', '2025-10-16 14:30:00', 'LAB-2025-004', 'Quest Diagnostics', 'completed',
   -- CBC
   7.1, 4.52, 14.1, 42.2, 248000, 93.4, 31.2, 33.4, 12.8,
   -- BMP
   94, true, 14, 0.87, 140, 4.2, 102, 25, 9.5,
   -- Lipids: Good
   182, 102, 65, 125,
   -- Liver
   19, 16, 60, 0.72, 4.5,
   -- Thyroid: T4 low end but acceptable
   2.8, 1.15, 5.2, 1.1,
   -- Vitamins: D optimal
   42, 495, 92, 88,
   -- HbA1c
   5.1, 'Thyroid well-controlled. Vitamin D now optimal. TSH Receptor Ab normalized. Excellent overall metabolic health.', 'Fasting specimen. TSH Receptor Ab: 0.8 IU/L (normal)', false)
ON CONFLICT (id) DO NOTHING;

-- Create prescriptions for Sarah Johnson
INSERT INTO prescriptions (
  id, patient_id, visit_id, icd10_id, medication_name, generic_name, dosage_amount, dosage_unit, dosage_form, frequency, route, 
  quantity, days_supply, refills_authorized, refills_remaining, instructions, indication, prescriber_name, prescriber_npi,
  pharmacy_name, pharmacy_phone, pharmacy_address, prescribed_date, start_date, status, dispense_as_written, take_with_food,
  is_controlled_substance
) VALUES
  -- Levothyroxine (ongoing)
  ('cc1a2b3c-d5e6-4890-abcd-111111111111', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '01a2b3c4-d5e6-4890-abcd-111111111111', 'c3d4e5f6-a7b8-4012-cdef-345678901234',
   'Synthroid', 'Levothyroxine Sodium', '88', 'mcg', 'tablet', 'Once daily', 'oral',
   90, 90, 3, 2, 'Take on empty stomach, 30-60 minutes before breakfast. Do not take with calcium or iron supplements.', 'Hypothyroidism management', 'Dr. Emily Chen', '1234567890',
   'CVS Pharmacy', '555-0200', '456 Market St, San Francisco, CA 94102', '2025-01-15', '2025-01-15', 'active', true, false, false),
  
  -- Vitamin D3 (started Jan 2025)
  ('cc2a2b3c-d5e6-4890-abcd-222222222222', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '01a2b3c4-d5e6-4890-abcd-111111111111', 'd4e5f6a7-b8c9-4123-defa-456789012345',
   'Vitamin D3', 'Cholecalciferol', '2000', 'IU', 'softgel', 'Once daily', 'oral',
   90, 90, 3, 1, 'Take with food for better absorption.', 'Vitamin D deficiency', 'Dr. Emily Chen', '1234567890',
   'CVS Pharmacy', '555-0200', '456 Market St, San Francisco, CA 94102', '2025-01-15', '2025-01-15', 'active', false, true, false),
  
  -- Vitamin D3 maintenance dose (updated Oct 2025)
  ('cc3a2b3c-d5e6-4890-abcd-333333333333', 'b2c3d4e5-f6a7-4901-bcde-f23456789012', '04a2b3c4-d5e6-4890-abcd-444444444444', 'd4e5f6a7-b8c9-4123-defa-456789012345',
   'Vitamin D3', 'Cholecalciferol', '1000', 'IU', 'softgel', 'Once daily', 'oral',
   90, 90, 3, 3, 'Maintenance dose. Take with food.', 'Vitamin D maintenance after deficiency correction', 'Dr. Emily Chen', '1234567890',
   'CVS Pharmacy', '555-0200', '456 Market St, San Francisco, CA 94102', '2025-10-15', '2025-10-15', 'active', false, true, false)
ON CONFLICT (id) DO NOTHING;

-- Link diagnoses to visits
INSERT INTO visit_diagnoses (id, visit_id, patient_diagnosis_id, is_primary, sequence_number) VALUES
  ('dd1a2b3c-d5e6-4890-abcd-111111111111', '01a2b3c4-d5e6-4890-abcd-111111111111', 'e1f2a3b4-c5d6-4890-efab-111111111111', true, 1),
  ('dd2a2b3c-d5e6-4890-abcd-111111111112', '01a2b3c4-d5e6-4890-abcd-111111111111', 'e2f2a3b4-c5d6-4890-efab-222222222222', false, 2),
  ('dd3a2b3c-d5e6-4890-abcd-222222222221', '02a2b3c4-d5e6-4890-abcd-222222222222', 'e1f2a3b4-c5d6-4890-efab-111111111111', true, 1),
  ('dd4a2b3c-d5e6-4890-abcd-222222222222', '02a2b3c4-d5e6-4890-abcd-222222222222', 'e2f2a3b4-c5d6-4890-efab-222222222222', false, 2),
  ('dd5a2b3c-d5e6-4890-abcd-333333333331', '03a2b3c4-d5e6-4890-abcd-333333333333', 'e1f2a3b4-c5d6-4890-efab-111111111111', true, 1),
  ('dd6a2b3c-d5e6-4890-abcd-333333333332', '03a2b3c4-d5e6-4890-abcd-333333333333', 'e2f2a3b4-c5d6-4890-efab-222222222222', false, 2),
  ('dd7a2b3c-d5e6-4890-abcd-444444444441', '04a2b3c4-d5e6-4890-abcd-444444444444', 'e1f2a3b4-c5d6-4890-efab-111111111111', true, 1),
  ('dd8a2b3c-d5e6-4890-abcd-444444444442', '04a2b3c4-d5e6-4890-abcd-444444444444', 'e2f2a3b4-c5d6-4890-efab-222222222222', false, 2)
ON CONFLICT (id) DO NOTHING;
