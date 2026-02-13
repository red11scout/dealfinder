import { create } from "zustand";

// ============================================================================
// VarCompany Interface — Value-Added Reseller companies
// ============================================================================

export interface VarCompany {
  id: number;
  name: string;
  hq: string;
  state: string;
  revenue: number; // $M
  employees: number;
  ownership: "Private" | "PE-Backed" | "Public" | "ESOP";
  specialties: string[];
  primaryVendors: string[];
  customerSegment: "SMB" | "Mid-Market" | "Enterprise" | "Mixed";
  growthRate: number; // percent YoY
  ebitdaMargin: number; // percent
  founded: number;
}

// ============================================================================
// M&A Scoring Interfaces
// ============================================================================

export interface AcquisitionCriteria {
  revenueFitWeight: number;
  geographicFitWeight: number;
  specialtyFitWeight: number;
  cultureFitWeight: number;
  customerOverlapWeight: number;
  vendorSynergyWeight: number;
  growthTrajectoryWeight: number;
  marginProfileWeight: number;
}

export interface VarScores {
  revenueFit: number;
  geographicFit: number;
  specialtyFit: number;
  cultureFit: number;
  customerOverlap: number;
  vendorSynergy: number;
  growthTrajectory: number;
  marginProfile: number;
}

export interface ScoredVar {
  var: VarCompany;
  scores: VarScores;
  compositeScore: number;
  rank: number;
  reasoning: string;
}

// ============================================================================
// Default Criteria Weights (sum to 1.0)
// ============================================================================

const DEFAULT_CRITERIA: AcquisitionCriteria = {
  revenueFitWeight: 0.15,
  geographicFitWeight: 0.10,
  specialtyFitWeight: 0.20,
  cultureFitWeight: 0.10,
  customerOverlapWeight: 0.10,
  vendorSynergyWeight: 0.15,
  growthTrajectoryWeight: 0.10,
  marginProfileWeight: 0.10,
};

// ============================================================================
// VAR Company Database — 40 realistic VARs
// ============================================================================

export const INITIAL_VARS: VarCompany[] = [
  { id: 1, name: "Presidio", hq: "New York, NY", state: "NY", revenue: 3200, employees: 3200, ownership: "PE-Backed", specialties: ["Cloud", "Cybersecurity", "Managed Services", "Networking"], primaryVendors: ["Cisco", "Microsoft", "Palo Alto", "Dell"], customerSegment: "Enterprise", growthRate: 12, ebitdaMargin: 11, founded: 2015 },
  { id: 2, name: "Optiv Security", hq: "Denver, CO", state: "CO", revenue: 2400, employees: 2200, ownership: "PE-Backed", specialties: ["Cybersecurity", "Identity", "Cloud Security", "Managed Detection"], primaryVendors: ["CrowdStrike", "Microsoft", "Palo Alto", "Splunk"], customerSegment: "Enterprise", growthRate: 15, ebitdaMargin: 13, founded: 2015 },
  { id: 3, name: "Trace3", hq: "Irvine, CA", state: "CA", revenue: 1800, employees: 1100, ownership: "PE-Backed", specialties: ["Cloud", "Data Center", "AI/ML", "Cybersecurity"], primaryVendors: ["Dell", "Cisco", "Microsoft", "VMware"], customerSegment: "Enterprise", growthRate: 18, ebitdaMargin: 14, founded: 2002 },
  { id: 4, name: "Flexential", hq: "Charlotte, NC", state: "NC", revenue: 480, employees: 800, ownership: "PE-Backed", specialties: ["Cloud", "Colocation", "Managed Services", "Data Protection"], primaryVendors: ["Dell", "VMware", "Microsoft", "Veeam"], customerSegment: "Mid-Market", growthRate: 14, ebitdaMargin: 22, founded: 2017 },
  { id: 5, name: "Sirius Computer Solutions", hq: "San Antonio, TX", state: "TX", revenue: 2200, employees: 2800, ownership: "PE-Backed", specialties: ["Cloud", "Cybersecurity", "Managed Services", "Data Center"], primaryVendors: ["Cisco", "Dell", "Microsoft", "IBM"], customerSegment: "Enterprise", growthRate: 8, ebitdaMargin: 9, founded: 1980 },
  { id: 6, name: "Red River Technology", hq: "Claremont, NH", state: "NH", revenue: 350, employees: 600, ownership: "Private", specialties: ["Cloud", "Cybersecurity", "Networking", "Managed Services"], primaryVendors: ["Cisco", "Dell", "Microsoft", "AWS"], customerSegment: "Mid-Market", growthRate: 16, ebitdaMargin: 12, founded: 1995 },
  { id: 7, name: "Evolve IP", hq: "Wayne, PA", state: "PA", revenue: 200, employees: 450, ownership: "PE-Backed", specialties: ["Cloud", "Unified Communications", "Managed Services", "Disaster Recovery"], primaryVendors: ["Microsoft", "Cisco", "VMware", "Citrix"], customerSegment: "Mid-Market", growthRate: 11, ebitdaMargin: 18, founded: 2007 },
  { id: 8, name: "Converge Technology Solutions", hq: "Toronto, ON", state: "ON", revenue: 2800, employees: 3600, ownership: "Public", specialties: ["Cloud", "Cybersecurity", "Managed Services", "Analytics"], primaryVendors: ["Microsoft", "Cisco", "Dell", "AWS"], customerSegment: "Enterprise", growthRate: 22, ebitdaMargin: 8, founded: 2016 },
  { id: 9, name: "Lumen Technologies Solutions", hq: "Monroe, LA", state: "LA", revenue: 1500, employees: 2000, ownership: "Public", specialties: ["Networking", "Cloud", "Edge Computing", "Security"], primaryVendors: ["Cisco", "Fortinet", "Microsoft", "AWS"], customerSegment: "Enterprise", growthRate: 3, ebitdaMargin: 7, founded: 1930 },
  { id: 10, name: "Pax8", hq: "Denver, CO", state: "CO", revenue: 1600, employees: 1800, ownership: "PE-Backed", specialties: ["Cloud Marketplace", "Managed Services", "SaaS Distribution"], primaryVendors: ["Microsoft", "AWS", "Adobe", "Acronis"], customerSegment: "SMB", growthRate: 35, ebitdaMargin: 6, founded: 2012 },
  { id: 11, name: "Nitel", hq: "Chicago, IL", state: "IL", revenue: 180, employees: 280, ownership: "PE-Backed", specialties: ["Cloud", "Managed SD-WAN", "UCaaS", "Connectivity"], primaryVendors: ["Cisco", "Microsoft", "VMware", "Fortinet"], customerSegment: "Mid-Market", growthRate: 19, ebitdaMargin: 15, founded: 2014 },
  { id: 12, name: "MicroAge", hq: "Tempe, AZ", state: "AZ", revenue: 320, employees: 350, ownership: "Private", specialties: ["Cloud", "Managed Services", "Procurement", "Lifecycle Services"], primaryVendors: ["Dell", "HP", "Microsoft", "Lenovo"], customerSegment: "Mid-Market", growthRate: 5, ebitdaMargin: 8, founded: 1976 },
  { id: 13, name: "TBC (Technology Business Consulting)", hq: "Raleigh, NC", state: "NC", revenue: 150, employees: 200, ownership: "Private", specialties: ["Cloud", "Cybersecurity", "Managed Services", "Networking"], primaryVendors: ["Cisco", "Microsoft", "Dell", "Fortinet"], customerSegment: "Mid-Market", growthRate: 13, ebitdaMargin: 14, founded: 2003 },
  { id: 14, name: "OneNeck IT Solutions", hq: "Scottsdale, AZ", state: "AZ", revenue: 280, employees: 500, ownership: "PE-Backed", specialties: ["Cloud", "Managed Services", "Data Center", "ERP Hosting"], primaryVendors: ["Dell", "VMware", "Microsoft", "Oracle"], customerSegment: "Mid-Market", growthRate: 7, ebitdaMargin: 16, founded: 2003 },
  { id: 15, name: "Logicalis US", hq: "New York, NY", state: "NY", revenue: 850, employees: 900, ownership: "Private", specialties: ["Cloud", "Managed Services", "Networking", "Collaboration"], primaryVendors: ["Cisco", "Microsoft", "AWS", "Dell"], customerSegment: "Enterprise", growthRate: 6, ebitdaMargin: 9, founded: 1997 },
  { id: 16, name: "Coretelligent", hq: "Westwood, MA", state: "MA", revenue: 85, employees: 230, ownership: "PE-Backed", specialties: ["Managed Services", "Cybersecurity", "Cloud", "Compliance"], primaryVendors: ["Microsoft", "Dell", "Cisco", "SentinelOne"], customerSegment: "Mid-Market", growthRate: 25, ebitdaMargin: 17, founded: 2006 },
  { id: 17, name: "GreenPages Technology Solutions", hq: "Kittery, ME", state: "ME", revenue: 250, employees: 300, ownership: "Private", specialties: ["Cloud", "DevOps", "Managed Services", "Data Center"], primaryVendors: ["Dell", "VMware", "Microsoft", "AWS"], customerSegment: "Mid-Market", growthRate: 10, ebitdaMargin: 11, founded: 1992 },
  { id: 18, name: "Marco Technologies", hq: "St. Cloud, MN", state: "MN", revenue: 550, employees: 1500, ownership: "ESOP", specialties: ["Managed Services", "Cloud", "Cybersecurity", "Print Management"], primaryVendors: ["Microsoft", "Dell", "Cisco", "HP"], customerSegment: "SMB", growthRate: 9, ebitdaMargin: 12, founded: 1973 },
  { id: 19, name: "Agio", hq: "New York, NY", state: "NY", revenue: 120, employees: 350, ownership: "PE-Backed", specialties: ["Managed Services", "Cybersecurity", "Cloud", "Compliance"], primaryVendors: ["Microsoft", "CrowdStrike", "Palo Alto", "AWS"], customerSegment: "Mid-Market", growthRate: 20, ebitdaMargin: 19, founded: 2010 },
  { id: 20, name: "Dataprise", hq: "Rockville, MD", state: "MD", revenue: 160, employees: 500, ownership: "PE-Backed", specialties: ["Managed Services", "Cybersecurity", "Cloud", "Help Desk"], primaryVendors: ["Microsoft", "Dell", "Cisco", "SentinelOne"], customerSegment: "Mid-Market", growthRate: 18, ebitdaMargin: 16, founded: 1995 },
  { id: 21, name: "Evolving Solutions", hq: "Hamel, MN", state: "MN", revenue: 140, employees: 160, ownership: "Private", specialties: ["Cloud", "Data Center", "Managed Services", "Storage"], primaryVendors: ["Dell", "VMware", "Microsoft", "Pure Storage"], customerSegment: "Mid-Market", growthRate: 7, ebitdaMargin: 10, founded: 1995 },
  { id: 22, name: "Ahead", hq: "Chicago, IL", state: "IL", revenue: 600, employees: 500, ownership: "PE-Backed", specialties: ["Cloud", "Data Analytics", "Managed Services", "Security"], primaryVendors: ["Microsoft", "Dell", "AWS", "Cisco"], customerSegment: "Enterprise", growthRate: 24, ebitdaMargin: 14, founded: 2007 },
  { id: 23, name: "InterVision Systems", hq: "Santa Clara, CA", state: "CA", revenue: 500, employees: 700, ownership: "PE-Backed", specialties: ["Cloud", "Managed Services", "AI", "Cybersecurity"], primaryVendors: ["Microsoft", "AWS", "Cisco", "Dell"], customerSegment: "Enterprise", growthRate: 16, ebitdaMargin: 13, founded: 1993 },
  { id: 24, name: "TierPoint", hq: "St. Louis, MO", state: "MO", revenue: 700, employees: 1000, ownership: "PE-Backed", specialties: ["Cloud", "Colocation", "Managed Services", "Disaster Recovery"], primaryVendors: ["Dell", "VMware", "Microsoft", "Zerto"], customerSegment: "Mid-Market", growthRate: 8, ebitdaMargin: 20, founded: 2010 },
  { id: 25, name: "NWN Carousel", hq: "Waltham, MA", state: "MA", revenue: 800, employees: 1200, ownership: "PE-Backed", specialties: ["Cloud", "Collaboration", "Managed Services", "Networking"], primaryVendors: ["Cisco", "Microsoft", "Dell", "Poly"], customerSegment: "Enterprise", growthRate: 11, ebitdaMargin: 10, founded: 1988 },
  { id: 26, name: "Rackspace Technology", hq: "San Antonio, TX", state: "TX", revenue: 3000, employees: 6000, ownership: "PE-Backed", specialties: ["Cloud", "Managed Services", "Multi-Cloud", "Data"], primaryVendors: ["AWS", "Microsoft", "Google", "VMware"], customerSegment: "Enterprise", growthRate: 2, ebitdaMargin: 8, founded: 1998 },
  { id: 27, name: "Sentinel Technologies", hq: "Downers Grove, IL", state: "IL", revenue: 190, employees: 250, ownership: "Private", specialties: ["Managed Services", "Cybersecurity", "Cloud", "Networking"], primaryVendors: ["Cisco", "Dell", "Microsoft", "Fortinet"], customerSegment: "Mid-Market", growthRate: 12, ebitdaMargin: 13, founded: 1982 },
  { id: 28, name: "Ntiva", hq: "McLean, VA", state: "VA", revenue: 110, employees: 400, ownership: "PE-Backed", specialties: ["Managed Services", "Cybersecurity", "Cloud", "Help Desk"], primaryVendors: ["Microsoft", "Dell", "Cisco", "Datto"], customerSegment: "SMB", growthRate: 22, ebitdaMargin: 15, founded: 2004 },
  { id: 29, name: "Burwood Group", hq: "Chicago, IL", state: "IL", revenue: 95, employees: 200, ownership: "Private", specialties: ["Cloud", "Cybersecurity", "Networking", "Data Center"], primaryVendors: ["Cisco", "Microsoft", "Dell", "AWS"], customerSegment: "Mid-Market", growthRate: 14, ebitdaMargin: 16, founded: 1997 },
  { id: 30, name: "VC3", hq: "Columbia, SC", state: "SC", revenue: 75, employees: 300, ownership: "PE-Backed", specialties: ["Managed Services", "Cybersecurity", "Cloud", "Government IT"], primaryVendors: ["Microsoft", "Dell", "Cisco", "Fortinet"], customerSegment: "SMB", growthRate: 20, ebitdaMargin: 18, founded: 1994 },
  { id: 31, name: "NetStandard", hq: "Kansas City, MO", state: "MO", revenue: 65, employees: 180, ownership: "PE-Backed", specialties: ["Managed Services", "Cloud", "Cybersecurity", "Compliance"], primaryVendors: ["Microsoft", "Dell", "Cisco", "SentinelOne"], customerSegment: "Mid-Market", growthRate: 17, ebitdaMargin: 14, founded: 2001 },
  { id: 32, name: "IT Solutions", hq: "Fort Lauderdale, FL", state: "FL", revenue: 130, employees: 220, ownership: "Private", specialties: ["Managed Services", "Cloud", "Cybersecurity", "VoIP"], primaryVendors: ["Microsoft", "Dell", "Cisco", "Fortinet"], customerSegment: "Mid-Market", growthRate: 15, ebitdaMargin: 15, founded: 1998 },
  { id: 33, name: "Thrive", hq: "Foxborough, MA", state: "MA", revenue: 300, employees: 700, ownership: "PE-Backed", specialties: ["Managed Services", "Cybersecurity", "Cloud", "Compliance"], primaryVendors: ["Microsoft", "CrowdStrike", "Palo Alto", "Dell"], customerSegment: "Mid-Market", growthRate: 28, ebitdaMargin: 16, founded: 2001 },
  { id: 34, name: "Resultant", hq: "Indianapolis, IN", state: "IN", revenue: 180, employees: 400, ownership: "Private", specialties: ["Cloud", "Data Analytics", "Cybersecurity", "Consulting"], primaryVendors: ["Microsoft", "AWS", "Dell", "Tableau"], customerSegment: "Mid-Market", growthRate: 20, ebitdaMargin: 15, founded: 2008 },
  { id: 35, name: "Cleareon", hq: "Atlanta, GA", state: "GA", revenue: 90, employees: 150, ownership: "PE-Backed", specialties: ["Cloud", "Managed Services", "Networking", "SD-WAN"], primaryVendors: ["Cisco", "Microsoft", "Dell", "Fortinet"], customerSegment: "Mid-Market", growthRate: 19, ebitdaMargin: 17, founded: 2010 },
  { id: 36, name: "Xantrion", hq: "Oakland, CA", state: "CA", revenue: 40, employees: 85, ownership: "Private", specialties: ["Managed Services", "Cybersecurity", "Cloud", "Help Desk"], primaryVendors: ["Microsoft", "Dell", "SentinelOne", "Datto"], customerSegment: "SMB", growthRate: 15, ebitdaMargin: 20, founded: 1988 },
  { id: 37, name: "Sourcepass", hq: "New York, NY", state: "NY", revenue: 55, employees: 250, ownership: "PE-Backed", specialties: ["Managed Services", "Cybersecurity", "Cloud", "VoIP"], primaryVendors: ["Microsoft", "Dell", "Cisco", "Fortinet"], customerSegment: "SMB", growthRate: 40, ebitdaMargin: 12, founded: 2019 },
  { id: 38, name: "CentraComm", hq: "Charlotte, NC", state: "NC", revenue: 60, employees: 100, ownership: "Private", specialties: ["Cloud", "Managed Services", "Cybersecurity", "Networking"], primaryVendors: ["Cisco", "Dell", "Microsoft", "Fortinet"], customerSegment: "Mid-Market", growthRate: 16, ebitdaMargin: 14, founded: 2005 },
  { id: 39, name: "TekLinks", hq: "Birmingham, AL", state: "AL", revenue: 95, employees: 200, ownership: "PE-Backed", specialties: ["Cloud", "Managed Services", "Cybersecurity", "Data Center"], primaryVendors: ["Dell", "Microsoft", "Cisco", "VMware"], customerSegment: "Mid-Market", growthRate: 11, ebitdaMargin: 13, founded: 1997 },
  { id: 40, name: "Cerdant", hq: "Richmond, VA", state: "VA", revenue: 50, employees: 80, ownership: "Private", specialties: ["Cybersecurity", "Cloud", "Managed Services", "Compliance"], primaryVendors: ["Microsoft", "CrowdStrike", "Cisco", "Fortinet"], customerSegment: "Mid-Market", growthRate: 22, ebitdaMargin: 18, founded: 2009 },
];

// ============================================================================
// Scoring Functions — BlueAlly Ideal Acquisition Profile
// ============================================================================

const PREFERRED_STATES = ["NC", "VA", "GA", "FL", "TX", "SC", "MD", "AL", "TN", "PA"];
const ADJACENT_STATES = ["NY", "NJ", "MA", "CT", "DE", "WV", "KY", "MS", "LA", "OH", "IN", "IL"];
const PREFERRED_SPECIALTIES = ["Cloud", "Cybersecurity", "Managed Services"];
const PREFERRED_VENDORS = ["Microsoft", "Cisco", "Dell"];

function scoreRevenueFit(revenue: number): number {
  if (revenue >= 100 && revenue <= 300) return 10;
  if (revenue >= 50 && revenue < 100) return 7;
  if (revenue > 300 && revenue <= 500) return 7;
  if (revenue > 500 && revenue <= 800) return 5;
  if (revenue > 800 && revenue <= 1000) return 4;
  if (revenue >= 30 && revenue < 50) return 5;
  return 3;
}

function scoreGeographicFit(state: string): number {
  if (PREFERRED_STATES.includes(state)) return 10;
  if (ADJACENT_STATES.includes(state)) return 7;
  return 4;
}

function scoreSpecialtyFit(specialties: string[]): number {
  const overlap = specialties.filter((s) => PREFERRED_SPECIALTIES.includes(s)).length;
  if (overlap >= 3) return 10;
  if (overlap === 2) return 8;
  if (overlap === 1) return 5;
  return 2;
}

function scoreCultureFit(ownership: VarCompany["ownership"]): number {
  if (ownership === "PE-Backed") return 9;
  if (ownership === "Private") return 8;
  if (ownership === "ESOP") return 6;
  return 4; // Public
}

function scoreCustomerOverlap(segment: VarCompany["customerSegment"]): number {
  if (segment === "Mid-Market") return 10;
  if (segment === "Mixed") return 8;
  if (segment === "Enterprise") return 6;
  return 5; // SMB
}

function scoreVendorSynergy(vendors: string[]): number {
  const overlap = vendors.filter((v) => PREFERRED_VENDORS.includes(v)).length;
  if (overlap >= 3) return 10;
  if (overlap === 2) return 8;
  if (overlap === 1) return 5;
  return 2;
}

function scoreGrowthTrajectory(growthRate: number): number {
  if (growthRate >= 20) return 10;
  if (growthRate >= 15) return 9;
  if (growthRate >= 10) return 7;
  if (growthRate >= 5) return 5;
  return 3;
}

function scoreMarginProfile(ebitdaMargin: number): number {
  if (ebitdaMargin >= 18) return 10;
  if (ebitdaMargin >= 15) return 9;
  if (ebitdaMargin >= 12) return 7;
  if (ebitdaMargin >= 10) return 6;
  if (ebitdaMargin >= 8) return 4;
  return 3;
}

function scoreVar(v: VarCompany): VarScores {
  return {
    revenueFit: scoreRevenueFit(v.revenue),
    geographicFit: scoreGeographicFit(v.state),
    specialtyFit: scoreSpecialtyFit(v.specialties),
    cultureFit: scoreCultureFit(v.ownership),
    customerOverlap: scoreCustomerOverlap(v.customerSegment),
    vendorSynergy: scoreVendorSynergy(v.primaryVendors),
    growthTrajectory: scoreGrowthTrajectory(v.growthRate),
    marginProfile: scoreMarginProfile(v.ebitdaMargin),
  };
}

function computeComposite(scores: VarScores, criteria: AcquisitionCriteria): number {
  return (
    scores.revenueFit * criteria.revenueFitWeight +
    scores.geographicFit * criteria.geographicFitWeight +
    scores.specialtyFit * criteria.specialtyFitWeight +
    scores.cultureFit * criteria.cultureFitWeight +
    scores.customerOverlap * criteria.customerOverlapWeight +
    scores.vendorSynergy * criteria.vendorSynergyWeight +
    scores.growthTrajectory * criteria.growthTrajectoryWeight +
    scores.marginProfile * criteria.marginProfileWeight
  );
}

// ============================================================================
// Top 10 Reasoning — Hemingway Style
// ============================================================================

function generateReasoning(sv: ScoredVar): string {
  const v = sv.var;
  const s = sv.scores;

  const strengths: string[] = [];
  const concerns: string[] = [];

  if (s.revenueFit >= 8) strengths.push(`revenue of $${v.revenue}M sits in the sweet spot`);
  if (s.geographicFit >= 8) strengths.push(`${v.hq} is home turf`);
  if (s.specialtyFit >= 8) strengths.push("specialty alignment is strong");
  if (s.vendorSynergy >= 8) strengths.push("vendor partnerships overlap well");
  if (s.growthTrajectory >= 8) strengths.push(`${v.growthRate}% growth shows momentum`);
  if (s.marginProfile >= 8) strengths.push(`${v.ebitdaMargin}% EBITDA margins are healthy`);
  if (s.cultureFit >= 8) strengths.push(`${v.ownership.toLowerCase()} ownership makes integration simpler`);
  if (s.customerOverlap >= 8) strengths.push(`${v.customerSegment.toLowerCase()} customer base matches BlueAlly`);

  if (s.revenueFit <= 4) concerns.push("revenue size is a stretch");
  if (s.geographicFit <= 4) concerns.push("geography adds complexity");
  if (s.marginProfile <= 5) concerns.push("margins need work");
  if (s.growthTrajectory <= 4) concerns.push("growth has stalled");

  const strengthText = strengths.length > 0
    ? `${strengths.slice(0, 3).join(", ")}`
    : "several dimensions look promising";

  const concernText = concerns.length > 0
    ? ` Watch the ${concerns[0]}.`
    : "";

  return `${v.name} makes sense. The ${strengthText}. Composite score of ${sv.compositeScore.toFixed(1)} puts them at #${sv.rank}.${concernText} The numbers tell the story.`;
}

// ============================================================================
// Compute All Scores
// ============================================================================

function computeAllScores(vars: VarCompany[], criteria: AcquisitionCriteria): ScoredVar[] {
  const scored = vars.map((v) => {
    const scores = scoreVar(v);
    const compositeScore = computeComposite(scores, criteria);
    return {
      var: v,
      scores,
      compositeScore: Math.round(compositeScore * 10) / 10,
      rank: 0,
      reasoning: "",
    };
  });

  // Sort by composite score descending
  scored.sort((a, b) => b.compositeScore - a.compositeScore);

  // Assign ranks and generate reasoning for top 10
  scored.forEach((sv, i) => {
    sv.rank = i + 1;
    if (i < 10) {
      sv.reasoning = generateReasoning(sv);
    }
  });

  return scored;
}

// Initial computation
const initialScored = computeAllScores(INITIAL_VARS, DEFAULT_CRITERIA);

// ============================================================================
// Zustand Store
// ============================================================================

interface MaState {
  acquisitionCriteria: AcquisitionCriteria;
  scoredVars: ScoredVar[];
  topTen: ScoredVar[];
  selectedCandidate: ScoredVar | null;
  comparisonIds: number[];

  // Actions
  updateCriteriaWeight: (key: keyof AcquisitionCriteria, value: number) => void;
  recalculateScores: () => void;
  setSelectedCandidate: (candidate: ScoredVar | null) => void;
  toggleComparison: (varId: number) => void;
  clearComparison: () => void;
}

export const useMaStore = create<MaState>((set, get) => ({
  acquisitionCriteria: { ...DEFAULT_CRITERIA },
  scoredVars: initialScored,
  topTen: initialScored.slice(0, 10),
  selectedCandidate: null,
  comparisonIds: [],

  updateCriteriaWeight: (key, value) => {
    set((state) => ({
      acquisitionCriteria: {
        ...state.acquisitionCriteria,
        [key]: value,
      },
    }));
  },

  recalculateScores: () => {
    const { acquisitionCriteria } = get();
    const recalculated = computeAllScores(INITIAL_VARS, acquisitionCriteria);
    set({
      scoredVars: recalculated,
      topTen: recalculated.slice(0, 10),
    });
  },

  setSelectedCandidate: (candidate) => set({ selectedCandidate: candidate }),

  toggleComparison: (varId) => {
    set((state) => {
      const exists = state.comparisonIds.includes(varId);
      if (exists) {
        return { comparisonIds: state.comparisonIds.filter((id) => id !== varId) };
      }
      if (state.comparisonIds.length >= 3) return state;
      return { comparisonIds: [...state.comparisonIds, varId] };
    });
  },

  clearComparison: () => set({ comparisonIds: [] }),
}));
