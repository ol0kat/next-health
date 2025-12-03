-- ============================================
-- NeXT Health Database Schema
-- Version: 1.0
-- Description: Comprehensive healthcare database with proper relationships
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. GUARDIANS / NEXT OF KIN TABLE
-- ============================================
CREATE TABLE guardians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL, -- e.g., 'Parent', 'Spouse', 'Sibling', 'Child', 'Legal Guardian'
    phone_primary VARCHAR(20) NOT NULL,
    phone_secondary VARCHAR(20),
    email VARCHAR(255),
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(50),
    address_zip VARCHAR(20),
    address_country VARCHAR(100) DEFAULT 'USA',
    is_emergency_contact BOOLEAN DEFAULT true,
    is_legal_guardian BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. PATIENTS TABLE
-- ============================================
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20), -- 'Male', 'Female', 'Other', 'Prefer not to say'
    ssn_last_four VARCHAR(4), -- Last 4 digits only for verification
    
    -- Contact Information
    phone_primary VARCHAR(20),
    phone_secondary VARCHAR(20),
    email VARCHAR(255),
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(50),
    address_zip VARCHAR(20),
    address_country VARCHAR(100) DEFAULT 'USA',
    
    -- Medical Information
    blood_type VARCHAR(5), -- 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
    allergies TEXT[], -- Array of known allergies
    medical_notes TEXT,
    
    -- Insurance Information
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(100),
    insurance_group_number VARCHAR(100),
    
    -- Guardian / Next of Kin (Foreign Key)
    primary_guardian_id UUID REFERENCES guardians(id) ON DELETE SET NULL,
    secondary_guardian_id UUID REFERENCES guardians(id) ON DELETE SET NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster patient lookups
CREATE INDEX idx_patients_name ON patients(last_name, first_name);
CREATE INDEX idx_patients_dob ON patients(date_of_birth);
CREATE INDEX idx_patients_guardian ON patients(primary_guardian_id);

-- ============================================
-- 3. ICD-10 CODES TABLE (Reference Table)
-- ============================================
CREATE TABLE icd10_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) NOT NULL UNIQUE, -- e.g., 'E11.9', 'I10', 'J06.9'
    short_description VARCHAR(255) NOT NULL,
    long_description TEXT,
    category VARCHAR(100), -- e.g., 'Endocrine', 'Circulatory', 'Respiratory'
    subcategory VARCHAR(100),
    is_billable BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast ICD-10 lookups
CREATE INDEX idx_icd10_code ON icd10_codes(code);
CREATE INDEX idx_icd10_category ON icd10_codes(category);

-- ============================================
-- 4. DISEASES TABLE
-- ============================================
CREATE TABLE diseases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    common_name VARCHAR(255), -- Layman's term
    description TEXT,
    symptoms TEXT[],
    risk_factors TEXT[],
    prevention TEXT,
    treatment_overview TEXT,
    
    -- Link to ICD-10 (many diseases can map to one ICD-10 code)
    primary_icd10_id UUID REFERENCES icd10_codes(id) ON DELETE SET NULL,
    
    -- Classification
    disease_type VARCHAR(100), -- 'Chronic', 'Acute', 'Infectious', 'Genetic', etc.
    body_system VARCHAR(100), -- 'Cardiovascular', 'Respiratory', 'Neurological', etc.
    severity_level VARCHAR(20), -- 'Mild', 'Moderate', 'Severe', 'Critical'
    is_communicable BOOLEAN DEFAULT false,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for disease lookups
CREATE INDEX idx_diseases_name ON diseases(name);
CREATE INDEX idx_diseases_icd10 ON diseases(primary_icd10_id);
CREATE INDEX idx_diseases_type ON diseases(disease_type);

-- ============================================
-- 5. VISITS TABLE
-- ============================================
CREATE TABLE visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Visit Details
    visit_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    visit_type VARCHAR(50) NOT NULL, -- 'Routine', 'Follow-up', 'Emergency', 'Specialist', 'Lab Only'
    visit_reason TEXT,
    
    -- Provider Information
    provider_name VARCHAR(255),
    provider_specialty VARCHAR(100),
    facility_name VARCHAR(255),
    
    -- Visit Notes
    chief_complaint TEXT,
    subjective_notes TEXT, -- Patient's description
    objective_notes TEXT, -- Provider's observations
    assessment TEXT, -- Provider's assessment
    plan TEXT, -- Treatment plan
    
    -- Status
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'checked-in', 'in-progress', 'completed', 'cancelled', 'no-show'
    checkout_time TIMESTAMPTZ,
    
    -- Billing
    billing_code VARCHAR(50),
    copay_amount DECIMAL(10,2),
    copay_collected BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for visit queries
CREATE INDEX idx_visits_patient ON visits(patient_id);
CREATE INDEX idx_visits_date ON visits(visit_date);
CREATE INDEX idx_visits_status ON visits(status);

-- ============================================
-- 6. VITAL SIGNS TABLE
-- ============================================
CREATE TABLE vital_signs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Timestamp of measurement
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Core Vital Signs
    temperature_f DECIMAL(4,1), -- e.g., 98.6
    temperature_method VARCHAR(20), -- 'Oral', 'Tympanic', 'Axillary', 'Rectal', 'Temporal'
    
    heart_rate_bpm INTEGER, -- beats per minute
    heart_rate_rhythm VARCHAR(20), -- 'Regular', 'Irregular'
    
    respiratory_rate INTEGER, -- breaths per minute
    
    blood_pressure_systolic INTEGER, -- mmHg
    blood_pressure_diastolic INTEGER, -- mmHg
    blood_pressure_position VARCHAR(20), -- 'Sitting', 'Standing', 'Lying'
    
    oxygen_saturation DECIMAL(4,1), -- SpO2 percentage
    oxygen_supplemental BOOLEAN DEFAULT false,
    oxygen_flow_rate DECIMAL(4,1), -- L/min if supplemental
    
    -- Physical Measurements
    height_inches DECIMAL(5,2),
    weight_lbs DECIMAL(6,2),
    bmi DECIMAL(4,1), -- Can be calculated
    
    -- Pain Assessment
    pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10), -- 0-10 scale
    pain_location VARCHAR(255),
    
    -- Blood Glucose (if measured)
    blood_glucose_mg_dl INTEGER,
    blood_glucose_timing VARCHAR(20), -- 'Fasting', 'Random', 'Post-meal'
    
    -- Notes
    notes TEXT,
    recorded_by VARCHAR(255),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for vital signs
CREATE INDEX idx_vitals_visit ON vital_signs(visit_id);
CREATE INDEX idx_vitals_patient ON vital_signs(patient_id);
CREATE INDEX idx_vitals_recorded ON vital_signs(recorded_at);

-- ============================================
-- 7. BLOOD WORK / LAB RESULTS TABLE
-- ============================================
CREATE TABLE blood_work (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Lab Information
    lab_name VARCHAR(255),
    specimen_collected_at TIMESTAMPTZ,
    results_received_at TIMESTAMPTZ,
    order_number VARCHAR(100),
    
    -- Complete Blood Count (CBC)
    wbc DECIMAL(6,2), -- White Blood Cells (K/uL)
    rbc DECIMAL(4,2), -- Red Blood Cells (M/uL)
    hemoglobin DECIMAL(4,1), -- g/dL
    hematocrit DECIMAL(4,1), -- %
    platelet_count INTEGER, -- K/uL
    mcv DECIMAL(5,1), -- Mean Corpuscular Volume (fL)
    mch DECIMAL(4,1), -- Mean Corpuscular Hemoglobin (pg)
    mchc DECIMAL(4,1), -- Mean Corpuscular Hemoglobin Concentration (g/dL)
    rdw DECIMAL(4,1), -- Red Cell Distribution Width (%)
    
    -- Basic Metabolic Panel (BMP)
    glucose DECIMAL(5,1), -- mg/dL
    glucose_fasting BOOLEAN,
    bun DECIMAL(5,1), -- Blood Urea Nitrogen (mg/dL)
    creatinine DECIMAL(4,2), -- mg/dL
    sodium INTEGER, -- mEq/L
    potassium DECIMAL(3,1), -- mEq/L
    chloride INTEGER, -- mEq/L
    co2 INTEGER, -- mEq/L
    calcium DECIMAL(4,1), -- mg/dL
    
    -- Lipid Panel
    total_cholesterol INTEGER, -- mg/dL
    ldl_cholesterol INTEGER, -- mg/dL
    hdl_cholesterol INTEGER, -- mg/dL
    triglycerides INTEGER, -- mg/dL
    
    -- Liver Function Tests
    ast INTEGER, -- Aspartate Aminotransferase (U/L)
    alt INTEGER, -- Alanine Aminotransferase (U/L)
    alp INTEGER, -- Alkaline Phosphatase (U/L)
    bilirubin_total DECIMAL(4,2), -- mg/dL
    albumin DECIMAL(3,1), -- g/dL
    
    -- Thyroid Panel
    tsh DECIMAL(5,2), -- mIU/L
    t3 DECIMAL(5,1), -- ng/dL
    t4 DECIMAL(4,1), -- ug/dL
    free_t4 DECIMAL(4,2), -- ng/dL
    
    -- Hemoglobin A1C
    hba1c DECIMAL(3,1), -- %
    
    -- Other Common Tests
    vitamin_d DECIMAL(5,1), -- ng/mL
    vitamin_b12 DECIMAL(6,1), -- pg/mL
    iron INTEGER, -- ug/dL
    ferritin DECIMAL(6,1), -- ng/mL
    
    -- PSA (Prostate)
    psa DECIMAL(5,2), -- ng/mL
    
    -- Urinalysis Summary
    urinalysis_performed BOOLEAN DEFAULT false,
    urinalysis_notes TEXT,
    
    -- Status and Notes
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'partial', 'complete', 'cancelled'
    interpretation TEXT, -- Provider's interpretation
    critical_values BOOLEAN DEFAULT false,
    critical_values_notified BOOLEAN DEFAULT false,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for blood work
CREATE INDEX idx_bloodwork_visit ON blood_work(visit_id);
CREATE INDEX idx_bloodwork_patient ON blood_work(patient_id);
CREATE INDEX idx_bloodwork_collected ON blood_work(specimen_collected_at);
CREATE INDEX idx_bloodwork_status ON blood_work(status);

-- ============================================
-- 8. PRESCRIPTIONS TABLE
-- ============================================
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES visits(id) ON DELETE SET NULL, -- Optional link to visit
    
    -- Medication Information
    medication_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    ndc_code VARCHAR(20), -- National Drug Code
    
    -- Dosage Information
    dosage_amount VARCHAR(50) NOT NULL, -- e.g., '500', '10-20'
    dosage_unit VARCHAR(20) NOT NULL, -- 'mg', 'mL', 'mcg', 'units'
    dosage_form VARCHAR(50) NOT NULL, -- 'Tablet', 'Capsule', 'Liquid', 'Injection', 'Patch', 'Cream'
    
    -- Instructions
    frequency VARCHAR(100) NOT NULL, -- 'Once daily', 'Twice daily', 'Every 8 hours', 'As needed'
    route VARCHAR(50) NOT NULL, -- 'Oral', 'Topical', 'Subcutaneous', 'Intramuscular', 'IV', 'Inhaled'
    instructions TEXT, -- Special instructions
    take_with_food BOOLEAN,
    
    -- Duration and Quantity
    quantity INTEGER NOT NULL,
    days_supply INTEGER,
    refills_authorized INTEGER DEFAULT 0,
    refills_remaining INTEGER DEFAULT 0,
    
    -- Dates
    prescribed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_date DATE,
    end_date DATE,
    
    -- Prescriber Information
    prescriber_name VARCHAR(255) NOT NULL,
    prescriber_npi VARCHAR(20), -- National Provider Identifier
    prescriber_dea VARCHAR(20), -- DEA number for controlled substances
    
    -- Pharmacy Information
    pharmacy_name VARCHAR(255),
    pharmacy_phone VARCHAR(20),
    pharmacy_address TEXT,
    
    -- Clinical Information
    diagnosis_id UUID REFERENCES diseases(id) ON DELETE SET NULL,
    icd10_id UUID REFERENCES icd10_codes(id) ON DELETE SET NULL,
    indication TEXT, -- Reason for prescription
    
    -- Control and Safety
    is_controlled_substance BOOLEAN DEFAULT false,
    controlled_substance_schedule VARCHAR(10), -- 'II', 'III', 'IV', 'V'
    brand_medically_necessary BOOLEAN DEFAULT false,
    dispense_as_written BOOLEAN DEFAULT false,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'discontinued', 'cancelled', 'on-hold'
    discontinued_reason TEXT,
    discontinued_date DATE,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for prescriptions
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_visit ON prescriptions(visit_id);
CREATE INDEX idx_prescriptions_medication ON prescriptions(medication_name);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_prescriptions_date ON prescriptions(prescribed_date);

-- ============================================
-- 9. PATIENT DIAGNOSES TABLE
-- Links patients to their conditions/diagnoses over time
-- ============================================
CREATE TABLE patient_diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    disease_id UUID REFERENCES diseases(id) ON DELETE SET NULL,
    icd10_id UUID NOT NULL REFERENCES icd10_codes(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES visits(id) ON DELETE SET NULL, -- When was this diagnosed
    
    -- Diagnosis Details
    diagnosis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnosed_by VARCHAR(255),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'resolved', 'chronic', 'in-remission', 'ruled-out'
    severity VARCHAR(20), -- 'Mild', 'Moderate', 'Severe'
    is_primary BOOLEAN DEFAULT false, -- Primary diagnosis for a visit
    
    -- Resolution
    resolution_date DATE,
    resolution_notes TEXT,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for patient diagnoses
CREATE INDEX idx_patient_diag_patient ON patient_diagnoses(patient_id);
CREATE INDEX idx_patient_diag_disease ON patient_diagnoses(disease_id);
CREATE INDEX idx_patient_diag_icd10 ON patient_diagnoses(icd10_id);
CREATE INDEX idx_patient_diag_visit ON patient_diagnoses(visit_id);
CREATE INDEX idx_patient_diag_status ON patient_diagnoses(status);

-- ============================================
-- 10. VISIT DIAGNOSES TABLE
-- Links specific diagnoses to visits
-- ============================================
CREATE TABLE visit_diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    patient_diagnosis_id UUID NOT NULL REFERENCES patient_diagnoses(id) ON DELETE CASCADE,
    
    is_primary BOOLEAN DEFAULT false, -- Primary reason for visit
    sequence_number INTEGER, -- Order of diagnoses (1 = primary, 2 = secondary, etc.)
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for visit diagnoses
CREATE INDEX idx_visit_diag_visit ON visit_diagnoses(visit_id);
CREATE INDEX idx_visit_diag_patient_diag ON visit_diagnoses(patient_diagnosis_id);

-- ============================================
-- 11. TRIGGER FUNCTIONS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_guardians_updated_at BEFORE UPDATE ON guardians FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_icd10_codes_updated_at BEFORE UPDATE ON icd10_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diseases_updated_at BEFORE UPDATE ON diseases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blood_work_updated_at BEFORE UPDATE ON blood_work FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_diagnoses_updated_at BEFORE UPDATE ON patient_diagnoses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 12. ROW LEVEL SECURITY (RLS) - OPEN FOR DEVELOPMENT
-- Changed from authenticated-only to public access for development
-- ============================================
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE icd10_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_work ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_diagnoses ENABLE ROW LEVEL SECURITY;

-- Allow public access for development (no auth required)
CREATE POLICY "Allow public access" ON guardians FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON patients FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON icd10_codes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON diseases FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON visits FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON vital_signs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON blood_work FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON prescriptions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON patient_diagnoses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON visit_diagnoses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
