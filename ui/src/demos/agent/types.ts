export type Agent = "orca" | "opal" | "okra" | "onyx" | "olive" | "weave" | "system";

export type KeySignal = { 
  path: string; 
  value: unknown; 
  weight?: number 
};

export type Explanation = {
  trace_id: string;
  step_id: string;
  agent: Agent;
  model_version: string;
  policy_version: string;
  summary: string;              // 1–3 sentences, human-readable
  decision: "allow" | "review" | "decline" | "propose_alt" | "error" | "pending";
  score?: number;               // risk/cost/suitability
  score_type?: ScoreType;       // type of score
  uncertainty?: number;         // 0..1
  key_signals?: KeySignal[];
  ap2_refs?: string[];
  guardrails?: { 
    rules_fired?: string[]; 
    limits_ok?: boolean 
  };
  redactions?: string[];        // paths to mask in the JSON viewer
  timestamp: string;
  extra?: Record<string, unknown>;
};

export type Verbosity = "brief" | "standard" | "forensics";

export type CartItem = { 
  sku: string; 
  name: string; 
  qty: number; 
  price: number 
};

export type Cart = { 
  items: CartItem[]; 
  currency: "USD"; 
  subtotal: number;
  tax: number;
  total: number 
};

export type CreditOption = "bnpl" | "revolving";

export type ScoreType = "risk" | "cost" | "suitability" | "security" | "success" | "error" | "value" | "affordability" | "trust" | "optimization" | "efficiency" | "completeness" | "final";

export type Evidence = {
  key_signals: string[];
  ap2_refs: string[];
  redacted_fields: string[];
};

export type ExplanationPayload = {
  agent: string;
  summary: string;
  decision: string;
  score: number;
  score_type: ScoreType;
  uncertainty: number;
  policy_version: string;
  model_version: string;
  trace_id: string;
  evidence?: Evidence;
  timestamp: string;
};

