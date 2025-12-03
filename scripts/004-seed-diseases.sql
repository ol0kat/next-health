-- ============================================
-- Seed Diseases
-- ============================================

-- Get ICD-10 IDs for linking
DO $$
DECLARE
    v_hypothyroidism_id UUID;
    v_hyperthyroidism_id UUID;
    v_hashimoto_id UUID;
    v_diabetes_id UUID;
    v_hypertension_id UUID;
    v_hyperlipidemia_id UUID;
    v_vitamin_d_def_id UUID;
    v_anxiety_id UUID;
    v_depression_id UUID;
BEGIN
    SELECT id INTO v_hypothyroidism_id FROM icd10_codes WHERE code = 'E03.9';
    SELECT id INTO v_hyperthyroidism_id FROM icd10_codes WHERE code = 'E05.90';
    SELECT id INTO v_hashimoto_id FROM icd10_codes WHERE code = 'E06.3';
    SELECT id INTO v_diabetes_id FROM icd10_codes WHERE code = 'E11.9';
    SELECT id INTO v_hypertension_id FROM icd10_codes WHERE code = 'I10';
    SELECT id INTO v_hyperlipidemia_id FROM icd10_codes WHERE code = 'E78.5';
    SELECT id INTO v_vitamin_d_def_id FROM icd10_codes WHERE code = 'E55.9';
    SELECT id INTO v_anxiety_id FROM icd10_codes WHERE code = 'F41.1';
    SELECT id INTO v_depression_id FROM icd10_codes WHERE code = 'F32.9';

    INSERT INTO diseases (name, common_name, description, primary_icd10_id, category) VALUES
    ('Hypothyroidism', 'Underactive Thyroid', 'A condition where the thyroid gland does not produce enough thyroid hormone', v_hypothyroidism_id, 'Endocrine'),
    ('Hyperthyroidism', 'Overactive Thyroid', 'A condition where the thyroid gland produces too much thyroid hormone', v_hyperthyroidism_id, 'Endocrine'),
    ('Hashimoto Thyroiditis', 'Hashimoto Disease', 'An autoimmune disorder affecting the thyroid gland', v_hashimoto_id, 'Endocrine'),
    ('Type 2 Diabetes Mellitus', 'Type 2 Diabetes', 'A chronic condition affecting the way the body processes blood sugar', v_diabetes_id, 'Endocrine'),
    ('Essential Hypertension', 'High Blood Pressure', 'A condition in which the force of blood against artery walls is too high', v_hypertension_id, 'Cardiovascular'),
    ('Hyperlipidemia', 'High Cholesterol', 'Abnormally elevated levels of lipids in the blood', v_hyperlipidemia_id, 'Metabolic'),
    ('Vitamin D Deficiency', 'Low Vitamin D', 'A condition where vitamin D levels in the blood are below normal', v_vitamin_d_def_id, 'Nutrition'),
    ('Generalized Anxiety Disorder', 'Anxiety', 'A mental health disorder characterized by persistent and excessive worry', v_anxiety_id, 'Mental Health'),
    ('Major Depressive Disorder', 'Depression', 'A mood disorder causing persistent feelings of sadness and loss of interest', v_depression_id, 'Mental Health')
    ON CONFLICT DO NOTHING;
END $$;
