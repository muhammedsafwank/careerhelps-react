export const MOCK_COURSES = [
  {
    id: 1,
    name: 'B.Sc Nursing',
    short_name: 'BSc Nsg',
    field: 'Nursing',
    type: 'Degree',
    duration: '4 years',
    eligibility: '10+2 PCB >=45%',
    min_marks: 45,
    outcome: 'Registered Nurse (RN)',
    salary: '₹3–5L/yr',
    govt_job_eligibility: true,
    description: 'A 4-year undergraduate program focusing on comprehensive nursing care, community health, and leadership.'
  },
  {
    id: 2,
    name: 'General Nursing and Midwifery (GNM)',
    short_name: 'GNM',
    field: 'Nursing',
    type: 'Diploma',
    duration: '3.5 years',
    eligibility: '10+2 >=40% + English',
    min_marks: 40,
    outcome: 'Registered Nurse & Midwife',
    salary: '₹2.5–4L/yr',
    govt_job_eligibility: true,
    description: 'A diploma program designed to prepare nurses for general bedside nursing and midwifery operations in hospital settings.'
  },
  {
    id: 3,
    name: 'Auxiliary Nurse Midwife (ANM)',
    short_name: 'ANM',
    field: 'Nursing',
    type: 'Diploma',
    duration: '2 years',
    eligibility: '10+2 (any stream)',
    min_marks: 35,
    outcome: 'Auxiliary Nurse (R.ANM)',
    salary: '₹2–3.5L/yr',
    govt_job_eligibility: true,
    description: 'A junior nursing course preparing health workers for basic medical assistance, particularly in community and rural settings.'
  },
  {
    id: 4,
    name: 'Bachelor of Physiotherapy (BPT)',
    short_name: 'BPT',
    field: 'Physiotherapy',
    type: 'Degree',
    duration: '4.5 years',
    eligibility: '10+2 PCB',
    min_marks: 50,
    outcome: 'Physiotherapist',
    salary: '₹3–6L/yr',
    govt_job_eligibility: false,
    description: 'A clinical program specializing in physical therapy, rehabilitation, electrotherapy, and muscle recovery.'
  },
  {
    id: 5,
    name: 'B.Sc Medical Lab Technology (MLT)',
    short_name: 'MLT',
    field: 'Allied Health',
    type: 'Degree',
    duration: '3 years',
    eligibility: '10+2 PCB',
    min_marks: 45,
    outcome: 'Medical Lab Technologist',
    salary: '₹2.5–4.5L/yr',
    govt_job_eligibility: true,
    description: 'Provides advanced knowledge in biochemistry, pathology, immunology, and lab diagnostics.'
  },
  {
    id: 6,
    name: 'Diploma in Medical Lab Technology (DMLT)',
    short_name: 'DMLT',
    field: 'Allied Health',
    type: 'Diploma',
    duration: '2 years',
    eligibility: '10+2 PCB',
    min_marks: 40,
    outcome: 'Lab Technician',
    salary: '₹2–3L/yr',
    govt_job_eligibility: false,
    description: 'A foundational course focused on lab equipment operation, chemical testing, and clinical diagnostics.'
  },
  {
    id: 7,
    name: 'B.Sc Radiology & Imaging Technology',
    short_name: 'Radiology',
    field: 'Allied Health',
    type: 'Degree',
    duration: '3 years',
    eligibility: '10+2 PCB',
    min_marks: 45,
    outcome: 'Radiology Technologist',
    salary: '₹3–5L/yr',
    govt_job_eligibility: true,
    description: 'Focuses on operating scanners like X-Ray, CT, MRI, and assisting in nuclear medicine procedures.'
  },
  {
    id: 8,
    name: 'B.Sc Optometry',
    short_name: 'Optometry',
    field: 'Allied Health',
    type: 'Degree',
    duration: '3 years',
    eligibility: '10+2 PCB',
    min_marks: 45,
    outcome: 'Optometrist',
    salary: '₹2.5–4L/yr',
    govt_job_eligibility: false,
    description: 'Specialized study in optical health, eye examinations, and vision correction techniques.'
  },
  {
    id: 9,
    name: 'Bachelor in Audiology and Speech-Language Pathology (BASLP)',
    short_name: 'BASLP',
    field: 'Allied Health',
    type: 'Degree',
    duration: '4 years',
    eligibility: '10+2 PCB/PCMB',
    min_marks: 50,
    outcome: 'Audiologist / Speech Therapist',
    salary: '₹3–5L/yr',
    govt_job_eligibility: false,
    description: 'Focuses on diagnostic assessment and therapy for hearing, speech, and communication disorders.'
  }
];

export const MOCK_COLLEGES = [
  {
    id: 1,
    name: 'AIIMS – College of Nursing',
    state: 'Delhi',
    city: 'New Delhi',
    address: 'Ansari Nagar, New Delhi - 110029',
    accreditation: 'INC Approved',
    avg_fee: 12000,
    contact_email: 'con@aiims.edu',
    contact_phone: '011-26588500',
    type: 'gov',
    description: 'Premier national public medical institute offering highly competitive programs with negligible fees and excellent clinical exposure.'
  },
  {
    id: 2,
    name: 'Manipal College of Nursing',
    state: 'Karnataka',
    city: 'Manipal',
    address: 'MCOH, Madhav Nagar, Manipal, Karnataka 576104',
    accreditation: 'NAAC A++',
    avg_fee: 180000,
    contact_email: 'con.mcns@manipal.edu',
    contact_phone: '0820-2922245',
    type: 'pvt',
    description: 'Top-ranked private nursing institution under MAHE, featuring world-class simulation labs and global placements.'
  },
  {
    id: 3,
    name: 'Christian Medical College (CMC) Vellore',
    state: 'Tamil Nadu',
    city: 'Vellore',
    address: 'Ida Scudder Road, Vellore, Tamil Nadu 632004',
    accreditation: 'INC Approved',
    avg_fee: 60000,
    contact_email: 'registrar@cmcvellore.ac.in',
    contact_phone: '0416-2282274',
    type: 'pvt',
    description: 'Legendary non-profit healthcare institution known for its high standards of nursing and medical education, focusing on ethical care.'
  },
  {
    id: 4,
    name: 'JIPMER College of Nursing',
    state: 'Puducherry',
    city: 'Puducherry',
    address: 'Dhanvantari Nagar, Puducherry 605006',
    accreditation: 'Central Govt.',
    avg_fee: 5000,
    contact_email: 'dean@jipmer.edu.in',
    contact_phone: '0413-2296000',
    type: 'gov',
    description: 'An Institution of National Importance, JIPMER offers top-tier nursing programs with state-of-the-art diagnostic facilities.'
  },
  {
    id: 5,
    name: 'Government College of Nursing',
    state: 'Kerala',
    city: 'Thiruvananthapuram',
    address: 'Medical College Campus, TVM, Kerala 695011',
    accreditation: 'INC Approved',
    avg_fee: 6000,
    contact_email: 'gcn.tvm@kerala.gov.in',
    contact_phone: '0471-2444290',
    type: 'gov',
    description: 'One of the oldest and most prestigious public nursing colleges in South India, affiliated with Kerala University of Health Sciences.'
  },
  {
    id: 6,
    name: 'St. John\'s Medical College & Nursing School',
    state: 'Karnataka',
    city: 'Bengaluru',
    address: 'Sarjapur Road, John Nagar, Bengaluru, Karnataka 560034',
    accreditation: 'NAAC A',
    avg_fee: 80000,
    contact_email: 'sjmc.adm@stjohns.in',
    contact_phone: '080-49466000',
    type: 'pvt',
    description: 'Leading Catholic minority institution providing compassionate nursing education and rich clinical practice in a 1300+ bed hospital.'
  },
  {
    id: 7,
    name: 'PGIMER Paramedical School',
    state: 'Punjab',
    city: 'Chandigarh',
    address: 'Sector 12, Chandigarh 160012',
    accreditation: 'INC Approved',
    avg_fee: 5000,
    contact_email: 'paramedical.admissions@pgimer.edu.in',
    contact_phone: '0172-2756565',
    type: 'gov',
    description: 'Post Graduate Institute of Medical Education and Research, offering elite allied health and lab technology training.'
  },
  {
    id: 8,
    name: 'SRM College of Allied Health Sciences',
    state: 'Tamil Nadu',
    city: 'Chennai',
    address: 'SRM Nagar, Kattankulathur, Chennai, Tamil Nadu 603203',
    accreditation: 'NAAC A++',
    avg_fee: 90000,
    contact_email: 'admissions.allied@srmist.edu.in',
    contact_phone: '044-27417000',
    type: 'pvt',
    description: 'Modern campus equipped with high-tech research centers and comprehensive multi-specialty clinical rotations.'
  },
  {
    id: 9,
    name: 'Government Medical College (Dept of PT)',
    state: 'Kerala',
    city: 'Kozhikode',
    address: 'Medical College Junction, Kozhikode, Kerala 673008',
    accreditation: 'State Govt.',
    avg_fee: 10000,
    contact_email: 'gmc.kkd@kerala.gov.in',
    contact_phone: '0495-2350216',
    type: 'gov',
    description: 'Renowned department for Physiotherapy and clinical rehab attached to the major Calicut Medical College Hospital.'
  }
];

export const MOCK_COLLEGE_COURSES = [
  { college_id: 1, course_id: 1 },
  { college_id: 2, course_id: 1 },
  { college_id: 2, course_id: 5 },
  { college_id: 2, course_id: 7 },
  { college_id: 3, course_id: 1 },
  { college_id: 3, course_id: 2 },
  { college_id: 3, course_id: 4 },
  { college_id: 4, course_id: 1 },
  { college_id: 4, course_id: 5 },
  { college_id: 4, course_id: 7 },
  { college_id: 5, course_id: 1 },
  { college_id: 5, course_id: 2 },
  { college_id: 6, course_id: 1 },
  { college_id: 6, course_id: 2 },
  { college_id: 7, course_id: 5 },
  { college_id: 7, course_id: 6 },
  { college_id: 7, course_id: 7 },
  { college_id: 8, course_id: 5 },
  { college_id: 8, course_id: 4 },
  { college_id: 8, course_id: 8 },
  { college_id: 9, course_id: 4 }
];

export const MOCK_QUESTIONS = [
  {
    id: 1,
    question: "Which activity would you enjoy most in a healthcare setting?",
    options: [
      { text: "Giving injections, dressing wounds & caring for patients", score: { nursing: 3 } },
      { text: "Analyzing blood/urine samples in a lab", score: { lab: 3 } },
      { text: "Helping patients recover movement & strength through exercises", score: { physio: 3 } },
      { text: "Using X-ray or scanning machines to capture body images", score: { radiology: 3 } }
    ]
  },
  {
    id: 2,
    question: "How do you feel about working night shifts in a hospital?",
    options: [
      { text: "Perfectly fine – patient care never stops", score: { nursing: 2 } },
      { text: "I prefer fixed daytime hours", score: { lab: 1, radiology: 1 } },
      { text: "I'm okay with it occasionally", score: { nursing: 1 } },
      { text: "I'd rather work in a clinic or diagnostic centre", score: { lab: 1, radiology: 2 } }
    ]
  },
  {
    id: 3,
    question: "Which subject did you enjoy most in Class 11–12?",
    options: [
      { text: "Biology & Human Physiology", score: { nursing: 2, physio: 2 } },
      { text: "Chemistry & Biochemistry", score: { lab: 3 } },
      { text: "Physics & Maths", score: { radiology: 3 } },
      { text: "All sciences equally", score: { nursing: 1, lab: 1, physio: 1, radiology: 1 } }
    ]
  },
  {
    id: 4,
    question: "A patient is anxious and scared. What do you do first?",
    options: [
      { text: "Sit with them, hold their hand and calmly explain everything", score: { nursing: 3 } },
      { text: "Go over their test reports carefully before speaking", score: { lab: 2 } },
      { text: "Ask them to do some gentle breathing exercises", score: { physio: 2 } },
      { text: "Take them for their scheduled scan and explain the procedure", score: { radiology: 2 } }
    ]
  },
  {
    id: 5,
    question: "Which work environment excites you more?",
    options: [
      { text: "Ward / ICU with patients around all day", score: { nursing: 3 } },
      { text: "Quiet laboratory with instruments and specimens", score: { lab: 3 } },
      { text: "Rehab gym or physiotherapy clinic", score: { physio: 3 } },
      { text: "Radiology or imaging department", score: { radiology: 3 } }
    ]
  },
  {
    id: 6,
    question: "How comfortable are you with technical equipment and gadgets?",
    options: [
      { text: "I prefer direct human interaction over machines", score: { nursing: 2 } },
      { text: "I love working with instruments and technology", score: { lab: 2, radiology: 2 } },
      { text: "Somewhere in between – I use equipment but focus on the patient", score: { physio: 2, nursing: 1 } },
      { text: "Very comfortable – I'd love to operate advanced scanners", score: { radiology: 3 } }
    ]
  },
  {
    id: 7,
    question: "What is your 10+2 stream background?",
    options: [
      { text: "Science (PCB – Physics, Chemistry, Biology)", score: { nursing: 1, lab: 1, physio: 1, radiology: 1 } },
      { text: "Science (PCM)", score: { lab: 1, radiology: 1 } },
      { text: "Arts or Commerce (any stream)", score: { anm_only: 5 } },
      { text: "Still in 10+2", score: {} }
    ]
  },
  {
    id: 8,
    question: "How long are you comfortable studying before entering the workforce?",
    options: [
      { text: "2 years (diploma is fine)", score: { diploma_pref: 3 } },
      { text: "3 years (degree/diploma)", score: { mid_pref: 2 } },
      { text: "4 years (degree with more depth)", score: { degree_pref: 3 } },
      { text: "As long as needed for the best career", score: { degree_pref: 3 } }
    ]
  },
  {
    id: 9,
    question: "Which career goal appeals to you most?",
    options: [
      { text: "Becoming a Registered Nurse in a government hospital", score: { nursing: 3 } },
      { text: "Becoming a certified Lab Technologist", score: { lab: 3 } },
      { text: "Becoming a Physiotherapist with your own clinic", score: { physio: 3 } },
      { text: "Becoming a Radiology/Imaging specialist", score: { radiology: 3 } }
    ]
  },
  {
    id: 10,
    question: "How important is government job eligibility for you?",
    options: [
      { text: "Very important – I want a stable government post", score: { govt_pref: 2 } },
      { text: "Somewhat important", score: { govt_pref: 1 } },
      { text: "Not really – private sector or self-employment is fine", score: {} },
      { text: "Open to both equally", score: {} }
    ]
  }
];

export const MOCK_FAQS = [
  {
    q: "What is the difference between B.Sc Nursing, GNM, and ANM?",
    a: "B.Sc Nursing is a 4-year degree course requiring Science (PCB) background, qualifying you for registered nurse (RN) roles and leadership. GNM (General Nursing & Midwifery) is a 3.5-year diploma open to science streams. ANM (Auxiliary Nurse Midwife) is a 2-year diploma open to all streams (Arts, Commerce, Science) focused on primary community healthcare."
  },
  {
    q: "Are paramedical degrees eligible for government jobs?",
    a: "Yes, courses like B.Sc MLT, B.Sc Radiology, and B.Sc Optometry are highly valued in public health laboratories, railway hospitals, and government medical centers. The central and state boards regularly release vacancies."
  },
  {
    q: "Can I open my own clinic after Bachelor of Physiotherapy (BPT)?",
    a: "Yes! Physiotherapists are independent practitioners in India. After completing BPT and their mandatory 6-month internship, you can register with the local council and open a private physiotherapy clinic."
  },
  {
    q: "What is the DPDP Act 2023 and why do you collect consent?",
    a: "The Digital Personal Data Protection Act 2023 is India's data privacy legislation. It mandates that apps must obtain explicit, unambiguous consent from users before collecting and processing personal details (like academic marks, phone numbers, and career interest data)."
  }
];
