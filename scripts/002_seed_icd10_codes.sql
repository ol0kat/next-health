-- ============================================
-- Seed ICD-10 Codes
-- Common diagnosis codes for healthcare
-- ============================================

INSERT INTO icd10_codes (code, short_description, long_description, category, is_billable) VALUES
-- Endocrine Disorders
('E11.9', 'Type 2 diabetes mellitus without complications', 'Type 2 diabetes mellitus without complications', 'Endocrine', true),
('E11.65', 'Type 2 diabetes mellitus with hyperglycemia', 'Type 2 diabetes mellitus with hyperglycemia', 'Endocrine', true),
('E03.9', 'Hypothyroidism, unspecified', 'Hypothyroidism, unspecified', 'Endocrine', true),
('E05.90', 'Thyrotoxicosis, unspecified', 'Thyrotoxicosis, unspecified without thyrotoxic crisis', 'Endocrine', true),
('E78.5', 'Hyperlipidemia, unspecified', 'Hyperlipidemia, unspecified', 'Endocrine', true),

-- Circulatory System
('I10', 'Essential (primary) hypertension', 'Essential (primary) hypertension', 'Circulatory', true),
('I25.10', 'Atherosclerotic heart disease', 'Atherosclerotic heart disease of native coronary artery without angina pectoris', 'Circulatory', true),
('I48.91', 'Unspecified atrial fibrillation', 'Unspecified atrial fibrillation', 'Circulatory', true),
('I50.9', 'Heart failure, unspecified', 'Heart failure, unspecified', 'Circulatory', true),

-- Respiratory System
('J06.9', 'Acute upper respiratory infection', 'Acute upper respiratory infection, unspecified', 'Respiratory', true),
('J18.9', 'Pneumonia, unspecified organism', 'Pneumonia, unspecified organism', 'Respiratory', true),
('J45.909', 'Unspecified asthma, uncomplicated', 'Unspecified asthma, uncomplicated', 'Respiratory', true),
('J44.9', 'COPD, unspecified', 'Chronic obstructive pulmonary disease, unspecified', 'Respiratory', true),

-- Musculoskeletal
('M54.5', 'Low back pain', 'Low back pain', 'Musculoskeletal', true),
('M25.50', 'Pain in unspecified joint', 'Pain in unspecified joint', 'Musculoskeletal', true),
('M79.3', 'Panniculitis, unspecified', 'Panniculitis, unspecified', 'Musculoskeletal', true),

-- Mental Health
('F32.9', 'Major depressive disorder, single episode', 'Major depressive disorder, single episode, unspecified', 'Mental Health', true),
('F41.9', 'Anxiety disorder, unspecified', 'Anxiety disorder, unspecified', 'Mental Health', true),
('F10.20', 'Alcohol dependence, uncomplicated', 'Alcohol dependence, uncomplicated', 'Mental Health', true),

-- Digestive System
('K21.0', 'GERD with esophagitis', 'Gastro-esophageal reflux disease with esophagitis', 'Digestive', true),
('K29.70', 'Gastritis, unspecified', 'Gastritis, unspecified, without bleeding', 'Digestive', true),
('K58.9', 'Irritable bowel syndrome', 'Irritable bowel syndrome without diarrhea', 'Digestive', true),

-- Genitourinary
('N39.0', 'Urinary tract infection', 'Urinary tract infection, site not specified', 'Genitourinary', true),
('N18.9', 'Chronic kidney disease, unspecified', 'Chronic kidney disease, unspecified', 'Genitourinary', true),

-- Symptoms and Signs
('R05.9', 'Cough, unspecified', 'Cough, unspecified', 'Symptoms', true),
('R50.9', 'Fever, unspecified', 'Fever, unspecified', 'Symptoms', true),
('R51.9', 'Headache, unspecified', 'Headache, unspecified', 'Symptoms', true),
('R53.83', 'Other fatigue', 'Other fatigue', 'Symptoms', true),

-- Infectious Diseases
('B34.9', 'Viral infection, unspecified', 'Viral infection, unspecified', 'Infectious', true),
('A09', 'Infectious gastroenteritis', 'Infectious gastroenteritis and colitis, unspecified', 'Infectious', true),

-- Skin
('L30.9', 'Dermatitis, unspecified', 'Dermatitis, unspecified', 'Skin', true),
('L50.9', 'Urticaria, unspecified', 'Urticaria, unspecified', 'Skin', true)

ON CONFLICT (code) DO NOTHING;
