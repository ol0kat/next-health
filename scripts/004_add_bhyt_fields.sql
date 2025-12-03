-- Add BHYT (Vietnamese Health Insurance) fields to patients table
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS citizen_id VARCHAR(20),
ADD COLUMN IF NOT EXISTS bhyt_card_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS bhyt_coverage_level INTEGER DEFAULT 80,
ADD COLUMN IF NOT EXISTS bhyt_registered_facility_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS bhyt_registered_facility_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS bhyt_valid_from DATE,
ADD COLUMN IF NOT EXISTS bhyt_valid_to DATE,
ADD COLUMN IF NOT EXISTS bhyt_issuing_agency VARCHAR(255),
ADD COLUMN IF NOT EXISTS bhyt_primary_site_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS bhyt_primary_site_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS bhyt_continuous_5yr_start DATE,
ADD COLUMN IF NOT EXISTS bhyt_new_card_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS bhyt_new_valid_from DATE,
ADD COLUMN IF NOT EXISTS bhyt_new_valid_to DATE,
ADD COLUMN IF NOT EXISTS bhyt_status VARCHAR(20) DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS bhyt_last_checked TIMESTAMP WITH TIME ZONE;

-- Create index for BHYT lookups
CREATE INDEX IF NOT EXISTS idx_patients_citizen_id ON patients(citizen_id);
CREATE INDEX IF NOT EXISTS idx_patients_bhyt_card_number ON patients(bhyt_card_number);

COMMENT ON COLUMN patients.citizen_id IS 'Vietnamese Citizen ID (CCCD)';
COMMENT ON COLUMN patients.bhyt_card_number IS 'BHYT Health Insurance Card Number';
COMMENT ON COLUMN patients.bhyt_coverage_level IS 'Insurance coverage percentage (e.g., 80, 95, 100)';
COMMENT ON COLUMN patients.bhyt_status IS 'BHYT card status: valid, expired, invalid, unknown';
