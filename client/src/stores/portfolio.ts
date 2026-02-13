import { create } from "zustand";
import type {
  Company,
  Cohort,
  InvestmentGroup,
  Quadrant,
  Track,
  ValueTheme,
  PortfolioStats,
  QuadrantDistribution,
  TrackDistribution,
  CohortDistribution,
  ValueThemeDistribution,
} from "@shared/types";

// ============================================================================
// Hardcoded portfolio data — 54 AEA portfolio companies
// Source: /data/aea_comprehensive_data.csv (exact values)
// ============================================================================

export const PORTFOLIO_COMPANIES: Company[] = [
  {
    rank: 1,
    name: "Scan Global Logistics",
    cohort: "Logistics",
    investmentGroup: "Small Business",
    revenue: 2300,
    ebitda: 276.0,
    scores: {
      ebitdaImpact: 8,
      revenueEnablement: 8,
      riskReduction: 7,
      orgCapacity: 8,
      dataReadiness: 8,
      techInfrastructure: 8,
      timelineFit: 8,
      valueScore: 7.75,
      readinessScore: 7.999999999999999,
      priorityScore: 2173.5,
    },
    quadrant: "Champion",
    track: "T1",
    trackDescription: "EBITDA Accelerators",
    implementationYear: "Year 1",
    implementationQuarter: "Q1-Q2",
    valueTheme: "Revenue Growth",
    platformClassification: "Platform",
    replicationPotential: 10,
    replicationCount: 5,
    adjustedPriority: 99623.925,
    adjustedEbitda: 45.83571428571429,
    peNativeScore: 0,
    portfolioAdjustedPriority: 149435.8875,
  },
  {
    rank: 2,
    name: "TricorBraun",
    cohort: "Industrial",
    investmentGroup: "Middle Market",
    revenue: 3000,
    ebitda: 300.0,
    scores: {
      ebitdaImpact: 8,
      revenueEnablement: 7,
      riskReduction: 6,
      orgCapacity: 7,
      dataReadiness: 7,
      techInfrastructure: 7,
      timelineFit: 7,
      valueScore: 7.25,
      readinessScore: 7.0,
      priorityScore: 2137.5,
    },
    quadrant: "Champion",
    track: "T1",
    trackDescription: "EBITDA Accelerators",
    implementationYear: "Year 1",
    implementationQuarter: "Q1-Q2",
    valueTheme: "Margin Expansion",
    platformClassification: "Platform",
    replicationPotential: 8,
    replicationCount: 17,
    adjustedPriority: 99622.76785714288,
    adjustedEbitda: 46.60714285714286,
    peNativeScore: 0,
    portfolioAdjustedPriority: 268981.4732142858,
  },
  {
    rank: 3,
    name: "NES Fircroft",
    cohort: "Services",
    investmentGroup: "Middle Market",
    revenue: 1500,
    ebitda: 225.0,
    scores: {
      ebitdaImpact: 7,
      revenueEnablement: 8,
      riskReduction: 6,
      orgCapacity: 7,
      dataReadiness: 7,
      techInfrastructure: 7,
      timelineFit: 7,
      valueScore: 7.0,
      readinessScore: 7.0,
      priorityScore: 1575.0,
    },
    quadrant: "Champion",
    track: "T1",
    trackDescription: "EBITDA Accelerators",
    implementationYear: "Year 1",
    implementationQuarter: "Q1-Q2",
    valueTheme: "Revenue Growth",
    platformClassification: "Platform",
    replicationPotential: 8,
    replicationCount: 14,
    adjustedPriority: 53156.25,
    adjustedEbitda: 33.75,
    peNativeScore: 0,
    portfolioAdjustedPriority: 127575.00000000001,
  },
  {
    rank: 4,
    name: "Redwood Logistics",
    cohort: "Logistics",
    investmentGroup: "Middle Market",
    revenue: 1000,
    ebitda: 120.0,
    scores: {
      ebitdaImpact: 8,
      revenueEnablement: 8,
      riskReduction: 6,
      orgCapacity: 8,
      dataReadiness: 8,
      techInfrastructure: 9,
      timelineFit: 9,
      valueScore: 7.5,
      readinessScore: 8.299999999999999,
      priorityScore: 948.0,
    },
    quadrant: "Champion",
    track: "T1",
    trackDescription: "EBITDA Accelerators",
    implementationYear: "Year 1",
    implementationQuarter: "Q1-Q2",
    valueTheme: "Revenue Growth",
    platformClassification: "Platform",
    replicationPotential: 10,
    replicationCount: 5,
    adjustedPriority: 18282.85714285714,
    adjustedEbitda: 19.285714285714285,
    peNativeScore: 0,
    portfolioAdjustedPriority: 27424.28571428571,
  },
  {
    rank: 5,
    name: "Polygon Group",
    cohort: "Services",
    investmentGroup: "Middle Market",
    revenue: 900,
    ebitda: 135.0,
    scores: {
      ebitdaImpact: 7,
      revenueEnablement: 7,
      riskReduction: 6,
      orgCapacity: 6,
      dataReadiness: 6,
      techInfrastructure: 6,
      timelineFit: 6,
      valueScore: 6.75,
      readinessScore: 6.0,
      priorityScore: 860.625,
    },
    quadrant: "Foundation",
    track: "T2",
    trackDescription: "Growth Enablers",
    implementationYear: "Year 2-3",
    implementationQuarter: "Q2-Q4",
    valueTheme: "Margin Expansion",
    platformClassification: "Hybrid",
    replicationPotential: 8,
    replicationCount: 14,
    adjustedPriority: 16805.239955357145,
    adjustedEbitda: 19.526785714285715,
    peNativeScore: 0,
    portfolioAdjustedPriority: 40332.57589285715,
  },
  {
    rank: 6,
    name: "American Oncology Network",
    cohort: "Healthcare",
    investmentGroup: "Elevate",
    revenue: 1000,
    ebitda: 100.0,
    scores: {
      ebitdaImpact: 8,
      revenueEnablement: 7,
      riskReduction: 9,
      orgCapacity: 7,
      dataReadiness: 6,
      techInfrastructure: 6,
      timelineFit: 6,
      valueScore: 8.0,
      readinessScore: 6.35,
      priorityScore: 717.5,
    },
    quadrant: "Strategic",
    track: "T1",
    trackDescription: "EBITDA Accelerators",
    implementationYear: "Year 1",
    implementationQuarter: "Q1-Q2",
    valueTheme: "Margin Expansion",
    platformClassification: "Hybrid",
    replicationPotential: 7,
    replicationCount: 7,
    adjustedPriority: 12300.0,
    adjustedEbitda: 17.142857142857142,
    peNativeScore: 0,
    portfolioAdjustedPriority: 20910.000000000004,
  },
  {
    rank: 7,
    name: "Excelitas Technologies",
    cohort: "Industrial",
    investmentGroup: "Middle Market",
    revenue: 1000,
    ebitda: 100.0,
    scores: {
      ebitdaImpact: 8,
      revenueEnablement: 7,
      riskReduction: 7,
      orgCapacity: 7,
      dataReadiness: 7,
      techInfrastructure: 8,
      timelineFit: 8,
      valueScore: 7.5,
      readinessScore: 7.3,
      priorityScore: 740.0,
    },
    quadrant: "Champion",
    track: "T1",
    trackDescription: "EBITDA Accelerators",
    implementationYear: "Year 1",
    implementationQuarter: "Q1-Q2",
    valueTheme: "Margin Expansion",
    platformClassification: "Platform",
    replicationPotential: 9,
    replicationCount: 17,
    adjustedPriority: 11892.85714285714,
    adjustedEbitda: 16.07142857142857,
    peNativeScore: 0,
    portfolioAdjustedPriority: 32110.71428571428,
  },
  {
    rank: 8,
    name: "BMS Enterprises",
    cohort: "Services",
    investmentGroup: "Middle Market",
    revenue: 500,
    ebitda: 75.0,
    scores: {
      ebitdaImpact: 7,
      revenueEnablement: 7,
      riskReduction: 6,
      orgCapacity: 6,
      dataReadiness: 6,
      techInfrastructure: 6,
      timelineFit: 6,
      valueScore: 6.75,
      readinessScore: 6.0,
      priorityScore: 478.125,
    },
    quadrant: "Foundation",
    track: "T2",
    trackDescription: "Growth Enablers",
    implementationYear: "Year 2-3",
    implementationQuarter: "Q2-Q4",
    valueTheme: "Margin Expansion",
    platformClassification: "Hybrid",
    replicationPotential: 8,
    replicationCount: 14,
    adjustedPriority: 5186.802455357143,
    adjustedEbitda: 10.848214285714286,
    peNativeScore: 0,
    portfolioAdjustedPriority: 12448.325892857145,
  },
  {
    rank: 9,
    name: "SitelogIQ",
    cohort: "Services",
    investmentGroup: "Middle Market",
    revenue: 430,
    ebitda: 64.5,
    scores: {
      ebitdaImpact: 8,
      revenueEnablement: 7,
      riskReduction: 7,
      orgCapacity: 7,
      dataReadiness: 7,
      techInfrastructure: 7,
      timelineFit: 7,
      valueScore: 7.5,
      readinessScore: 7.0,
      priorityScore: 467.625,
    },
    quadrant: "Champion",
    track: "T1",
    trackDescription: "EBITDA Accelerators",
    implementationYear: "Year 1",
    implementationQuarter: "Q1-Q2",
    valueTheme: "Margin Expansion",
    platformClassification: "Platform",
    replicationPotential: 7,
    replicationCount: 14,
    adjustedPriority: 4847.434151785714,
    adjustedEbitda: 10.366071428571429,
    peNativeScore: 0,
    portfolioAdjustedPriority: 11633.841964285715,
  },
  {
    rank: 10,
    name: "Traeger Pellet Grills",
    cohort: "Consumer",
    investmentGroup: "Middle Market",
    revenue: 800,
    ebitda: 64.0,
    scores: {
      ebitdaImpact: 7,
      revenueEnablement: 8,
      riskReduction: 5,
      orgCapacity: 7,
      dataReadiness: 7,
      techInfrastructure: 7,
      timelineFit: 7,
      valueScore: 6.75,
      readinessScore: 7.0,
      priorityScore: 440.0,
    },
    quadrant: "Quick Win",
    track: "T1",
    trackDescription: "EBITDA Accelerators",
    implementationYear: "Year 1",
    implementationQuarter: "Q1-Q2",
    valueTheme: "Revenue Growth",
    platformClassification: "Platform",
    replicationPotential: 7,
    replicationCount: 11,
    adjustedPriority: 4073.142857142857,
    adjustedEbitda: 9.257142857142856,
    peNativeScore: 0,
    portfolioAdjustedPriority: 8553.6,
  },
  {
    rank: 11,
    name: "Numotion",
    cohort: "Healthcare",
    investmentGroup: "Middle Market",
    revenue: 600,
    ebitda: 60.0,
    scores: {
      ebitdaImpact: 7,
      revenueEnablement: 7,
      riskReduction: 8,
      orgCapacity: 6,
      dataReadiness: 6,
      techInfrastructure: 6,
      timelineFit: 6,
      valueScore: 7.25,
      readinessScore: 6.0,
      priorityScore: 397.5,
    },
    quadrant: "Strategic",
    track: "T2",
    trackDescription: "Growth Enablers",
    implementationYear: "Year 2-3",
    implementationQuarter: "Q2-Q4",
    valueTheme: "Margin Expansion",
    platformClassification: "Hybrid",
    replicationPotential: 7,
    replicationCount: 7,
    adjustedPriority: 3705.267857142858,
    adjustedEbitda: 9.321428571428571,
    peNativeScore: 0,
    portfolioAdjustedPriority: 6298.955357142859,
  },
  {
    rank: 12,
    name: "Visual Comfort",
    cohort: "Consumer",
    investmentGroup: "Middle Market",
    revenue: 750,
    ebitda: 60.0,
    scores: {
      ebitdaImpact: 7,
      revenueEnablement: 8,
      riskReduction: 5,
      orgCapacity: 7,
      dataReadiness: 7,
      techInfrastructure: 7,
      timelineFit: 7,
      valueScore: 6.75,
      readinessScore: 7.0,
      priorityScore: 412.5,
    },
    quadrant: "Quick Win",
    track: "T1",
    trackDescription: "EBITDA Accelerators",
    implementationYear: "Year 1",
    implementationQuarter: "Q1-Q2",
    valueTheme: "Revenue Growth",
    platformClassification: "Platform",
    replicationPotential: 7,
    replicationCount: 11,
    adjustedPriority: 3579.910714285714,
    adjustedEbitda: 8.678571428571429,
    peNativeScore: 0,
    portfolioAdjustedPriority: 7517.8125,
  },
  {
    rank: 13,
    name: "Huge",
    cohort: "Services",
    investmentGroup: "Middle Market",
    revenue: 300,
    ebitda: 45.0,
    scores: { ebitdaImpact: 8, revenueEnablement: 8, riskReduction: 5, orgCapacity: 9, dataReadiness: 8, techInfrastructure: 9, timelineFit: 9, valueScore: 7.25, readinessScore: 8.649999999999999, priorityScore: 357.74999999999994 },
    quadrant: "Champion", track: "T1", trackDescription: "EBITDA Accelerators", implementationYear: "Year 1", implementationQuarter: "Q1-Q2", valueTheme: "Revenue Growth", platformClassification: "Platform", replicationPotential: 9, replicationCount: 14, adjustedPriority: 2501.0558035714284, adjustedEbitda: 6.991071428571429, peNativeScore: 0, portfolioAdjustedPriority: 6002.533928571429,
  },
  {
    rank: 14,
    name: "Ascential Technologies",
    cohort: "Industrial",
    investmentGroup: "Middle Market",
    revenue: 500,
    ebitda: 50.0,
    scores: { ebitdaImpact: 7, revenueEnablement: 6, riskReduction: 7, orgCapacity: 6, dataReadiness: 6, techInfrastructure: 7, timelineFit: 7, valueScore: 6.75, readinessScore: 6.3, priorityScore: 326.25 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Platform", replicationPotential: 8, replicationCount: 17, adjustedPriority: 2359.4866071428573, adjustedEbitda: 7.232142857142858, peNativeScore: 0, portfolioAdjustedPriority: 6370.613839285716,
  },
  {
    rank: 15,
    name: "Pave America",
    cohort: "Industrial",
    investmentGroup: "Middle Market",
    revenue: 500,
    ebitda: 50.0,
    scores: { ebitdaImpact: 7, revenueEnablement: 6, riskReduction: 6, orgCapacity: 5, dataReadiness: 5, techInfrastructure: 5, timelineFit: 5, valueScore: 6.5, readinessScore: 5.0, priorityScore: 287.5 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Hybrid", replicationPotential: 6, replicationCount: 17, adjustedPriority: 2002.232142857143, adjustedEbitda: 6.964285714285714, peNativeScore: 0, portfolioAdjustedPriority: 5406.026785714286,
  },
  {
    rank: 16,
    name: "Singer Industrial",
    cohort: "Industrial",
    investmentGroup: "Small Business",
    revenue: 500,
    ebitda: 50.0,
    scores: { ebitdaImpact: 7, revenueEnablement: 6, riskReduction: 6, orgCapacity: 5, dataReadiness: 5, techInfrastructure: 5, timelineFit: 5, valueScore: 6.5, readinessScore: 5.0, priorityScore: 287.5 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Hybrid", replicationPotential: 6, replicationCount: 17, adjustedPriority: 2002.232142857143, adjustedEbitda: 6.964285714285714, peNativeScore: 0, portfolioAdjustedPriority: 5406.026785714286,
  },
  {
    rank: 17,
    name: "Nations Roof",
    cohort: "Industrial",
    investmentGroup: "Middle Market",
    revenue: 400,
    ebitda: 40.0,
    scores: { ebitdaImpact: 8, revenueEnablement: 7, riskReduction: 7, orgCapacity: 6, dataReadiness: 6, techInfrastructure: 6, timelineFit: 6, valueScore: 7.5, readinessScore: 6.0, priorityScore: 270.0 },
    quadrant: "Strategic", track: "T1", trackDescription: "EBITDA Accelerators", implementationYear: "Year 1", implementationQuarter: "Q1-Q2", valueTheme: "Margin Expansion", platformClassification: "Hybrid", replicationPotential: 7, replicationCount: 17, adjustedPriority: 1735.7142857142858, adjustedEbitda: 6.428571428571429, peNativeScore: 0, portfolioAdjustedPriority: 4686.428571428572,
  },
  {
    rank: 18,
    name: "ThreeSixty Group",
    cohort: "Consumer",
    investmentGroup: "Middle Market",
    revenue: 500,
    ebitda: 40.0,
    scores: { ebitdaImpact: 7, revenueEnablement: 7, riskReduction: 5, orgCapacity: 6, dataReadiness: 6, techInfrastructure: 6, timelineFit: 6, valueScore: 6.5, readinessScore: 6.0, priorityScore: 250.0 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Hybrid", replicationPotential: 7, replicationCount: 11, adjustedPriority: 1392.857142857143, adjustedEbitda: 5.571428571428571, peNativeScore: 0, portfolioAdjustedPriority: 2925.0,
  },
  {
    rank: 19,
    name: "Jack's Family Restaurants",
    cohort: "Consumer",
    investmentGroup: "Middle Market",
    revenue: 450,
    ebitda: 36.0,
    scores: { ebitdaImpact: 7, revenueEnablement: 7, riskReduction: 6, orgCapacity: 5, dataReadiness: 5, techInfrastructure: 5, timelineFit: 5, valueScore: 6.75, readinessScore: 5.0, priorityScore: 211.5 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Point", replicationPotential: 4, replicationCount: 11, adjustedPriority: 1101.310714285714, adjustedEbitda: 5.207142857142856, peNativeScore: 0, portfolioAdjustedPriority: 2312.7524999999996,
  },
  {
    rank: 20,
    name: "RED Global",
    cohort: "Services",
    investmentGroup: "Small Business",
    revenue: 200,
    ebitda: 30.0,
    scores: { ebitdaImpact: 7, revenueEnablement: 7, riskReduction: 5, orgCapacity: 6, dataReadiness: 6, techInfrastructure: 6, timelineFit: 6, valueScore: 6.5, readinessScore: 6.0, priorityScore: 187.5 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Hybrid", replicationPotential: 7, replicationCount: 14, adjustedPriority: 783.4821428571429, adjustedEbitda: 4.178571428571429, peNativeScore: 0, portfolioAdjustedPriority: 1880.3571428571431,
  },
  {
    rank: 21,
    name: "Verdesian Life Sciences",
    cohort: "Industrial",
    investmentGroup: "Middle Market",
    revenue: 300,
    ebitda: 30.0,
    scores: { ebitdaImpact: 6, revenueEnablement: 6, riskReduction: 7, orgCapacity: 5, dataReadiness: 5, techInfrastructure: 5, timelineFit: 5, valueScore: 6.25, readinessScore: 5.0, priorityScore: 168.75 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Hybrid", replicationPotential: 5, replicationCount: 17, adjustedPriority: 678.0133928571429, adjustedEbitda: 4.017857142857143, peNativeScore: 0, portfolioAdjustedPriority: 1830.636160714286,
  },
  {
    rank: 22,
    name: "Spectrum Control",
    cohort: "Industrial",
    investmentGroup: "Middle Market",
    revenue: 250,
    ebitda: 25.0,
    scores: { ebitdaImpact: 7, revenueEnablement: 6, riskReduction: 7, orgCapacity: 6, dataReadiness: 6, techInfrastructure: 7, timelineFit: 7, valueScore: 6.75, readinessScore: 6.3, priorityScore: 163.125 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Platform", replicationPotential: 7, replicationCount: 17, adjustedPriority: 589.8716517857143, adjustedEbitda: 3.616071428571429, peNativeScore: 0, portfolioAdjustedPriority: 1592.653459821429,
  },
  {
    rank: 23,
    name: "SCIO Automation",
    cohort: "Industrial",
    investmentGroup: "Middle Market",
    revenue: 200,
    ebitda: 20.0,
    scores: { ebitdaImpact: 8, revenueEnablement: 7, riskReduction: 6, orgCapacity: 7, dataReadiness: 7, techInfrastructure: 8, timelineFit: 8, valueScore: 7.25, readinessScore: 7.3, priorityScore: 145.5 },
    quadrant: "Champion", track: "T1", trackDescription: "EBITDA Accelerators", implementationYear: "Year 1", implementationQuarter: "Q1-Q2", valueTheme: "Margin Expansion", platformClassification: "Platform", replicationPotential: 8, replicationCount: 17, adjustedPriority: 452.0892857142858, adjustedEbitda: 3.1071428571428577, peNativeScore: 0, portfolioAdjustedPriority: 1220.6410714285716,
  },
  {
    rank: 24,
    name: "Window Nation",
    cohort: "Consumer",
    investmentGroup: "Middle Market",
    revenue: 250,
    ebitda: 20.0,
    scores: { ebitdaImpact: 7, revenueEnablement: 8, riskReduction: 5, orgCapacity: 6, dataReadiness: 6, techInfrastructure: 6, timelineFit: 6, valueScore: 6.75, readinessScore: 6.0, priorityScore: 127.5 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Revenue Growth", platformClassification: "Hybrid", replicationPotential: 6, replicationCount: 11, adjustedPriority: 368.8392857142857, adjustedEbitda: 2.892857142857143, peNativeScore: 0, portfolioAdjustedPriority: 774.5625,
  },
  {
    rank: 25,
    name: "The Lifetime Value Co",
    cohort: "Services",
    investmentGroup: "Elevate",
    revenue: 100,
    ebitda: 15.0,
    scores: { ebitdaImpact: 8, revenueEnablement: 9, riskReduction: 5, orgCapacity: 9, dataReadiness: 9, techInfrastructure: 9, timelineFit: 9, valueScore: 7.5, readinessScore: 9.0, priorityScore: 123.75 },
    quadrant: "Champion", track: "T1", trackDescription: "EBITDA Accelerators", implementationYear: "Year 1", implementationQuarter: "Q1-Q2", valueTheme: "Revenue Growth", platformClassification: "Platform", replicationPotential: 9, replicationCount: 14, adjustedPriority: 298.32589285714283, adjustedEbitda: 2.4107142857142856, peNativeScore: 0, portfolioAdjustedPriority: 715.9821428571429,
  },
  {
    rank: 26,
    name: "ROI CX Solutions",
    cohort: "Services",
    investmentGroup: "Small Business",
    revenue: 100,
    ebitda: 15.0,
    scores: { ebitdaImpact: 9, revenueEnablement: 7, riskReduction: 7, orgCapacity: 7, dataReadiness: 7, techInfrastructure: 7, timelineFit: 7, valueScore: 8.0, readinessScore: 7.0, priorityScore: 112.5 },
    quadrant: "Champion", track: "T1", trackDescription: "EBITDA Accelerators", implementationYear: "Year 1", implementationQuarter: "Q1-Q2", valueTheme: "Margin Expansion", platformClassification: "Platform", replicationPotential: 7, replicationCount: 14, adjustedPriority: 289.2857142857143, adjustedEbitda: 2.571428571428571, peNativeScore: 0, portfolioAdjustedPriority: 694.2857142857143,
  },
  {
    rank: 27,
    name: "Veseris",
    cohort: "Industrial",
    investmentGroup: "Small Business",
    revenue: 200,
    ebitda: 20.0,
    scores: { ebitdaImpact: 6, revenueEnablement: 6, riskReduction: 6, orgCapacity: 5, dataReadiness: 5, techInfrastructure: 5, timelineFit: 5, valueScore: 6.0, readinessScore: 5.0, priorityScore: 110.0 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Hybrid", replicationPotential: 5, replicationCount: 17, adjustedPriority: 282.85714285714283, adjustedEbitda: 2.571428571428571, peNativeScore: 0, portfolioAdjustedPriority: 763.7142857142857,
  },
  {
    rank: 28,
    name: "Hero Digital",
    cohort: "Services",
    investmentGroup: "Middle Market",
    revenue: 100,
    ebitda: 15.0,
    scores: { ebitdaImpact: 8, revenueEnablement: 8, riskReduction: 5, orgCapacity: 9, dataReadiness: 8, techInfrastructure: 9, timelineFit: 9, valueScore: 7.25, readinessScore: 8.649999999999999, priorityScore: 119.25 },
    quadrant: "Champion", track: "T1", trackDescription: "EBITDA Accelerators", implementationYear: "Year 1", implementationQuarter: "Q1-Q2", valueTheme: "Revenue Growth", platformClassification: "Platform", replicationPotential: 9, replicationCount: 14, adjustedPriority: 277.8950892857143, adjustedEbitda: 2.3303571428571432, peNativeScore: 0, portfolioAdjustedPriority: 666.9482142857144,
  },
  {
    rank: 29,
    name: "Dana Safety Supply",
    cohort: "Services",
    investmentGroup: "Small Business",
    revenue: 120,
    ebitda: 18.0,
    scores: { ebitdaImpact: 6, revenueEnablement: 6, riskReduction: 6, orgCapacity: 5, dataReadiness: 5, techInfrastructure: 5, timelineFit: 5, valueScore: 6.0, readinessScore: 5.0, priorityScore: 99.0 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Hybrid", replicationPotential: 5, replicationCount: 14, adjustedPriority: 229.1142857142857, adjustedEbitda: 2.314285714285714, peNativeScore: 0, portfolioAdjustedPriority: 549.8742857142857,
  },
  {
    rank: 30,
    name: "Mark Spain Real Estate",
    cohort: "Services",
    investmentGroup: "Elevate",
    revenue: 100,
    ebitda: 15.0,
    scores: { ebitdaImpact: 7, revenueEnablement: 8, riskReduction: 5, orgCapacity: 7, dataReadiness: 7, techInfrastructure: 7, timelineFit: 7, valueScore: 6.75, readinessScore: 7.0, priorityScore: 103.125 },
    quadrant: "Quick Win", track: "T1", trackDescription: "EBITDA Accelerators", implementationYear: "Year 1", implementationQuarter: "Q1-Q2", valueTheme: "Revenue Growth", platformClassification: "Platform", replicationPotential: 7, replicationCount: 14, adjustedPriority: 223.74441964285717, adjustedEbitda: 2.169642857142857, peNativeScore: 0, portfolioAdjustedPriority: 536.9866071428572,
  },
  {
    rank: 31,
    name: "AmeriVet Partners",
    cohort: "Healthcare",
    investmentGroup: "Elevate",
    revenue: 140,
    ebitda: 14.0,
    scores: { ebitdaImpact: 7, revenueEnablement: 7, riskReduction: 7, orgCapacity: 6, dataReadiness: 5, techInfrastructure: 5, timelineFit: 5, valueScore: 7.0, readinessScore: 5.35, priorityScore: 86.45 },
    quadrant: "Strategic", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Point", replicationPotential: 4, replicationCount: 7, adjustedPriority: 181.545, adjustedEbitda: 2.1, peNativeScore: 0, portfolioAdjustedPriority: 308.6265,
  },
  {
    rank: 32,
    name: "American Expediting",
    cohort: "Logistics",
    investmentGroup: "Small Business",
    revenue: 100,
    ebitda: 12.0,
    scores: { ebitdaImpact: 7, revenueEnablement: 7, riskReduction: 5, orgCapacity: 6, dataReadiness: 6, techInfrastructure: 6, timelineFit: 6, valueScore: 6.5, readinessScore: 6.0, priorityScore: 75.0 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Hybrid", replicationPotential: 8, replicationCount: 5, adjustedPriority: 125.35714285714285, adjustedEbitda: 1.6714285714285713, peNativeScore: 0, portfolioAdjustedPriority: 188.03571428571428,
  },
  {
    rank: 33,
    name: "50 Floor",
    cohort: "Consumer",
    investmentGroup: "Small Business",
    revenue: 150,
    ebitda: 12.0,
    scores: { ebitdaImpact: 6, revenueEnablement: 7, riskReduction: 5, orgCapacity: 5, dataReadiness: 5, techInfrastructure: 5, timelineFit: 5, valueScore: 6.0, readinessScore: 5.0, priorityScore: 66.0 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Point", replicationPotential: 4, replicationCount: 11, adjustedPriority: 101.82857142857142, adjustedEbitda: 1.5428571428571427, peNativeScore: 0, portfolioAdjustedPriority: 213.84,
  },
  {
    rank: 34,
    name: "American Dental",
    cohort: "Healthcare",
    investmentGroup: "Elevate",
    revenue: 100,
    ebitda: 10.0,
    scores: { ebitdaImpact: 7, revenueEnablement: 7, riskReduction: 7, orgCapacity: 6, dataReadiness: 5, techInfrastructure: 5, timelineFit: 5, valueScore: 7.0, readinessScore: 5.35, priorityScore: 61.75 },
    quadrant: "Strategic", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Point", replicationPotential: 4, replicationCount: 7, adjustedPriority: 92.625, adjustedEbitda: 1.5, peNativeScore: 0, portfolioAdjustedPriority: 157.4625,
  },
  {
    rank: 35,
    name: "Crane Engineering",
    cohort: "Industrial",
    investmentGroup: "Small Business",
    revenue: 100,
    ebitda: 10.0,
    scores: { ebitdaImpact: 6, revenueEnablement: 5, riskReduction: 6, orgCapacity: 5, dataReadiness: 5, techInfrastructure: 5, timelineFit: 5, valueScore: 5.75, readinessScore: 5.0, priorityScore: 53.75 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Hybrid", replicationPotential: 5, replicationCount: 17, adjustedPriority: 66.22767857142857, adjustedEbitda: 1.2321428571428572, peNativeScore: 0, portfolioAdjustedPriority: 178.81473214285714,
  },
  {
    rank: 36,
    name: "EZ Texting",
    cohort: "Services",
    investmentGroup: "Elevate",
    revenue: 50,
    ebitda: 7.5,
    scores: { ebitdaImpact: 7, revenueEnablement: 8, riskReduction: 5, orgCapacity: 9, dataReadiness: 9, techInfrastructure: 9, timelineFit: 9, valueScore: 6.75, readinessScore: 9.0, priorityScore: 59.0625 },
    quadrant: "Quick Win", track: "T1", trackDescription: "EBITDA Accelerators", implementationYear: "Year 1", implementationQuarter: "Q1-Q2", valueTheme: "Revenue Growth", platformClassification: "Platform", replicationPotential: 8, replicationCount: 14, adjustedPriority: 64.072265625, adjustedEbitda: 1.0848214285714286, peNativeScore: 0, portfolioAdjustedPriority: 153.77343750000003,
  },
  {
    rank: 37,
    name: "Chemical Guys",
    cohort: "Consumer",
    investmentGroup: "Middle Market",
    revenue: 100,
    ebitda: 8.0,
    scores: { ebitdaImpact: 7, revenueEnablement: 8, riskReduction: 5, orgCapacity: 7, dataReadiness: 7, techInfrastructure: 7, timelineFit: 7, valueScore: 6.75, readinessScore: 7.0, priorityScore: 55.0 },
    quadrant: "Quick Win", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Revenue Growth", platformClassification: "Hybrid", replicationPotential: 6, replicationCount: 11, adjustedPriority: 63.64285714285714, adjustedEbitda: 1.157142857142857, peNativeScore: 0, portfolioAdjustedPriority: 133.65,
  },
  {
    rank: 38,
    name: "P&B Intermodal",
    cohort: "Logistics",
    investmentGroup: "Small Business",
    revenue: 75,
    ebitda: 9.0,
    scores: { ebitdaImpact: 7, revenueEnablement: 6, riskReduction: 5, orgCapacity: 5, dataReadiness: 5, techInfrastructure: 5, timelineFit: 5, valueScore: 6.25, readinessScore: 5.0, priorityScore: 50.625 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Hybrid", replicationPotential: 5, replicationCount: 5, adjustedPriority: 61.02120535714285, adjustedEbitda: 1.2053571428571428, peNativeScore: 0, portfolioAdjustedPriority: 91.53180803571428,
  },
  {
    rank: 39,
    name: "TileBar",
    cohort: "Consumer",
    investmentGroup: "Middle Market",
    revenue: 100,
    ebitda: 8.0,
    scores: { ebitdaImpact: 6, revenueEnablement: 7, riskReduction: 5, orgCapacity: 6, dataReadiness: 6, techInfrastructure: 6, timelineFit: 6, valueScore: 6.0, readinessScore: 6.0, priorityScore: 48.0 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Hybrid", replicationPotential: 6, replicationCount: 11, adjustedPriority: 49.37142857142857, adjustedEbitda: 1.0285714285714285, peNativeScore: 0, portfolioAdjustedPriority: 103.67999999999999,
  },
  {
    rank: 40,
    name: "Splash Car Wash",
    cohort: "Consumer",
    investmentGroup: "Small Business",
    revenue: 100,
    ebitda: 8.0,
    scores: { ebitdaImpact: 6, revenueEnablement: 7, riskReduction: 5, orgCapacity: 5, dataReadiness: 5, techInfrastructure: 5, timelineFit: 5, valueScore: 6.0, readinessScore: 5.0, priorityScore: 44.0 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Point", replicationPotential: 4, replicationCount: 11, adjustedPriority: 45.25714285714285, adjustedEbitda: 1.0285714285714285, peNativeScore: 0, portfolioAdjustedPriority: 95.03999999999999,
  },
  {
    rank: 41,
    name: "Rees Scientific",
    cohort: "Services",
    investmentGroup: "Small Business",
    revenue: 50,
    ebitda: 7.5,
    scores: { ebitdaImpact: 6, revenueEnablement: 6, riskReduction: 6, orgCapacity: 6, dataReadiness: 6, techInfrastructure: 6, timelineFit: 6, valueScore: 6.0, readinessScore: 6.0, priorityScore: 45.0 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Hybrid", replicationPotential: 6, replicationCount: 14, adjustedPriority: 43.39285714285714, adjustedEbitda: 0.9642857142857142, peNativeScore: 0, portfolioAdjustedPriority: 104.14285714285715,
  },
  {
    rank: 42,
    name: "Meritus Gas Partners",
    cohort: "Industrial",
    investmentGroup: "Small Business",
    revenue: 80,
    ebitda: 8.0,
    scores: { ebitdaImpact: 6, revenueEnablement: 5, riskReduction: 6, orgCapacity: 5, dataReadiness: 5, techInfrastructure: 5, timelineFit: 5, valueScore: 5.75, readinessScore: 5.0, priorityScore: 43.0 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Point", replicationPotential: 4, replicationCount: 17, adjustedPriority: 42.385714285714286, adjustedEbitda: 0.9857142857142857, peNativeScore: 0, portfolioAdjustedPriority: 114.44142857142857,
  },
  {
    rank: 43,
    name: "Monroe Engineering",
    cohort: "Industrial",
    investmentGroup: "Small Business",
    revenue: 80,
    ebitda: 8.0,
    scores: { ebitdaImpact: 6, revenueEnablement: 5, riskReduction: 6, orgCapacity: 5, dataReadiness: 5, techInfrastructure: 5, timelineFit: 5, valueScore: 5.75, readinessScore: 5.0, priorityScore: 43.0 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Point", replicationPotential: 4, replicationCount: 17, adjustedPriority: 42.385714285714286, adjustedEbitda: 0.9857142857142857, peNativeScore: 0, portfolioAdjustedPriority: 114.44142857142857,
  },
  {
    rank: 44,
    name: "WorldWide Electric",
    cohort: "Industrial",
    investmentGroup: "Small Business",
    revenue: 75,
    ebitda: 7.5,
    scores: { ebitdaImpact: 6, revenueEnablement: 5, riskReduction: 6, orgCapacity: 5, dataReadiness: 5, techInfrastructure: 5, timelineFit: 5, valueScore: 5.75, readinessScore: 5.0, priorityScore: 40.3125 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Point", replicationPotential: 4, replicationCount: 17, adjustedPriority: 37.25306919642857, adjustedEbitda: 0.9241071428571428, peNativeScore: 0, portfolioAdjustedPriority: 100.58328683035714,
  },
  {
    rank: 45,
    name: "Commonwealth Pain",
    cohort: "Healthcare",
    investmentGroup: "Elevate",
    revenue: 50,
    ebitda: 5.0,
    scores: { ebitdaImpact: 6, revenueEnablement: 6, riskReduction: 8, orgCapacity: 5, dataReadiness: 5, techInfrastructure: 5, timelineFit: 5, valueScore: 6.5, readinessScore: 5.0, priorityScore: 28.75 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Point", replicationPotential: 3, replicationCount: 7, adjustedPriority: 20.022321428571427, adjustedEbitda: 0.6964285714285714, peNativeScore: 0, portfolioAdjustedPriority: 34.03794642857143,
  },
  {
    rank: 46,
    name: "Unisyn Precision",
    cohort: "Industrial",
    investmentGroup: "Small Business",
    revenue: 50,
    ebitda: 5.0,
    scores: { ebitdaImpact: 6, revenueEnablement: 5, riskReduction: 6, orgCapacity: 5, dataReadiness: 5, techInfrastructure: 5, timelineFit: 5, valueScore: 5.75, readinessScore: 5.0, priorityScore: 26.875 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Point", replicationPotential: 4, replicationCount: 17, adjustedPriority: 16.556919642857142, adjustedEbitda: 0.6160714285714286, peNativeScore: 0, portfolioAdjustedPriority: 44.703683035714285,
  },
  {
    rank: 47,
    name: "Cenegenics",
    cohort: "Healthcare",
    investmentGroup: "Elevate",
    revenue: 38,
    ebitda: 3.8,
    scores: { ebitdaImpact: 6, revenueEnablement: 7, riskReduction: 7, orgCapacity: 6, dataReadiness: 5, techInfrastructure: 6, timelineFit: 6, valueScore: 6.5, readinessScore: 5.65, priorityScore: 23.085 },
    quadrant: "Foundation", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Point", replicationPotential: 4, replicationCount: 7, adjustedPriority: 12.218560714285712, adjustedEbitda: 0.5292857142857142, peNativeScore: 0, portfolioAdjustedPriority: 20.771553214285714,
  },
  {
    rank: 48,
    name: "Montway",
    cohort: "Logistics",
    investmentGroup: "Small Business",
    revenue: 30,
    ebitda: 3.6,
    scores: { ebitdaImpact: 7, revenueEnablement: 7, riskReduction: 5, orgCapacity: 7, dataReadiness: 7, techInfrastructure: 7, timelineFit: 7, valueScore: 6.5, readinessScore: 7.0, priorityScore: 24.3 },
    quadrant: "Quick Win", track: "T1", trackDescription: "EBITDA Accelerators", implementationYear: "Year 1", implementationQuarter: "Q1-Q2", valueTheme: "Margin Expansion", platformClassification: "Platform", replicationPotential: 7, replicationCount: 5, adjustedPriority: 12.184714285714286, adjustedEbitda: 0.5014285714285714, peNativeScore: 0, portfolioAdjustedPriority: 18.27707142857143,
  },
  {
    rank: 49,
    name: "Impetus Wellness",
    cohort: "Consumer",
    investmentGroup: "Small Business",
    revenue: 50,
    ebitda: 4.0,
    scores: { ebitdaImpact: 6, revenueEnablement: 6, riskReduction: 5, orgCapacity: 5, dataReadiness: 5, techInfrastructure: 5, timelineFit: 5, valueScore: 5.75, readinessScore: 5.0, priorityScore: 21.5 },
    quadrant: "Foundation", track: "T3", trackDescription: "Exit Multiplier Plays", implementationYear: "Year 3-4", implementationQuarter: "Q4+", valueTheme: "Margin Expansion", platformClassification: "Point", replicationPotential: 3, replicationCount: 11, adjustedPriority: 10.596428571428572, adjustedEbitda: 0.4928571428571428, peNativeScore: 0, portfolioAdjustedPriority: 22.2525,
  },
  {
    rank: 50,
    name: "Bespoke Partners",
    cohort: "Services",
    investmentGroup: "Elevate",
    revenue: 20,
    ebitda: 3.0,
    scores: { ebitdaImpact: 6, revenueEnablement: 7, riskReduction: 5, orgCapacity: 8, dataReadiness: 7, techInfrastructure: 8, timelineFit: 8, valueScore: 6.0, readinessScore: 7.649999999999999, priorityScore: 20.475 },
    quadrant: "Quick Win", track: "T2", trackDescription: "Growth Enablers", implementationYear: "Year 2-3", implementationQuarter: "Q2-Q4", valueTheme: "Margin Expansion", platformClassification: "Platform", replicationPotential: 7, replicationCount: 14, adjustedPriority: 7.897499999999998, adjustedEbitda: 0.3857142857142857, peNativeScore: 0, portfolioAdjustedPriority: 18.953999999999997,
  },
  {
    rank: 51,
    name: "Barnet Products",
    cohort: "Consumer",
    investmentGroup: "Small Business",
    revenue: 50,
    ebitda: 4.0,
    scores: { ebitdaImpact: 5, revenueEnablement: 5, riskReduction: 5, orgCapacity: 4, dataReadiness: 4, techInfrastructure: 4, timelineFit: 4, valueScore: 5.0, readinessScore: 4.0, priorityScore: 18.0 },
    quadrant: "Foundation", track: "T3", trackDescription: "Exit Multiplier Plays", implementationYear: "Year 3-4", implementationQuarter: "Q4+", valueTheme: "Margin Expansion", platformClassification: "Point", replicationPotential: 3, replicationCount: 11, adjustedPriority: 7.7142857142857135, adjustedEbitda: 0.4285714285714285, peNativeScore: 0, portfolioAdjustedPriority: 16.2,
  },
  {
    rank: 52,
    name: "AS Software",
    cohort: "Healthcare",
    investmentGroup: "Elevate",
    revenue: 20,
    ebitda: 2.0,
    scores: { ebitdaImpact: 7, revenueEnablement: 8, riskReduction: 6, orgCapacity: 8, dataReadiness: 8, techInfrastructure: 8, timelineFit: 8, valueScore: 7.0, readinessScore: 7.999999999999999, priorityScore: 15.0 },
    quadrant: "Champion", track: "T3", trackDescription: "Exit Multiplier Plays", implementationYear: "Year 3-4", implementationQuarter: "Q4+", valueTheme: "Revenue Growth", platformClassification: "Platform", replicationPotential: 7, replicationCount: 7, adjustedPriority: 4.5, adjustedEbitda: 0.3, peNativeScore: 0, portfolioAdjustedPriority: 7.65,
  },
  {
    rank: 53,
    name: "Chemtron RiverBend",
    cohort: "Industrial",
    investmentGroup: "Small Business",
    revenue: 20,
    ebitda: 2.0,
    scores: { ebitdaImpact: 5, revenueEnablement: 5, riskReduction: 5, orgCapacity: 4, dataReadiness: 4, techInfrastructure: 4, timelineFit: 4, valueScore: 5.0, readinessScore: 4.0, priorityScore: 9.0 },
    quadrant: "Foundation", track: "T3", trackDescription: "Exit Multiplier Plays", implementationYear: "Year 3-4", implementationQuarter: "Q4+", valueTheme: "Margin Expansion", platformClassification: "Point", replicationPotential: 4, replicationCount: 17, adjustedPriority: 1.9285714285714284, adjustedEbitda: 0.2142857142857142, peNativeScore: 0, portfolioAdjustedPriority: 5.207142857142857,
  },
  {
    rank: 54,
    name: "Cimsense",
    cohort: "Industrial",
    investmentGroup: "Small Business",
    revenue: 10,
    ebitda: 1.0,
    scores: { ebitdaImpact: 6, revenueEnablement: 5, riskReduction: 5, orgCapacity: 5, dataReadiness: 4, techInfrastructure: 5, timelineFit: 5, valueScore: 5.5, readinessScore: 4.65, priorityScore: 5.075 },
    quadrant: "Foundation", track: "T3", trackDescription: "Exit Multiplier Plays", implementationYear: "Year 3-4", implementationQuarter: "Q4+", valueTheme: "Margin Expansion", platformClassification: "Point", replicationPotential: 4, replicationCount: 17, adjustedPriority: 0.598125, adjustedEbitda: 0.1178571428571428, peNativeScore: 0, portfolioAdjustedPriority: 1.6149375000000001,
  },
];

// ============================================================================
// Computed Stats Helper
// ============================================================================

export function computeStats(companies: Company[]): PortfolioStats {
  const quadrantDistribution: QuadrantDistribution = {
    champion: 0,
    quickWin: 0,
    strategic: 0,
    foundation: 0,
  };

  const trackDistribution: TrackDistribution = { t1: 0, t2: 0, t3: 0 };

  const cohortDistribution: CohortDistribution = {
    industrial: 0,
    services: 0,
    consumer: 0,
    healthcare: 0,
    logistics: 0,
  };

  const valueThemeDistribution: ValueThemeDistribution = {
    revenueGrowth: 0,
    marginExpansion: 0,
    costCutting: 0,
  };

  let totalRevenue = 0;
  let totalEbitda = 0;
  let totalEbitdaOpportunity = 0;

  for (const c of companies) {
    totalRevenue += c.revenue;
    totalEbitda += c.ebitda;
    totalEbitdaOpportunity += c.adjustedEbitda;

    // Quadrant
    switch (c.quadrant) {
      case "Champion":
        quadrantDistribution.champion++;
        break;
      case "Quick Win":
        quadrantDistribution.quickWin++;
        break;
      case "Strategic":
        quadrantDistribution.strategic++;
        break;
      case "Foundation":
        quadrantDistribution.foundation++;
        break;
    }

    // Track
    switch (c.track) {
      case "T1":
        trackDistribution.t1++;
        break;
      case "T2":
        trackDistribution.t2++;
        break;
      case "T3":
        trackDistribution.t3++;
        break;
    }

    // Cohort
    switch (c.cohort) {
      case "Industrial":
        cohortDistribution.industrial++;
        break;
      case "Services":
        cohortDistribution.services++;
        break;
      case "Consumer":
        cohortDistribution.consumer++;
        break;
      case "Healthcare":
        cohortDistribution.healthcare++;
        break;
      case "Logistics":
        cohortDistribution.logistics++;
        break;
    }

    // Value Theme
    switch (c.valueTheme) {
      case "Revenue Growth":
        valueThemeDistribution.revenueGrowth++;
        break;
      case "Margin Expansion":
        valueThemeDistribution.marginExpansion++;
        break;
      case "Cost Cutting":
        valueThemeDistribution.costCutting++;
        break;
    }
  }

  return {
    totalCompanies: companies.length,
    totalRevenue,
    totalEbitda,
    totalEbitdaOpportunity,
    quadrantDistribution,
    trackDistribution,
    cohortDistribution,
    valueThemeDistribution,
  };
}

// ============================================================================
// Filter Types & Logic
// ============================================================================

export interface PortfolioFilters {
  selectedCohorts: Cohort[];
  selectedQuadrants: Quadrant[];
  selectedTracks: Track[];
  selectedInvestmentGroups: InvestmentGroup[];
  searchQuery: string;
}

const DEFAULT_FILTERS: PortfolioFilters = {
  selectedCohorts: [],
  selectedQuadrants: [],
  selectedTracks: [],
  selectedInvestmentGroups: [],
  searchQuery: "",
};

function applyFilters(
  companies: Company[],
  filters: PortfolioFilters
): Company[] {
  return companies.filter((c) => {
    if (
      filters.selectedCohorts.length > 0 &&
      !filters.selectedCohorts.includes(c.cohort)
    ) {
      return false;
    }
    if (
      filters.selectedQuadrants.length > 0 &&
      !filters.selectedQuadrants.includes(c.quadrant)
    ) {
      return false;
    }
    if (
      filters.selectedTracks.length > 0 &&
      !filters.selectedTracks.includes(c.track)
    ) {
      return false;
    }
    if (
      filters.selectedInvestmentGroups.length > 0 &&
      !filters.selectedInvestmentGroups.includes(c.investmentGroup)
    ) {
      return false;
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.cohort.toLowerCase().includes(q) ||
        c.trackDescription.toLowerCase().includes(q) ||
        c.valueTheme.toLowerCase().includes(q)
      );
    }
    return true;
  });
}

// ============================================================================
// Zustand Store
// ============================================================================

interface PortfolioState {
  // Data
  companies: Company[];
  stats: PortfolioStats;

  // Selection
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;

  // Filters
  filters: PortfolioFilters;
  setFilter: <K extends keyof PortfolioFilters>(
    key: K,
    value: PortfolioFilters[K]
  ) => void;
  clearFilters: () => void;

  // Derived
  getFilteredCompanies: () => Company[];
  getFilteredStats: () => PortfolioStats;
  getTopCompanies: (count: number) => Company[];
  getCompaniesByQuadrant: (quadrant: Quadrant) => Company[];
  getCompaniesByTrack: (track: Track) => Company[];
  getCompaniesByValueTheme: (theme: ValueTheme) => Company[];
  getPlatformCount: () => number;
  getReplicationOpportunities: () => number;

  // What-if score updates (local only, no DB yet)
  updateCompanyScores: (
    rank: number,
    scores: Partial<Company["scores"]>
  ) => void;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  // Data
  companies: PORTFOLIO_COMPANIES,
  stats: computeStats(PORTFOLIO_COMPANIES),

  // Selection
  selectedCompany: null,
  setSelectedCompany: (company) => set({ selectedCompany: company }),

  // Filters
  filters: { ...DEFAULT_FILTERS },

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  clearFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  // Derived getters
  getFilteredCompanies: () => {
    const { companies, filters } = get();
    return applyFilters(companies, filters);
  },

  getFilteredStats: () => {
    const filtered = get().getFilteredCompanies();
    return computeStats(filtered);
  },

  getTopCompanies: (count: number) => {
    return [...get().companies]
      .sort(
        (a, b) => b.portfolioAdjustedPriority - a.portfolioAdjustedPriority
      )
      .slice(0, count);
  },

  getCompaniesByQuadrant: (quadrant: Quadrant) => {
    return get().companies.filter((c) => c.quadrant === quadrant);
  },

  getCompaniesByTrack: (track: Track) => {
    return get().companies.filter((c) => c.track === track);
  },

  getCompaniesByValueTheme: (theme: ValueTheme) => {
    return get().companies.filter((c) => c.valueTheme === theme);
  },

  getPlatformCount: () => {
    return get().companies.filter(
      (c) => c.platformClassification === "Platform"
    ).length;
  },

  getReplicationOpportunities: () => {
    return get().companies.reduce((sum, c) => sum + c.replicationCount, 0);
  },

  // What-if score updates
  updateCompanyScores: (rank, newScores) =>
    set((state) => {
      const companies = state.companies.map((c) => {
        if (c.rank !== rank) return c;
        return {
          ...c,
          scores: { ...c.scores, ...newScores },
        };
      });
      return { companies, stats: computeStats(companies) };
    }),
}));
