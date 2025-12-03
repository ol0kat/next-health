-- ============================================
-- Row Level Security Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_work ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE icd10_codes ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations for authenticated and anon users (development mode)
-- In production, these should be restricted based on user roles

-- Patients policies
CREATE POLICY "Allow all operations on patients" ON patients FOR ALL USING (true) WITH CHECK (true);

-- Guardians policies
CREATE POLICY "Allow all operations on guardians" ON guardians FOR ALL USING (true) WITH CHECK (true);

-- Visits policies
CREATE POLICY "Allow all operations on visits" ON visits FOR ALL USING (true) WITH CHECK (true);

-- Vital signs policies
CREATE POLICY "Allow all operations on vital_signs" ON vital_signs FOR ALL USING (true) WITH CHECK (true);

-- Blood work policies
CREATE POLICY "Allow all operations on blood_work" ON blood_work FOR ALL USING (true) WITH CHECK (true);

-- Prescriptions policies
CREATE POLICY "Allow all operations on prescriptions" ON prescriptions FOR ALL USING (true) WITH CHECK (true);

-- Patient diagnoses policies
CREATE POLICY "Allow all operations on patient_diagnoses" ON patient_diagnoses FOR ALL USING (true) WITH CHECK (true);

-- Visit diagnoses policies
CREATE POLICY "Allow all operations on visit_diagnoses" ON visit_diagnoses FOR ALL USING (true) WITH CHECK (true);

-- Diseases policies
CREATE POLICY "Allow all operations on diseases" ON diseases FOR ALL USING (true) WITH CHECK (true);

-- ICD-10 codes policies
CREATE POLICY "Allow all operations on icd10_codes" ON icd10_codes FOR ALL USING (true) WITH CHECK (true);
