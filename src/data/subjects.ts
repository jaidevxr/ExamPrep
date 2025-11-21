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
    id: "computer-networks",
    name: "Computer Networks",
    code: "NCS4503",
    examDate: "2025-11-27",
    examTime: "2:00 PM - 5:00 PM",
    color: "primary",
    units: [
      {
        id: "cn-unit1",
        title: "Module 1",
        topics: [
          { id: "cn-1-h1", title: "Introduction", completed: false, important: false, isHeading: true },
          { id: "cn-1-1", title: "Introduction: Network objectives and applications", completed: false, important: true },
          { id: "cn-1-2", title: "Network structure and architecture", completed: false, important: true },
          { id: "cn-1-3", title: "OSI reference model", completed: false, important: true },
          { id: "cn-1-4", title: "Network services", completed: false, important: false },
          { id: "cn-1-5", title: "Network standardization", completed: false, important: false },
          { id: "cn-1-6", title: "Examples of network, TCP/IP model", completed: false, important: true },
          { id: "cn-1-h2", title: "Physical layer", completed: false, important: false, isHeading: true },
          { id: "cn-1-7", title: "Fundamentals of data communication", completed: false, important: true },
          { id: "cn-1-8", title: "Transmission media", completed: false, important: true },
          { id: "cn-1-9", title: "Analog transmission", completed: false, important: false },
          { id: "cn-1-10", title: "Digital transmission", completed: false, important: true },
          { id: "cn-1-11", title: "Switching", completed: false, important: true },
          { id: "cn-1-12", title: "ISDN", completed: false, important: false },
          { id: "cn-1-13", title: "Terminal handling", completed: false, important: false },
          { id: "cn-1-14", title: "Broadcast channels and medium access: LAN protocols", completed: false, important: true },
        ]
      },
      {
        id: "cn-unit2",
        title: "Data link layer and Network layer",
        topics: [
          { id: "cn-2-h1", title: "Data link layer", completed: false, important: false, isHeading: true },
          { id: "cn-2-1", title: "Design issues", completed: false, important: true },
          { id: "cn-2-2", title: "Error detection and corrections", completed: false, important: true },
          { id: "cn-2-3", title: "Elementary data link protocols", completed: false, important: true },
          { id: "cn-2-4", title: "Sliding window protocols. Examples", completed: false, important: true },
          { id: "cn-2-h2", title: "Network layer", completed: false, important: false, isHeading: true },
          { id: "cn-2-5", title: "Design issues", completed: false, important: true },
          { id: "cn-2-6", title: "Routing algorithms", completed: false, important: true },
          { id: "cn-2-7", title: "Congestion control", completed: false, important: true },
          { id: "cn-2-8", title: "Internetworking. Examples", completed: false, important: false },
          { id: "cn-2-9", title: "CSMA with collision detection", completed: false, important: true },
          { id: "cn-2-10", title: "Collision free protocols", completed: false, important: false },
          { id: "cn-2-11", title: "IEEE standard 802 for LANs", completed: false, important: true },
          { id: "cn-2-12", title: "Comparison of LANs", completed: false, important: false },
          { id: "cn-2-13", title: "Fiber optic network and FDDI", completed: false, important: false },
        ]
      },
      {
        id: "cn-unit3",
        title: "Transport, Session and Presentation layer",
        topics: [
          { id: "cn-3-h1", title: "Transport layer", completed: false, important: false, isHeading: true },
          { id: "cn-3-1", title: "Design Issues", completed: false, important: true },
          { id: "cn-3-2", title: "Connection management", completed: false, important: true },
          { id: "cn-3-3", title: "Example of a simple transport protocol", completed: false, important: false },
          { id: "cn-3-h2", title: "Session layer", completed: false, important: false, isHeading: true },
          { id: "cn-3-4", title: "Design issues", completed: false, important: false },
          { id: "cn-3-5", title: "Remote procedure call", completed: false, important: true },
          { id: "cn-3-6", title: "Examples", completed: false, important: false },
          { id: "cn-3-h3", title: "Presentation layer", completed: false, important: false, isHeading: true },
          { id: "cn-3-7", title: "Design issues", completed: false, important: false },
          { id: "cn-3-8", title: "Data compression and encryption", completed: false, important: true },
          { id: "cn-3-9", title: "Network security and privacy", completed: false, important: true },
          { id: "cn-3-h4", title: "Application Layer", completed: false, important: false, isHeading: true },
          { id: "cn-3-10", title: "Design issues", completed: false, important: false },
          { id: "cn-3-11", title: "File transfer and file access", completed: false, important: true },
          { id: "cn-3-12", title: "Electronic mail", completed: false, important: true },
          { id: "cn-3-13", title: "Virtual terminals", completed: false, important: false },
          { id: "cn-3-14", title: "Other applications, Case study based on available network software", completed: false, important: false },
        ]
      }
    ]
  },
  {
    id: "automata-theory",
    name: "Automata Theory",
    code: "NCS4504",
    examDate: "2025-11-29",
    examTime: "2:00 PM - 5:00 PM",
    color: "secondary",
    units: [
      {
        id: "at-unit1",
        title: "Module 1",
        topics: [
          { id: "at-1-h1", title: "Fundamentals", completed: false, important: false, isHeading: true },
          { id: "at-1-1", title: "Formal Languages, Strings, Alphabets, Languages", completed: false, important: true },
          { id: "at-1-2", title: "Chomsky Hierarchy of languages", completed: false, important: true },
          { id: "at-1-h2", title: "Finite Automata", completed: false, important: false, isHeading: true },
          { id: "at-1-3", title: "Introduction to Finite State machine", completed: false, important: true },
          { id: "at-1-4", title: "Acceptance of strings and languages", completed: false, important: true },
          { id: "at-1-5", title: "Deterministic finite automaton (DFA) and Non-deterministic finite automaton (NFA)", completed: false, important: true },
          { id: "at-1-6", title: "Equivalence of NFA and DFA – Equivalence of NDFAs with and without Є-moves", completed: false, important: true },
          { id: "at-1-7", title: "Minimization of finite automata", completed: false, important: true },
          { id: "at-1-8", title: "Equivalence between two DFA's", completed: false, important: false },
          { id: "at-1-9", title: "Finite automata with output – Moore and Mealy machines", completed: false, important: true },
          { id: "at-1-10", title: "Conversion of Moore to Mealy and Mealy to Moore", completed: false, important: true },
          { id: "at-1-h3", title: "Regular Languages", completed: false, important: false, isHeading: true },
          { id: "at-1-11", title: "Regular expressions, Identity rules", completed: false, important: true },
          { id: "at-1-12", title: "Conversion of a given regular expression into a finite automaton", completed: false, important: true },
          { id: "at-1-13", title: "Conversion of finite automata into a regular expression", completed: false, important: true },
          { id: "at-1-14", title: "Pumping lemma for regular sets", completed: false, important: true },
          { id: "at-1-15", title: "Closure properties of regular sets", completed: false, important: false },
        ]
      },
      {
        id: "at-unit2",
        title: "Module 2",
        topics: [
          { id: "at-2-h1", title: "Context Free Grammars", completed: false, important: false, isHeading: true },
          { id: "at-2-1", title: "Context free grammars and languages", completed: false, important: true },
          { id: "at-2-2", title: "Derivation trees", completed: false, important: true },
          { id: "at-2-3", title: "Leftmost and rightmost derivation of strings and Sentential forms", completed: false, important: true },
          { id: "at-2-4", title: "Ambiguity, left recursion and left factoring in context free grammars", completed: false, important: true },
          { id: "at-2-5", title: "Minimization of context free grammars", completed: false, important: false },
          { id: "at-2-6", title: "Normal forms for context free grammars, Chomsky normal form, Greibach normal form", completed: false, important: true },
          { id: "at-2-7", title: "Pumping Lemma for Context free Languages", completed: false, important: true },
          { id: "at-2-8", title: "Closure and decision properties of context free languages", completed: false, important: false },
        ]
      },
      {
        id: "at-unit3",
        title: "Module 3",
        topics: [
          { id: "at-3-h1", title: "Pushdown Automata", completed: false, important: false, isHeading: true },
          { id: "at-3-1", title: "Introduction to Pushdown automata", completed: false, important: true },
          { id: "at-3-2", title: "Acceptance of context free languages", completed: false, important: true },
          { id: "at-3-3", title: "Acceptance by final state and acceptance by empty state and its equivalence", completed: false, important: true },
          { id: "at-3-4", title: "Equivalence of context free grammars and pushdown automata, Inter-conversion", completed: false, important: true },
        ]
      },
      {
        id: "at-unit4",
        title: "Module 4",
        topics: [
          { id: "at-4-h1", title: "Turing Machine (TM)", completed: false, important: false, isHeading: true },
          { id: "at-4-1", title: "Problems That Computers Cannot Solve", completed: false, important: true },
          { id: "at-4-2", title: "The Turing Machine", completed: false, important: true },
          { id: "at-4-3", title: "Programming Techniques for Turing Machines", completed: false, important: true },
          { id: "at-4-4", title: "Extensions to the Basic Turing Machine", completed: false, important: false },
          { id: "at-4-5", title: "Restricted Turing Machines, Turing Machines and Computers", completed: false, important: false },
          { id: "at-4-6", title: "Definition of Post's Correspondence Problem", completed: false, important: true },
          { id: "at-4-7", title: "A Language That Is Not Recursively Enumerable", completed: false, important: true },
          { id: "at-4-8", title: "An Undecidable Problem That Is RE", completed: false, important: true },
          { id: "at-4-9", title: "Context sensitive languages and Chomsky hierarchy", completed: false, important: true },
          { id: "at-4-10", title: "Other Undecidable Problems", completed: false, important: false },
        ]
      }
    ]
  },
  {
    id: "microprocessor",
    name: "Microprocessor & Interfacing",
    code: "NCS4502",
    examDate: "2025-12-04",
    examTime: "2:00 PM - 5:00 PM",
    color: "accent",
    units: [
      {
        id: "mp-unit1",
        title: "Introduction: Memory & Microprocessor",
        topics: [
          { id: "mp-1-1", title: "Memory Unit: Primary Memory - RAM, SRAM, DRAM", completed: false, important: true },
          { id: "mp-1-2", title: "ROM, PROM, EPROM and EEPROM", completed: false, important: true },
          { id: "mp-1-3", title: "Secondary Memory: Magnetic Memory, Tap, disc", completed: false, important: false },
          { id: "mp-1-4", title: "Cache Memory", completed: false, important: true },
          { id: "mp-1-5", title: "Real and Virtual Memory", completed: false, important: false },
          { id: "mp-1-6", title: "Addressing Capacity of CPU", completed: false, important: true },
          { id: "mp-1-7", title: "Evolution of Microprocessor and its Types", completed: false, important: false },
          { id: "mp-1-8", title: "Microprocessor Architecture & Operation of Components", completed: false, important: true },
          { id: "mp-1-9", title: "Addressing Modes", completed: false, important: true },
          { id: "mp-1-10", title: "Interrupts", completed: false, important: true },
          { id: "mp-1-11", title: "Data Transfer Schemes: Instruction and Data Flow", completed: false, important: true },
          { id: "mp-1-12", title: "Timer and Timing Diagram", completed: false, important: true },
          { id: "mp-1-13", title: "Interfacing Devices", completed: false, important: false },
          { id: "mp-1-14", title: "Architectural Advancement of Microprocessors", completed: false, important: false },
          { id: "mp-1-15", title: "Typical Microprocessor Development Schemes", completed: false, important: false },
        ]
      },
      {
        id: "mp-unit2",
        title: "8085 Microprocessor",
        topics: [
          { id: "mp-2-1", title: "8 bit Microprocessor: Internal Architecture", completed: false, important: true },
          { id: "mp-2-2", title: "PIN Diagram", completed: false, important: true },
          { id: "mp-2-3", title: "Interrupt and Machine Cycle", completed: false, important: true },
          { id: "mp-2-4", title: "Instruction Sets: Addressing Modes", completed: false, important: true },
          { id: "mp-2-5", title: "Instruction Classification", completed: false, important: true },
          { id: "mp-2-6", title: "Machine Control and Assembler Directives", completed: false, important: false },
          { id: "mp-2-7", title: "Technical Features of: The Pentium", completed: false, important: false },
          { id: "mp-2-8", title: "Pentium Pr Micro Processor", completed: false, important: false },
          { id: "mp-2-9", title: "Pentium II, Pentium III", completed: false, important: false },
          { id: "mp-2-10", title: "Pentium – IV Microprocessor", completed: false, important: false },
        ]
      },
      {
        id: "mp-unit3",
        title: "8086 Microprocessor & Assembly Language Programming",
        topics: [
          { id: "mp-3-1", title: "16-bit Microprocessor: Architecture of 8086", completed: false, important: true },
          { id: "mp-3-2", title: "Register Organization", completed: false, important: true },
          { id: "mp-3-3", title: "Bus Interface Unit", completed: false, important: true },
          { id: "mp-3-4", title: "Execution Unit", completed: false, important: true },
          { id: "mp-3-5", title: "Memory Addressing", completed: false, important: true },
          { id: "mp-3-6", title: "Operating Modes", completed: false, important: false },
          { id: "mp-3-7", title: "Instruction Sets: Instruction Format", completed: false, important: true },
          { id: "mp-3-8", title: "Types of Instructions", completed: false, important: true },
          { id: "mp-3-9", title: "Introduction to 8086 Family", completed: false, important: false },
          { id: "mp-3-10", title: "Procedure and Macros, Connection", completed: false, important: false },
          { id: "mp-3-11", title: "Timing and Troubleshooting", completed: false, important: false },
          { id: "mp-3-12", title: "Interrupts", completed: false, important: true },
          { id: "mp-3-13", title: "Programming: Assembly Language Programming based on Intel 8085/8086", completed: false, important: true },
          { id: "mp-3-14", title: "Instructions: Data Transfer, Arithmetic, Logic", completed: false, important: true },
          { id: "mp-3-15", title: "Branch Operations, Looping, Counting, Indexing", completed: false, important: true },
          { id: "mp-3-16", title: "Programming Techniques: Counters and Time Delays", completed: false, important: false },
          { id: "mp-3-17", title: "Stacks, Subroutines", completed: false, important: true },
          { id: "mp-3-18", title: "Conditional Calls and Returns Instructions", completed: false, important: false },
          { id: "mp-3-19", title: "Introduction to Debugging Program", completed: false, important: false },
          { id: "mp-3-20", title: "Modular Programming: Structured Programming", completed: false, important: false },
          { id: "mp-3-21", title: "Top-down, Bottom-up Design", completed: false, important: false },
          { id: "mp-3-22", title: "MACRO Microprogramming", completed: false, important: false },
        ]
      },
      {
        id: "mp-unit4",
        title: "Peripheral Interfacing",
        topics: [
          { id: "mp-4-1", title: "Introduction to Peripheral Devices", completed: false, important: true },
          { id: "mp-4-2", title: "8237 4.2 DMA Controller", completed: false, important: true },
          { id: "mp-4-3", title: "8255 Programmable Peripheral Interface", completed: false, important: true },
          { id: "mp-4-4", title: "8253/8254 Programmable Timer/Counter", completed: false, important: true },
          { id: "mp-4-5", title: "8259 Programmable Interrupt Controller", completed: false, important: true },
          { id: "mp-4-6", title: "8251 USART and RS232C", completed: false, important: false },
        ]
      }
    ]
  },
  {
    id: "computer-graphics",
    name: "Computer Graphics",
    code: "NCS4505",
    examDate: "2025-12-08",
    examTime: "2:00 PM - 5:00 PM",
    color: "success",
    units: [
      {
        id: "cg-unit1",
        title: "Module 1",
        topics: [
          { id: "cg-1-h1", title: "INTRODUCTION TO COMPUTER GRAPHICS, GRAPHIC DISPLAYS, LINE AND CIRCLE DRAWING ALGORITHM", completed: false, important: false, isHeading: true },
          { id: "cg-1-1", title: "Introduction and Line Generation: Types of computer graphics", completed: false, important: true },
          { id: "cg-1-2", title: "Graphic displays", completed: false, important: true },
          { id: "cg-1-3", title: "Random scan displays", completed: false, important: false },
          { id: "cg-1-4", title: "Raster scan displays", completed: false, important: true },
          { id: "cg-1-5", title: "Frame buffer and video controller", completed: false, important: true },
          { id: "cg-1-6", title: "Points and lines", completed: false, important: true },
          { id: "cg-1-7", title: "Line drawing algorithms", completed: false, important: true },
          { id: "cg-1-8", title: "Circle generating algorithms", completed: false, important: true },
          { id: "cg-1-9", title: "Midpoint circle generating algorithm", completed: false, important: true },
          { id: "cg-1-10", title: "Parallel version of these algorithms", completed: false, important: false },
        ]
      },
      {
        id: "cg-unit2",
        title: "Module 2",
        topics: [
          { id: "cg-2-h1", title: "TRANSFORMATIONS, WINDOWING AND CLIPPING", completed: false, important: false, isHeading: true },
          { id: "cg-2-1", title: "Transformations: Basic transformation", completed: false, important: true },
          { id: "cg-2-2", title: "Matrix representations and homogenous coordinates", completed: false, important: true },
          { id: "cg-2-3", title: "Composite transformations", completed: false, important: true },
          { id: "cg-2-4", title: "Reflections and shearing", completed: false, important: true },
          { id: "cg-2-5", title: "Windowing and Clipping: Viewing pipeline", completed: false, important: true },
          { id: "cg-2-6", title: "Viewing transformations", completed: false, important: false },
          { id: "cg-2-7", title: "2-D Clipping algorithms- Line clipping algorithms such as Cohen Sutherland line clipping algorithm", completed: false, important: true },
          { id: "cg-2-8", title: "Liang Bar sky algorithm", completed: false, important: true },
          { id: "cg-2-9", title: "Line clipping against non-rectangular clip windows", completed: false, important: false },
          { id: "cg-2-10", title: "Polygon clipping – Sutherland Hodge man polygon clipping", completed: false, important: true },
          { id: "cg-2-11", title: "Weiler and Atherton polygon clipping", completed: false, important: false },
          { id: "cg-2-12", title: "Curve clipping, Text clipping", completed: false, important: false },
        ]
      },
      {
        id: "cg-unit3",
        title: "Module 3",
        topics: [
          { id: "cg-3-h1", title: "3-D TRANSFORMATION", completed: false, important: false, isHeading: true },
          { id: "cg-3-1", title: "Three Dimensional: 3-D geometric primitives", completed: false, important: true },
          { id: "cg-3-2", title: "3-D Object representation", completed: false, important: true },
          { id: "cg-3-3", title: "3-D Transformation", completed: false, important: true },
          { id: "cg-3-4", title: "3-D viewing", completed: false, important: true },
          { id: "cg-3-5", title: "Projections", completed: false, important: true },
          { id: "cg-3-6", title: "3-D Clipping", completed: false, important: true },
          { id: "cg-3-h2", title: "CURVES AND SURFACES, HIDDEN LINES AND SURFACES AND BASIC ILLUMINATION MODEL", completed: false, important: false, isHeading: true },
          { id: "cg-3-7", title: "Curves and Surfaces: Quadric surfaces", completed: false, important: true },
          { id: "cg-3-8", title: "Spheres", completed: false, important: false },
          { id: "cg-3-9", title: "Ellipsoid", completed: false, important: false },
          { id: "cg-3-10", title: "Blobby objects", completed: false, important: false },
          { id: "cg-3-11", title: "Introductory concepts of Spline, Bspline and Bezier curves and surfaces", completed: false, important: true },
          { id: "cg-3-12", title: "Hidden Lines and Surfaces: Back Face Detection algorithm", completed: false, important: true },
          { id: "cg-3-13", title: "Depth buffer method", completed: false, important: true },
          { id: "cg-3-14", title: "A-buffer method", completed: false, important: false },
          { id: "cg-3-15", title: "Scan line method", completed: false, important: true },
          { id: "cg-3-16", title: "Basic illumination models– Ambient light", completed: false, important: true },
          { id: "cg-3-17", title: "Diffuse reflection", completed: false, important: true },
          { id: "cg-3-18", title: "Specular reflection and Phuong model", completed: false, important: true },
        ]
      }
    ]
  },
  {
    id: "eme",
    name: "Engineering & Managerial Economics",
    code: "NHS4501",
    examDate: "2025-12-02",
    examTime: "2:00 PM - 5:00 PM",
    color: "warning",
    units: [
      {
        id: "eme-unit1",
        title: "Module I",
        topics: [
          { id: "eme-1-h1", title: "Introduction and basic concepts", completed: false, important: false, isHeading: true },
          { id: "eme-1-1", title: "Meaning, nature and scope of Economics", completed: false, important: true },
          { id: "eme-1-2", title: "Role of Engineering in Economics", completed: false, important: true },
          { id: "eme-1-3", title: "Managerial economics and its scope in Engineering perspective", completed: false, important: true },
          { id: "eme-1-4", title: "Relationship between Science, Engineering and Managerial Economics", completed: false, important: true },
          { id: "eme-1-h2", title: "Economics", completed: false, important: false, isHeading: true },
          { id: "eme-1-5", title: "Demand Analysis", completed: false, important: true },
          { id: "eme-1-6", title: "Law of Demand", completed: false, important: true },
          { id: "eme-1-7", title: "Determinants of demand", completed: false, important: true },
          { id: "eme-1-8", title: "Elasticity of Demand- Price, Income and Cross elasticity", completed: false, important: true },
          { id: "eme-1-9", title: "Law of supply, factor affecting supply", completed: false, important: true },
          { id: "eme-1-10", title: "Elasticity of supply", completed: false, important: true },
        ]
      },
      {
        id: "eme-unit2",
        title: "Module II",
        topics: [
          { id: "eme-2-h1", title: "Demand Forecasting", completed: false, important: false, isHeading: true },
          { id: "eme-2-1", title: "Meaning, Significance and methods of demand forecasting", completed: false, important: true },
          { id: "eme-2-2", title: "Production functions", completed: false, important: true },
          { id: "eme-2-3", title: "Law of Return to scale and Law of Diminishing Return to scale", completed: false, important: true },
          { id: "eme-2-4", title: "An overview of Short run and Long run cost curve", completed: false, important: true },
          { id: "eme-2-5", title: "Fixed cost, variable cost, average cost, marginal cost and opportunity cost", completed: false, important: true },
          { id: "eme-2-6", title: "Break-Even Analysis", completed: false, important: true },
        ]
      },
      {
        id: "eme-unit3",
        title: "Module III",
        topics: [
          { id: "eme-3-h1", title: "Market Structure", completed: false, important: false, isHeading: true },
          { id: "eme-3-1", title: "Perfect Competition", completed: false, important: true },
          { id: "eme-3-2", title: "Imperfect Competition", completed: false, important: true },
          { id: "eme-3-3", title: "Monopoly", completed: false, important: true },
          { id: "eme-3-4", title: "Monopolistic", completed: false, important: true },
          { id: "eme-3-5", title: "Oligopoly", completed: false, important: true },
          { id: "eme-3-6", title: "Duopoly", completed: false, important: false },
          { id: "eme-3-7", title: "Sorbent features of Price discrimination", completed: false, important: true },
        ]
      },
      {
        id: "eme-unit4",
        title: "Module IV",
        topics: [
          { id: "eme-4-h1", title: "National Income, Inflation and Business Cycle", completed: false, important: false, isHeading: true },
          { id: "eme-4-1", title: "Nature and characteristic of Indian Economy", completed: false, important: true },
          { id: "eme-4-2", title: "Concept of National Income and measurement", completed: false, important: true },
          { id: "eme-4-3", title: "Meaning of Inflation", completed: false, important: true },
          { id: "eme-4-4", title: "Types, causes and prevention methods of Inflation", completed: false, important: true },
          { id: "eme-4-5", title: "Deflation", completed: false, important: true },
          { id: "eme-4-6", title: "Phases of Business Cycle", completed: false, important: true },
        ]
      }
    ]
  },
  {
    id: "indian-knowledge",
    name: "Essence of Indian Knowledge Tradition",
    code: "NVC4501",
    examDate: "2025-11-25",
    examTime: "2:00 PM - 5:00 PM",
    color: "accent",
    units: [
      {
        id: "ikt-unit1",
        title: "Introduction to Traditional Knowledge",
        topics: [
          { id: "ikt-1-h1", title: "Introduction to Indian Traditional Knowledge", completed: false, important: false, isHeading: true },
          { id: "ikt-1-1", title: "Understanding Concept & Significance of Indian TK", completed: false, important: true },
          { id: "ikt-1-2", title: "Historical Background & Evolution of TK in India", completed: false, important: false },
          { id: "ikt-1-h2", title: "Intellectual Property Rights (IPR)", completed: false, important: false, isHeading: true },
          { id: "ikt-1-3", title: "Overview of IPR & Importance in Context of TK", completed: false, important: true },
          { id: "ikt-1-4", title: "Different Types of IPRs: Copyright, Trademarks, Patents, Geographical Indications", completed: false, important: true },
          { id: "ikt-1-h3", title: "Traditional Knowledge and Traditional Cultural Expressions (TCEs)", completed: false, important: false, isHeading: true },
          { id: "ikt-1-5", title: "Introduction to TCEs & Challenges in Protection", completed: false, important: false },
          { id: "ikt-1-6", title: "WIPO Intergovernmental Committee on IP & Genetic Resources, TK & Folklore", completed: false, important: false },
          { id: "ikt-1-h4", title: "Traditional Knowledge and Traditional Ecological Knowledge (TEK)", completed: false, important: false, isHeading: true },
          { id: "ikt-1-7", title: "Understanding Relationship Between TK & TEK", completed: false, important: false },
          { id: "ikt-1-8", title: "Analysis of Role of TEK in Environmental Conservation & Sustainable Development", completed: false, important: true },
        ]
      },
      {
        id: "ikt-unit2",
        title: "Traditional Knowledge and IPR Laws in India",
        topics: [
          { id: "ikt-2-h1", title: "Traditional Knowledge and IPR Laws", completed: false, important: false, isHeading: true },
          { id: "ikt-2-1", title: "Study of Legal Framework for Protection of TK in India", completed: false, important: true },
          { id: "ikt-2-2", title: "Examination of Relevant Laws: Traditional Knowledge Digital Library (TKDL)", completed: false, important: true },
          { id: "ikt-2-h2", title: "Traditional Knowledge and Patent Law", completed: false, important: false, isHeading: true },
          { id: "ikt-2-3", title: "Understanding Challenges in Patenting Traditional Knowledge", completed: false, important: true },
          { id: "ikt-2-4", title: "Analysis of Case Studies on Controversies & Debates", completed: false, important: false },
          { id: "ikt-2-h3", title: "Traditional Knowledge and Copyright Law", completed: false, important: false, isHeading: true },
          { id: "ikt-2-5", title: "Exploring Relationship Between TK & Copyright Law", completed: false, important: false },
          { id: "ikt-2-6", title: "Discussion on Cultural Appropriation & Protection of Traditional Expressions", completed: false, important: true },
          { id: "ikt-2-h4", title: "Traditional Knowledge and Geographical Indications (GI)", completed: false, important: false, isHeading: true },
          { id: "ikt-2-7", title: "Overview of GI & Significance in Protecting TK", completed: false, important: true },
          { id: "ikt-2-8", title: "Case Studies on Successful Registration & Protection of Traditional Products", completed: false, important: false },
          { id: "ikt-2-h5", title: "Traditional Knowledge, IPR, and the Future", completed: false, important: false, isHeading: true },
          { id: "ikt-2-9", title: "Analysis of Current Trends & Future Prospects for TK Protection", completed: false, important: false },
          { id: "ikt-2-10", title: "Emerging Issues: Digital Platforms & TK Dissemination", completed: false, important: false },
        ]
      }
    ]
  }
];
