export interface Topic {
  id: string;
  title: string;
  completed: boolean;
  important: boolean;
  notes?: string;
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
  color: string;
  units: Unit[];
}

export const subjects: Subject[] = [
  {
    id: "computer-networks",
    name: "Computer Networks",
    code: "NCS4503",
    examDate: "2025-11-27",
    color: "primary",
    units: [
      {
        id: "cn-unit1",
        title: "Network Concepts & OSI/TCP-IP Models",
        topics: [
          { id: "cn-1-1", title: "Introduction to Networks", completed: false, important: false },
          { id: "cn-1-2", title: "OSI Model - 7 Layers", completed: false, important: true },
          { id: "cn-1-3", title: "TCP/IP Protocol Suite", completed: false, important: true },
          { id: "cn-1-4", title: "Network Topologies", completed: false, important: false },
        ]
      },
      {
        id: "cn-unit2",
        title: "Physical Layer & Transmission Media",
        topics: [
          { id: "cn-2-1", title: "Transmission Media Types", completed: false, important: false },
          { id: "cn-2-2", title: "Analog vs Digital Transmission", completed: false, important: false },
          { id: "cn-2-3", title: "Multiplexing Techniques", completed: false, important: true },
        ]
      },
      {
        id: "cn-unit3",
        title: "Data Link & Network Layers",
        topics: [
          { id: "cn-3-1", title: "Error Detection & Correction", completed: false, important: true },
          { id: "cn-3-2", title: "Flow Control Protocols", completed: false, important: true },
          { id: "cn-3-3", title: "LAN Protocols - Ethernet", completed: false, important: false },
          { id: "cn-3-4", title: "Routing Algorithms", completed: false, important: true },
          { id: "cn-3-5", title: "IPv4 and IPv6", completed: false, important: true },
        ]
      },
      {
        id: "cn-unit4",
        title: "Transport, Session & Presentation Layers",
        topics: [
          { id: "cn-4-1", title: "TCP and UDP", completed: false, important: true },
          { id: "cn-4-2", title: "Session Management", completed: false, important: false },
          { id: "cn-4-3", title: "Data Encryption & Compression", completed: false, important: false },
        ]
      },
      {
        id: "cn-unit5",
        title: "Application Layer Protocols",
        topics: [
          { id: "cn-5-1", title: "HTTP & HTTPS", completed: false, important: true },
          { id: "cn-5-2", title: "DNS", completed: false, important: true },
          { id: "cn-5-3", title: "FTP & SMTP", completed: false, important: false },
          { id: "cn-5-4", title: "Network Security Basics", completed: false, important: true },
        ]
      }
    ]
  },
  {
    id: "automata-theory",
    name: "Automata Theory",
    code: "NCS4504",
    examDate: "2025-11-29",
    color: "secondary",
    units: [
      {
        id: "at-unit1",
        title: "Formal Languages & Finite Automata",
        topics: [
          { id: "at-1-1", title: "Alphabet, Strings & Languages", completed: false, important: true },
          { id: "at-1-2", title: "DFA (Deterministic Finite Automata)", completed: false, important: true },
          { id: "at-1-3", title: "NFA (Non-deterministic Finite Automata)", completed: false, important: true },
          { id: "at-1-4", title: "Moore & Mealy Machines", completed: false, important: true },
          { id: "at-1-5", title: "Minimization of DFA", completed: false, important: false },
        ]
      },
      {
        id: "at-unit2",
        title: "Regular Expressions & CFG",
        topics: [
          { id: "at-2-1", title: "Regular Expressions", completed: false, important: true },
          { id: "at-2-2", title: "RE to FA Conversion", completed: false, important: true },
          { id: "at-2-3", title: "Context-Free Grammar (CFG)", completed: false, important: true },
          { id: "at-2-4", title: "Chomsky Normal Form", completed: false, important: false },
          { id: "at-2-5", title: "Greibach Normal Form", completed: false, important: false },
          { id: "at-2-6", title: "Pumping Lemma for Regular Languages", completed: false, important: true },
        ]
      },
      {
        id: "at-unit3",
        title: "Pushdown Automata",
        topics: [
          { id: "at-3-1", title: "Definition of PDA", completed: false, important: true },
          { id: "at-3-2", title: "CFG to PDA Conversion", completed: false, important: true },
          { id: "at-3-3", title: "Deterministic vs Non-deterministic PDA", completed: false, important: false },
          { id: "at-3-4", title: "Pumping Lemma for CFL", completed: false, important: true },
        ]
      },
      {
        id: "at-unit4",
        title: "Turing Machines & Undecidability",
        topics: [
          { id: "at-4-1", title: "Turing Machine Definition", completed: false, important: true },
          { id: "at-4-2", title: "Variations of Turing Machine", completed: false, important: false },
          { id: "at-4-3", title: "Church-Turing Thesis", completed: false, important: true },
          { id: "at-4-4", title: "Recursive & Recursively Enumerable Languages", completed: false, important: true },
          { id: "at-4-5", title: "Halting Problem", completed: false, important: true },
          { id: "at-4-6", title: "Undecidability Concepts", completed: false, important: false },
        ]
      }
    ]
  },
  {
    id: "microprocessor",
    name: "Microprocessor & Interfacing",
    code: "NCS4502",
    examDate: "2025-12-02",
    color: "accent",
    units: [
      {
        id: "mp-unit1",
        title: "Memory & Microprocessor Fundamentals",
        topics: [
          { id: "mp-1-1", title: "RAM Types (SRAM, DRAM)", completed: false, important: false },
          { id: "mp-1-2", title: "ROM Types (PROM, EPROM, EEPROM)", completed: false, important: false },
          { id: "mp-1-3", title: "Cache Memory", completed: false, important: true },
          { id: "mp-1-4", title: "CPU Addressing Modes", completed: false, important: true },
          { id: "mp-1-5", title: "Microprocessor Evolution", completed: false, important: false },
          { id: "mp-1-6", title: "Interrupts & Interrupt Handling", completed: false, important: true },
        ]
      },
      {
        id: "mp-unit2",
        title: "8085 Microprocessor",
        topics: [
          { id: "mp-2-1", title: "8085 Architecture & Pin Diagram", completed: false, important: true },
          { id: "mp-2-2", title: "8085 Instruction Set", completed: false, important: true },
          { id: "mp-2-3", title: "Timing Diagrams", completed: false, important: true },
          { id: "mp-2-4", title: "8085 Interrupts", completed: false, important: false },
        ]
      },
      {
        id: "mp-unit3",
        title: "8086 Microprocessor",
        topics: [
          { id: "mp-3-1", title: "8086 Architecture & Registers", completed: false, important: true },
          { id: "mp-3-2", title: "8086 Instruction Set", completed: false, important: true },
          { id: "mp-3-3", title: "Assembly Language Programming", completed: false, important: true },
          { id: "mp-3-4", title: "8086 Memory Segmentation", completed: false, important: true },
        ]
      },
      {
        id: "mp-unit4",
        title: "Interfacing & I/O",
        topics: [
          { id: "mp-4-1", title: "8255 Programmable Peripheral Interface", completed: false, important: true },
          { id: "mp-4-2", title: "8259 Interrupt Controller", completed: false, important: false },
          { id: "mp-4-3", title: "8253 Timer", completed: false, important: false },
          { id: "mp-4-4", title: "ADC & DAC Interfacing", completed: false, important: true },
        ]
      }
    ]
  },
  {
    id: "computer-graphics",
    name: "Computer Graphics",
    code: "NCS4505",
    examDate: "2025-12-08",
    color: "success",
    units: [
      {
        id: "cg-unit1",
        title: "2D Graphics Basics",
        topics: [
          { id: "cg-1-1", title: "Raster vs Vector Graphics", completed: false, important: true },
          { id: "cg-1-2", title: "DDA Line Drawing Algorithm", completed: false, important: true },
          { id: "cg-1-3", title: "Bresenham's Line Algorithm", completed: false, important: true },
          { id: "cg-1-4", title: "Circle Drawing Algorithms", completed: false, important: true },
          { id: "cg-1-5", title: "Ellipse Drawing", completed: false, important: false },
        ]
      },
      {
        id: "cg-unit2",
        title: "2D Transformations",
        topics: [
          { id: "cg-2-1", title: "Translation, Rotation, Scaling", completed: false, important: true },
          { id: "cg-2-2", title: "Homogeneous Coordinates", completed: false, important: true },
          { id: "cg-2-3", title: "Matrix Representation", completed: false, important: true },
          { id: "cg-2-4", title: "Composite Transformations", completed: false, important: false },
        ]
      },
      {
        id: "cg-unit3",
        title: "Windowing & Clipping",
        topics: [
          { id: "cg-3-1", title: "Cohen-Sutherland Line Clipping", completed: false, important: true },
          { id: "cg-3-2", title: "Liang-Barsky Algorithm", completed: false, important: false },
          { id: "cg-3-3", title: "Polygon Clipping", completed: false, important: false },
        ]
      },
      {
        id: "cg-unit4",
        title: "3D Graphics",
        topics: [
          { id: "cg-4-1", title: "3D Transformations", completed: false, important: true },
          { id: "cg-4-2", title: "Projections (Parallel & Perspective)", completed: false, important: true },
          { id: "cg-4-3", title: "Hidden Surface Removal", completed: false, important: true },
        ]
      },
      {
        id: "cg-unit5",
        title: "Curves & Surfaces",
        topics: [
          { id: "cg-5-1", title: "Bezier Curves", completed: false, important: true },
          { id: "cg-5-2", title: "B-Spline Curves", completed: false, important: false },
          { id: "cg-5-3", title: "Surface Modeling", completed: false, important: false },
        ]
      }
    ]
  },
  {
    id: "eme",
    name: "Engineering & Managerial Economics",
    code: "NHS4501",
    examDate: "2025-12-02",
    color: "warning",
    units: [
      {
        id: "eme-unit1",
        title: "Introduction to Economics",
        topics: [
          { id: "eme-1-1", title: "Demand & Supply Analysis", completed: false, important: true },
          { id: "eme-1-2", title: "Elasticity of Demand", completed: false, important: true },
          { id: "eme-1-3", title: "Demand Forecasting", completed: false, important: false },
          { id: "eme-1-4", title: "Consumer Behavior", completed: false, important: false },
        ]
      },
      {
        id: "eme-unit2",
        title: "Production & Cost Theory",
        topics: [
          { id: "eme-2-1", title: "Production Function", completed: false, important: true },
          { id: "eme-2-2", title: "Isoquants & Isocosts", completed: false, important: true },
          { id: "eme-2-3", title: "Returns to Scale", completed: false, important: false },
          { id: "eme-2-4", title: "Short-run & Long-run Cost Curves", completed: false, important: true },
        ]
      },
      {
        id: "eme-unit3",
        title: "Market Structures",
        topics: [
          { id: "eme-3-1", title: "Perfect Competition", completed: false, important: true },
          { id: "eme-3-2", title: "Monopoly", completed: false, important: true },
          { id: "eme-3-3", title: "Monopolistic Competition", completed: false, important: false },
          { id: "eme-3-4", title: "Oligopoly", completed: false, important: false },
        ]
      },
      {
        id: "eme-unit4",
        title: "Macroeconomic Indicators",
        topics: [
          { id: "eme-4-1", title: "National Income Accounting", completed: false, important: true },
          { id: "eme-4-2", title: "Inflation & Deflation", completed: false, important: true },
          { id: "eme-4-3", title: "Business Cycles", completed: false, important: false },
          { id: "eme-4-4", title: "Fiscal & Monetary Policy", completed: false, important: false },
        ]
      }
    ]
  },
  {
    id: "indian-knowledge",
    name: "Essence of Indian Knowledge Tradition",
    code: "NVC4501",
    examDate: "2025-11-25",
    color: "accent",
    units: [
      {
        id: "ikt-unit1",
        title: "Indian Traditional Knowledge & IPR",
        topics: [
          { id: "ikt-1-1", title: "Concepts of Traditional Knowledge", completed: false, important: true },
          { id: "ikt-1-2", title: "History of Traditional Knowledge", completed: false, important: false },
          { id: "ikt-1-3", title: "Overview of IPR - Copyrights", completed: false, important: true },
          { id: "ikt-1-4", title: "Patents & Trademarks", completed: false, important: true },
          { id: "ikt-1-5", title: "Geographical Indications", completed: false, important: false },
          { id: "ikt-1-6", title: "Traditional Cultural Expressions", completed: false, important: false },
          { id: "ikt-1-7", title: "Ecological Knowledge", completed: false, important: false },
          { id: "ikt-1-8", title: "International Protection Frameworks", completed: false, important: false },
        ]
      }
    ]
  }
];
