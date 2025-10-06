#!/usr/bin/env python3
"""
Comprehensive test script to test all OCN agent API endpoints
and determine which are using mock vs real ML/LLM implementations.
"""

import json
import time
from typing import Dict, List, Any
import requests
from dataclasses import dataclass
from datetime import datetime
import concurrent.futures
from threading import Thread

@dataclass
class AgentEndpoint:
    agent: str
    port: int
    endpoint: str
    method: str = "GET"
    payload: Dict[str, Any] = None
    description: str = ""

@dataclass
class TestResult:
    agent: str
    endpoint: str
    status_code: int
    response_time: float
    response_data: Dict[str, Any]
    is_mock: bool
    analysis: str
    error: str = None

class AgentEndpointTester:
    def __init__(self):
        self.base_url = "http://localhost"
        self.results: List[TestResult] = []
        
        # Define all agent endpoints to test
        self.endpoints = [
            # Orca (8080) - Core Decision Engine
            AgentEndpoint("orca", 8080, "/", "GET", description="Root endpoint"),
            AgentEndpoint("orca", 8080, "/health", "GET", description="Health check"),
            AgentEndpoint("orca", 8080, "/healthz", "GET", description="Healthz check"),
            AgentEndpoint("orca", 8080, "/readyz", "GET", description="Readiness check"),
            AgentEndpoint("orca", 8080, "/decision", "POST", 
                         {"transaction": {"amount": 100.0, "currency": "USD"}, 
                          "context": {"merchant_id": "test_merchant"}}, 
                         description="Core decision endpoint"),
            AgentEndpoint("orca", 8080, "/explain", "POST",
                         {"decision_id": "test_decision", "transaction_id": "test_txn"},
                         description="Decision explanation endpoint"),
            AgentEndpoint("orca", 8080, "/negotiate", "POST",
                         {"offer": {"amount": 100.0, "terms": "standard"}},
                         description="Negotiation endpoint"),
            AgentEndpoint("orca", 8080, "/negotiation/status", "GET", description="Negotiation status"),
            
            # Orion (8081) - Optimization
            AgentEndpoint("orion", 8081, "/health", "GET", description="Health check"),
            AgentEndpoint("orion", 8081, "/optimize", "POST",
                         {"parameters": {"cost": 100.0, "risk": 0.5}},
                         description="Optimization endpoint"),
            
            # Weave (8082) - Auction & Receipts
            AgentEndpoint("weave", 8082, "/health", "GET", description="Health check"),
            AgentEndpoint("weave", 8082, "/auction/run", "POST",
                         {"participants": ["merchant1", "merchant2"], "amount": 100.0},
                         description="Auction endpoint"),
            AgentEndpoint("weave", 8082, "/auction/status", "GET", description="Auction status"),
            AgentEndpoint("weave", 8082, "/auction/sample-request", "GET", description="Sample auction request"),
            
            # Okra (8083) - Credit & BNPL
            AgentEndpoint("okra", 8083, "/", "GET", description="Root endpoint"),
            AgentEndpoint("okra", 8083, "/health", "GET", description="Health check"),
            AgentEndpoint("okra", 8083, "/policies", "GET", description="Credit policies"),
            AgentEndpoint("okra", 8083, "/credit/quote", "POST",
                         {"amount": 100.0, "customer_id": "test_customer"},
                         description="Credit quote endpoint"),
            AgentEndpoint("okra", 8083, "/bnpl/quote", "POST",
                         {"amount": 50.0, "customer_id": "test_customer"},
                         description="BNPL quote endpoint"),
            AgentEndpoint("okra", 8083, "/credit/quote/test_quote", "GET", description="Get credit quote"),
            
            # Opal (8084) - Wallet
            AgentEndpoint("opal", 8084, "/", "GET", description="Root endpoint"),
            AgentEndpoint("opal", 8084, "/health", "GET", description="Health check"),
            AgentEndpoint("opal", 8084, "/controls/limits", "GET", description="Control limits"),
            AgentEndpoint("opal", 8084, "/wallet/methods", "GET", description="Wallet methods"),
            AgentEndpoint("opal", 8084, "/wallet/select", "POST",
                         {"amount": 100.0, "currency": "USD", "preferences": {}},
                         description="Wallet selection endpoint"),
            AgentEndpoint("opal", 8084, "/negotiate-wallet-choice", "POST",
                         {"offer": {"method": "credit_card", "amount": 100.0}},
                         description="Wallet negotiation endpoint"),
            AgentEndpoint("opal", 8084, "/counter-negotiate", "POST",
                         {"counter_offer": {"method": "debit_card", "amount": 100.0}},
                         description="Counter negotiation endpoint"),
            AgentEndpoint("opal", 8084, "/negotiation/status", "GET", description="Negotiation status"),
            AgentEndpoint("opal", 8084, "/negotiation/sample-instruments", "GET", description="Sample instruments"),
            AgentEndpoint("opal", 8084, "/wallet/methods/test_method", "GET", description="Get wallet method"),
            
            # Oasis (8085) - Treasury
            AgentEndpoint("oasis", 8085, "/health", "GET", description="Health check"),
            AgentEndpoint("oasis", 8085, "/treasury/plan", "POST",
                         {"amount": 1000.0, "risk_tolerance": "medium"},
                         description="Treasury planning endpoint"),
            
            # Onyx (8086) - Trust Registry
            AgentEndpoint("onyx", 8086, "/health", "GET", description="Health check"),
            AgentEndpoint("onyx", 8086, "/trust/providers", "GET", description="Trust providers"),
            AgentEndpoint("onyx", 8086, "/trust/allowed/test_provider", "GET", description="Check if provider allowed"),
            AgentEndpoint("onyx", 8086, "/kyb/verify", "POST",
                         {"provider_id": "test_provider", "documents": []},
                         description="KYB verification endpoint"),
            AgentEndpoint("onyx", 8086, "/trust/signal", "POST",
                         {"provider_id": "test_provider", "signal_type": "positive"},
                         description="Trust signal endpoint"),
            AgentEndpoint("onyx", 8086, "/trust/signal/status", "GET", description="Trust signal status"),
            AgentEndpoint("onyx", 8086, "/trust/signal/sample-context", "GET", description="Sample trust context"),
            AgentEndpoint("onyx", 8086, "/v1/trust-registry/providers", "GET", description="Trust registry providers"),
            AgentEndpoint("onyx", 8086, "/v1/trust-registry/providers/test_provider", "GET", description="Get trust provider"),
            AgentEndpoint("onyx", 8086, "/v1/trust-registry/stats", "GET", description="Trust registry stats"),
            AgentEndpoint("onyx", 8086, "/v1/trust-signals", "POST",
                         {"provider_id": "test_provider", "signal": "positive"},
                         description="Trust signals endpoint"),
            
            # Olive (8087) - Incentives & Policies
            AgentEndpoint("olive", 8087, "/health", "GET", description="Health check"),
            AgentEndpoint("olive", 8087, "/incentives", "GET", description="Incentives list"),
            AgentEndpoint("olive", 8087, "/policies", "GET", description="Policies list"),
            AgentEndpoint("olive", 8087, "/policies", "POST",
                         {"policy_name": "test_policy", "rules": []},
                         description="Create policy endpoint"),
            AgentEndpoint("olive", 8087, "/policies/test_policy", "GET", description="Get policy"),
            AgentEndpoint("olive", 8087, "/policies/evaluate", "POST",
                         {"policy_id": "test_policy", "context": {}},
                         description="Policy evaluation endpoint"),
        ]

    def analyze_response(self, agent: str, endpoint: str, response_data: Dict[str, Any]) -> tuple[bool, str]:
        """Analyze response to determine if it's mock or real ML/LLM."""
        analysis_parts = []
        is_mock = False
        
        # Check for obvious mock indicators
        mock_indicators = [
            "mock", "fake", "test", "sample", "placeholder", "dummy",
            "static", "hardcoded", "example", "demo"
        ]
        
        response_str = json.dumps(response_data, default=str).lower()
        for indicator in mock_indicators:
            if indicator in response_str:
                is_mock = True
                analysis_parts.append(f"Contains mock indicator: '{indicator}'")
        
        # Check for ML/LLM specific indicators
        ml_indicators = [
            "model", "prediction", "confidence", "score", "probability",
            "neural", "tensor", "embedding", "inference", "generation",
            "llm", "openai", "azure", "gpt", "claude", "anthropic"
        ]
        
        ml_found = False
        for indicator in ml_indicators:
            if indicator in response_str:
                ml_found = True
                analysis_parts.append(f"Contains ML/LLM indicator: '{indicator}'")
        
        # Check for deterministic vs non-deterministic responses
        if isinstance(response_data, dict):
            # Check for timestamp variations (non-deterministic)
            timestamp_fields = ["timestamp", "created_at", "updated_at", "time"]
            for field in timestamp_fields:
                if field in response_data:
                    analysis_parts.append(f"Contains timestamp field: '{field}' (indicates real-time processing)")
                    break
            
            # Check for ID generation patterns
            id_fields = ["id", "request_id", "transaction_id", "decision_id"]
            for field in id_fields:
                if field in response_data:
                    field_value = str(response_data[field])
                    if len(field_value) > 10 or "-" in field_value or field_value.startswith("req_"):
                        analysis_parts.append(f"Contains generated ID: '{field}' (indicates real processing)")
                        break
        
        # Agent-specific analysis
        if agent == "orca":
            if "decision" in response_data and "explanation" in response_data:
                analysis_parts.append("Contains decision explanation (likely real ML)")
            if "confidence" in response_data or "score" in response_data:
                analysis_parts.append("Contains confidence scores (likely real ML)")
        
        elif agent == "opal":
            if "negotiation" in endpoint and "counter_offer" in response_data:
                analysis_parts.append("Contains negotiation logic (potentially real)")
        
        elif agent == "okra":
            if "credit_score" in response_data or "risk_assessment" in response_data:
                analysis_parts.append("Contains credit scoring (likely real ML)")
        
        elif agent == "onyx":
            if "verification_result" in response_data and "confidence" in response_data:
                analysis_parts.append("Contains verification confidence (likely real ML)")
        
        elif agent == "olive":
            if "evaluation_result" in response_data and "score" in response_data:
                analysis_parts.append("Contains policy evaluation scores (likely real)")
        
        # Default analysis
        if not analysis_parts:
            if ml_found:
                analysis_parts.append("Contains ML/LLM indicators but unclear if mock or real")
            else:
                analysis_parts.append("No clear indicators - may be mock")
                is_mock = True
        
        return is_mock, "; ".join(analysis_parts)

    def test_endpoint(self, endpoint: AgentEndpoint) -> TestResult:
        """Test a single endpoint."""
        url = f"{self.base_url}:{endpoint.port}{endpoint.endpoint}"
        start_time = time.time()
        
        try:
            if endpoint.method == "GET":
                response = requests.get(url, timeout=10)
            else:
                response = requests.post(url, json=endpoint.payload, timeout=10)
            
            response_time = time.time() - start_time
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text[:200]}
            
            status_code = response.status_code
            is_mock, analysis = self.analyze_response(endpoint.agent, endpoint.endpoint, response_data)
            
            return TestResult(
                agent=endpoint.agent,
                endpoint=endpoint.endpoint,
                status_code=status_code,
                response_time=response_time,
                response_data=response_data,
                is_mock=is_mock,
                analysis=analysis
            )
            
        except Exception as e:
            response_time = time.time() - start_time
            return TestResult(
                agent=endpoint.agent,
                endpoint=endpoint.endpoint,
                status_code=0,
                response_time=response_time,
                response_data={},
                is_mock=False,
                analysis="Error occurred",
                error=str(e)
            )

    def test_all_endpoints(self):
        """Test all endpoints concurrently."""
        print(f"🚀 Testing {len(self.endpoints)} endpoints across 8 agents...")
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
            futures = [executor.submit(self.test_endpoint, endpoint) for endpoint in self.endpoints]
            self.results = [future.result() for future in concurrent.futures.as_completed(futures)]

    def generate_report(self):
        """Generate comprehensive test report."""
        print("\n" + "=" * 80)
        print("📊 AGENT ENDPOINT TEST REPORT")
        print("=" * 80)
        
        # Summary statistics
        total_endpoints = len(self.results)
        successful_endpoints = len([r for r in self.results if r.status_code == 200])
        mock_endpoints = len([r for r in self.results if r.is_mock])
        real_endpoints = total_endpoints - mock_endpoints
        error_endpoints = len([r for r in self.results if r.status_code != 200])
        
        print(f"\n📈 SUMMARY STATISTICS:")
        print(f"   Total Endpoints Tested: {total_endpoints}")
        print(f"   Successful (200): {successful_endpoints}")
        print(f"   Errors: {error_endpoints}")
        print(f"   Mock Responses: {mock_endpoints}")
        print(f"   Real ML/LLM Responses: {real_endpoints}")
        print(f"   Success Rate: {(successful_endpoints/total_endpoints)*100:.1f}%")
        
        # Agent breakdown
        print(f"\n🤖 AGENT BREAKDOWN:")
        agent_stats = {}
        for result in self.results:
            if result.agent not in agent_stats:
                agent_stats[result.agent] = {"total": 0, "successful": 0, "mock": 0, "errors": 0}
            agent_stats[result.agent]["total"] += 1
            if result.status_code == 200:
                agent_stats[result.agent]["successful"] += 1
            if result.is_mock:
                agent_stats[result.agent]["mock"] += 1
            if result.status_code != 200:
                agent_stats[result.agent]["errors"] += 1
        
        for agent, stats in agent_stats.items():
            print(f"   {agent.upper()}: {stats['successful']}/{stats['total']} successful, "
                  f"{stats['mock']} mock, {stats['errors']} errors")
        
        # Detailed results by agent
        print(f"\n🔍 DETAILED RESULTS BY AGENT:")
        print("=" * 80)
        
        for agent in ["orca", "orion", "weave", "okra", "opal", "oasis", "onyx", "olive"]:
            agent_results = [r for r in self.results if r.agent == agent]
            if not agent_results:
                continue
                
            print(f"\n🤖 {agent.upper()} Agent (Port {agent_results[0].endpoint.split(':')[0] if ':' in str(agent_results[0].endpoint) else 'N/A'}):")
            print("-" * 60)
            
            for result in agent_results:
                status_emoji = "✅" if result.status_code == 200 else "❌"
                mock_emoji = "🎭" if result.is_mock else "🧠"
                
                print(f"   {status_emoji} {mock_emoji} {result.endpoint}")
                print(f"      Status: {result.status_code} | Time: {result.response_time:.3f}s")
                
                if result.error:
                    print(f"      Error: {result.error}")
                else:
                    print(f"      Analysis: {result.analysis}")
                
                # Show sample response data for key endpoints
                if result.status_code == 200 and result.response_data:
                    if any(keyword in result.endpoint for keyword in ["decision", "quote", "verify", "negotiate"]):
                        sample_data = dict(list(result.response_data.items())[:3])  # First 3 items
                        print(f"      Sample: {json.dumps(sample_data, indent=6)[:100]}...")
                print()
        
        # Mock vs Real Analysis
        print(f"\n🎭 MOCK vs 🧠 REAL ML/LLM ANALYSIS:")
        print("=" * 80)
        
        mock_results = [r for r in self.results if r.is_mock and r.status_code == 200]
        real_results = [r for r in self.results if not r.is_mock and r.status_code == 200]
        
        print(f"\n🎭 MOCK ENDPOINTS ({len(mock_results)}):")
        for result in mock_results:
            print(f"   {result.agent}: {result.endpoint}")
        
        print(f"\n🧠 REAL ML/LLM ENDPOINTS ({len(real_results)}):")
        for result in real_results:
            print(f"   {result.agent}: {result.endpoint}")
        
        # Performance analysis
        print(f"\n⏱️ PERFORMANCE ANALYSIS:")
        print("=" * 80)
        
        successful_results = [r for r in self.results if r.status_code == 200]
        if successful_results:
            avg_response_time = sum(r.response_time for r in successful_results) / len(successful_results)
            max_response_time = max(successful_results, key=lambda x: x.response_time)
            min_response_time = min(successful_results, key=lambda x: x.response_time)
            
            print(f"   Average Response Time: {avg_response_time:.3f}s")
            print(f"   Fastest: {min_response_time.agent}{min_response_time.endpoint} ({min_response_time.response_time:.3f}s)")
            print(f"   Slowest: {max_response_time.agent}{max_response_time.endpoint} ({max_response_time.response_time:.3f}s)")
            
            # Identify potentially slow ML/LLM endpoints
            slow_results = [r for r in successful_results if r.response_time > 1.0 and not r.is_mock]
            if slow_results:
                print(f"\n   🐌 Potentially Slow ML/LLM Endpoints (>1s):")
                for result in slow_results:
                    print(f"      {result.agent}: {result.endpoint} ({result.response_time:.3f}s)")

def main():
    """Main function to run the endpoint tests."""
    tester = AgentEndpointTester()
    
    try:
        tester.test_all_endpoints()
        tester.generate_report()
    except KeyboardInterrupt:
        print("\n⚠️ Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")

if __name__ == "__main__":
    main()
