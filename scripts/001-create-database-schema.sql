-- ============================================
-- TeleHealth Database Schema
-- Version: 1.0.0
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ICD-10 Codes Table (for diagnoses)
-- ============================================
CREATE TABLE IF NOT EXISTS icd10_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) NOT NULL UNIQUE,
    short_description TEXT NOT NULL,
    long_description TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Diseases Table
-- ============================================
CREATE TABLE IF NOT EXISTS diseases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    common_name VARCHAR(255),
    description TEXT,
    primary_icd10_id UUID REFERENCES icd10_codes(id),
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Guardians Table
-- ============================================
CREATE TABLE IF NOT EXISTS guardians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50),
    phone_primary VARCHAR(20),
    phone_secondary VARCHAR(20),
    email VARCHAR(255),
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_zip VARCHAR(20),
    is_emergency_contact BOOLEAN DEFAULT TRUE,
    is_legal_guardian BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Patients Table
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    phone_primary VARCHAR(20),
    phone_secondary VARCHAR(20),
    email VARCHAR(255),
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_zip VARCHAR(20),
    address_country VARCHAR(100) DEFAULT 'Vietnam',
    blood_type VARCHAR(10),
    allergies TEXT[],
    medical_notes TEXT,
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(100),
    insurance_group_number VARCHAR(100),
    -- BHYT (Vietnam Health Insurance) fields
    citizen_id VARCHAR(20),
    bhyt_card_number VARCHAR(30),
    bhyt_coverage_level INTEGER,
    bhyt_registered_facility_code VARCHAR(20),
    bhyt_registered_facility_name VARCHAR(255),
    bhyt_valid_from DATE,
    bhyt_valid_to DATE,
    bhyt_issuing_agency VARCHAR(255),
    bhyt_primary_site_code VARCHAR(20),
    bhyt_primary_site_name VARCHAR(255),
    bhyt_continuous_5yr_start DATE,
    bhyt_new_card_number VARCHAR(30),
    bhyt_new_valid_from DATE,
    bhyt_new_valid_to DATE,
    bhyt_status VARCHAR(50) DEFAULT 'unknown',
    bhyt_last_checked TIMESTAMPTZ,
    -- Guardian references
    primary_guardian_id UUID REFERENCES guardians(id),
    secondary_guardian_id UUID REFERENCES guardians(id),
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Visits Table
-- ============================================
CREATE TABLE IF NOT EXISTS visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    visit_date TIMESTAMPTZ DEFAULT NOW(),
    visit_type VARCHAR(50) NOT NULL, -- 'in-person', 'telehealth', 'follow-up'
    visit_reason TEXT,
    provider_name VARCHAR(255),
    provider_specialty VARCHAR(100),
    facility_name VARCHAR(255),
    -- SOAP Notes
    chief_complaint TEXT,
    subjective_notes TEXT,
    objective_notes TEXT,
    assessment TEXT,
    plan TEXT,
    -- Timing
    checkin_time TIMESTAMPTZ,
    checkout_time TIMESTAMPTZ,
    -- Status & Payment
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'checked-in', 'in-progress', 'completed', 'cancelled'
    copay_amount DECIMAL(10, 2),
    copay_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Vital Signs Table
-- ============================================
CREATE TABLE IF NOT EXISTS vital_signs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    -- Temperature
    temperature_f DECIMAL(5, 2),
    temperature_method VARCHAR(20), -- 'oral', 'axillary', 'tympanic', 'rectal'
    -- Cardiovascular
    heart_rate_bpm INTEGER,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    -- Respiratory
    respiratory_rate INTEGER,
    oxygen_saturation DECIMAL(5, 2),
    -- Measurements
    height_inches DECIMAL(5, 2),
    weight_lbs DECIMAL(6, 2),
    bmi DECIMAL(4, 1),
    -- Pain
    pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
    -- Blood Glucose
    blood_glucose_mg_dl INTEGER,
    -- Meta
    notes TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    recorded_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Blood Work / Lab Results Table
-- ============================================
CREATE TABLE IF NOT EXISTS blood_work (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    lab_name VARCHAR(255),
    order_number VARCHAR(100),
    specimen_collected_at TIMESTAMPTZ,
    results_received_at TIMESTAMPTZ,
    -- Complete Blood Count (CBC)
    wbc DECIMAL(6, 2),           -- White Blood Cells (K/uL)
    rbc DECIMAL(6, 2),           -- Red Blood Cells (M/uL)
    hemoglobin DECIMAL(5, 2),    -- (g/dL)
    hematocrit DECIMAL(5, 2),    -- (%)
    platelet_count INTEGER,      -- (K/uL)
    mcv DECIMAL(5, 2),           -- Mean Corpuscular Volume (fL)
    mch DECIMAL(5, 2),           -- Mean Corpuscular Hemoglobin (pg)
    mchc DECIMAL(5, 2),          -- Mean Corpuscular Hemoglobin Concentration (g/dL)
    rdw DECIMAL(5, 2),           -- Red Cell Distribution Width (%)
    -- Differential
    neutrophils DECIMAL(5, 2),
    lymphocytes DECIMAL(5, 2),
    monocytes DECIMAL(5, 2),
    eosinophils DECIMAL(5, 2),
    basophils DECIMAL(5, 2),
    -- Basic Metabolic Panel (BMP)
    glucose DECIMAL(6, 2),       -- (mg/dL)
    glucose_fasting BOOLEAN,
    bun DECIMAL(5, 2),           -- Blood Urea Nitrogen (mg/dL)
    creatinine DECIMAL(5, 2),    -- (mg/dL)
    sodium DECIMAL(5, 2),        -- (mEq/L)
    potassium DECIMAL(5, 2),     -- (mEq/L)
    chloride DECIMAL(5, 2),      -- (mEq/L)
    co2 DECIMAL(5, 2),           -- (mEq/L)
    calcium DECIMAL(5, 2),       -- (mg/dL)
    -- Lipid Panel
    total_cholesterol DECIMAL(6, 2),  -- (mg/dL)
    ldl_cholesterol DECIMAL(6, 2),    -- (mg/dL)
    hdl_cholesterol DECIMAL(6, 2),    -- (mg/dL)
    triglycerides DECIMAL(6, 2),      -- (mg/dL)
    vldl DECIMAL(6, 2),               -- (mg/dL)
    -- Liver Function
    ast DECIMAL(6, 2),           -- Aspartate Aminotransferase (U/L)
    alt DECIMAL(6, 2),           -- Alanine Aminotransferase (U/L)
    alp DECIMAL(6, 2),           -- Alkaline Phosphatase (U/L)
    ggt DECIMAL(6, 2),           -- Gamma-Glutamyl Transferase (U/L)
    total_bilirubin DECIMAL(5, 2),
    direct_bilirubin DECIMAL(5, 2),
    albumin DECIMAL(5, 2),
    total_protein DECIMAL(5, 2),
    -- Thyroid
    tsh DECIMAL(6, 3),           -- Thyroid Stimulating Hormone (mIU/L)
    t4 DECIMAL(5, 2),            -- Total T4 (μg/dL)
    free_t4 DECIMAL(5, 3),       -- Free T4 (ng/dL)
    t3 DECIMAL(5, 2),            -- Total T3 (ng/dL)
    free_t3 DECIMAL(5, 3),       -- Free T3 (pg/mL)
    tpo_antibodies DECIMAL(8, 2), -- Thyroid Peroxidase Antibodies (IU/mL)
    thyroglobulin_ab DECIMAL(8, 2), -- Thyroglobulin Antibodies (IU/mL)
    -- Diabetes
    hba1c DECIMAL(4, 2),         -- Hemoglobin A1c (%)
    fasting_insulin DECIMAL(6, 2), -- (μU/mL)
    -- Iron Studies
    iron DECIMAL(6, 2),          -- (μg/dL)
    ferritin DECIMAL(6, 2),      -- (ng/mL)
    tibc DECIMAL(6, 2),          -- Total Iron Binding Capacity (μg/dL)
    iron_saturation DECIMAL(5, 2), -- (%)
    -- Vitamins
    vitamin_d DECIMAL(6, 2),     -- 25-Hydroxy Vitamin D (ng/mL)
    vitamin_b12 DECIMAL(6, 2),   -- (pg/mL)
    folate DECIMAL(6, 2),        -- (ng/mL)
    -- Inflammation
    crp DECIMAL(6, 2),           -- C-Reactive Protein (mg/L)
    esr INTEGER,                 -- Erythrocyte Sedimentation Rate (mm/hr)
    -- Kidney Function (additional)
    egfr DECIMAL(6, 2),          -- Estimated Glomerular Filtration Rate (mL/min/1.73m²)
    microalbumin DECIMAL(6, 2),  -- (mg/L)
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'reviewed'
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Patient Diagnoses Table
-- ============================================
CREATE TABLE IF NOT EXISTS patient_diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    disease_id UUID REFERENCES diseases(id),
    icd10_id UUID NOT NULL REFERENCES icd10_codes(id),
    visit_id UUID REFERENCES visits(id),
    diagnosis_date DATE NOT NULL,
    diagnosed_by VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'resolved', 'chronic', 'remission'
    severity VARCHAR(50), -- 'mild', 'moderate', 'severe'
    is_primary BOOLEAN DEFAULT FALSE,
    onset_date DATE,
    resolution_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Visit Diagnoses (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS visit_diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    patient_diagnosis_id UUID NOT NULL REFERENCES patient_diagnoses(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(visit_id, patient_diagnosis_id)
);

-- ============================================
-- Prescriptions Table
-- ============================================
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES visits(id),
    -- Medication Details
    medication_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    ndc_code VARCHAR(20),
    -- Dosage
    dosage_amount VARCHAR(50) NOT NULL,
    dosage_unit VARCHAR(50) NOT NULL,
    dosage_form VARCHAR(50) NOT NULL, -- 'tablet', 'capsule', 'liquid', 'injection', etc.
    frequency VARCHAR(100) NOT NULL, -- 'once daily', 'twice daily', 'every 8 hours', etc.
    route VARCHAR(50) NOT NULL, -- 'oral', 'topical', 'injection', etc.
    instructions TEXT,
    take_with_food BOOLEAN,
    -- Quantity
    quantity INTEGER NOT NULL,
    days_supply INTEGER,
    refills_authorized INTEGER DEFAULT 0,
    refills_remaining INTEGER DEFAULT 0,
    -- Dates
    prescribed_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    discontinued_date DATE,
    discontinued_reason TEXT,
    -- Prescriber
    prescriber_name VARCHAR(255) NOT NULL,
    prescriber_npi VARCHAR(20),
    prescriber_dea VARCHAR(20),
    -- Pharmacy
    pharmacy_name VARCHAR(255),
    pharmacy_phone VARCHAR(20),
    pharmacy_fax VARCHAR(20),
    -- Clinical
    icd10_id UUID REFERENCES icd10_codes(id),
    indication TEXT,
    is_controlled_substance BOOLEAN DEFAULT FALSE,
    controlled_substance_schedule VARCHAR(10),
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'discontinued', 'on-hold'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Create Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_patients_dob ON patients(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_patients_active ON patients(is_active);
CREATE INDEX IF NOT EXISTS idx_visits_patient ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);
CREATE INDEX IF NOT EXISTS idx_vital_signs_patient ON vital_signs(patient_id);
CREATE INDEX IF NOT EXISTS idx_vital_signs_visit ON vital_signs(visit_id);
CREATE INDEX IF NOT EXISTS idx_blood_work_patient ON blood_work(patient_id);
CREATE INDEX IF NOT EXISTS idx_blood_work_specimen ON blood_work(specimen_collected_at);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_patient_diagnoses_patient ON patient_diagnoses(patient_id);
CREATE INDEX IF NOT EXISTS idx_icd10_codes_code ON icd10_codes(code);

-- ============================================
-- Updated At Trigger Function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guardians_updated_at BEFORE UPDATE ON guardians FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vital_signs_updated_at BEFORE UPDATE ON vital_signs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blood_work_updated_at BEFORE UPDATE ON blood_work FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_diagnoses_updated_at BEFORE UPDATE ON patient_diagnoses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diseases_updated_at BEFORE UPDATE ON diseases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_icd10_codes_updated_at BEFORE UPDATE ON icd10_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
