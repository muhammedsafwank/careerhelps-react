-- ==========================================
-- Database Schema for Career Helps AI App
-- ==========================================

-- 1. Create enum/types if needed (optional)
-- Enable uuid-ossp if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    short_name TEXT,
    field TEXT NOT NULL,          -- e.g. 'Nursing', 'Allied Health', 'Physiotherapy', 'Diagnostics'
    type TEXT NOT NULL,           -- 'Degree' or 'Diploma'
    duration TEXT NOT NULL,       -- e.g. '4 years', '3.5 years'
    eligibility TEXT NOT NULL,    -- e.g. '10+2 PCB >=45%'
    min_marks NUMERIC DEFAULT 0,  -- Minimum percentage requirement
    outcome TEXT,                 -- e.g. 'Registered Nurse (RN)'
    salary TEXT,                  -- e.g. '₹3–5L/yr'
    govt_job_eligibility BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COLLEGES TABLE
CREATE TABLE IF NOT EXISTS public.colleges (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    accreditation TEXT,           -- e.g. 'INC Approved', 'NAAC A++'
    avg_fee NUMERIC,              -- Average annual fee in INR
    contact_email TEXT,
    contact_phone TEXT,
    type TEXT NOT NULL CHECK (type IN ('gov', 'pvt')), -- Government vs Private
    description TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COLLEGE_COURSES JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.college_courses (
    college_id INT REFERENCES public.colleges(id) ON DELETE CASCADE,
    course_id INT REFERENCES public.courses(id) ON DELETE CASCADE,
    PRIMARY KEY (college_id, course_id)
);

-- 5. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    birth_date DATE,
    state TEXT,
    city TEXT,
    education_level TEXT,         -- '10th', '12th', 'Graduate'
    board TEXT,                   -- e.g. 'CBSE', 'State Board'
    marks_10th NUMERIC,
    marks_12th NUMERIC,
    course_preferred TEXT,
    budget NUMERIC,               -- Max annual fee user can afford
    learning_mode TEXT,           -- 'On-Campus', 'Distance'
    preferred_location TEXT,      -- Preferred state/city
    consent_given BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5b. GUEST_LEADS TABLE (For anonymous quiz attendees)
CREATE TABLE IF NOT EXISTS public.guest_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    phone TEXT,
    course_preferred TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. USER_RESPONSES (For questionnaire answers)
CREATE TABLE IF NOT EXISTS public.user_responses (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id INT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, question_id)
);

-- 7. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    college_id INT REFERENCES public.colleges(id) ON DELETE CASCADE NOT NULL,
    course_id INT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Not Started', 'Submitted', 'Interview', 'Accepted')),
    notes TEXT,
    applied_on TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, college_id, course_id)
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Helper function to avoid infinite recursion on profiles table policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_leads ENABLE ROW LEVEL SECURITY;

-- Courses Policies
CREATE POLICY "Allow public read access to courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Allow admin to write courses" ON public.courses FOR ALL USING (
    public.is_admin() = true
);

-- Colleges Policies
CREATE POLICY "Allow public read access to colleges" ON public.colleges FOR SELECT USING (true);
CREATE POLICY "Allow admin to write colleges" ON public.colleges FOR ALL USING (
    public.is_admin() = true
);

-- College Courses Policies
CREATE POLICY "Allow public read access to college courses" ON public.college_courses FOR SELECT USING (true);
CREATE POLICY "Allow admin to write college courses" ON public.college_courses FOR ALL USING (
    public.is_admin() = true
);

-- Profiles Policies
CREATE POLICY "Allow users to read their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow users to update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow admin to view all profiles" ON public.profiles FOR ALL USING (
    public.is_admin() = true
);

-- User Responses Policies
CREATE POLICY "Allow users to manage their own responses" ON public.user_responses FOR ALL USING (auth.uid() = user_id);

-- Applications Policies
CREATE POLICY "Allow users to view their own applications" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to create their own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own applications" ON public.applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow admin to manage all applications" ON public.applications FOR ALL USING (
    public.is_admin() = true
);

-- Guest Leads Policies
CREATE POLICY "Allow public insert to guest_leads" ON public.guest_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to guest_leads" ON public.guest_leads FOR UPDATE USING (true);
CREATE POLICY "Allow admin to view all guest_leads" ON public.guest_leads FOR SELECT USING (
    public.is_admin() = true
);

-- ==========================================
-- TRIGGERS & FUNCTIONS
-- ==========================================

-- Function to handle new user signup profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, consent_given, is_admin)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Student'),
    new.email,
    COALESCE((new.raw_user_meta_data->>'consent_given')::boolean, false),
    COALESCE((new.raw_user_meta_data->>'is_admin')::boolean, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- SEED DATA
-- ==========================================

-- Courses Seed
INSERT INTO public.courses (id, name, short_name, field, type, duration, eligibility, min_marks, outcome, salary, govt_job_eligibility, description) VALUES
(1, 'B.Sc Nursing', 'BSc Nsg', 'Nursing', 'Degree', '4 years', '10+2 PCB >=45%', 45, 'Registered Nurse (RN)', '₹3–5L/yr', true, 'A 4-year undergraduate program focusing on comprehensive nursing care, community health, and leadership.'),
(2, 'General Nursing and Midwifery (GNM)', 'GNM', 'Nursing', 'Diploma', '3.5 years', '10+2 >=40% + English', 40, 'Registered Nurse & Midwife', '₹2.5–4L/yr', true, 'A diploma program designed to prepare nurses for general bedside nursing and midwifery operations in hospital settings.'),
(3, 'Auxiliary Nurse Midwife (ANM)', 'ANM', 'Nursing', 'Diploma', '2 years', '10+2 (any stream)', 35, 'Auxiliary Nurse (R.ANM)', '₹2–3.5L/yr', true, 'A junior nursing course preparing health workers for basic medical assistance, particularly in community and rural settings.'),
(4, 'Bachelor of Physiotherapy (BPT)', 'BPT', 'Physiotherapy', 'Degree', '4.5 years', '10+2 PCB', 50, 'Physiotherapist', '₹3–6L/yr', false, 'A clinical program specializing in physical therapy, rehabilitation, electrotherapy, and muscle recovery.'),
(5, 'B.Sc Medical Lab Technology (MLT)', 'MLT', 'Allied Health', 'Degree', '3 years', '10+2 PCB', 45, 'Medical Lab Technologist', '₹2.5–4.5L/yr', true, 'Provides advanced knowledge in biochemistry, pathology, immunology, and lab diagnostics.'),
(6, 'Diploma in Medical Lab Technology (DMLT)', 'DMLT', 'Allied Health', 'Diploma', '2 years', '10+2 PCB', 40, 'Lab Technician', '₹2–3L/yr', false, 'A foundational course focused on lab equipment operation, chemical testing, and clinical diagnostics.'),
(7, 'B.Sc Radiology & Imaging Technology', 'Radiology', 'Allied Health', 'Degree', '3 years', '10+2 PCB', 45, 'Radiology Technologist', '₹3–5L/yr', true, 'Focuses on operating scanners like X-Ray, CT, MRI, and assisting in nuclear medicine procedures.'),
(8, 'B.Sc Optometry', 'Optometry', 'Allied Health', 'Degree', '3 years', '10+2 PCB', 45, 'Optometrist', '₹2.5–4L/yr', false, 'Specialized study in optical health, eye examinations, and vision correction techniques.'),
(9, 'Bachelor in Audiology and Speech-Language Pathology (BASLP)', 'BASLP', 'Allied Health', 'Degree', '4 years', '10+2 PCB/PCMB', 50, 'Audiologist / Speech Therapist', '₹3–5L/yr', false, 'Focuses on diagnostic assessment and therapy for hearing, speech, and communication disorders.')
ON CONFLICT (name) DO UPDATE SET
    short_name = EXCLUDED.short_name,
    field = EXCLUDED.field,
    type = EXCLUDED.type,
    duration = EXCLUDED.duration,
    eligibility = EXCLUDED.eligibility,
    min_marks = EXCLUDED.min_marks,
    outcome = EXCLUDED.outcome,
    salary = EXCLUDED.salary,
    govt_job_eligibility = EXCLUDED.govt_job_eligibility,
    description = EXCLUDED.description;

-- Colleges Seed
INSERT INTO public.colleges (id, name, state, city, address, accreditation, avg_fee, contact_email, contact_phone, type, description) VALUES
(1, 'AIIMS – College of Nursing', 'Delhi', 'New Delhi', 'Ansari Nagar, New Delhi - 110029', 'INC Approved', 12000, 'con@aiims.edu', '011-26588500', 'gov', 'Premier national public medical institute offering highly competitive programs with negligible fees and excellent clinical exposure.'),
(2, 'Manipal College of Nursing', 'Karnataka', 'Manipal', 'MCOH, Madhav Nagar, Manipal, Karnataka 576104', 'NAAC A++', 180000, 'con.mcns@manipal.edu', '0820-2922245', 'pvt', 'Top-ranked private nursing institution under MAHE, featuring world-class simulation labs and global placements.'),
(3, 'Christian Medical College (CMC) Vellore', 'Tamil Nadu', 'Vellore', 'Ida Scudder Road, Vellore, Tamil Nadu 632004', 'INC Approved', 60000, 'registrar@cmcvellore.ac.in', '0416-2282274', 'pvt', 'Legendary non-profit healthcare institution known for its high standards of nursing and medical education, focusing on ethical care.'),
(4, 'JIPMER College of Nursing', 'Puducherry', 'Puducherry', 'Dhanvantari Nagar, Puducherry 605006', 'Central Govt.', 5000, 'dean@jipmer.edu.in', '0413-2296000', 'gov', 'An Institution of National Importance, JIPMER offers top-tier nursing programs with state-of-the-art diagnostic facilities.'),
(5, 'Government College of Nursing', 'Kerala', 'Thiruvananthapuram', 'Medical College Campus, TVM, Kerala 695011', 'INC Approved', 6000, 'gcn.tvm@kerala.gov.in', '0471-2444290', 'gov', 'One of the oldest and most prestigious public nursing colleges in South India, affiliated with Kerala University of Health Sciences.'),
(6, 'St. John''s Medical College & Nursing School', 'Karnataka', 'Bengaluru', 'Sarjapur Road, John Nagar, Bengaluru, Karnataka 560034', 'NAAC A', 80000, 'sjmc.adm@stjohns.in', '080-49466000', 'pvt', 'Leading Catholic minority institution providing compassionate nursing education and rich clinical practice in a 1300+ bed hospital.'),
(7, 'PGIMER Paramedical School', 'Punjab', 'Chandigarh', 'Sector 12, Chandigarh 160012', 'INC Approved', 5000, 'paramedical.admissions@pgimer.edu.in', '0172-2756565', 'gov', 'Post Graduate Institute of Medical Education and Research, offering elite allied health and lab technology training.'),
(8, 'SRM College of Allied Health Sciences', 'Tamil Nadu', 'Chennai', 'SRM Nagar, Kattankulathur, Chennai, Tamil Nadu 603203', 'NAAC A++', 90000, 'admissions.allied@srmist.edu.in', '044-27417000', 'pvt', 'Modern campus equipped with high-tech research centers and comprehensive multi-specialty clinical rotations.'),
(9, 'Government Medical College (Dept of PT)', 'Kerala', 'Kozhikode', 'Medical College Junction, Kozhikode, Kerala 673008', 'State Govt.', 10000, 'gmc.kkd@kerala.gov.in', '0495-2350216', 'gov', 'Renowned department for Physiotherapy and clinical rehab attached to the major Calicut Medical College Hospital.')
ON CONFLICT (name) DO UPDATE SET
    state = EXCLUDED.state,
    city = EXCLUDED.city,
    address = EXCLUDED.address,
    accreditation = EXCLUDED.accreditation,
    avg_fee = EXCLUDED.avg_fee,
    contact_email = EXCLUDED.contact_email,
    contact_phone = EXCLUDED.contact_phone,
    type = EXCLUDED.type,
    description = EXCLUDED.description;

-- Junction Seed (Map courses to colleges)
-- AIIMS offers B.Sc Nursing (1)
INSERT INTO public.college_courses (college_id, course_id) VALUES (1, 1) ON CONFLICT DO NOTHING;
-- Manipal offers B.Sc Nursing (1), B.Sc MLT (5), B.Sc Radiology (7)
INSERT INTO public.college_courses (college_id, course_id) VALUES (2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.college_courses (college_id, course_id) VALUES (2, 5) ON CONFLICT DO NOTHING;
INSERT INTO public.college_courses (college_id, course_id) VALUES (2, 7) ON CONFLICT DO NOTHING;
-- CMC Vellore offers B.Sc Nursing (1), GNM (2), BPT (4)
INSERT INTO public.college_courses (college_id, course_id) VALUES (3, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.college_courses (college_id, course_id) VALUES (3, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.college_courses (college_id, course_id) VALUES (3, 4) ON CONFLICT DO NOTHING;
-- JIPMER offers B.Sc Nursing (1), B.Sc MLT (5), B.Sc Radiology (7)
INSERT INTO public.college_courses (college_id, course_id) VALUES (4, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.college_courses (college_id, course_id) VALUES (4, 5) ON CONFLICT DO NOTHING;
INSERT INTO public.college_courses (college_id, course_id) VALUES (4, 7) ON CONFLICT DO NOTHING;
-- Govt TVM offers B.Sc Nursing (1), GNM (2)
INSERT INTO public.college_courses (college_id, course_id) VALUES (5, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.college_courses (college_id, course_id) VALUES (5, 2) ON CONFLICT DO NOTHING;
-- St. Johns offers B.Sc Nursing (1), GNM (2)
INSERT INTO public.college_courses (college_id, course_id) VALUES (6, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.college_courses (college_id, course_id) VALUES (6, 2) ON CONFLICT DO NOTHING;
-- PGIMER offers B.Sc MLT (5), DMLT (6), B.Sc Radiology (7)
INSERT INTO public.college_courses (college_id, course_id) VALUES (7, 5) ON CONFLICT DO NOTHING;
INSERT INTO public.college_courses (college_id, course_id) VALUES (7, 6) ON CONFLICT DO NOTHING;
INSERT INTO public.college_courses (college_id, course_id) VALUES (7, 7) ON CONFLICT DO NOTHING;
-- SRM Chennai offers B.Sc MLT (5), BPT (4), B.Sc Optometry (8)
INSERT INTO public.college_courses (college_id, course_id) VALUES (8, 5) ON CONFLICT DO NOTHING;
INSERT INTO public.college_courses (college_id, course_id) VALUES (8, 4) ON CONFLICT DO NOTHING;
INSERT INTO public.college_courses (college_id, course_id) VALUES (8, 8) ON CONFLICT DO NOTHING;
-- GMC Kozhikode offers BPT (4)
INSERT INTO public.college_courses (college_id, course_id) VALUES (9, 4) ON CONFLICT DO NOTHING;
