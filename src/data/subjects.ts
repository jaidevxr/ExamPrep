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
  isPostponed?: boolean;
}

export const subjects: Subject[] = [
  {
    id: "computer-vision",
    name: "Computer Vision",
    code: "NPEC43232",
    examDate: "2026-11-17",
    examTime: "10:00 AM - 01:00 PM",
    color: "primary",
    units: [
      {
        id: "cv-unit1",
        title: "Module 1: Introduction to Image Processing (15 Hrs)",
        topics: [
          { id: "cv-1-h1", title: "Introduction to Image Processing & Image Formation", completed: false, important: false, isHeading: true },
          { id: "cv-1-1", title: "Geometric primitives and transformations", completed: false, important: true },
          { id: "cv-1-2", title: "Photometric image formation", completed: false, important: true },
          { id: "cv-1-3", title: "Digital camera", completed: false, important: false },
          { id: "cv-1-4", title: "Image processing: Point operators", completed: false, important: true },
          { id: "cv-1-5", title: "More neighborhood operators", completed: false, important: true },
          { id: "cv-1-6", title: "Fourier transforms", completed: false, important: true },
          { id: "cv-1-7", title: "Pyramids and wavelets", completed: false, important: true },
          { id: "cv-1-8", title: "Geometric transformations", completed: false, important: true },
          { id: "cv-1-9", title: "Model fitting and optimization", completed: false, important: true },
          { id: "cv-1-10", title: "Variational methods and regularization", completed: false, important: false },
          { id: "cv-1-11", title: "Markov random fields", completed: false, important: false },
        ]
      },
      {
        id: "cv-unit2",
        title: "Module 2: Linear Filtering & Deep Learning (15 Hrs)",
        topics: [
          { id: "cv-2-h1", title: "Linear Filtering", completed: false, important: false, isHeading: true },
          { id: "cv-2-1", title: "Filter Kernels", completed: false, important: true },
          { id: "cv-2-2", title: "Linear Filter Experiments", completed: false, important: true },
          { id: "cv-2-3", title: "Linear Convolution Filtering", completed: false, important: true },
          { id: "cv-2-4", title: "Selecting a Region-of-Interest", completed: false, important: false },
          { id: "cv-2-5", title: "Adding Noise to Image", completed: false, important: false },
          { id: "cv-2-6", title: "Mean Filtering", completed: false, important: true },
          { id: "cv-2-7", title: "Median Filtering", completed: false, important: true },
          { id: "cv-2-8", title: "Rank Order Filtering", completed: false, important: true },
          { id: "cv-2-9", title: "Normal Distribution Filtering", completed: false, important: false },
          { id: "cv-2-10", title: "Edges, Lines, Contours", completed: false, important: true },
          { id: "cv-2-11", title: "Gaussian Kernel and Voronoi Meshes Linear Function", completed: false, important: false },
          { id: "cv-2-12", title: "Edge Detection", completed: false, important: true },
          { id: "cv-2-13", title: "Double Precision Laplacian Filter", completed: false, important: true },
          { id: "cv-2-14", title: "Enhancing Digital Image Edges", completed: false, important: false },
          { id: "cv-2-15", title: "Gaussian Kernel, Gaussian Filter", completed: false, important: true },
          { id: "cv-2-16", title: "Image Gradient Approach to Isolating Image Edges", completed: false, important: true },
          { id: "cv-2-h2", title: "Deep Learning & Recognition", completed: false, important: false, isHeading: true },
          { id: "cv-2-17", title: "Supervised learning, Unsupervised learning", completed: false, important: true },
          { id: "cv-2-18", title: "Deep neural networks", completed: false, important: true },
          { id: "cv-2-19", title: "Convolutional neural networks", completed: false, important: true },
          { id: "cv-2-20", title: "More complex models", completed: false, important: false },
          { id: "cv-2-21", title: "Instance recognition", completed: false, important: true },
          { id: "cv-2-22", title: "Image classification", completed: false, important: true },
          { id: "cv-2-23", title: "Object detection", completed: false, important: true },
          { id: "cv-2-24", title: "Semantic segmentation", completed: false, important: true },
          { id: "cv-2-25", title: "Pose estimation", completed: false, important: true },
          { id: "cv-2-26", title: "Video understanding, Language and vision", completed: false, important: false },
        ]
      },
      {
        id: "cv-unit3",
        title: "Module 3: Feature Detection & Motion Estimation (15 Hrs)",
        topics: [
          { id: "cv-3-h1", title: "Feature Detection and Matching", completed: false, important: false, isHeading: true },
          { id: "cv-3-1", title: "Edges and contours", completed: false, important: true },
          { id: "cv-3-2", title: "Contour tracing", completed: false, important: true },
          { id: "cv-3-3", title: "Lines and vanishing points", completed: false, important: true },
          { id: "cv-3-4", title: "Segmentation", completed: false, important: true },
          { id: "cv-3-5", title: "Feature matching", completed: false, important: true },
          { id: "cv-3-6", title: "Motion estimation", completed: false, important: true },
          { id: "cv-3-7", title: "Feature correspondence", completed: false, important: true },
          { id: "cv-3-h2", title: "Motion Estimation Techniques", completed: false, important: false, isHeading: true },
          { id: "cv-3-8", title: "Translational alignment", completed: false, important: true },
          { id: "cv-3-9", title: "Parametric motion", completed: false, important: true },
          { id: "cv-3-10", title: "Optical flow", completed: false, important: true },
          { id: "cv-3-11", title: "Layered motion", completed: false, important: false },
          { id: "cv-3-12", title: "Computational photography", completed: false, important: false },
          { id: "cv-3-13", title: "High dynamic range imaging", completed: false, important: false },
          { id: "cv-3-14", title: "Super-resolution, denoising, and blur removal", completed: false, important: true },
          { id: "cv-3-15", title: "Image matting and compositing", completed: false, important: false },
          { id: "cv-3-16", title: "Video matting", completed: false, important: false },
          { id: "cv-3-17", title: "Texture analysis and synthesis", completed: false, important: true },
        ]
      }
    ]
  },
  {
    id: "disaster-management",
    name: "Disaster Management",
    code: "OE43101",
    examDate: "2026-12-17",
    examTime: "10:00 AM - 01:00 PM",
    color: "secondary",
    isPostponed: true,
    units: [
      {
        id: "dm-unit1",
        title: "Module 1: Introduction to Disasters (30 Hrs)",
        topics: [
          { id: "dm-1-h1", title: "Introduction", completed: false, important: false, isHeading: true },
          { id: "dm-1-1", title: "Concept of Environmental Hazards, Environmental stress & Environmental Disasters", completed: false, important: true },
          { id: "dm-1-2", title: "Types of Environmental hazards & Disasters: Natural hazards and Disasters", completed: false, important: true },
          { id: "dm-1-3", title: "Volcanic Hazards/Disasters - Causes and distribution of Volcanoes", completed: false, important: true },
          { id: "dm-1-4", title: "Environmental impacts of volcanic eruptions", completed: false, important: false },
          { id: "dm-1-5", title: "Earthquake Hazards/disasters - Causes of Earthquakes", completed: false, important: true },
          { id: "dm-1-6", title: "Distribution of Earthquakes", completed: false, important: true },
          { id: "dm-1-7", title: "Flood control measures in human adjustment, perception & mitigation", completed: false, important: true },
          { id: "dm-1-8", title: "Droughts - Impacts of droughts", completed: false, important: true },
          { id: "dm-1-9", title: "Drought hazards in India", completed: false, important: true },
          { id: "dm-1-10", title: "Drought control measures", completed: false, important: true },
        ]
      },
      {
        id: "dm-unit2",
        title: "Module 2: Mechanics & Forms of Soil Erosion (30 Hrs)",
        topics: [
          { id: "dm-2-h1", title: "Mechanics & Forms of Soil Erosion", completed: false, important: false, isHeading: true },
          { id: "dm-2-1", title: "Factors & causes of Soil Erosion", completed: false, important: true },
          { id: "dm-2-2", title: "Conservation measures of Soil Erosion", completed: false, important: true },
          { id: "dm-2-3", title: "Chemical hazards/disasters - Release of toxic chemicals", completed: false, important: false },
          { id: "dm-2-4", title: "Nuclear explosion", completed: false, important: false },
          { id: "dm-2-5", title: "Sedimentation processes - Global Sedimentation problems", completed: false, important: true },
          { id: "dm-2-6", title: "Regional Sedimentation problems", completed: false, important: false },
          { id: "dm-2-7", title: "Sedimentation & Environmental problems", completed: false, important: true },
          { id: "dm-2-8", title: "Corrective measures of 23 Erosion & Sedimentation", completed: false, important: true },
          { id: "dm-2-9", title: "Biological hazards/disasters", completed: false, important: false },
          { id: "dm-2-10", title: "Population Explosion", completed: false, important: false },
        ]
      },
      {
        id: "dm-unit3",
        title: "Module 3: Stages of Disaster Management (30 Hrs)",
        topics: [
          { id: "dm-3-h1", title: "Pre-disaster Stage (Preparedness)", completed: false, important: false, isHeading: true },
          { id: "dm-3-1", title: "Preparing hazard zonation maps", completed: false, important: true },
          { id: "dm-3-2", title: "Predictability: forecasting & warning", completed: false, important: true },
          { id: "dm-3-3", title: "Preparing disaster preparedness plan", completed: false, important: true },
          { id: "dm-3-4", title: "Land use zoning", completed: false, important: false },
          { id: "dm-3-5", title: "Pre-disaster stage (mitigation): Disaster resistant house construction", completed: false, important: true },
          { id: "dm-3-6", title: "Population reduction in vulnerable areas", completed: false, important: true },
          { id: "dm-3-7", title: "Awareness", completed: false, important: false },
          { id: "dm-3-h2", title: "Emergency & Post-Disaster Stage", completed: false, important: false, isHeading: true },
          { id: "dm-3-8", title: "Emergency Stage: Search for rescue & operation at national & regional level", completed: false, important: true },
          { id: "dm-3-9", title: "Immediate relief, and Assessment surveys", completed: false, important: true },
          { id: "dm-3-10", title: "Post Disaster stage - Rehabilitation: Political Administrative Aspect", completed: false, important: true },
        ]
      },
      {
        id: "dm-unit4",
        title: "Module 4: Relief Measures (30 Hrs)",
        topics: [
          { id: "dm-4-h1", title: "Relief Measures", completed: false, important: false, isHeading: true },
          { id: "dm-4-1", title: "Provision of immediate relief measures to disaster affected people", completed: false, important: true },
          { id: "dm-4-2", title: "Prediction of Hazards & Disasters", completed: false, important: true },
          { id: "dm-4-3", title: "Measures of adjustment to natural hazards mitigation", completed: false, important: true },
          { id: "dm-4-h2", title: "Institutions & Organizations", completed: false, important: false, isHeading: true },
          { id: "dm-4-4", title: "Meteorological observatory", completed: false, important: false },
          { id: "dm-4-5", title: "Hydrology Laboratory", completed: false, important: false },
          { id: "dm-4-6", title: "Industrial Safety Inspectorate", completed: false, important: false },
          { id: "dm-4-7", title: "Institution of urban & regional planners", completed: false, important: false },
          { id: "dm-4-8", title: "Chambers of Architects", completed: false, important: false },
          { id: "dm-4-9", title: "Engineering Council, National Standards Committee", completed: false, important: false },
          { id: "dm-4-10", title: "Integrated Planning Contingency management", completed: false, important: true },
          { id: "dm-4-11", title: "Preparedness Education on disasters", completed: false, important: true },
          { id: "dm-4-12", title: "Community involvement: The adjustment of Human Population to Natural hazards & disasters", completed: false, important: true },
        ]
      }
    ]
  },
  {
    id: "distributed-systems",
    name: "Distributed Systems",
    code: "NCS4701",
    examDate: "2026-11-26",
    examTime: "10:00 AM - 01:00 PM",
    color: "accent",
    units: [
      {
        id: "ds-unit1",
        title: "Module 1: Introduction to Distributed Systems (15 Hrs)",
        topics: [
          { id: "ds-1-h1", title: "Introduction to Distributed Systems", completed: false, important: false, isHeading: true },
          { id: "ds-1-1", title: "Definitions, Examples and Applications of Distributed systems", completed: false, important: true },
          { id: "ds-1-2", title: "System Models: Architectural models and Fundamental models", completed: false, important: true },
          { id: "ds-1-3", title: "Limitations of distributed systems", completed: false, important: true },
          { id: "ds-1-4", title: "Introduction to Edge computing", completed: false, important: false },
          { id: "ds-1-5", title: "Introduction to Cloud Computing", completed: false, important: true },
          { id: "ds-1-h2", title: "Clocks & State", completed: false, important: false, isHeading: true },
          { id: "ds-1-6", title: "Message Passing System: Causality determination", completed: false, important: true },
          { id: "ds-1-7", title: "Message ordering: Causal ordering of messages", completed: false, important: true },
          { id: "ds-1-8", title: "Sates of a Distributed system", completed: false, important: true },
          { id: "ds-1-9", title: "Local and Global State", completed: false, important: true },
          { id: "ds-1-10", title: "Consistent and inconsistent states", completed: false, important: true },
          { id: "ds-1-11", title: "Termination detection", completed: false, important: true },
          { id: "ds-1-12", title: "Network Time Protocol", completed: false, important: true },
        ]
      },
      {
        id: "ds-unit2",
        title: "Module 2: Mutual Exclusion, Deadlock & Agreement Protocols (15 Hrs)",
        topics: [
          { id: "ds-2-h1", title: "Mutual Exclusion", completed: false, important: false, isHeading: true },
          { id: "ds-2-1", title: "Requirements of Mutual Exclusion", completed: false, important: true },
          { id: "ds-2-2", title: "Classification of distributed mutual exclusion", completed: false, important: true },
          { id: "ds-2-3", title: "Non-token based Quorum Based and Token Based mutual exclusion with examples", completed: false, important: true },
          { id: "ds-2-4", title: "Performance metric for distributed mutual exclusion algorithms", completed: false, important: true },
          { id: "ds-2-h2", title: "Deadlock Detection", completed: false, important: false, isHeading: true },
          { id: "ds-2-5", title: "System models, Preliminaries", completed: false, important: true },
          { id: "ds-2-6", title: "Deadlock prevention", completed: false, important: true },
          { id: "ds-2-7", title: "Deadlock avoidance", completed: false, important: true },
          { id: "ds-2-8", title: "Deadlock detection & resolution", completed: false, important: true },
          { id: "ds-2-h3", title: "Agreement Protocols", completed: false, important: false, isHeading: true },
          { id: "ds-2-9", title: "Classification of Agreement Problem", completed: false, important: true },
          { id: "ds-2-10", title: "Byzantine agreement problem", completed: false, important: true },
          { id: "ds-2-11", title: "Consensus problem, Interactive consistency problem", completed: false, important: true },
          { id: "ds-2-12", title: "Solution to Byzantine Agreement problem", completed: false, important: true },
          { id: "ds-2-13", title: "Application of Agreement problem", completed: false, important: false },
        ]
      },
      {
        id: "ds-unit3",
        title: "Module 3: Distributed File Systems & Failure Recovery (15 Hrs)",
        topics: [
          { id: "ds-3-h1", title: "Distributed File Systems", completed: false, important: false, isHeading: true },
          { id: "ds-3-1", title: "Introduction, Issues in distributed File System", completed: false, important: true },
          { id: "ds-3-2", title: "Mechanism for building distributed file systems", completed: false, important: true },
          { id: "ds-3-3", title: "Distributed Shared Memory", completed: false, important: true },
          { id: "ds-3-4", title: "Design issues in Distributed Shared Memory", completed: false, important: true },
          { id: "ds-3-5", title: "Algorithm for Implementation of Distributed Shared Memory", completed: false, important: true },
          { id: "ds-3-h2", title: "Failure Recovery", completed: false, important: false, isHeading: true },
          { id: "ds-3-6", title: "Backward and Forward and recovery in Concurrent systems", completed: false, important: true },
          { id: "ds-3-7", title: "Checkpoints", completed: false, important: true },
          { id: "ds-3-8", title: "Recovery in Distributed Database Systems", completed: false, important: true },
          { id: "ds-3-9", title: "Fault Tolerance: Issues in Fault Tolerance", completed: false, important: true },
          { id: "ds-3-10", title: "Voting Protocols", completed: false, important: true },
        ]
      }
    ]
  },
  {
    id: "soft-computing",
    name: "Soft Computing",
    code: "NCS4702",
    examDate: "2026-11-30",
    examTime: "10:00 AM - 01:00 PM",
    color: "warning",
    units: [
      {
        id: "sc-unit1",
        title: "Module 1: Artificial Intelligence (30 Hrs)",
        topics: [
          { id: "sc-1-h1", title: "Introduction to Soft Computing & AI", completed: false, important: false, isHeading: true },
          { id: "sc-1-1", title: "Introduction of soft computing", completed: false, important: true },
          { id: "sc-1-2", title: "Soft computing vs. hard computing", completed: false, important: true },
          { id: "sc-1-3", title: "Various types of soft computing techniques", completed: false, important: true },
          { id: "sc-1-4", title: "Artificial neural networks, Fuzzy logic, Genetic Algorithms", completed: false, important: true },
          { id: "sc-1-5", title: "Applications of soft computing", completed: false, important: false },
          { id: "sc-1-h2", title: "Artificial Intelligence Concepts", completed: false, important: false, isHeading: true },
          { id: "sc-1-6", title: "Introduction of AI - Production systems", completed: false, important: true },
          { id: "sc-1-7", title: "Types of production systems, Characteristics of production systems", completed: false, important: true },
          { id: "sc-1-h3", title: "Search Algorithms", completed: false, important: false, isHeading: true },
          { id: "sc-1-8", title: "Breadth first search", completed: false, important: true },
          { id: "sc-1-9", title: "Depth first search", completed: false, important: true },
          { id: "sc-1-10", title: "Heuristic Search Algorithms: Hill Climbing", completed: false, important: true },
          { id: "sc-1-11", title: "Best first Search", completed: false, important: true },
          { id: "sc-1-12", title: "A* algorithm", completed: false, important: true },
          { id: "sc-1-13", title: "AO* Algorithms", completed: false, important: true },
          { id: "sc-1-h4", title: "Knowledge Representation", completed: false, important: false, isHeading: true },
          { id: "sc-1-14", title: "Knowledge representation issues", completed: false, important: true },
          { id: "sc-1-15", title: "Prepositional and predicate logic", completed: false, important: true },
          { id: "sc-1-16", title: "Forward Reasoning and backward reasoning", completed: false, important: true },
          { id: "sc-1-17", title: "Weak & Strong Slot & filler structures", completed: false, important: false },
          { id: "sc-1-18", title: "Natural Language Processing (NLP)", completed: false, important: true },
        ]
      },
      {
        id: "sc-unit2",
        title: "Module 2: Neural Networks (30 Hrs)",
        topics: [
          { id: "sc-2-h1", title: "Biological & Artificial Neural Networks", completed: false, important: false, isHeading: true },
          { id: "sc-2-1", title: "Structure of Biological neuron; Neuron, Nerve Structure and synapse", completed: false, important: true },
          { id: "sc-2-2", title: "Artificial Neuron and its model", completed: false, important: true },
          { id: "sc-2-3", title: "Activation functions", completed: false, important: true },
          { id: "sc-2-h2", title: "Neural Network Architectures & Learning", completed: false, important: false, isHeading: true },
          { id: "sc-2-4", title: "Neural network architecture: Single layer feed forward networks", completed: false, important: true },
          { id: "sc-2-5", title: "Multilayer feed forward networks", completed: false, important: true },
          { id: "sc-2-6", title: "Recurrent networks", completed: false, important: true },
          { id: "sc-2-7", title: "Various learning techniques", completed: false, important: true },
          { id: "sc-2-8", title: "Perceptron training algorithm", completed: false, important: true },
          { id: "sc-2-9", title: "Linear separability", completed: false, important: true },
          { id: "sc-2-10", title: "Widrow & Hebb's learning rule/Delta rule", completed: false, important: true },
          { id: "sc-2-11", title: "ADALINE vs MADALINE", completed: false, important: true },
          { id: "sc-2-h3", title: "Back Propagation & ANN Applications", completed: false, important: false, isHeading: true },
          { id: "sc-2-12", title: "Introduction of MLP and BPN", completed: false, important: true },
          { id: "sc-2-13", title: "Error back propagation algorithm (EBPA)", completed: false, important: true },
          { id: "sc-2-14", title: "Characteristics and application of EBPA", completed: false, important: true },
          { id: "sc-2-15", title: "Momentum factor and limitation of EBPA", completed: false, important: true },
          { id: "sc-2-16", title: "Difference between ANN and human brain", completed: false, important: false },
          { id: "sc-2-17", title: "Characteristics and applications of ANN", completed: false, important: true },
          { id: "sc-2-18", title: "Associative Memory and its characteristics", completed: false, important: false },
          { id: "sc-2-19", title: "Counter propagation network (CPN); Architecture of CPN", completed: false, important: true },
          { id: "sc-2-20", title: "Hopfield/Recurrent network; Hopfield vs Boltzman machine", completed: false, important: true },
          { id: "sc-2-21", title: "Adaptive Resonance Theory (ART); Architecture of ART, Classification and training of ART", completed: false, important: true },
        ]
      },
      {
        id: "sc-unit3",
        title: "Module 3: Fuzzy Logic (30 Hrs)",
        topics: [
          { id: "sc-3-h1", title: "Fuzzy Logic Basics", completed: false, important: false, isHeading: true },
          { id: "sc-3-1", title: "Basic concepts of fuzzy logic", completed: false, important: true },
          { id: "sc-3-2", title: "Fuzzy sets versus Crisp sets", completed: false, important: true },
          { id: "sc-3-3", title: "Fuzzy set theory and operations", completed: false, important: true },
          { id: "sc-3-4", title: "Properties of fuzzy sets and crisp sets", completed: false, important: true },
          { id: "sc-3-5", title: "Fuzzy relations and Crisp relations", completed: false, important: true },
          { id: "sc-3-6", title: "Fuzzy to Crisp conversion", completed: false, important: true },
          { id: "sc-3-7", title: "Membership functions", completed: false, important: true },
          { id: "sc-3-8", title: "Fuzzyfications & Defuzzifications", completed: false, important: true },
          { id: "sc-3-h2", title: "Fuzzy Inference & Control", completed: false, important: false, isHeading: true },
          { id: "sc-3-9", title: "Fuzzy preposition", completed: false, important: false },
          { id: "sc-3-10", title: "Fuzzy inference System", completed: false, important: true },
          { id: "sc-3-11", title: "Fuzzy Rule Base", completed: false, important: true },
          { id: "sc-3-12", title: "Fuzzy reasoning and decision making", completed: false, important: true },
          { id: "sc-3-13", title: "Fuzzy Logic Controller (FLC)", completed: false, important: true },
          { id: "sc-3-14", title: "Formation, decomposition & aggregation of fuzzy rules", completed: false, important: true },
          { id: "sc-3-15", title: "Industrial applications of Fuzzy", completed: false, important: false },
        ]
      }
    ]
  }
];
