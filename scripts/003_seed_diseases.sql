-- ============================================
-- Seed Diseases
-- Link diseases to ICD-10 codes
-- ============================================

-- First, we need to get the ICD-10 code IDs
INSERT INTO diseases (name, common_name, description, symptoms, risk_factors, disease_type, body_system, severity_level, is_communicable, primary_icd10_id)
SELECT 
  'Type 2 Diabetes Mellitus',
  'Diabetes',
  'A chronic condition that affects the way the body processes blood sugar (glucose).',
  ARRAY['Increased thirst', 'Frequent urination', 'Fatigue', 'Blurred vision', 'Slow healing wounds'],
  ARRAY['Obesity', 'Family history', 'Sedentary lifestyle', 'Age over 45'],
  'Chronic',
  'Endocrine',
  'Moderate',
  false,
  id
FROM icd10_codes WHERE code = 'E11.9';

INSERT INTO diseases (name, common_name, description, symptoms, risk_factors, disease_type, body_system, severity_level, is_communicable, primary_icd10_id)
SELECT 
  'Essential Hypertension',
  'High Blood Pressure',
  'A chronic condition in which the force of blood against artery walls is too high.',
  ARRAY['Often no symptoms', 'Headaches', 'Shortness of breath', 'Nosebleeds'],
  ARRAY['Age', 'Family history', 'Obesity', 'High sodium diet', 'Stress'],
  'Chronic',
  'Cardiovascular',
  'Moderate',
  false,
  id
FROM icd10_codes WHERE code = 'I10';

INSERT INTO diseases (name, common_name, description, symptoms, risk_factors, disease_type, body_system, severity_level, is_communicable, primary_icd10_id)
SELECT 
  'Hypothyroidism',
  'Underactive Thyroid',
  'A condition in which the thyroid gland does not produce enough thyroid hormone.',
  ARRAY['Fatigue', 'Weight gain', 'Cold intolerance', 'Dry skin', 'Depression'],
  ARRAY['Female gender', 'Age over 60', 'Family history', 'Autoimmune disease'],
  'Chronic',
  'Endocrine',
  'Mild',
  false,
  id
FROM icd10_codes WHERE code = 'E03.9';

INSERT INTO diseases (name, common_name, description, symptoms, risk_factors, disease_type, body_system, severity_level, is_communicable, primary_icd10_id)
SELECT 
  'Hyperlipidemia',
  'High Cholesterol',
  'A condition characterized by elevated levels of lipids in the blood.',
  ARRAY['Usually no symptoms', 'Fatty deposits around eyes', 'Chest pain if severe'],
  ARRAY['Diet high in saturated fats', 'Obesity', 'Family history', 'Diabetes'],
  'Chronic',
  'Cardiovascular',
  'Moderate',
  false,
  id
FROM icd10_codes WHERE code = 'E78.5';

INSERT INTO diseases (name, common_name, description, symptoms, risk_factors, disease_type, body_system, severity_level, is_communicable, primary_icd10_id)
SELECT 
  'Acute Upper Respiratory Infection',
  'Common Cold',
  'A viral infection of the upper respiratory tract.',
  ARRAY['Runny nose', 'Sore throat', 'Cough', 'Sneezing', 'Mild fever'],
  ARRAY['Exposure to infected individuals', 'Weakened immune system', 'Cold weather'],
  'Acute',
  'Respiratory',
  'Mild',
  true,
  id
FROM icd10_codes WHERE code = 'J06.9';

INSERT INTO diseases (name, common_name, description, symptoms, risk_factors, disease_type, body_system, severity_level, is_communicable, primary_icd10_id)
SELECT 
  'Major Depressive Disorder',
  'Depression',
  'A mental health disorder characterized by persistently depressed mood and loss of interest.',
  ARRAY['Persistent sadness', 'Loss of interest', 'Sleep changes', 'Fatigue', 'Difficulty concentrating'],
  ARRAY['Family history', 'Trauma', 'Chronic illness', 'Certain medications'],
  'Chronic',
  'Neurological',
  'Moderate',
  false,
  id
FROM icd10_codes WHERE code = 'F32.9';

INSERT INTO diseases (name, common_name, description, symptoms, risk_factors, disease_type, body_system, severity_level, is_communicable, primary_icd10_id)
SELECT 
  'Generalized Anxiety Disorder',
  'Anxiety',
  'A mental health condition characterized by excessive worry and anxiety.',
  ARRAY['Excessive worry', 'Restlessness', 'Difficulty sleeping', 'Muscle tension', 'Irritability'],
  ARRAY['Family history', 'Personality factors', 'Trauma', 'Chronic stress'],
  'Chronic',
  'Neurological',
  'Moderate',
  false,
  id
FROM icd10_codes WHERE code = 'F41.9';

INSERT INTO diseases (name, common_name, description, symptoms, risk_factors, disease_type, body_system, severity_level, is_communicable, primary_icd10_id)
SELECT 
  'Urinary Tract Infection',
  'UTI',
  'An infection in any part of the urinary system.',
  ARRAY['Burning urination', 'Frequent urination', 'Cloudy urine', 'Pelvic pain'],
  ARRAY['Female anatomy', 'Sexual activity', 'Urinary catheters', 'Weakened immune system'],
  'Acute',
  'Genitourinary',
  'Mild',
  false,
  id
FROM icd10_codes WHERE code = 'N39.0';

INSERT INTO diseases (name, common_name, description, symptoms, risk_factors, disease_type, body_system, severity_level, is_communicable, primary_icd10_id)
SELECT 
  'Gastroesophageal Reflux Disease',
  'GERD / Acid Reflux',
  'A chronic digestive disease where stomach acid flows back into the esophagus.',
  ARRAY['Heartburn', 'Regurgitation', 'Difficulty swallowing', 'Chest pain'],
  ARRAY['Obesity', 'Hiatal hernia', 'Pregnancy', 'Smoking', 'Certain foods'],
  'Chronic',
  'Digestive',
  'Mild',
  false,
  id
FROM icd10_codes WHERE code = 'K21.0';

INSERT INTO diseases (name, common_name, description, symptoms, risk_factors, disease_type, body_system, severity_level, is_communicable, primary_icd10_id)
SELECT 
  'Chronic Low Back Pain',
  'Lower Back Pain',
  'Pain in the lower back that persists for more than 12 weeks.',
  ARRAY['Dull aching pain', 'Muscle stiffness', 'Limited mobility', 'Pain radiating to legs'],
  ARRAY['Age', 'Sedentary lifestyle', 'Obesity', 'Poor posture', 'Heavy lifting'],
  'Chronic',
  'Musculoskeletal',
  'Moderate',
  false,
  id
FROM icd10_codes WHERE code = 'M54.5';
