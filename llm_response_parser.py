"""
LLM-based Response Parser for Agent Communication

This module uses LLM to parse agent responses and extract structured data
that can be fed into ML models for enhanced decision making.
"""

import json
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime
import requests

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ParsedAgentResponse:
    """Structured representation of parsed agent response."""
    agent_name: str
    response_type: str
    extracted_features: Dict[str, Any]
    confidence_score: float
    raw_response: Dict[str, Any]
    timestamp: str
    ml_ready_data: Dict[str, Any]

class LLMResponseParser:
    """LLM-based parser for agent responses."""
    
    def __init__(self, openai_api_key: Optional[str] = None, model: str = "gpt-4o-mini"):
        self.openai_api_key = openai_api_key
        self.model = model
        self.base_url = "https://api.openai.com/v1/chat/completions"
        
    def parse_agent_response(self, agent_name: str, response: Dict[str, Any]) -> ParsedAgentResponse:
        """
        Parse agent response using LLM to extract structured data.
        
        Args:
            agent_name: Name of the agent (okra, onyx, opal, etc.)
            response: Raw response from the agent
            
        Returns:
            ParsedAgentResponse with structured data
        """
        try:
            # Create LLM prompt for parsing
            prompt = self._create_parsing_prompt(agent_name, response)
            
            # Call LLM for parsing
            parsed_data = self._call_llm_for_parsing(prompt)
            
            # Extract ML-ready features
            ml_ready_data = self._extract_ml_features(agent_name, parsed_data, response)
            
            return ParsedAgentResponse(
                agent_name=agent_name,
                response_type=parsed_data.get("response_type", "unknown"),
                extracted_features=parsed_data.get("features", {}),
                confidence_score=parsed_data.get("confidence_score", 0.5),
                raw_response=response,
                timestamp=datetime.now().isoformat(),
                ml_ready_data=ml_ready_data
            )
            
        except Exception as e:
            logger.error(f"Error parsing {agent_name} response: {e}")
            # Return fallback parsing
            return self._fallback_parsing(agent_name, response)
    
    def _create_parsing_prompt(self, agent_name: str, response: Dict[str, Any]) -> str:
        """Create LLM prompt for parsing agent response."""
        
        agent_schemas = {
            "okra": {
                "description": "Credit assessment agent",
                "key_fields": ["approved", "credit_limit", "apr", "risk_score", "reasons"],
                "ml_features": ["approval_probability", "risk_level", "credit_worthiness"]
            },
            "onyx": {
                "description": "Trust and compliance agent", 
                "key_fields": ["trust_score", "compliance_status", "risk_factors", "sanctions_check"],
                "ml_features": ["trust_level", "compliance_risk", "sanctions_risk"]
            },
            "opal": {
                "description": "Wallet and payment method agent",
                "key_fields": ["payment_methods", "fees", "processing_time", "security_features"],
                "ml_features": ["method_preference", "cost_efficiency", "security_score"]
            },
            "orca": {
                "description": "Checkout and decision agent",
                "key_fields": ["optimal_rail", "confidence", "cost_analysis", "risk_assessment"],
                "ml_features": ["rail_preference", "decision_confidence", "cost_optimization"]
            },
            "olive": {
                "description": "Loyalty and incentives agent",
                "key_fields": ["incentives", "loyalty_tier", "discounts", "rewards"],
                "ml_features": ["loyalty_value", "incentive_attractiveness", "retention_probability"]
            },
            "weave": {
                "description": "Processor and auction agent",
                "key_fields": ["auction_results", "processor_rankings", "cost_analysis", "performance_metrics"],
                "ml_features": ["processor_efficiency", "cost_optimization", "performance_score"]
            }
        }
        
        schema = agent_schemas.get(agent_name, agent_schemas["orca"])
        
        prompt = f"""
You are an expert at parsing payment processing agent responses. Your task is to extract structured data from the {agent_name} agent response.

Agent Description: {schema['description']}
Key Fields to Extract: {', '.join(schema['key_fields'])}
ML Features to Generate: {', '.join(schema['ml_features'])}

Raw Response:
{json.dumps(response, indent=2)}

Please parse this response and return a JSON object with the following structure:
{{
    "response_type": "string describing the type of response",
    "features": {{
        "key_field_1": "extracted_value",
        "key_field_2": "extracted_value",
        ...
    }},
    "confidence_score": 0.0-1.0,
    "ml_features": {{
        "feature_1": numerical_value,
        "feature_2": numerical_value,
        ...
    }},
    "insights": [
        "key insight 1",
        "key insight 2"
    ],
    "risk_indicators": [
        "risk factor 1",
        "risk factor 2"
    ]
}}

Focus on extracting numerical values that can be used by ML models for decision making.
"""
        return prompt
    
    def _call_llm_for_parsing(self, prompt: str) -> Dict[str, Any]:
        """Call LLM to parse the response."""
        
        if not self.openai_api_key:
            logger.warning("No OpenAI API key provided, using fallback parsing")
            return self._fallback_llm_response()
        
        try:
            headers = {
                "Authorization": f"Bearer {self.openai_api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": "You are an expert at parsing payment processing data. Always return valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.1,
                "max_tokens": 1000
            }
            
            response = requests.post(self.base_url, headers=headers, json=payload, timeout=10)
            response.raise_for_status()
            
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            
            # Parse JSON response
            return json.loads(content)
            
        except Exception as e:
            logger.error(f"LLM parsing failed: {e}")
            return self._fallback_llm_response()
    
    def _extract_ml_features(self, agent_name: str, parsed_data: Dict[str, Any], raw_response: Dict[str, Any]) -> Dict[str, Any]:
        """Extract ML-ready features from parsed data."""
        
        ml_features = {}
        
        # Common ML features across all agents
        ml_features["response_confidence"] = parsed_data.get("confidence_score", 0.5)
        ml_features["response_completeness"] = len(parsed_data.get("features", {})) / 5.0  # Normalize to 0-1
        
        # Agent-specific ML feature extraction
        if agent_name == "okra":
            features = parsed_data.get("features", {})
            ml_features["approval_probability"] = 1.0 if features.get("approved") else 0.0
            ml_features["credit_risk_score"] = self._normalize_risk_score(features.get("risk_score", 0.5))
            ml_features["credit_limit_ratio"] = min(features.get("credit_limit", 0) / 10000.0, 1.0)
            
        elif agent_name == "onyx":
            features = parsed_data.get("features", {})
            ml_features["trust_score"] = features.get("trust_score", 0.5)
            ml_features["compliance_risk"] = 1.0 - features.get("compliance_status", 0.5)
            ml_features["sanctions_risk"] = 1.0 if "sanctions" in str(features).lower() else 0.0
            
        elif agent_name == "opal":
            features = parsed_data.get("features", {})
            ml_features["payment_method_count"] = len(features.get("payment_methods", []))
            ml_features["avg_processing_fee"] = features.get("avg_fee", 0.03)
            ml_features["security_score"] = features.get("security_score", 0.8)
            
        elif agent_name == "orca":
            features = parsed_data.get("features", {})
            ml_features["decision_confidence"] = features.get("confidence", 0.5)
            ml_features["cost_optimization"] = 1.0 - min(features.get("cost_score", 0.5), 1.0)
            ml_features["rail_efficiency"] = features.get("efficiency_score", 0.7)
            
        elif agent_name == "olive":
            features = parsed_data.get("features", {})
            ml_features["loyalty_tier_score"] = self._map_loyalty_tier(features.get("loyalty_tier", "bronze"))
            ml_features["incentive_value"] = features.get("total_discount", 0) / 100.0
            ml_features["retention_probability"] = features.get("retention_score", 0.6)
            
        elif agent_name == "weave":
            features = parsed_data.get("features", {})
            ml_features["auction_efficiency"] = features.get("auction_success", 0.8)
            ml_features["cost_savings"] = features.get("cost_savings", 0.05)
            ml_features["processor_performance"] = features.get("performance_score", 0.7)
        
        return ml_features
    
    def _normalize_risk_score(self, risk_score: Any) -> float:
        """Normalize risk score to 0-1 range."""
        if isinstance(risk_score, (int, float)):
            return min(max(risk_score, 0.0), 1.0)
        elif isinstance(risk_score, str):
            risk_lower = risk_score.lower()
            if "low" in risk_lower:
                return 0.2
            elif "medium" in risk_lower:
                return 0.5
            elif "high" in risk_lower:
                return 0.8
        return 0.5
    
    def _map_loyalty_tier(self, tier: str) -> float:
        """Map loyalty tier to numerical score."""
        tier_mapping = {
            "bronze": 0.3,
            "silver": 0.5,
            "gold": 0.7,
            "platinum": 0.9,
            "diamond": 1.0
        }
        return tier_mapping.get(tier.lower(), 0.3)
    
    def _fallback_parsing(self, agent_name: str, response: Dict[str, Any]) -> ParsedAgentResponse:
        """Fallback parsing when LLM is not available."""
        
        # Simple rule-based parsing
        features = {}
        ml_features = {"response_confidence": 0.3, "response_completeness": 0.5}
        
        if agent_name == "okra":
            features["approved"] = response.get("approved", False)
            features["credit_limit"] = response.get("credit_limit", 0)
            ml_features["approval_probability"] = 1.0 if features["approved"] else 0.0
            
        elif agent_name == "onyx":
            features["trust_score"] = response.get("trust_score", 0.5)
            ml_features["trust_score"] = features["trust_score"]
            
        elif agent_name == "opal":
            features["payment_methods"] = response.get("payment_methods", [])
            ml_features["payment_method_count"] = len(features["payment_methods"])
            
        elif agent_name == "orca":
            features["optimal_rail"] = response.get("chosen_rail", "Card")
            features["confidence"] = response.get("confidence", 0.5)
            ml_features["decision_confidence"] = features["confidence"]
            
        elif agent_name == "olive":
            features["incentives"] = response.get("incentives", [])
            ml_features["incentive_value"] = len(features["incentives"]) * 0.1
            
        elif agent_name == "weave":
            features["auction_results"] = response.get("candidate_scores", [])
            ml_features["auction_efficiency"] = 0.8 if features["auction_results"] else 0.3
        
        return ParsedAgentResponse(
            agent_name=agent_name,
            response_type="fallback_parsed",
            extracted_features=features,
            confidence_score=0.3,
            raw_response=response,
            timestamp=datetime.now().isoformat(),
            ml_ready_data=ml_features
        )
    
    def _fallback_llm_response(self) -> Dict[str, Any]:
        """Fallback LLM response structure."""
        return {
            "response_type": "fallback",
            "features": {},
            "confidence_score": 0.3,
            "ml_features": {},
            "insights": ["Fallback parsing used"],
            "risk_indicators": []
        }

class MLModelEnhancer:
    """Enhances ML models with LLM-parsed data."""
    
    def __init__(self, parser: LLMResponseParser):
        self.parser = parser
        self.parsed_responses: List[ParsedAgentResponse] = []
    
    def add_agent_response(self, agent_name: str, response: Dict[str, Any]) -> ParsedAgentResponse:
        """Add and parse agent response."""
        parsed = self.parser.parse_agent_response(agent_name, response)
        self.parsed_responses.append(parsed)
        return parsed
    
    def get_enhanced_features(self) -> Dict[str, Any]:
        """Get enhanced features for ML model input."""
        
        enhanced_features = {}
        
        # Aggregate features from all parsed responses
        for parsed in self.parsed_responses:
            agent_features = parsed.ml_ready_data
            for key, value in agent_features.items():
                enhanced_features[f"{parsed.agent_name}_{key}"] = value
        
        # Add cross-agent insights
        enhanced_features["total_confidence"] = sum(p.confidence_score for p in self.parsed_responses) / len(self.parsed_responses)
        enhanced_features["response_completeness"] = sum(p.ml_ready_data.get("response_completeness", 0) for p in self.parsed_responses) / len(self.parsed_responses)
        
        # Add risk aggregation
        risk_features = [f for f in enhanced_features.keys() if "risk" in f.lower()]
        if risk_features:
            enhanced_features["aggregate_risk"] = sum(enhanced_features[f] for f in risk_features) / len(risk_features)
        
        return enhanced_features
    
    def get_decision_recommendation(self) -> Dict[str, Any]:
        """Get LLM-enhanced decision recommendation."""
        
        if not self.parsed_responses:
            return {"recommendation": "insufficient_data", "confidence": 0.0}
        
        # Simple rule-based decision logic (can be enhanced with actual ML model)
        total_confidence = sum(p.confidence_score for p in self.parsed_responses) / len(self.parsed_responses)
        
        # Check for critical risk factors
        high_risk_agents = [p for p in self.parsed_responses if p.ml_ready_data.get("risk_score", 0) > 0.7]
        
        if high_risk_agents:
            return {
                "recommendation": "decline",
                "confidence": total_confidence,
                "reason": f"High risk detected from {[a.agent_name for a in high_risk_agents]}",
                "risk_factors": [a.agent_name for a in high_risk_agents]
            }
        
        # Check approval status
        approval_agents = [p for p in self.parsed_responses if p.ml_ready_data.get("approval_probability", 0) > 0.5]
        
        if len(approval_agents) >= len(self.parsed_responses) * 0.7:  # 70% approval threshold
            return {
                "recommendation": "approve",
                "confidence": total_confidence,
                "reason": "Majority of agents recommend approval",
                "supporting_agents": [a.agent_name for a in approval_agents]
            }
        
        return {
            "recommendation": "review",
            "confidence": total_confidence,
            "reason": "Mixed signals from agents, manual review recommended"
        }

# Example usage and testing
def test_llm_parser():
    """Test the LLM parser with sample data."""
    
    parser = LLMResponseParser()  # No API key for testing
    enhancer = MLModelEnhancer(parser)
    
    # Sample agent responses
    sample_responses = {
        "okra": {
            "approved": True,
            "credit_limit": 5000,
            "apr": 7.99,
            "reasons": ["Good credit score", "Low risk profile"]
        },
        "onyx": {
            "trust_score": 0.85,
            "compliance_status": "verified",
            "sanctions_check": "clear"
        },
        "orca": {
            "chosen_rail": "ACH",
            "confidence": 0.8,
            "cost_score": 0.9
        }
    }
    
    # Parse responses
    for agent_name, response in sample_responses.items():
        parsed = enhancer.add_agent_response(agent_name, response)
        print(f"\n{agent_name.upper()} Parsed:")
        print(f"  Features: {parsed.extracted_features}")
        print(f"  ML Data: {parsed.ml_ready_data}")
        print(f"  Confidence: {parsed.confidence_score}")
    
    # Get enhanced features
    enhanced_features = enhancer.get_enhanced_features()
    print(f"\nEnhanced Features: {enhanced_features}")
    
    # Get decision recommendation
    recommendation = enhancer.get_decision_recommendation()
    print(f"\nDecision Recommendation: {recommendation}")

if __name__ == "__main__":
    test_llm_parser()

