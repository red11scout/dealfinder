import { create } from "zustand";

// ============================================================================
// VAR Company Type Definition
// ============================================================================

export interface VarCompany {
  id: number;
  name: string;
  website: string;
  hqCity: string;
  hqState: string;
  annualRevenue: number; // in millions
  profit: number | null;
  employeeCount: number;
  ownershipType: "VC" | "PE" | "Public" | "Private";
  strategicSpecialty: string;
  strategicFocus: string;
  topVendors: string[];
  topCustomers: string[];
  yearFounded: number;
  description: string;
  confidenceScore: number; // 0-1
}

// ============================================================================
// Filter Types
// ============================================================================

export interface VarFilters {
  searchQuery: string;
  ownershipType: string; // "" = all, or "VC" | "PE" | "Public" | "Private"
  revenueRange: string; // "" = all, or "0-100" | "100-1000" | "1000-5000" | "5000+"
  stateFilter: string; // "" = all, or state code
  specialtyFilter: string; // "" = all, or specialty name
}

const DEFAULT_FILTERS: VarFilters = {
  searchQuery: "",
  ownershipType: "",
  revenueRange: "",
  stateFilter: "",
  specialtyFilter: "",
};

// ============================================================================
// Hardcoded Seed Data — ~50 Major US VARs
// ============================================================================

export const VAR_COMPANIES: VarCompany[] = [
  {
    id: 1,
    name: "CDW Corporation",
    website: "cdw.com",
    hqCity: "Lincolnshire",
    hqState: "IL",
    annualRevenue: 21500,
    profit: 1050,
    employeeCount: 15100,
    ownershipType: "Public",
    strategicSpecialty: "Full-Stack IT Solutions",
    strategicFocus: "Multi-vendor IT procurement, cloud, security, and infrastructure solutions for enterprise, government, and education",
    topVendors: ["Microsoft", "Cisco", "Dell", "HP", "Lenovo", "VMware"],
    topCustomers: ["Federal Government", "K-12 Education", "Healthcare Systems"],
    yearFounded: 1984,
    description: "Largest US VAR by revenue. Multi-brand technology solutions provider serving business, government, education, and healthcare customers with end-to-end IT lifecycle services.",
    confidenceScore: 0.95,
  },
  {
    id: 2,
    name: "World Wide Technology (WWT)",
    website: "wwt.com",
    hqCity: "St. Louis",
    hqState: "MO",
    annualRevenue: 17000,
    profit: 850,
    employeeCount: 10000,
    ownershipType: "Private",
    strategicSpecialty: "Advanced Technology Center",
    strategicFocus: "Digital strategy, ATC lab environment, cloud, networking, and security solutions for Fortune 500 enterprises",
    topVendors: ["Cisco", "Dell", "HP", "NetApp", "Palo Alto Networks", "F5"],
    topCustomers: ["Fortune 500 Enterprises", "Federal Agencies", "Financial Services"],
    yearFounded: 1990,
    description: "Privately held technology solution provider and systems integrator known for its Advanced Technology Center (ATC), a virtual and physical lab for testing enterprise solutions at scale.",
    confidenceScore: 0.9,
  },
  {
    id: 3,
    name: "SHI International",
    website: "shi.com",
    hqCity: "Somerset",
    hqState: "NJ",
    annualRevenue: 14000,
    profit: null,
    employeeCount: 6000,
    ownershipType: "Private",
    strategicSpecialty: "Software & Cloud Licensing",
    strategicFocus: "Software asset management, cloud migration, ITAM, and procurement optimization for global enterprises",
    topVendors: ["Microsoft", "Adobe", "VMware", "AWS", "Cisco", "Dell"],
    topCustomers: ["Fortune 500 Enterprises", "Public Sector", "Higher Education"],
    yearFounded: 1989,
    description: "One of the largest minority and woman-owned businesses in the US. Specializes in software licensing, cloud solutions, and IT asset management for enterprise and public sector clients.",
    confidenceScore: 0.9,
  },
  {
    id: 4,
    name: "Insight Enterprises",
    website: "insight.com",
    hqCity: "Chandler",
    hqState: "AZ",
    annualRevenue: 9100,
    profit: 280,
    employeeCount: 13500,
    ownershipType: "Public",
    strategicSpecialty: "Solutions Integration",
    strategicFocus: "Cloud and data center transformation, connected workforce, digital innovation, and supply chain optimization",
    topVendors: ["Microsoft", "HP", "Dell", "Cisco", "AWS", "Google Cloud"],
    topCustomers: ["Enterprise", "Healthcare", "Government"],
    yearFounded: 1988,
    description: "Fortune 500 Solutions Integrator providing Intelligent Technology Solutions across cloud, data center, connected workforce, and supply chain optimization.",
    confidenceScore: 0.95,
  },
  {
    id: 5,
    name: "Presidio",
    website: "presidio.com",
    hqCity: "New York",
    hqState: "NY",
    annualRevenue: 3500,
    profit: null,
    employeeCount: 3200,
    ownershipType: "PE",
    strategicSpecialty: "Digital Infrastructure",
    strategicFocus: "Network, security, cloud, and collaboration solutions with emphasis on digital transformation and managed services",
    topVendors: ["Cisco", "Palo Alto Networks", "Microsoft", "AWS", "Dell", "Fortinet"],
    topCustomers: ["Mid-Market Enterprise", "Financial Services", "Healthcare"],
    yearFounded: 2004,
    description: "PE-backed IT solutions provider focused on digital infrastructure, cloud, security, and lifecycle management. Known for deep Cisco expertise and managed services capabilities.",
    confidenceScore: 0.85,
  },
  {
    id: 6,
    name: "Connection (PC Connection)",
    website: "connection.com",
    hqCity: "Merrimack",
    hqState: "NH",
    annualRevenue: 3300,
    profit: 105,
    employeeCount: 2700,
    ownershipType: "Public",
    strategicSpecialty: "IT Procurement",
    strategicFocus: "IT solutions for SMB, mid-market, and public sector with strong supply chain and configuration capabilities",
    topVendors: ["HP", "Dell", "Microsoft", "Cisco", "Apple", "Lenovo"],
    topCustomers: ["SMB", "State/Local Government", "Education"],
    yearFounded: 1982,
    description: "Public company providing IT solutions across three segments: Business Solutions, Enterprise Solutions, and Public Sector Solutions. Known for efficient procurement and configuration services.",
    confidenceScore: 0.95,
  },
  {
    id: 7,
    name: "Zones",
    website: "zones.com",
    hqCity: "Auburn",
    hqState: "WA",
    annualRevenue: 2500,
    profit: null,
    employeeCount: 2000,
    ownershipType: "Private",
    strategicSpecialty: "Global IT Solutions",
    strategicFocus: "Hardware, software, cloud, and IT services with expertise in workplace modernization and data center solutions",
    topVendors: ["Microsoft", "HP", "Dell", "Cisco", "Lenovo", "Apple"],
    topCustomers: ["Enterprise", "Education", "Government"],
    yearFounded: 1986,
    description: "Global IT solutions provider offering hardware, software, cloud, and services. Known for workplace modernization, cloud solutions, and strong OEM partnerships.",
    confidenceScore: 0.8,
  },
  {
    id: 8,
    name: "ePlus",
    website: "eplus.com",
    hqCity: "Herndon",
    hqState: "VA",
    annualRevenue: 2100,
    profit: 110,
    employeeCount: 1900,
    ownershipType: "Public",
    strategicSpecialty: "Security & Cloud",
    strategicFocus: "Security-first approach to IT solutions, cloud consulting, managed services, and financial solutions for mid-market and enterprise",
    topVendors: ["Cisco", "Palo Alto Networks", "Dell", "HPE", "Nutanix", "NetApp"],
    topCustomers: ["Mid-Market Enterprise", "Federal Government", "SLED"],
    yearFounded: 1990,
    description: "Public company providing technology and financing solutions. Combines technology product sales with professional services, managed services, and IT financing.",
    confidenceScore: 0.95,
  },
  {
    id: 9,
    name: "Logicalis",
    website: "logicalis.com",
    hqCity: "Farmington Hills",
    hqState: "MI",
    annualRevenue: 2000,
    profit: null,
    employeeCount: 7000,
    ownershipType: "PE",
    strategicSpecialty: "Digital Transformation",
    strategicFocus: "Cloud-first managed services, network infrastructure, and digital workplace solutions for global enterprises",
    topVendors: ["Cisco", "Microsoft", "IBM", "Dell", "HPE", "Fortinet"],
    topCustomers: ["Global Enterprise", "Education", "Healthcare"],
    yearFounded: 1997,
    description: "International IT solutions and managed services provider owned by Datatec. Focuses on cloud, security, and network infrastructure with operations in the US, Europe, and Latin America.",
    confidenceScore: 0.8,
  },
  {
    id: 10,
    name: "Trace3",
    website: "trace3.com",
    hqCity: "Irvine",
    hqState: "CA",
    annualRevenue: 1200,
    profit: null,
    employeeCount: 900,
    ownershipType: "Private",
    strategicSpecialty: "Emerging Technology",
    strategicFocus: "Innovation-focused IT advisory and engineering services, AI/ML, data analytics, cloud, and cybersecurity",
    topVendors: ["Dell", "HPE", "Palo Alto Networks", "Nutanix", "Pure Storage", "Rubrik"],
    topCustomers: ["Enterprise", "Technology", "Financial Services"],
    yearFounded: 2002,
    description: "Technology solutions integrator focused on helping enterprises adopt emerging and disruptive technologies. Known for innovation workshops, AI/ML practices, and data center transformation.",
    confidenceScore: 0.8,
  },
  {
    id: 11,
    name: "Softchoice",
    website: "softchoice.com",
    hqCity: "Chicago",
    hqState: "IL",
    annualRevenue: 1100,
    profit: null,
    employeeCount: 1500,
    ownershipType: "Public",
    strategicSpecialty: "Cloud & Software Advisory",
    strategicFocus: "Cloud migration, software asset management, digital workplace, and IT optimization for mid-market",
    topVendors: ["Microsoft", "AWS", "Google Cloud", "Cisco", "VMware", "Adobe"],
    topCustomers: ["Mid-Market Enterprise", "Financial Services", "Manufacturing"],
    yearFounded: 1989,
    description: "Software-focused technology solutions provider publicly traded on TSX. Specializes in cloud advisory, software asset management, and digital workplace transformation.",
    confidenceScore: 0.85,
  },
  {
    id: 12,
    name: "Dasher Technologies",
    website: "dasher.com",
    hqCity: "Campbell",
    hqState: "CA",
    annualRevenue: 800,
    profit: null,
    employeeCount: 250,
    ownershipType: "Private",
    strategicSpecialty: "Data Center & Cloud",
    strategicFocus: "Data center infrastructure, cloud architecture, storage, networking, and professional services for West Coast enterprises",
    topVendors: ["Dell", "HPE", "Pure Storage", "Nutanix", "Cisco", "Arista"],
    topCustomers: ["Technology Companies", "Enterprise", "Higher Education"],
    yearFounded: 1999,
    description: "Silicon Valley-based IT solutions provider specializing in data center, cloud, and infrastructure solutions. Known for deep technical engineering talent and West Coast enterprise relationships.",
    confidenceScore: 0.75,
  },
  {
    id: 13,
    name: "Mainline Information Systems",
    website: "mainline.com",
    hqCity: "Tallahassee",
    hqState: "FL",
    annualRevenue: 750,
    profit: null,
    employeeCount: 500,
    ownershipType: "Private",
    strategicSpecialty: "Enterprise Infrastructure",
    strategicFocus: "IBM-centric infrastructure solutions, hybrid cloud, storage, and mainframe modernization",
    topVendors: ["IBM", "Dell", "Cisco", "Pure Storage", "Lenovo", "Cohesity"],
    topCustomers: ["Banking & Finance", "Government", "Healthcare"],
    yearFounded: 1989,
    description: "Employee-owned IT solutions provider with deep IBM expertise. Focuses on enterprise infrastructure, hybrid cloud, data protection, and mainframe modernization.",
    confidenceScore: 0.75,
  },
  {
    id: 14,
    name: "NWN Carousel",
    website: "nwncarousel.com",
    hqCity: "Exeter",
    hqState: "RI",
    annualRevenue: 700,
    profit: null,
    employeeCount: 900,
    ownershipType: "PE",
    strategicSpecialty: "Unified Communications",
    strategicFocus: "Cloud communications, collaboration, contact center, security, and managed services for enterprise",
    topVendors: ["Cisco", "Microsoft", "Poly", "Palo Alto Networks", "Genesys", "Zoom"],
    topCustomers: ["Enterprise", "Healthcare", "Financial Services"],
    yearFounded: 1992,
    description: "PE-backed provider formed from merger of NWN and Carousel Industries. Specializes in cloud communications, managed services, and collaboration solutions with strong Cisco UC expertise.",
    confidenceScore: 0.8,
  },
  {
    id: 15,
    name: "GDT (General Datatech)",
    website: "gdt.com",
    hqCity: "Dallas",
    hqState: "TX",
    annualRevenue: 650,
    profit: null,
    employeeCount: 500,
    ownershipType: "PE",
    strategicSpecialty: "Network & Security",
    strategicFocus: "Network infrastructure, cybersecurity, cloud, and managed SD-WAN services for enterprise",
    topVendors: ["Cisco", "Fortinet", "Palo Alto Networks", "HPE Aruba", "VMware", "Juniper"],
    topCustomers: ["Enterprise", "Financial Services", "Retail"],
    yearFounded: 1984,
    description: "PE-backed IT solutions provider specializing in network infrastructure, cybersecurity, and cloud solutions. Known for managed SD-WAN and SASE capabilities.",
    confidenceScore: 0.75,
  },
  {
    id: 16,
    name: "Myriad360",
    website: "myriad360.com",
    hqCity: "New York",
    hqState: "NY",
    annualRevenue: 500,
    profit: null,
    employeeCount: 300,
    ownershipType: "Private",
    strategicSpecialty: "Cybersecurity",
    strategicFocus: "Security-first IT solutions, managed security services, cloud security, and compliance-driven infrastructure",
    topVendors: ["Palo Alto Networks", "CrowdStrike", "Fortinet", "Cisco", "Microsoft", "Okta"],
    topCustomers: ["Financial Services", "Legal", "Enterprise"],
    yearFounded: 2014,
    description: "Security-focused IT solutions provider based in New York. Combines deep cybersecurity expertise with infrastructure and cloud services for security-conscious enterprises.",
    confidenceScore: 0.7,
  },
  {
    id: 17,
    name: "Evolve IP",
    website: "evolveip.net",
    hqCity: "Wayne",
    hqState: "PA",
    annualRevenue: 200,
    profit: null,
    employeeCount: 400,
    ownershipType: "PE",
    strategicSpecialty: "Cloud Services",
    strategicFocus: "Cloud workspace, communications, collaboration, and contact center as a service for mid-market",
    topVendors: ["Microsoft", "Cisco", "Genesys", "VMware", "Citrix", "Zoom"],
    topCustomers: ["Mid-Market", "Healthcare", "Financial Services"],
    yearFounded: 2007,
    description: "PE-backed cloud services provider delivering unified cloud workspace, communications, and contact center solutions. Focuses on work-anywhere enablement for mid-market companies.",
    confidenceScore: 0.7,
  },
  {
    id: 18,
    name: "Avanade",
    website: "avanade.com",
    hqCity: "Seattle",
    hqState: "WA",
    annualRevenue: 4000,
    profit: null,
    employeeCount: 60000,
    ownershipType: "Private",
    strategicSpecialty: "Microsoft Solutions",
    strategicFocus: "Microsoft-centric digital transformation, Azure, Dynamics 365, Power Platform, and AI-driven innovation",
    topVendors: ["Microsoft"],
    topCustomers: ["Global Enterprise", "Financial Services", "Manufacturing"],
    yearFounded: 2000,
    description: "Joint venture between Accenture and Microsoft, specializing exclusively in the Microsoft ecosystem. Largest dedicated Microsoft partner globally, delivering cloud, AI, and business solutions.",
    confidenceScore: 0.9,
  },
  {
    id: 19,
    name: "Computacenter",
    website: "computacenter.com",
    hqCity: "Irving",
    hqState: "TX",
    annualRevenue: 1800,
    profit: null,
    employeeCount: 2500,
    ownershipType: "Public",
    strategicSpecialty: "Workplace & Infrastructure",
    strategicFocus: "Technology sourcing, workplace services, cloud infrastructure, and managed services for large enterprises",
    topVendors: ["HP", "Lenovo", "Microsoft", "Dell", "Cisco", "VMware"],
    topCustomers: ["Global Enterprise", "Public Sector", "Manufacturing"],
    yearFounded: 1981,
    description: "UK-headquartered, publicly traded IT services company with significant US operations. Specializes in technology sourcing, digital workplace, and infrastructure services.",
    confidenceScore: 0.85,
  },
  {
    id: 20,
    name: "Pomeroy",
    website: "pomeroy.com",
    hqCity: "Hebron",
    hqState: "KY",
    annualRevenue: 350,
    profit: null,
    employeeCount: 800,
    ownershipType: "PE",
    strategicSpecialty: "IT Staffing & Services",
    strategicFocus: "IT staffing, managed services, help desk, field services, and technology deployment at scale",
    topVendors: ["HP", "Dell", "Microsoft", "Cisco", "Lenovo", "Apple"],
    topCustomers: ["Enterprise", "Healthcare", "Financial Services"],
    yearFounded: 1981,
    description: "IT services provider focused on staffing, managed services, and technology deployment. Known for nationwide field services capability and IT lifecycle management.",
    confidenceScore: 0.7,
  },
  {
    id: 21,
    name: "Sirius Computer Solutions (CDW)",
    website: "siriuscom.com",
    hqCity: "San Antonio",
    hqState: "TX",
    annualRevenue: 2500,
    profit: null,
    employeeCount: 2700,
    ownershipType: "Public",
    strategicSpecialty: "Infrastructure & Security",
    strategicFocus: "IT infrastructure, security, cloud, and managed services — now operating as CDW's solutions subsidiary",
    topVendors: ["Dell", "Cisco", "HPE", "IBM", "Palo Alto Networks", "NetApp"],
    topCustomers: ["Enterprise", "Healthcare", "Government"],
    yearFounded: 1980,
    description: "Acquired by CDW in 2021 for $2.5B. Operates as a subsidiary focused on complex IT infrastructure, security, and hybrid cloud solutions. Retains separate brand for enterprise segment.",
    confidenceScore: 0.85,
  },
  {
    id: 22,
    name: "Converge Technology Solutions",
    website: "convergetp.com",
    hqCity: "Gatineau",
    hqState: "NY",
    annualRevenue: 2200,
    profit: null,
    employeeCount: 2500,
    ownershipType: "Public",
    strategicSpecialty: "Hybrid IT & Analytics",
    strategicFocus: "Regional VAR rollup strategy, hybrid cloud, analytics, cybersecurity, and managed services across North America",
    topVendors: ["Cisco", "Dell", "HPE", "Microsoft", "IBM", "Nutanix"],
    topCustomers: ["Mid-Market Enterprise", "Public Sector", "Healthcare"],
    yearFounded: 2017,
    description: "Publicly traded buy-and-build IT solutions aggregator. Has acquired numerous regional VARs across North America to create national scale with local expertise in hybrid cloud, security, and analytics.",
    confidenceScore: 0.8,
  },
  {
    id: 23,
    name: "Ahead",
    website: "ahead.com",
    hqCity: "Chicago",
    hqState: "IL",
    annualRevenue: 700,
    profit: null,
    employeeCount: 600,
    ownershipType: "PE",
    strategicSpecialty: "Cloud & Digital Infrastructure",
    strategicFocus: "Cloud transformation, data center modernization, security, and managed infrastructure for mid-market and enterprise",
    topVendors: ["Dell", "HPE", "Cisco", "Nutanix", "Pure Storage", "VMware"],
    topCustomers: ["Enterprise", "Healthcare", "Financial Services"],
    yearFounded: 2007,
    description: "PE-backed IT solutions provider based in Chicago focusing on cloud, data center, and digital infrastructure. Known for engineering-led approach and deep hybrid cloud expertise.",
    confidenceScore: 0.75,
  },
  {
    id: 24,
    name: "Flexential",
    website: "flexential.com",
    hqCity: "Charlotte",
    hqState: "NC",
    annualRevenue: 500,
    profit: null,
    employeeCount: 800,
    ownershipType: "PE",
    strategicSpecialty: "Colocation & Cloud",
    strategicFocus: "Data center colocation, hybrid cloud, connectivity, and managed hosting services across 40+ US data centers",
    topVendors: ["VMware", "Dell", "Cisco", "Juniper", "Palo Alto Networks", "AWS"],
    topCustomers: ["Enterprise", "Financial Services", "SaaS Companies"],
    yearFounded: 2017,
    description: "PE-backed data center services provider formed from merger of Peak 10 and ViaWest. Operates 40+ data centers across the US providing colocation, cloud, and interconnection services.",
    confidenceScore: 0.75,
  },
  {
    id: 25,
    name: "Sentinel Technologies",
    website: "sentinel.com",
    hqCity: "Downers Grove",
    hqState: "IL",
    annualRevenue: 550,
    profit: null,
    employeeCount: 500,
    ownershipType: "PE",
    strategicSpecialty: "Managed Services",
    strategicFocus: "Managed IT services, security, cloud, and infrastructure solutions for mid-market enterprises in the Midwest",
    topVendors: ["Cisco", "Dell", "HPE", "Palo Alto Networks", "Microsoft", "VMware"],
    topCustomers: ["Mid-Market Enterprise", "Manufacturing", "Financial Services"],
    yearFounded: 1982,
    description: "PE-backed Midwest-focused IT solutions provider offering managed services, cybersecurity, cloud, and infrastructure. Known for high-touch service delivery in the Chicago region.",
    confidenceScore: 0.7,
  },
  {
    id: 26,
    name: "BlueAlly Technology Solutions",
    website: "blueally.com",
    hqCity: "Morrisville",
    hqState: "NC",
    annualRevenue: 50,
    profit: null,
    employeeCount: 100,
    ownershipType: "Private",
    strategicSpecialty: "AI & Data Analytics",
    strategicFocus: "AI-powered IT consulting, data analytics, cloud migration, and managed services for mid-market",
    topVendors: ["Microsoft", "AWS", "Dell", "Cisco", "Anthropic", "ServiceNow"],
    topCustomers: ["Mid-Market Enterprise", "PE Portfolio Companies", "Healthcare"],
    yearFounded: 2014,
    description: "AI-forward IT solutions and consulting firm based in the Research Triangle. Specializes in AI implementation, data analytics, cloud transformation, and managed services for PE portfolio companies.",
    confidenceScore: 0.7,
  },
  {
    id: 27,
    name: "Datalink (Insight)",
    website: "datalink.com",
    hqCity: "Chanhassen",
    hqState: "MN",
    annualRevenue: 600,
    profit: null,
    employeeCount: 400,
    ownershipType: "Public",
    strategicSpecialty: "Data Center Solutions",
    strategicFocus: "Data center architecture, storage, virtualization, and hybrid cloud — operating under Insight Enterprises",
    topVendors: ["Dell", "HPE", "NetApp", "VMware", "Nutanix", "Cisco"],
    topCustomers: ["Enterprise", "Healthcare", "Financial Services"],
    yearFounded: 2003,
    description: "Acquired by Insight Enterprises in 2017. Originally a Minnesota-based data center solutions provider known for deep storage and virtualization expertise. Now part of Insight's solutions portfolio.",
    confidenceScore: 0.75,
  },
  {
    id: 28,
    name: "ConvergeOne",
    website: "convergeone.com",
    hqCity: "Eagan",
    hqState: "MN",
    annualRevenue: 1000,
    profit: null,
    employeeCount: 1200,
    ownershipType: "PE",
    strategicSpecialty: "Collaboration & Contact Center",
    strategicFocus: "Unified communications, contact center, cloud collaboration, and managed services for enterprise",
    topVendors: ["Avaya", "Cisco", "Genesys", "Microsoft", "AWS", "RingCentral"],
    topCustomers: ["Enterprise", "Healthcare", "Financial Services"],
    yearFounded: 1993,
    description: "PE-backed IT solutions provider specializing in collaboration, communications, and contact center technology. Largest independent Avaya partner in the US.",
    confidenceScore: 0.8,
  },
  {
    id: 29,
    name: "PCM (Insight)",
    website: "pcm.com",
    hqCity: "El Segundo",
    hqState: "CA",
    annualRevenue: 2000,
    profit: null,
    employeeCount: 3500,
    ownershipType: "Public",
    strategicSpecialty: "IT Procurement & Services",
    strategicFocus: "End-to-end IT procurement, cloud, managed services, and staffing — now operating under Insight",
    topVendors: ["HP", "Microsoft", "Dell", "Cisco", "Lenovo", "Apple"],
    topCustomers: ["Enterprise", "SMB", "Public Sector"],
    yearFounded: 1987,
    description: "Acquired by Insight Enterprises in 2019 for $581M. Was one of the largest direct marketers of technology products in the US. Strengthened Insight's commercial and SMB reach.",
    confidenceScore: 0.8,
  },
  {
    id: 30,
    name: "Technologent",
    website: "technologent.com",
    hqCity: "Irvine",
    hqState: "CA",
    annualRevenue: 450,
    profit: null,
    employeeCount: 250,
    ownershipType: "Private",
    strategicSpecialty: "Data Center & Storage",
    strategicFocus: "Enterprise data center infrastructure, storage, virtualization, and professional services on the West Coast",
    topVendors: ["Dell", "HPE", "Pure Storage", "Cisco", "NetApp", "Rubrik"],
    topCustomers: ["Entertainment", "Technology", "Financial Services"],
    yearFounded: 2003,
    description: "Woman-owned enterprise IT solutions provider based in Southern California. Specializes in data center, storage, and compute solutions with deep engineering capabilities.",
    confidenceScore: 0.7,
  },
  {
    id: 31,
    name: "Advizex (Insight)",
    website: "advizex.com",
    hqCity: "Cleveland",
    hqState: "OH",
    annualRevenue: 400,
    profit: null,
    employeeCount: 250,
    ownershipType: "Public",
    strategicSpecialty: "Hybrid Cloud",
    strategicFocus: "Hybrid cloud, infrastructure modernization, and managed services — now operating under Insight",
    topVendors: ["Dell", "HPE", "Cisco", "Nutanix", "VMware", "Pure Storage"],
    topCustomers: ["Enterprise", "Manufacturing", "Healthcare"],
    yearFounded: 1984,
    description: "Acquired by Insight Enterprises. Originally Cleveland-based data center and hybrid cloud solutions provider known for deep Midwest enterprise relationships and engineering expertise.",
    confidenceScore: 0.7,
  },
  {
    id: 32,
    name: "ACI (Agilant Solutions)",
    website: "acit.com",
    hqCity: "Orlando",
    hqState: "FL",
    annualRevenue: 300,
    profit: null,
    employeeCount: 200,
    ownershipType: "Private",
    strategicSpecialty: "Professional AV & Collaboration",
    strategicFocus: "Audio-visual integration, collaboration spaces, digital signage, and unified communications deployment",
    topVendors: ["Crestron", "Cisco", "Poly", "Microsoft", "Extron", "QSC"],
    topCustomers: ["Corporate", "Education", "Government"],
    yearFounded: 1998,
    description: "AV-centric IT solutions provider specializing in professional audio-visual integration, collaboration spaces, and digital workplace environments for corporate and education sectors.",
    confidenceScore: 0.65,
  },
  {
    id: 33,
    name: "Viavi Solutions (Optical)",
    website: "viavisolutions.com",
    hqCity: "Chandler",
    hqState: "AZ",
    annualRevenue: 1100,
    profit: 80,
    employeeCount: 3300,
    ownershipType: "Public",
    strategicSpecialty: "Network Test & Measurement",
    strategicFocus: "Network test and measurement, fiber optics, 5G validation, and optical products for telecom and enterprise",
    topVendors: ["Proprietary Technology"],
    topCustomers: ["Telecom Carriers", "Cable Operators", "Government"],
    yearFounded: 2005,
    description: "Public company providing network test, measurement, and assurance solutions. Serves telecom carriers, cable operators, and enterprise customers with fiber, 5G, and network monitoring tools.",
    confidenceScore: 0.85,
  },
  {
    id: 34,
    name: "Optiv Security",
    website: "optiv.com",
    hqCity: "Denver",
    hqState: "CO",
    annualRevenue: 2400,
    profit: null,
    employeeCount: 2200,
    ownershipType: "PE",
    strategicSpecialty: "Cybersecurity",
    strategicFocus: "End-to-end cybersecurity solutions, managed security services, identity, cloud security, and threat management",
    topVendors: ["CrowdStrike", "Palo Alto Networks", "Splunk", "Okta", "Microsoft", "SailPoint"],
    topCustomers: ["Enterprise", "Financial Services", "Healthcare"],
    yearFounded: 2015,
    description: "Largest pure-play cybersecurity solutions integrator in the US. PE-backed (KKR). Provides comprehensive security advisory, implementation, managed security, and threat management services.",
    confidenceScore: 0.85,
  },
  {
    id: 35,
    name: "OneNeck IT Solutions",
    website: "oneneck.com",
    hqCity: "Scottsdale",
    hqState: "AZ",
    annualRevenue: 350,
    profit: null,
    employeeCount: 400,
    ownershipType: "Private",
    strategicSpecialty: "Managed Hosting",
    strategicFocus: "Managed hosting, cloud, ERP hosting (JD Edwards/Oracle), and IT managed services",
    topVendors: ["Dell", "Cisco", "VMware", "Oracle", "Microsoft", "AWS"],
    topCustomers: ["Mid-Market", "Manufacturing", "Distribution"],
    yearFounded: 2003,
    description: "Subsidiary of Telephone and Data Systems (TDS). Specializes in managed hosting, cloud infrastructure, ERP hosting, and IT managed services for mid-market companies.",
    confidenceScore: 0.7,
  },
  {
    id: 36,
    name: "Mythics",
    website: "mythics.com",
    hqCity: "Virginia Beach",
    hqState: "VA",
    annualRevenue: 500,
    profit: null,
    employeeCount: 350,
    ownershipType: "Private",
    strategicSpecialty: "Oracle Solutions",
    strategicFocus: "Oracle-centric cloud, infrastructure, database, and application solutions for federal and commercial markets",
    topVendors: ["Oracle", "Dell", "AWS", "Cisco", "NetApp"],
    topCustomers: ["Federal Government", "State/Local Government", "Enterprise"],
    yearFounded: 2000,
    description: "Oracle Platinum Partner specializing in Oracle Cloud, database, middleware, and hardware solutions. Strong federal and public sector practice with deep Oracle expertise.",
    confidenceScore: 0.7,
  },
  {
    id: 37,
    name: "Meridian IT",
    website: "meridianit.com",
    hqCity: "Libertyville",
    hqState: "IL",
    annualRevenue: 400,
    profit: null,
    employeeCount: 300,
    ownershipType: "PE",
    strategicSpecialty: "IT Lifecycle Management",
    strategicFocus: "IT asset disposition, lifecycle management, refurbished hardware, and sustainability-focused IT services",
    topVendors: ["Dell", "HP", "Lenovo", "Cisco", "Apple", "Microsoft"],
    topCustomers: ["Enterprise", "Education", "Government"],
    yearFounded: 1985,
    description: "PE-backed IT solutions provider with unique ITAD (IT Asset Disposition) and lifecycle management capabilities. Combines new technology sales with sustainable IT disposition services.",
    confidenceScore: 0.7,
  },
  {
    id: 38,
    name: "Core BTS",
    website: "corebts.com",
    hqCity: "Indianapolis",
    hqState: "IN",
    annualRevenue: 250,
    profit: null,
    employeeCount: 300,
    ownershipType: "PE",
    strategicSpecialty: "Cloud & Digital Workplace",
    strategicFocus: "Microsoft-centric cloud transformation, digital workplace, cybersecurity, and managed services",
    topVendors: ["Microsoft", "Cisco", "Palo Alto Networks", "VMware", "Dell", "Fortinet"],
    topCustomers: ["Mid-Market Enterprise", "Manufacturing", "Healthcare"],
    yearFounded: 1995,
    description: "PE-backed IT solutions provider focused on Microsoft cloud transformation, digital workplace, and cybersecurity. Strong Midwest regional presence with national managed services.",
    confidenceScore: 0.7,
  },
  {
    id: 39,
    name: "Aqueduct Technologies",
    website: "aqueducttech.com",
    hqCity: "Waltham",
    hqState: "MA",
    annualRevenue: 200,
    profit: null,
    employeeCount: 150,
    ownershipType: "Private",
    strategicSpecialty: "Network & Security",
    strategicFocus: "Network infrastructure, cybersecurity, SD-WAN, and professional services for Northeast enterprise",
    topVendors: ["Cisco", "Palo Alto Networks", "Fortinet", "HPE Aruba", "Juniper", "F5"],
    topCustomers: ["Enterprise", "Financial Services", "Education"],
    yearFounded: 2006,
    description: "New England-based IT solutions provider specializing in network infrastructure, cybersecurity, and cloud. Known for deep Cisco and Palo Alto Networks expertise in the Northeast.",
    confidenceScore: 0.65,
  },
  {
    id: 40,
    name: "CBTS (Cincinnati Bell Technology Solutions)",
    website: "cbts.com",
    hqCity: "Cincinnati",
    hqState: "OH",
    annualRevenue: 800,
    profit: null,
    employeeCount: 1000,
    ownershipType: "Private",
    strategicSpecialty: "Communications & Cloud",
    strategicFocus: "UCaaS, CCaaS, SD-WAN, cybersecurity, and managed infrastructure services for mid-market and enterprise",
    topVendors: ["Cisco", "Microsoft", "Genesys", "Fortinet", "Dell", "VMware"],
    topCustomers: ["Mid-Market Enterprise", "Healthcare", "Financial Services"],
    yearFounded: 2007,
    description: "IT solutions subsidiary of Cincinnati Bell (now altafiber). Provides unified communications, contact center, SD-WAN, and managed services. Strong Midwest and Southeast presence.",
    confidenceScore: 0.75,
  },
  {
    id: 41,
    name: "Crayon",
    website: "crayon.com",
    hqCity: "Houston",
    hqState: "TX",
    annualRevenue: 600,
    profit: null,
    employeeCount: 500,
    ownershipType: "Public",
    strategicSpecialty: "Software & Cloud Economics",
    strategicFocus: "Cloud economics, software asset management, FinOps, and cloud optimization for global enterprises",
    topVendors: ["Microsoft", "AWS", "Google Cloud", "Adobe", "SAP", "Oracle"],
    topCustomers: ["Global Enterprise", "Financial Services", "Energy"],
    yearFounded: 2002,
    description: "Norwegian-headquartered, publicly traded IT advisory firm with growing US operations. Specializes in cloud economics, software licensing optimization, and FinOps advisory.",
    confidenceScore: 0.75,
  },
  {
    id: 42,
    name: "Lumen Technologies (CenturyLink)",
    website: "lumen.com",
    hqCity: "Monroe",
    hqState: "LA",
    annualRevenue: 14000,
    profit: null,
    employeeCount: 30000,
    ownershipType: "Public",
    strategicSpecialty: "Network & Edge",
    strategicFocus: "Fiber networking, edge compute, security, and application delivery platform for global enterprises",
    topVendors: ["Cisco", "Juniper", "Fortinet", "Microsoft", "VMware", "AWS"],
    topCustomers: ["Global Enterprise", "Government", "Wholesale Carriers"],
    yearFounded: 1930,
    description: "Major telecom and IT solutions provider offering enterprise fiber networking, edge computing, security, and collaboration services. Transitioning from legacy telco to platform-based solutions company.",
    confidenceScore: 0.9,
  },
  {
    id: 43,
    name: "Logista Solutions",
    website: "logistasolutions.com",
    hqCity: "Tampa",
    hqState: "FL",
    annualRevenue: 200,
    profit: null,
    employeeCount: 150,
    ownershipType: "Private",
    strategicSpecialty: "IT Deployment Services",
    strategicFocus: "Large-scale IT deployment, rollout services, field services, and technology refresh for retail and enterprise",
    topVendors: ["HP", "Dell", "Lenovo", "Zebra", "Cisco", "Epson"],
    topCustomers: ["Retail", "Hospitality", "Healthcare"],
    yearFounded: 2010,
    description: "IT deployment and field services company specializing in large-scale technology rollouts for retail, hospitality, and healthcare. Provides nationwide break/fix and deployment services.",
    confidenceScore: 0.65,
  },
  {
    id: 44,
    name: "Compugen",
    website: "compugen.com",
    hqCity: "Richmond Hill",
    hqState: "NY",
    annualRevenue: 900,
    profit: null,
    employeeCount: 800,
    ownershipType: "Private",
    strategicSpecialty: "End-User Computing",
    strategicFocus: "Digital workplace, device lifecycle, cloud, and managed services for enterprises across North America",
    topVendors: ["HP", "Dell", "Lenovo", "Microsoft", "Cisco", "Apple"],
    topCustomers: ["Enterprise", "Education", "Government"],
    yearFounded: 1981,
    description: "Canadian-headquartered IT solutions provider with US operations. Specializes in end-user computing, device lifecycle management, cloud, and digital workplace transformation.",
    confidenceScore: 0.7,
  },
  {
    id: 45,
    name: "Datacom",
    website: "dtcom.com",
    hqCity: "East Rutherford",
    hqState: "NJ",
    annualRevenue: 180,
    profit: null,
    employeeCount: 120,
    ownershipType: "Private",
    strategicSpecialty: "Network Infrastructure",
    strategicFocus: "Network design, structured cabling, data center build, and infrastructure deployment for enterprise",
    topVendors: ["Cisco", "CommScope", "Corning", "Panduit", "Dell", "HPE"],
    topCustomers: ["Enterprise", "Financial Services", "Government"],
    yearFounded: 1983,
    description: "Northeast-based network infrastructure and structured cabling solutions provider. Specializes in data center builds, network design, and physical infrastructure deployment.",
    confidenceScore: 0.6,
  },
  {
    id: 46,
    name: "Arctiq",
    website: "arctiq.com",
    hqCity: "Chicago",
    hqState: "IL",
    annualRevenue: 150,
    profit: null,
    employeeCount: 200,
    ownershipType: "Private",
    strategicSpecialty: "DevSecOps & Automation",
    strategicFocus: "Kubernetes, DevSecOps, infrastructure automation, and cloud-native transformation for enterprises",
    topVendors: ["Red Hat", "HashiCorp", "Cisco", "Palo Alto Networks", "Microsoft", "AWS"],
    topCustomers: ["Enterprise", "Financial Services", "Technology"],
    yearFounded: 2015,
    description: "Cloud-native IT solutions provider focusing on Kubernetes, DevSecOps, and infrastructure automation. Helps enterprises adopt modern application platforms and zero-trust security.",
    confidenceScore: 0.6,
  },
  {
    id: 47,
    name: "Strategic Communications",
    website: "stratcomm.com",
    hqCity: "Reno",
    hqState: "NV",
    annualRevenue: 120,
    profit: null,
    employeeCount: 100,
    ownershipType: "Private",
    strategicSpecialty: "Managed IT Services",
    strategicFocus: "Managed IT, cybersecurity, cloud, and communications for SMB and mid-market in the Western US",
    topVendors: ["Cisco", "Microsoft", "Fortinet", "Dell", "HP", "SonicWall"],
    topCustomers: ["SMB", "Gaming/Hospitality", "Government"],
    yearFounded: 1996,
    description: "Western US IT solutions provider specializing in managed services, cybersecurity, and unified communications for SMB and mid-market clients in Nevada and surrounding states.",
    confidenceScore: 0.6,
  },
  {
    id: 48,
    name: "Anexinet (Acuative)",
    website: "anexinet.com",
    hqCity: "Blue Bell",
    hqState: "PA",
    annualRevenue: 200,
    profit: null,
    employeeCount: 200,
    ownershipType: "PE",
    strategicSpecialty: "Digital Experience",
    strategicFocus: "Digital experience platforms, mobile development, data analytics, and cloud application modernization",
    topVendors: ["Microsoft", "AWS", "Salesforce", "Adobe", "ServiceNow", "Snowflake"],
    topCustomers: ["Enterprise", "Financial Services", "Healthcare"],
    yearFounded: 2002,
    description: "PE-backed digital solutions provider focused on customer experience, data analytics, and application modernization. Combines consulting with technical implementation for digital transformation.",
    confidenceScore: 0.65,
  },
  {
    id: 49,
    name: "Red River Technology",
    website: "redriver.com",
    hqCity: "Claremont",
    hqState: "NH",
    annualRevenue: 1500,
    profit: null,
    employeeCount: 800,
    ownershipType: "Private",
    strategicSpecialty: "Government IT",
    strategicFocus: "Federal and SLED IT solutions, cybersecurity, cloud, and managed services with deep public sector expertise",
    topVendors: ["Dell", "Cisco", "Palo Alto Networks", "Microsoft", "VMware", "AWS"],
    topCustomers: ["Federal Government", "DoD", "State/Local Government"],
    yearFounded: 1995,
    description: "Major government-focused IT solutions provider with deep federal and SLED expertise. Provides cybersecurity, cloud, and managed services to public sector customers across the US.",
    confidenceScore: 0.8,
  },
  {
    id: 50,
    name: "Involta",
    website: "involta.com",
    hqCity: "Cedar Rapids",
    hqState: "IA",
    annualRevenue: 200,
    profit: null,
    employeeCount: 250,
    ownershipType: "PE",
    strategicSpecialty: "Hybrid IT & Colocation",
    strategicFocus: "Hybrid IT solutions, colocation, cloud, managed services, and disaster recovery for Midwest enterprises",
    topVendors: ["Dell", "Cisco", "VMware", "Zerto", "Veeam", "Microsoft"],
    topCustomers: ["Mid-Market Enterprise", "Healthcare", "Financial Services"],
    yearFounded: 2007,
    description: "PE-backed hybrid IT and colocation provider operating data centers across the Midwest. Provides colocation, cloud, managed services, and disaster recovery for mid-market enterprises.",
    confidenceScore: 0.65,
  },
  {
    id: 51,
    name: "Burwood Group",
    website: "burwood.com",
    hqCity: "Chicago",
    hqState: "IL",
    annualRevenue: 150,
    profit: null,
    employeeCount: 200,
    ownershipType: "Private",
    strategicSpecialty: "IT Consulting",
    strategicFocus: "IT strategy consulting, infrastructure, cybersecurity, and cloud solutions for Midwest enterprise and education",
    topVendors: ["Cisco", "Palo Alto Networks", "Microsoft", "Dell", "Google Cloud", "VMware"],
    topCustomers: ["Enterprise", "Higher Education", "Healthcare"],
    yearFounded: 1997,
    description: "Chicago-based IT consulting and solutions firm specializing in infrastructure, security, and cloud. Strong higher education and healthcare practices in the Midwest.",
    confidenceScore: 0.6,
  },
];

// ============================================================================
// Filter Logic
// ============================================================================

function applyFilters(vars: VarCompany[], filters: VarFilters): VarCompany[] {
  return vars.filter((v) => {
    // Search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchesSearch =
        v.name.toLowerCase().includes(q) ||
        v.hqCity.toLowerCase().includes(q) ||
        v.hqState.toLowerCase().includes(q) ||
        v.strategicSpecialty.toLowerCase().includes(q) ||
        v.strategicFocus.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.topVendors.some((vendor) => vendor.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }

    // Ownership type
    if (filters.ownershipType && v.ownershipType !== filters.ownershipType) {
      return false;
    }

    // Revenue range
    if (filters.revenueRange) {
      switch (filters.revenueRange) {
        case "0-100":
          if (v.annualRevenue > 100) return false;
          break;
        case "100-1000":
          if (v.annualRevenue <= 100 || v.annualRevenue > 1000) return false;
          break;
        case "1000-5000":
          if (v.annualRevenue <= 1000 || v.annualRevenue > 5000) return false;
          break;
        case "5000+":
          if (v.annualRevenue <= 5000) return false;
          break;
      }
    }

    // State filter
    if (filters.stateFilter && v.hqState !== filters.stateFilter) {
      return false;
    }

    // Specialty filter
    if (filters.specialtyFilter) {
      if (!v.strategicSpecialty.toLowerCase().includes(filters.specialtyFilter.toLowerCase())) {
        return false;
      }
    }

    return true;
  });
}

// ============================================================================
// Zustand Store
// ============================================================================

interface VarState {
  // Data
  vars: VarCompany[];

  // Selection
  selectedVar: VarCompany | null;
  setSelectedVar: (v: VarCompany | null) => void;

  // Filters
  filters: VarFilters;
  setFilter: <K extends keyof VarFilters>(key: K, value: VarFilters[K]) => void;
  clearFilters: () => void;

  // Derived
  getFilteredVars: () => VarCompany[];
  getStats: () => {
    totalVars: number;
    totalRevenue: number;
    avgRevenue: number;
    totalEmployees: number;
  };

  // View
  viewMode: "grid" | "table";
  setViewMode: (mode: "grid" | "table") => void;

  // Sort (for table view)
  sortField: keyof VarCompany;
  sortDirection: "asc" | "desc";
  setSortField: (field: keyof VarCompany) => void;
}

export const useVarStore = create<VarState>((set, get) => ({
  // Data
  vars: VAR_COMPANIES,

  // Selection
  selectedVar: null,
  setSelectedVar: (v) => set({ selectedVar: v }),

  // Filters
  filters: { ...DEFAULT_FILTERS },
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  clearFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  // Derived
  getFilteredVars: () => {
    const { vars, filters, sortField, sortDirection } = get();
    const filtered = applyFilters(vars, filters);
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  },

  getStats: () => {
    const filtered = get().getFilteredVars();
    const totalRevenue = filtered.reduce((sum, v) => sum + v.annualRevenue, 0);
    return {
      totalVars: filtered.length,
      totalRevenue,
      avgRevenue: filtered.length > 0 ? Math.round(totalRevenue / filtered.length) : 0,
      totalEmployees: filtered.reduce((sum, v) => sum + v.employeeCount, 0),
    };
  },

  // View
  viewMode: "grid",
  setViewMode: (mode) => set({ viewMode: mode }),

  // Sort
  sortField: "annualRevenue",
  sortDirection: "desc",
  setSortField: (field) =>
    set((state) => ({
      sortField: field,
      sortDirection:
        state.sortField === field && state.sortDirection === "desc"
          ? "asc"
          : "desc",
    })),
}));
