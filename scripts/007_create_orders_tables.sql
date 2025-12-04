-- ============================================
-- Orders Tables
-- These tables are needed for lab order management
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ORDERS TABLE
-- For tracking lab test orders
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Order Information
    order_number VARCHAR(50) UNIQUE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'cancelled'
    tests_ordered TEXT NOT NULL, -- Comma-separated test IDs or JSON
    notes TEXT,
    
    -- Financial Information
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    insurance_coverage DECIMAL(10, 2) NOT NULL DEFAULT 0,
    patient_owes DECIMAL(10, 2) NOT NULL DEFAULT 0,
    
    -- Timing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    scheduled_date TIMESTAMPTZ
);

-- ============================================
-- PATIENT VISITS TABLE
-- For tracking scheduled visits related to orders
-- ============================================
CREATE TABLE IF NOT EXISTS patient_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Visit Details
    visit_type VARCHAR(50) NOT NULL, -- 'lab_order', 'follow_up', 'consultation'
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
    scheduled_date TIMESTAMPTZ NOT NULL,
    actual_date TIMESTAMPTZ,
    
    -- Provider Information
    provider_name VARCHAR(255),
    provider_specialty VARCHAR(100),
    facility_name VARCHAR(255),
    
    -- Visit Notes
    visit_reason TEXT,
    notes TEXT,
    
    -- Link to orders if applicable
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Create Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orders_patient ON orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_patient_visits_patient ON patient_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_visits_status ON patient_visits(status);
CREATE INDEX IF NOT EXISTS idx_patient_visits_scheduled ON patient_visits(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_patient_visits_type ON patient_visits(visit_type);

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
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_visits_updated_at BEFORE UPDATE ON patient_visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Enable Row Level Security
-- ============================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_visits ENABLE ROW LEVEL SECURITY;

-- Allow public access for development (no auth required)
CREATE POLICY "Allow public access" ON orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON patient_visits FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================
-- Function to generate order numbers
-- ============================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR AS $$
DECLARE
    order_count INTEGER;
    new_order_number VARCHAR(20);
BEGIN
    -- Get current count of orders
    SELECT COUNT(*) INTO order_count FROM orders;
    
    -- Format: ORD-YYYYMMDD-XXXXX (e.g., ORD-20241204-00001)
    new_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                       LPAD((order_count + 1)::TEXT, 5, '0');
    
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Create trigger to set order number on insert
-- ============================================
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := generate_order_number();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
BEFORE INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION set_order_number();
