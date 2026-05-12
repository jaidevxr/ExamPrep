export interface Topic {
  id: string;
  title: string;
  completed: boolean;
  important: boolean;
  notes?: string;
  isHeading?: boolean;
}

export interface Unit {
  id: string;
  title: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  examDate: string;
  examTime?: string;
  color: string;
  units: Unit[];
}

export const subjects: Subject[] = [
  {
    id: "internet-of-things",
    name: "Internet of Things",
    code: "NPEC43224",
    examDate: "2026-05-15",
    examTime: "2:00 PM - 5:00 PM",
    color: "primary",
    units: [
      {
        id: "iot-unit1",
        title: "Module 1: Introduction to IoT (30 Hrs)",
        topics: [
          { id: "iot-1-h1", title: "Introduction to IoT", completed: false, important: false, isHeading: true },
          { id: "iot-1-1", title: "Sensing", completed: false, important: true },
          { id: "iot-1-2", title: "Actuation", completed: false, important: true },
          { id: "iot-1-3", title: "Networking Basics", completed: false, important: true },
          { id: "iot-1-4", title: "Communication Protocols", completed: false, important: true },
          { id: "iot-1-5", title: "Sensor Networks", completed: false, important: true },
          { id: "iot-1-6", title: "Machine-to-machine Communications", completed: false, important: true },
          { id: "iot-1-7", title: "IoT Definition", completed: false, important: true },
          { id: "iot-1-8", title: "IoT Characteristics", completed: false, important: true },
          { id: "iot-1-9", title: "IoT Functional Blocks", completed: false, important: true },
          { id: "iot-1-10", title: "Physical design of IoT", completed: false, important: true },
          { id: "iot-1-11", title: "Logical design of IoT", completed: false, important: true },
          { id: "iot-1-12", title: "Communication models & APIs", completed: false, important: true },
          { id: "iot-1-h2", title: "M2M to IoT - The Vision", completed: false, important: false, isHeading: true },
          { id: "iot-1-13", title: "M2M to IoT - Introduction", completed: false, important: true },
          { id: "iot-1-14", title: "From M2M to IoT", completed: false, important: true },
          { id: "iot-1-15", title: "M2M towards IoT - The global context", completed: false, important: true },
          { id: "iot-1-16", title: "A use case example", completed: false, important: false },
          { id: "iot-1-17", title: "Differing Characteristics", completed: false, important: true },
          { id: "iot-1-18", title: "Definitions", completed: false, important: true },
          { id: "iot-1-19", title: "M2M Value Chains", completed: false, important: true },
          { id: "iot-1-20", title: "IoT Value Chains", completed: false, important: true },
          { id: "iot-1-21", title: "An emerging industrial structure for IoT", completed: false, important: false },
        ]
      },
      {
        id: "iot-unit2",
        title: "Module 2: IoT Architecture (30 Hrs)",
        topics: [
          { id: "iot-2-h1", title: "M2M vs IoT - An Architectural Overview", completed: false, important: false, isHeading: true },
          { id: "iot-2-1", title: "Building architecture", completed: false, important: true },
          { id: "iot-2-2", title: "Main design principles and needed capabilities", completed: false, important: true },
          { id: "iot-2-3", title: "An IoT architecture outline", completed: false, important: true },
          { id: "iot-2-4", title: "Standards considerations", completed: false, important: true },
          { id: "iot-2-5", title: "Reference Architecture and Reference Model of IoT", completed: false, important: true },
          { id: "iot-2-h2", title: "IoT Reference Architecture", completed: false, important: false, isHeading: true },
          { id: "iot-2-6", title: "Getting Familiar with IoT Architecture", completed: false, important: true },
          { id: "iot-2-7", title: "Various architectural views of IoT", completed: false, important: true },
          { id: "iot-2-8", title: "Functional view", completed: false, important: true },
          { id: "iot-2-9", title: "Information view", completed: false, important: true },
          { id: "iot-2-10", title: "Operational view", completed: false, important: true },
          { id: "iot-2-11", title: "Deployment view", completed: false, important: true },
        ]
      },
      {
        id: "iot-unit3",
        title: "Module 3: Design Constraints & Applications (30 Hrs)",
        topics: [
          { id: "iot-3-h1", title: "Constraints affecting design in the IoT world", completed: false, important: false, isHeading: true },
          { id: "iot-3-1", title: "Introduction to IoT design constraints", completed: false, important: true },
          { id: "iot-3-2", title: "Technical design constraints", completed: false, important: true },
          { id: "iot-3-h2", title: "Domain-specific applications of IoT", completed: false, important: false, isHeading: true },
          { id: "iot-3-3", title: "Home automation", completed: false, important: true },
          { id: "iot-3-4", title: "Industry applications", completed: false, important: true },
          { id: "iot-3-5", title: "Surveillance applications", completed: false, important: true },
          { id: "iot-3-6", title: "Other IoT applications", completed: false, important: false },
          { id: "iot-3-7", title: "Developing IoT solutions", completed: false, important: true },
        ]
      }
    ]
  },
  {
    id: "industrial-management",
    name: "Industrial Management",
    code: "NHS4601",
    examDate: "2026-05-22",
    examTime: "2:00 PM - 5:00 PM",
    color: "secondary",
    units: [
      {
        id: "im-unit1",
        title: "Module 1: Introduction (20 Hrs)",
        topics: [
          { id: "im-1-h1", title: "Introduction", completed: false, important: false, isHeading: true },
          { id: "im-1-1", title: "Concept of Industrial Management", completed: false, important: true },
          { id: "im-1-2", title: "Development of Industrial Management", completed: false, important: true },
          { id: "im-1-3", title: "Scope of Industrial Management", completed: false, important: true },
          { id: "im-1-4", title: "Recent Trends in IM", completed: false, important: true },
          { id: "im-1-5", title: "Industrial Management & Production Management", completed: false, important: true },
          { id: "im-1-6", title: "Productivity Measurement", completed: false, important: true },
          { id: "im-1-7", title: "Types of Production System", completed: false, important: true },
          { id: "im-1-8", title: "Production Planning and Control", completed: false, important: true },
        ]
      },
      {
        id: "im-unit2",
        title: "Module 2: Plant Maintenance & Industrial Safety (20 Hrs)",
        topics: [
          { id: "im-2-h1", title: "Plant Maintenance & Industrial Safety", completed: false, important: false, isHeading: true },
          { id: "im-2-1", title: "Concept of Plant Location", completed: false, important: true },
          { id: "im-2-2", title: "Factors influencing Location", completed: false, important: true },
          { id: "im-2-3", title: "Concept & Meaning of Plant Layout", completed: false, important: true },
          { id: "im-2-4", title: "Factors Affecting Plant Layout", completed: false, important: true },
          { id: "im-2-5", title: "Advantages of Plant Layout", completed: false, important: true },
          { id: "im-2-6", title: "Types of Plant Layout", completed: false, important: true },
          { id: "im-2-7", title: "Work Study", completed: false, important: true },
          { id: "im-2-8", title: "Industrial Ownership", completed: false, important: true },
        ]
      },
      {
        id: "im-unit3",
        title: "Module 3: Project Management & Quality Control (20 Hrs)",
        topics: [
          { id: "im-3-h1", title: "Project Management and Quality Control", completed: false, important: false, isHeading: true },
          { id: "im-3-1", title: "Inventory", completed: false, important: true },
          { id: "im-3-2", title: "Deterministic Models & Techniques", completed: false, important: true },
          { id: "im-3-3", title: "Concept of Supply Chain Management", completed: false, important: true },
          { id: "im-3-h2", title: "Quality Control", completed: false, important: false, isHeading: true },
          { id: "im-3-4", title: "SQC Concept & Techniques", completed: false, important: true },
          { id: "im-3-5", title: "Introduction to TQM", completed: false, important: true },
          { id: "im-3-h3", title: "Project Management", completed: false, important: false, isHeading: true },
          { id: "im-3-6", title: "Project network analysis", completed: false, important: true },
          { id: "im-3-7", title: "CPM (Critical Path Method)", completed: false, important: true },
          { id: "im-3-8", title: "PERT", completed: false, important: true },
          { id: "im-3-9", title: "Project crashing", completed: false, important: true },
          { id: "im-3-10", title: "Resource leveling", completed: false, important: true },
        ]
      }
    ]
  },
  {
    id: "compiler-design",
    name: "Compiler Design",
    code: "NCS4604",
    examDate: "2026-05-29",
    examTime: "2:00 PM - 5:00 PM",
    color: "accent",
    units: [
      {
        id: "cd-unit1",
        title: "Module 1: Introduction to Compilers & Parsing (30 Hrs)",
        topics: [
          { id: "cd-1-h1", title: "Introduction to Compilers", completed: false, important: false, isHeading: true },
          { id: "cd-1-1", title: "Compilers: Phases and passes", completed: false, important: true },
          { id: "cd-1-2", title: "Bootstrapping", completed: false, important: false },
          { id: "cd-1-3", title: "Finite state machines and regular expressions", completed: false, important: true },
          { id: "cd-1-4", title: "Applications to lexical analysis", completed: false, important: true },
          { id: "cd-1-5", title: "Optimization of DFA-Based Pattern Matchers", completed: false, important: true },
          { id: "cd-1-6", title: "Implementation of lexical analyzers", completed: false, important: true },
          { id: "cd-1-7", title: "Lexical-analyzer generator", completed: false, important: true },
          { id: "cd-1-8", title: "LEX compiler", completed: false, important: true },
          { id: "cd-1-9", title: "Formal grammars and their application to syntax analysis", completed: false, important: true },
          { id: "cd-1-10", title: "BNF notation", completed: false, important: true },
          { id: "cd-1-11", title: "Ambiguity", completed: false, important: true },
          { id: "cd-1-12", title: "YACC", completed: false, important: true },
          { id: "cd-1-13", title: "The syntactic specification of programming languages", completed: false, important: true },
          { id: "cd-1-14", title: "Context free grammars", completed: false, important: true },
          { id: "cd-1-15", title: "Derivation and parse trees", completed: false, important: true },
          { id: "cd-1-16", title: "Capabilities of CFGs", completed: false, important: false },
          { id: "cd-1-h2", title: "Basic Parsing Techniques", completed: false, important: false, isHeading: true },
          { id: "cd-1-17", title: "Parsers", completed: false, important: true },
          { id: "cd-1-18", title: "Shift reduce parsing", completed: false, important: true },
          { id: "cd-1-19", title: "Operator precedence parsing", completed: false, important: true },
          { id: "cd-1-20", title: "Top down parsing", completed: false, important: true },
          { id: "cd-1-21", title: "Predictive parsers", completed: false, important: true },
        ]
      },
      {
        id: "cd-unit2",
        title: "Module 2: Efficient Parsers & Intermediate Code (30 Hrs)",
        topics: [
          { id: "cd-2-h1", title: "Automatic Construction of Efficient Parsers", completed: false, important: false, isHeading: true },
          { id: "cd-2-1", title: "LR parsers", completed: false, important: true },
          { id: "cd-2-2", title: "The canonical collection of LR(0) items", completed: false, important: true },
          { id: "cd-2-3", title: "Constructing SLR parsing tables", completed: false, important: true },
          { id: "cd-2-4", title: "Constructing Canonical LR parsing tables", completed: false, important: true },
          { id: "cd-2-5", title: "Constructing LALR parsing tables", completed: false, important: true },
          { id: "cd-2-6", title: "Using ambiguous grammars", completed: false, important: false },
          { id: "cd-2-7", title: "An automatic parser generator", completed: false, important: false },
          { id: "cd-2-8", title: "Implementation of LR parsing tables", completed: false, important: true },
          { id: "cd-2-h2", title: "Intermediate Code Generation", completed: false, important: false, isHeading: true },
          { id: "cd-2-9", title: "Parse trees & syntax trees", completed: false, important: true },
          { id: "cd-2-10", title: "Three address code", completed: false, important: true },
          { id: "cd-2-11", title: "Quadruple & triples", completed: false, important: true },
          { id: "cd-2-12", title: "Translation of assignment statements", completed: false, important: true },
          { id: "cd-2-13", title: "Boolean expressions", completed: false, important: true },
          { id: "cd-2-14", title: "Statements that alter the flow of control", completed: false, important: true },
          { id: "cd-2-15", title: "Postfix translation", completed: false, important: true },
          { id: "cd-2-16", title: "Translation with a top down parser", completed: false, important: false },
        ]
      },
      {
        id: "cd-unit3",
        title: "Module 3: Syntax-directed Translation (30 Hrs)",
        topics: [
          { id: "cd-3-h1", title: "Syntax-directed Translation", completed: false, important: false, isHeading: true },
          { id: "cd-3-1", title: "Syntax-directed Translation schemes", completed: false, important: true },
          { id: "cd-3-2", title: "Implementation of Syntax directed Translators", completed: false, important: true },
          { id: "cd-3-3", title: "Intermediate code", completed: false, important: true },
          { id: "cd-3-4", title: "Postfix notation", completed: false, important: true },
          { id: "cd-3-h2", title: "More about Translation", completed: false, important: false, isHeading: true },
          { id: "cd-3-5", title: "Array references in arithmetic expressions", completed: false, important: true },
          { id: "cd-3-6", title: "Procedures call", completed: false, important: true },
          { id: "cd-3-7", title: "Declarations and case statements", completed: false, important: true },
          { id: "cd-3-h3", title: "Symbol Tables", completed: false, important: false, isHeading: true },
          { id: "cd-3-8", title: "Data structure for symbols tables", completed: false, important: true },
          { id: "cd-3-9", title: "Representing scope information", completed: false, important: true },
          { id: "cd-3-10", title: "Run-Time Administration", completed: false, important: true },
        ]
      },
      {
        id: "cd-unit4",
        title: "Module 4: Code Generation & Optimization (30 Hrs)",
        topics: [
          { id: "cd-4-h1", title: "Runtime Storage", completed: false, important: false, isHeading: true },
          { id: "cd-4-1", title: "Implementation of simple stack allocation scheme", completed: false, important: true },
          { id: "cd-4-2", title: "Storage allocation in block structured language", completed: false, important: true },
          { id: "cd-4-h2", title: "Error Detection & Recovery", completed: false, important: false, isHeading: true },
          { id: "cd-4-3", title: "Lexical Phase errors", completed: false, important: true },
          { id: "cd-4-4", title: "Syntactic phase errors", completed: false, important: true },
          { id: "cd-4-5", title: "Semantic errors", completed: false, important: true },
          { id: "cd-4-h3", title: "Code Generation", completed: false, important: false, isHeading: true },
          { id: "cd-4-6", title: "Code Generation: Design Issues", completed: false, important: true },
          { id: "cd-4-7", title: "The Target Language", completed: false, important: true },
          { id: "cd-4-8", title: "Addresses in the Target Code", completed: false, important: true },
          { id: "cd-4-9", title: "Basic Blocks and Flow Graphs", completed: false, important: true },
          { id: "cd-4-10", title: "Optimization of Basic Blocks", completed: false, important: true },
          { id: "cd-4-11", title: "Code Generator", completed: false, important: true },
          { id: "cd-4-h4", title: "Code Optimization", completed: false, important: false, isHeading: true },
          { id: "cd-4-12", title: "Machine-Independent Optimizations", completed: false, important: true },
          { id: "cd-4-13", title: "Loop optimization", completed: false, important: true },
          { id: "cd-4-14", title: "DAG representation of basic blocks", completed: false, important: true },
          { id: "cd-4-15", title: "Value numbers and algebraic laws", completed: false, important: true },
          { id: "cd-4-16", title: "Global Data-Flow analysis", completed: false, important: true },
        ]
      }
    ]
  },
  {
    id: "cyber-law-security",
    name: "Cyber Law and Security",
    code: "NPEC43213",
    examDate: "2026-06-01",
    examTime: "2:00 PM - 5:00 PM",
    color: "success",
    units: [
      {
        id: "cls-unit1",
        title: "Module 1: Information Systems & Security (30 Hrs)",
        topics: [
          { id: "cls-1-h1", title: "Introduction to Information Systems", completed: false, important: false, isHeading: true },
          { id: "cls-1-1", title: "Introduction to information systems", completed: false, important: true },
          { id: "cls-1-2", title: "Types of Information Systems", completed: false, important: true },
          { id: "cls-1-3", title: "Development of Information Systems", completed: false, important: false },
          { id: "cls-1-4", title: "Introduction to information security", completed: false, important: true },
          { id: "cls-1-5", title: "Need for Information security", completed: false, important: true },
          { id: "cls-1-6", title: "Threats to Information Systems", completed: false, important: true },
          { id: "cls-1-7", title: "Information Assurance", completed: false, important: true },
          { id: "cls-1-8", title: "Cyber Security", completed: false, important: true },
          { id: "cls-1-9", title: "Security Risk Analysis", completed: false, important: true },
          { id: "cls-1-h2", title: "Mobile & Wireless Security", completed: false, important: false, isHeading: true },
          { id: "cls-1-10", title: "Classification of Threats and Assessing Damages", completed: false, important: true },
          { id: "cls-1-11", title: "Security in Mobile and Wireless Computing", completed: false, important: true },
          { id: "cls-1-12", title: "Security Challenges in Mobile Devices", completed: false, important: true },
          { id: "cls-1-13", title: "Authentication Service Security", completed: false, important: true },
          { id: "cls-1-14", title: "Security Implication for organizations", completed: false, important: true },
          { id: "cls-1-h3", title: "Application Security", completed: false, important: false, isHeading: true },
          { id: "cls-1-15", title: "Application security (Database)", completed: false, important: true },
          { id: "cls-1-16", title: "Application security (E-mail)", completed: false, important: true },
          { id: "cls-1-17", title: "Application security (Internet)", completed: false, important: true },
          { id: "cls-1-18", title: "Data Security Considerations", completed: false, important: true },
          { id: "cls-1-19", title: "Backups", completed: false, important: true },
          { id: "cls-1-20", title: "Archival Storage and Disposal of Data", completed: false, important: false },
        ]
      },
      {
        id: "cls-unit2",
        title: "Module 2: Security Technology & Cryptography (30 Hrs)",
        topics: [
          { id: "cls-2-h1", title: "Security Technology - Firewall and VPNs", completed: false, important: false, isHeading: true },
          { id: "cls-2-1", title: "Firewall", completed: false, important: true },
          { id: "cls-2-2", title: "VPNs (Virtual Private Networks)", completed: false, important: true },
          { id: "cls-2-h2", title: "Security Threats", completed: false, important: false, isHeading: true },
          { id: "cls-2-3", title: "Viruses", completed: false, important: true },
          { id: "cls-2-4", title: "Worms", completed: false, important: true },
          { id: "cls-2-5", title: "Trojan Horse", completed: false, important: true },
          { id: "cls-2-6", title: "Bombs, Trapdoors, Spoofs", completed: false, important: true },
          { id: "cls-2-7", title: "E-mail viruses", completed: false, important: true },
          { id: "cls-2-8", title: "Macro viruses", completed: false, important: true },
          { id: "cls-2-9", title: "Malicious Software", completed: false, important: true },
          { id: "cls-2-10", title: "Network and Denial of Services Attacks", completed: false, important: true },
          { id: "cls-2-h3", title: "Security Threats to E-Commerce", completed: false, important: false, isHeading: true },
          { id: "cls-2-11", title: "Electronic Payment System", completed: false, important: true },
          { id: "cls-2-12", title: "e-Cash", completed: false, important: true },
          { id: "cls-2-13", title: "Credit/Debit Cards", completed: false, important: true },
          { id: "cls-2-14", title: "Digital Signature", completed: false, important: true },
          { id: "cls-2-15", title: "Public Key Cryptography", completed: false, important: true },
          { id: "cls-2-h4", title: "Secure Information Systems", completed: false, important: false, isHeading: true },
          { id: "cls-2-16", title: "Developing Secure Information Systems", completed: false, important: true },
          { id: "cls-2-17", title: "Application Development Security", completed: false, important: true },
          { id: "cls-2-18", title: "Information Security Governance & Risk Management", completed: false, important: true },
          { id: "cls-2-19", title: "Security Architecture & Design Security", completed: false, important: true },
        ]
      },
      {
        id: "cls-unit3",
        title: "Module 3: Physical Security, Cyber Crime & Law (30 Hrs)",
        topics: [
          { id: "cls-3-h1", title: "Physical Security", completed: false, important: false, isHeading: true },
          { id: "cls-3-1", title: "Issues in Hardware", completed: false, important: true },
          { id: "cls-3-2", title: "Data Storage & Downloadable Devices", completed: false, important: true },
          { id: "cls-3-3", title: "Physical Security of IT Assets", completed: false, important: true },
          { id: "cls-3-4", title: "Access Control", completed: false, important: true },
          { id: "cls-3-5", title: "CCTV and Intrusion Detection Systems", completed: false, important: true },
          { id: "cls-3-6", title: "Backup Security Measures", completed: false, important: true },
          { id: "cls-3-h2", title: "Laws, Investigation and Ethics", completed: false, important: false, isHeading: true },
          { id: "cls-3-7", title: "Cyber Crime", completed: false, important: true },
          { id: "cls-3-8", title: "Information Security and Law", completed: false, important: true },
          { id: "cls-3-9", title: "Types & overview of Cyber Crimes", completed: false, important: true },
          { id: "cls-3-10", title: "Cyber Law", completed: false, important: true },
          { id: "cls-3-11", title: "Issues in E-Business Management", completed: false, important: true },
          { id: "cls-3-12", title: "Overview of Indian IT Act", completed: false, important: true },
          { id: "cls-3-h3", title: "Ethical & Legal Issues", completed: false, important: false, isHeading: true },
          { id: "cls-3-13", title: "Ethical Issues in Intellectual property rights", completed: false, important: true },
          { id: "cls-3-14", title: "Copy Right", completed: false, important: true },
          { id: "cls-3-15", title: "Patents", completed: false, important: true },
          { id: "cls-3-16", title: "Data privacy and protection", completed: false, important: true },
          { id: "cls-3-17", title: "Domain Name", completed: false, important: true },
          { id: "cls-3-18", title: "Software piracy", completed: false, important: true },
          { id: "cls-3-19", title: "Plagiarism", completed: false, important: false },
          { id: "cls-3-20", title: "Issues in ethical hacking", completed: false, important: true },
        ]
      }
    ]
  }
];
