-- ============================================
-- Seed ICD-10 Codes (Common Codes)
-- ============================================

INSERT INTO icd10_codes (code, short_description, long_description, category) VALUES
-- Endocrine, nutritional and metabolic diseases (E00-E89)
('E05.00', 'Thyrotoxicosis with diffuse goiter without thyrotoxic crisis', 'Thyrotoxicosis with diffuse goiter without thyrotoxic crisis or storm', 'Thyroid'),
('E05.90', 'Thyrotoxicosis, unspecified without thyrotoxic crisis', 'Thyrotoxicosis, unspecified without thyrotoxic crisis or storm', 'Thyroid'),
('E06.3', 'Autoimmune thyroiditis', 'Autoimmune thyroiditis', 'Thyroid'),
('E03.9', 'Hypothyroidism, unspecified', 'Hypothyroidism, unspecified', 'Thyroid'),
('E11.9', 'Type 2 diabetes mellitus without complications', 'Type 2 diabetes mellitus without complications', 'Diabetes'),
('E11.65', 'Type 2 diabetes mellitus with hyperglycemia', 'Type 2 diabetes mellitus with hyperglycemia', 'Diabetes'),
('E55.9', 'Vitamin D deficiency, unspecified', 'Vitamin D deficiency, unspecified', 'Nutrition'),
('E78.5', 'Hyperlipidemia, unspecified', 'Hyperlipidemia, unspecified', 'Metabolic'),
('E78.00', 'Pure hypercholesterolemia, unspecified', 'Pure hypercholesterolemia, unspecified', 'Metabolic'),
('E66.9', 'Obesity, unspecified', 'Obesity, unspecified', 'Metabolic'),
-- Circulatory system (I00-I99)
('I10', 'Essential (primary) hypertension', 'Essential (primary) hypertension', 'Cardiovascular'),
('I25.10', 'Atherosclerotic heart disease of native coronary artery', 'Atherosclerotic heart disease of native coronary artery without angina pectoris', 'Cardiovascular'),
('I50.9', 'Heart failure, unspecified', 'Heart failure, unspecified', 'Cardiovascular'),
('I48.91', 'Unspecified atrial fibrillation', 'Unspecified atrial fibrillation', 'Cardiovascular'),
-- Respiratory system (J00-J99)
('J06.9', 'Acute upper respiratory infection, unspecified', 'Acute upper respiratory infection, unspecified', 'Respiratory'),
('J18.9', 'Pneumonia, unspecified organism', 'Pneumonia, unspecified organism', 'Respiratory'),
('J45.909', 'Unspecified asthma, uncomplicated', 'Unspecified asthma, uncomplicated', 'Respiratory'),
-- Mental and behavioral disorders (F00-F99)
('F32.9', 'Major depressive disorder, single episode, unspecified', 'Major depressive disorder, single episode, unspecified', 'Mental Health'),
('F41.1', 'Generalized anxiety disorder', 'Generalized anxiety disorder', 'Mental Health'),
('F41.9', 'Anxiety disorder, unspecified', 'Anxiety disorder, unspecified', 'Mental Health'),
-- Musculoskeletal system (M00-M99)
('M54.5', 'Low back pain', 'Low back pain', 'Musculoskeletal'),
('M79.3', 'Panniculitis, unspecified', 'Panniculitis, unspecified', 'Musculoskeletal'),
('M25.50', 'Pain in unspecified joint', 'Pain in unspecified joint', 'Musculoskeletal'),
-- Symptoms and signs (R00-R99)
('R51.9', 'Headache, unspecified', 'Headache, unspecified', 'Symptoms'),
('R10.9', 'Unspecified abdominal pain', 'Unspecified abdominal pain', 'Symptoms'),
('R53.83', 'Other fatigue', 'Other fatigue', 'Symptoms'),
('R05.9', 'Cough, unspecified', 'Cough, unspecified', 'Symptoms'),
('R50.9', 'Fever, unspecified', 'Fever, unspecified', 'Symptoms'),
-- General examination (Z00-Z99)
('Z00.00', 'Encounter for general adult medical examination', 'Encounter for general adult medical examination without abnormal findings', 'Preventive'),
('Z12.31', 'Encounter for screening mammogram', 'Encounter for screening mammogram for malignant neoplasm of breast', 'Preventive'),
('Z23', 'Encounter for immunization', 'Encounter for immunization', 'Preventive')
ON CONFLICT (code) DO NOTHING;
