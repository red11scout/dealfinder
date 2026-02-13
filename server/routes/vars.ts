import { Router, Request, Response } from "express";

// ============================================================================
// VarCompany type (mirrors client store)
// ============================================================================

interface VarCompany {
  id: number;
  name: string;
  website: string;
  hqCity: string;
  hqState: string;
  annualRevenue: number;
  profit: number | null;
  employeeCount: number;
  ownershipType: "VC" | "PE" | "Public" | "Private";
  strategicSpecialty: string;
  strategicFocus: string;
  topVendors: string[];
  topCustomers: string[];
  yearFounded: number;
  description: string;
  confidenceScore: number;
}

// ============================================================================
// Hardcoded VAR data — same source as client store
// Will be replaced with DB queries when Neon/Drizzle is connected
// ============================================================================

const vars: VarCompany[] = [
  { id: 1, name: "CDW Corporation", website: "cdw.com", hqCity: "Lincolnshire", hqState: "IL", annualRevenue: 21500, profit: 1050, employeeCount: 15100, ownershipType: "Public", strategicSpecialty: "Full-Stack IT Solutions", strategicFocus: "Multi-vendor IT procurement, cloud, security, and infrastructure solutions", topVendors: ["Microsoft", "Cisco", "Dell", "HP", "Lenovo", "VMware"], topCustomers: ["Federal Government", "K-12 Education", "Healthcare Systems"], yearFounded: 1984, description: "Largest US VAR by revenue.", confidenceScore: 0.95 },
  { id: 2, name: "World Wide Technology (WWT)", website: "wwt.com", hqCity: "St. Louis", hqState: "MO", annualRevenue: 17000, profit: 850, employeeCount: 10000, ownershipType: "Private", strategicSpecialty: "Advanced Technology Center", strategicFocus: "Digital strategy, ATC lab environment, cloud, networking, and security", topVendors: ["Cisco", "Dell", "HP", "NetApp", "Palo Alto Networks", "F5"], topCustomers: ["Fortune 500 Enterprises", "Federal Agencies", "Financial Services"], yearFounded: 1990, description: "Privately held technology solution provider known for ATC.", confidenceScore: 0.9 },
  { id: 3, name: "SHI International", website: "shi.com", hqCity: "Somerset", hqState: "NJ", annualRevenue: 14000, profit: null, employeeCount: 6000, ownershipType: "Private", strategicSpecialty: "Software & Cloud Licensing", strategicFocus: "Software asset management, cloud migration, ITAM", topVendors: ["Microsoft", "Adobe", "VMware", "AWS", "Cisco", "Dell"], topCustomers: ["Fortune 500 Enterprises", "Public Sector", "Higher Education"], yearFounded: 1989, description: "Minority and woman-owned, specializes in software licensing.", confidenceScore: 0.9 },
  { id: 4, name: "Insight Enterprises", website: "insight.com", hqCity: "Chandler", hqState: "AZ", annualRevenue: 9100, profit: 280, employeeCount: 13500, ownershipType: "Public", strategicSpecialty: "Solutions Integration", strategicFocus: "Cloud, data center transformation, connected workforce", topVendors: ["Microsoft", "HP", "Dell", "Cisco", "AWS", "Google Cloud"], topCustomers: ["Enterprise", "Healthcare", "Government"], yearFounded: 1988, description: "Fortune 500 Solutions Integrator.", confidenceScore: 0.95 },
  { id: 5, name: "Presidio", website: "presidio.com", hqCity: "New York", hqState: "NY", annualRevenue: 3500, profit: null, employeeCount: 3200, ownershipType: "PE", strategicSpecialty: "Digital Infrastructure", strategicFocus: "Network, security, cloud, and collaboration solutions", topVendors: ["Cisco", "Palo Alto Networks", "Microsoft", "AWS", "Dell", "Fortinet"], topCustomers: ["Mid-Market Enterprise", "Financial Services", "Healthcare"], yearFounded: 2004, description: "PE-backed, focused on digital infrastructure.", confidenceScore: 0.85 },
  { id: 6, name: "Connection (PC Connection)", website: "connection.com", hqCity: "Merrimack", hqState: "NH", annualRevenue: 3300, profit: 105, employeeCount: 2700, ownershipType: "Public", strategicSpecialty: "IT Procurement", strategicFocus: "IT solutions for SMB, mid-market, and public sector", topVendors: ["HP", "Dell", "Microsoft", "Cisco", "Apple", "Lenovo"], topCustomers: ["SMB", "State/Local Government", "Education"], yearFounded: 1982, description: "Public company across Business, Enterprise, and Public Sector segments.", confidenceScore: 0.95 },
  { id: 7, name: "Zones", website: "zones.com", hqCity: "Auburn", hqState: "WA", annualRevenue: 2500, profit: null, employeeCount: 2000, ownershipType: "Private", strategicSpecialty: "Global IT Solutions", strategicFocus: "Hardware, software, cloud, and workplace modernization", topVendors: ["Microsoft", "HP", "Dell", "Cisco", "Lenovo", "Apple"], topCustomers: ["Enterprise", "Education", "Government"], yearFounded: 1986, description: "Global IT solutions provider.", confidenceScore: 0.8 },
  { id: 8, name: "ePlus", website: "eplus.com", hqCity: "Herndon", hqState: "VA", annualRevenue: 2100, profit: 110, employeeCount: 1900, ownershipType: "Public", strategicSpecialty: "Security & Cloud", strategicFocus: "Security-first IT, cloud consulting, managed services", topVendors: ["Cisco", "Palo Alto Networks", "Dell", "HPE", "Nutanix", "NetApp"], topCustomers: ["Mid-Market Enterprise", "Federal Government", "SLED"], yearFounded: 1990, description: "Public company, technology and financing solutions.", confidenceScore: 0.95 },
];

// ============================================================================
// Filter helper
// ============================================================================

function filterVars(
  data: VarCompany[],
  query: Record<string, string | undefined>
): VarCompany[] {
  let result = data;

  if (query.search) {
    const q = query.search.toLowerCase();
    result = result.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.hqCity.toLowerCase().includes(q) ||
        v.hqState.toLowerCase().includes(q) ||
        v.strategicSpecialty.toLowerCase().includes(q) ||
        v.topVendors.some((vendor) => vendor.toLowerCase().includes(q))
    );
  }

  if (query.ownershipType) {
    const types = query.ownershipType.split(",");
    result = result.filter((v) => types.includes(v.ownershipType));
  }

  if (query.state) {
    const states = query.state.split(",");
    result = result.filter((v) => states.includes(v.hqState));
  }

  if (query.minRevenue) {
    const min = parseFloat(query.minRevenue);
    result = result.filter((v) => v.annualRevenue >= min);
  }

  if (query.maxRevenue) {
    const max = parseFloat(query.maxRevenue);
    result = result.filter((v) => v.annualRevenue <= max);
  }

  return result;
}

// ============================================================================
// Stats computation
// ============================================================================

function computeStats(data: VarCompany[]) {
  const totalRevenue = data.reduce((sum, v) => sum + v.annualRevenue, 0);
  const totalEmployees = data.reduce((sum, v) => sum + v.employeeCount, 0);
  return {
    totalVars: data.length,
    totalRevenue,
    avgRevenue: data.length > 0 ? Math.round(totalRevenue / data.length) : 0,
    totalEmployees,
    ownershipBreakdown: {
      public: data.filter((v) => v.ownershipType === "Public").length,
      private: data.filter((v) => v.ownershipType === "Private").length,
      pe: data.filter((v) => v.ownershipType === "PE").length,
      vc: data.filter((v) => v.ownershipType === "VC").length,
    },
  };
}

// ============================================================================
// Routes
// ============================================================================

const router = Router();

// GET /api/vars/stats — aggregate stats (must be before /:id to avoid conflict)
router.get("/vars/stats", (req: Request, res: Response) => {
  const hasFilters = Object.keys(req.query).length > 0;
  const data = hasFilters
    ? filterVars(vars, req.query as Record<string, string>)
    : vars;

  res.json(computeStats(data));
});

// GET /api/vars — list all VARs (with query param filters)
router.get("/vars", (req: Request, res: Response) => {
  const filtered = filterVars(vars, req.query as Record<string, string>);
  res.json({
    vars: filtered,
    count: filtered.length,
  });
});

// GET /api/vars/:id — single VAR detail
router.get("/vars/:id", (req: Request<{ id: string }>, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const varCompany = vars.find((v) => v.id === id);

  if (!varCompany) {
    res.status(404).json({ error: `VAR with id ${id} not found` });
    return;
  }

  res.json(varCompany);
});

// POST /api/vars/research — placeholder for AI research agent
router.post("/vars/research", (req: Request, res: Response) => {
  const { varId, query } = req.body as { varId?: number; query?: string };

  res.json({
    status: "placeholder",
    message: "AI research agent not yet implemented",
    varId,
    query,
    timestamp: new Date().toISOString(),
  });
});

export default router;
