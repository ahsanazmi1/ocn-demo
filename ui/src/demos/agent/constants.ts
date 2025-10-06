export const COLORS = {
  purple: "#5063BF",
  aqua: "#8EDFEB",
  green: "#10B981",
  dark: "#414B77",
  medium: "#6F6F77",
  light: "#FAFAFD",
  shadow8: "rgba(80,99,191,0.08)",
  shadow25: "rgba(80,99,191,0.25)",
};

export const AGENT_LABEL: Record<string, string> = {
  orca: "Orca — Checkout",
  opal: "Opal — Wallet",
  okra: "Okra — Credit",
  onyx: "Onyx — Trust",
  olive: "Olive — Loyalty",
  weave: "Weave — Routing",
};

export const AGENT_EMOJI: Record<string, string> = {
  orca: "🦈",
  opal: "💎",
  okra: "🦏",
  onyx: "🖤",
  olive: "🫒",
  weave: "🌊",
};

export const AGENT_COLORS: Record<string, string> = {
  onyx: "bg-ocn-dark text-white",
  okra: "bg-ocn-purple text-white",
  opal: "bg-ocn-aqua text-ocn-dark",
  olive: "bg-green-600 text-white",
  weave: "bg-blue-600 text-white",
  orca: "bg-orange-600 text-white",
};

export const VERBOSITY_LEVELS = {
  brief: "Brief",
  standard: "Standard", 
  forensics: "Forensics",
} as const;

export const CREDIT_OPTIONS = {
  bnpl: "BNPL",
  revolving: "Revolving",
} as const;

export const DECISION_TYPES = {
  allow: "Allow",
  review: "Review",
  decline: "Decline",
  propose_alt: "Propose Alternative",
} as const;

export const SCORE_TYPES = {
  risk: "Risk",
  cost: "Cost",
  suitability: "Suitability",
} as const;

export const OXFORD_CART = {
  items: [
    {
      sku: "OXFORD-SLIM-CREW-M",
      name: "Slim-Fit Crew Oxford (M)",
      qty: 2,
      price: 120
    },
    {
      sku: "BLAZER-NAVY-40R", 
      name: "Navy Blazer",
      qty: 1,
      price: 140
    }
  ],
  currency: "USD" as const,
  subtotal: 380,
  tax: 30.40,
  total: 410.40
};

export const AGENT_SEQUENCE: string[] = [
  "onyx",  // Trust verification first
  "okra",  // Credit assessment
  "opal",  // Wallet optimization
  "olive", // Loyalty incentives
  "weave", // Auction/routing
  "orca",  // Finalization
  "weave", // Post-auth
];

export const TIMING_CONFIG = {
  minDelay: 1500,
  maxDelay: 2500,
  agentProcessingTime: 2000,
} as const;

export const SCORE_THRESHOLDS = {
  excellent: 9.0,
  good: 7.0,
  fair: 5.0,
  poor: 3.0,
} as const;

export const UNCERTAINTY_LEVELS = {
  high: 0.3,
  medium: 0.15,
  low: 0.05,
} as const;

// Helper functions
export const getScoreColor = (score: number, scoreType: string): string => {
  if (scoreType === 'cost') {
    return score >= SCORE_THRESHOLDS.good ? 'text-green-600' : 
           score >= SCORE_THRESHOLDS.fair ? 'text-yellow-600' : 'text-red-600';
  }
  return score >= SCORE_THRESHOLDS.good ? 'text-green-600' : 
         score >= SCORE_THRESHOLDS.fair ? 'text-yellow-600' : 'text-red-600';
};

export const getUncertaintyColor = (uncertainty: number): string => {
  if (uncertainty >= UNCERTAINTY_LEVELS.high) return 'text-red-600';
  if (uncertainty >= UNCERTAINTY_LEVELS.medium) return 'text-yellow-600';
  return 'text-green-600';
};

export const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString();
};

export const generateTraceId = (): string => {
  return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getAgentDisplayName = (agent: string): string => {
  return AGENT_LABEL[agent] || agent;
};

export const getAgentEmoji = (agent: string): string => {
  return AGENT_EMOJI[agent] || "🤖";
};

export const getAgentColor = (agent: string): string => {
  return AGENT_COLORS[agent] || 'bg-gray-600 text-white';
};

