-- ==============================================================================
-- CBIT RESOURCE HUB - SEED DATA
-- Chaitanya Bharathi Institute of Technology (CBIT), Hyderabad
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. DEPARTMENTS
-- ------------------------------------------------------------------------------
INSERT INTO departments (id, department_name, department_code, description, is_active)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'Computer Science and Engineering', 'CSE', 'Department of Computer Science & Engineering', TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Information Technology', 'IT', 'Department of Information Technology', TRUE),
    ('a0000000-0000-0000-0000-000000000003', 'Artificial Intelligence and Machine Learning', 'AI&ML', 'Department of AI & ML', TRUE),
    ('a0000000-0000-0000-0000-000000000004', 'Artificial Intelligence and Data Science', 'AI&DS', 'Department of AI & Data Science', TRUE),
    ('a0000000-0000-0000-0000-000000000005', 'Electronics and Communication Engineering', 'ECE', 'Department of Electronics & Communication Engineering', TRUE),
    ('a0000000-0000-0000-0000-000000000006', 'Electrical and Electronics Engineering', 'EEE', 'Department of Electrical & Electronics Engineering', TRUE),
    ('a0000000-0000-0000-0000-000000000007', 'Mechanical Engineering', 'MECH', 'Department of Mechanical Engineering', TRUE),
    ('a0000000-0000-0000-0000-000000000008', 'Civil Engineering', 'CIVIL', 'Department of Civil Engineering', TRUE),
    ('a0000000-0000-0000-0000-000000000009', 'Biotechnology', 'BIOTECH', 'Department of Biotechnology', TRUE),
    ('a0000000-0000-0000-0000-000000000010', 'School of Management Studies', 'SMS', 'Department of Management Studies (MBA)', TRUE),
    ('a0000000-0000-0000-0000-000000000011', 'Master of Computer Applications', 'MCA', 'Department of Computer Applications', TRUE)
ON CONFLICT (department_name) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. ORGANISATIONS
-- ------------------------------------------------------------------------------
INSERT INTO organisations (id, organisation_name, organisation_type, website, address, description, is_active)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'Wipro', 'Corporate', 'https://www.wipro.com', 'Gachibowli, Hyderabad, Telangana 500032', 'Global information technology, consulting and business process services company', TRUE),
    ('b0000000-0000-0000-0000-000000000002', 'Google India', 'Corporate', 'https://about.google', 'HITEC City, Madhapur, Hyderabad, Telangana 500081', 'Global technology multinational focusing on search, AI, cloud computing and software', TRUE),
    ('b0000000-0000-0000-0000-000000000003', 'Microsoft India Development Center', 'Corporate', 'https://www.microsoft.com/en-in', 'ISB Road, Gachibowli, Hyderabad, Telangana 500032', 'Premier research and software engineering center for Microsoft technologies', TRUE),
    ('b0000000-0000-0000-0000-000000000004', 'Tata Consultancy Services', 'Corporate', 'https://www.tcs.com', 'Sy No 107, Madhapur, Hyderabad, Telangana 500081', 'Global leader in IT services, digital and business solutions', TRUE),
    ('b0000000-0000-0000-0000-000000000005', 'Amazon AWS', 'Corporate', 'https://aws.amazon.com', 'Financial District, Nanakramguda, Hyderabad, Telangana 500032', 'World’s most comprehensive and broadly adopted cloud platform', TRUE),
    ('b0000000-0000-0000-0000-000000000006', 'Defence Research and Development Organisation (DRDO)', 'Government', 'https://www.drdo.gov.in', 'DRDO Complex, Kanchanbagh, Hyderabad, Telangana 500058', 'Military research and development agency of Government of India', TRUE),
    ('b0000000-0000-0000-0000-000000000007', 'Indian Space Research Organisation (ISRO)', 'Government', 'https://www.isro.gov.in', 'NRSC, Balanagar, Hyderabad, Telangana 500037', 'National space agency of India', TRUE),
    ('b0000000-0000-0000-0000-000000000008', 'IIIT Hyderabad', 'Academic', 'https://www.iiit.ac.in', 'Prof. C R Rao Road, Gachibowli, Hyderabad, Telangana 500032', 'Autonomous university dedicated to computer science and interdisciplinary research', TRUE),
    ('b0000000-0000-0000-0000-000000000009', 'IIT Hyderabad', 'Academic', 'https://www.iith.ac.in', 'Kandi, Sangareddy, Telangana 502285', 'Institute of National Importance for technical education and research', TRUE),
    ('b0000000-0000-0000-0000-000000000010', 'Qualcomm India', 'Corporate', 'https://www.qualcomm.com', 'Mindspace IT Park, HITEC City, Hyderabad, Telangana 500081', 'Global pioneer in wireless technology and semiconductor innovation', TRUE),
    ('b0000000-0000-0000-0000-000000000011', 'Oracle India', 'Corporate', 'https://www.oracle.com/in', 'HITEC City, Madhapur, Hyderabad, Telangana 500081', 'Enterprise software, cloud infrastructure and database systems pioneer', TRUE),
    ('b0000000-0000-0000-0000-000000000012', 'Infosys Limited', 'Corporate', 'https://www.infosys.com', 'Pocharam, Hyderabad, Telangana 500088', 'Global leader in next-generation digital services and consulting', TRUE)
ON CONFLICT (organisation_name) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. EXPERTISE
-- ------------------------------------------------------------------------------
INSERT INTO expertise (id, expertise_name, category, description, is_active)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Generative AI', 'Artificial Intelligence', 'LLMs, Diffusion Models, Transformer architectures, Prompt Engineering and RAG pipelines', TRUE),
    ('c0000000-0000-0000-0000-000000000002', 'Machine Learning', 'Artificial Intelligence', 'Supervised/Unsupervised learning, predictive modeling, Scikit-learn, XGBoost', TRUE),
    ('c0000000-0000-0000-0000-000000000003', 'Data Science', 'Data Analytics', 'Statistical analysis, data pipelines, exploratory data analysis, Pandas, visualization', TRUE),
    ('c0000000-0000-0000-0000-000000000004', 'Cloud Computing', 'Infrastructure', 'AWS, Azure, GCP architecture, serverless systems, microservices, Kubernetes', TRUE),
    ('c0000000-0000-0000-0000-000000000005', 'Cybersecurity', 'Security', 'Application security, penetration testing, network defense, threat modeling and SIEM', TRUE),
    ('c0000000-0000-0000-0000-000000000006', 'Python Programming', 'Software Engineering', 'Advanced Python, asynchronous programming, backend frameworks, data structures', TRUE),
    ('c0000000-0000-0000-0000-000000000007', 'Artificial Intelligence', 'Artificial Intelligence', 'Core AI algorithms, search strategies, knowledge representation, reasoning systems', TRUE),
    ('c0000000-0000-0000-0000-000000000008', 'Web Development', 'Software Engineering', 'Full-stack engineering, React, Next.js, FastAPI, REST/GraphQL APIs, UI/UX design', TRUE),
    ('c0000000-0000-0000-0000-000000000009', 'DevOps & CI/CD', 'Infrastructure', 'Docker containerization, CI/CD pipelines, GitHub Actions, Terraform, monitoring', TRUE),
    ('c0000000-0000-0000-0000-000000000010', 'Internet of Things (IoT)', 'Hardware & Embedded', 'Embedded sensors, Arduino, Raspberry Pi, MQTT protocols, edge computing', TRUE),
    ('c0000000-0000-0000-0000-000000000011', 'VLSI Design', 'Hardware & Embedded', 'Verilog/VHDL, ASIC design flow, FPGA prototyping, semiconductor architectures', TRUE),
    ('c0000000-0000-0000-0000-000000000012', 'Natural Language Processing', 'Artificial Intelligence', 'Tokenization, word embeddings, BERT, LLM fine-tuning, sentiment analysis', TRUE),
    ('c0000000-0000-0000-0000-000000000013', 'Computer Vision', 'Artificial Intelligence', 'OpenCV, object detection, YOLO, CNN architectures, image segmentation', TRUE),
    ('c0000000-0000-0000-0000-000000000014', 'Robotics & Automation', 'Hardware & Embedded', 'ROS framework, kinematics, autonomous navigation, industrial automation', TRUE),
    ('c0000000-0000-0000-0000-000000000015', 'Big Data Analytics', 'Data Analytics', 'Apache Spark, Hadoop, distributed data streaming, Kafka, data warehousing', TRUE)
ON CONFLICT (expertise_name) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. SAMPLE SEED RESOURCE PERSONS (Approved profiles for initial exploration)
-- ------------------------------------------------------------------------------
-- Note: Replace or augment as needed. Passwords and users are seeded separately.
INSERT INTO resource_persons (
    id, full_name, designation, email, mobile_number, address, 
    professional_biography, professional_profile_url, approval_status
)
VALUES
    (
        'd0000000-0000-0000-0000-000000000001',
        'Dr. Ramesh Kumar Varma',
        'Director of Artificial Intelligence',
        'ramesh.varma@wipro.com',
        '+91 98480 12345',
        'Plot 23, Jubilee Hills, Hyderabad, Telangana',
        'Senior AI Architect and Director with over 18 years of industry experience leading enterprise AI transformations, LLM applications and Generative AI research.',
        'https://linkedin.com/in/ramesh-kumar-varma',
        'APPROVED'
    ),
    (
        'd0000000-0000-0000-0000-000000000002',
        'Dr. Ananya Reddy',
        'Principal Cloud Architect',
        'ananya.reddy@microsoft.com',
        '+91 94400 54321',
        'Road No 10, Banjara Hills, Hyderabad, Telangana',
        'Principal cloud solutions architect specializing in distributed hyperscale systems, hybrid cloud infrastructure and Kubernetes resiliency at Microsoft IDC.',
        'https://linkedin.com/in/ananya-reddy-cloud',
        'APPROVED'
    ),
    (
        'd0000000-0000-0000-0000-000000000003',
        'Prof. K. S. Narayana',
        'Senior Scientist & Research Fellow',
        'ks.narayana@drdo.gov.in',
        '+91 98850 67890',
        'Defence Housing Colony, Secunderabad, Telangana',
        'Veteran scientist with over 25 years of research in secure communications, cryptographic hardware, and cybersecurity protocols for national defence.',
        'https://linkedin.com/in/prof-ks-narayana',
        'APPROVED'
    ),
    (
        'd0000000-0000-0000-0000-000000000004',
        'Siddharth Rao',
        'Staff Software Engineer',
        'siddharth.rao@google.com',
        '+91 99590 11223',
        'Kondapur, Hyderabad, Telangana',
        'Staff engineer working on large-scale distributed systems, Python backend services, and high-performance Web platform architectures.',
        'https://linkedin.com/in/siddharth-rao-dev',
        'APPROVED'
    ),
    (
        'd0000000-0000-0000-0000-000000000005',
        'Pooja Deshmukh',
        'Lead Data Scientist',
        'pooja.deshmukh@amazon.com',
        '+91 97000 33445',
        'Madhapur, Hyderabad, Telangana',
        'Specialist in predictive customer analytics, NLP pipelines for multi-lingual search, and end-to-end MLOps deployment on AWS SageMaker.',
        'https://linkedin.com/in/pooja-deshmukh-ds',
        'PENDING'
    )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. PERSON-ORGANISATION ASSOCIATIONS
-- ------------------------------------------------------------------------------
-- Dr. Ramesh Kumar Varma (Wipro Director - Current, previous at Infosys)
INSERT INTO person_organisations (id, resource_person_id, organisation_id, designation, start_date, end_date, is_current)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Director of Artificial Intelligence', '2020-01-15', NULL, TRUE),
    ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000012', 'Principal AI Consultant', '2014-06-01', '2019-12-31', FALSE),

-- Dr. Ananya Reddy (Microsoft - Current, previous at Amazon AWS)
    ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'Principal Cloud Architect', '2019-03-01', NULL, TRUE),
    ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000005', 'Senior Solutions Architect', '2015-08-01', '2019-02-28', FALSE),

-- Prof. K. S. Narayana (DRDO - Current)
    ('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000006', 'Senior Scientist & Research Fellow', '2008-01-01', NULL, TRUE),

-- Siddharth Rao (Google - Current)
    ('e0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'Staff Software Engineer', '2021-04-10', NULL, TRUE),

-- Pooja Deshmukh (Amazon AWS - Current)
    ('e0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'Lead Data Scientist', '2022-02-01', NULL, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 6. PERSON-EXPERTISE ASSOCIATIONS
-- ------------------------------------------------------------------------------
INSERT INTO person_expertise (id, resource_person_id, expertise_id)
VALUES
    -- Ramesh Varma: Generative AI, Machine Learning, Artificial Intelligence
    ('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),
    ('f0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002'),
    ('f0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000007'),

    -- Ananya Reddy: Cloud Computing, DevOps & CI/CD
    ('f0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000004'),
    ('f0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000009'),

    -- Prof KS Narayana: Cybersecurity, VLSI Design
    ('f0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000005'),
    ('f0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000011'),

    -- Siddharth Rao: Python Programming, Web Development
    ('f0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000006'),
    ('f0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000008'),

    -- Pooja Deshmukh: Data Science, Natural Language Processing
    ('f0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003'),
    ('f0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000012')
ON CONFLICT (resource_person_id, expertise_id) DO NOTHING;

