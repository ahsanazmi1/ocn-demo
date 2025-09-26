import os
import json
import uuid
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI(title="OCN Demo 1 Gateway", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Agent URLs with defaults
AGENT_URLS = {
    "orca": os.getenv("ORCA_URL", "http://orca:8080"),
    "okra": os.getenv("OKRA_URL", "http://okra:8083"),
    "opal": os.getenv("OPAL_URL", "http://opal:8084"),
    "onyx": os.getenv("ONYX_URL", "http://onyx:8086"),
    "olive": os.getenv("OLIVE_URL", "http://olive:8087"),
    "weave": os.getenv("WEAVE_URL", "http://weave:8082"),
}

def new_trace_id() -> str:
    """Generate a new trace ID."""
    return str(uuid.uuid4())

def with_trace(headers: Dict[str, str], trace_id: str) -> Dict[str, str]:
    """Add trace ID to headers."""
    headers["x-ocn-trace-id"] = trace_id
    return headers

@app.post("/run/demo1")
async def run_demo1():
    """Run Demo 1: Oxfords Checkout across 6 agents."""
    samples_dir = "/app/samples/demo1_oxfords"
    trace_id = new_trace_id()
    results = {
        "trace_id": trace_id,
        "orca": {},
        "opal": {},
        "olive": {},
        "okra": {},
        "onyx": {},
        "weave": {}
    }
    
    async with httpx.AsyncClient(timeout=30.0) as http_client:
        try:
            # Step 1: Load cart and call Orca /decide
            print(f"🦈 Step 1: Orca checkout decision for trace {trace_id}")
            with open(f"{samples_dir}/cart.json", "r") as f:
                cart_data = json.load(f)
            
            # Call Orca /decide endpoint
            orca_headers = with_trace({}, trace_id)
            orca_response = await http_client.post(
                f"{AGENT_URLS['orca']}/decide",
                json=cart_data,
                headers=orca_headers
            )
            
            if orca_response.status_code == 200:
                results["orca"]["decision"] = orca_response.json()
                # Extract trace_id from response if present
                decision_data = orca_response.json()
                if "trace_id" in decision_data:
                    trace_id = decision_data["trace_id"]
            else:
                results["orca"]["error"] = f"Decision failed: {orca_response.status_code}"
            
            # Step 2: Call Orca /explain with CE emission
            print(f"🦈 Step 2: Orca explanation with CE emission for trace {trace_id}")
            explain_headers = with_trace({}, trace_id)
            explain_response = await http_client.post(
                f"{AGENT_URLS['orca']}/explain?emit_ce=true",
                json=cart_data,
                headers=explain_headers
            )
            
            if explain_response.status_code == 200:
                results["orca"]["explanation"] = explain_response.json()
            else:
                results["orca"]["explanation_error"] = f"Explanation failed: {explain_response.status_code}"
            
            # Step 3: Opal wallet methods and selection
            print(f"💎 Step 3: Opal wallet selection for trace {trace_id}")
            
            # Get wallet methods
            opal_headers = with_trace({}, trace_id)
            methods_response = await http_client.get(
                f"{AGENT_URLS['opal']}/wallet/methods",
                headers=opal_headers
            )
            
            if methods_response.status_code == 200:
                methods_data = methods_response.json()
                results["opal"]["methods"] = methods_data
                
                # Deterministically choose corp_visa
                chosen_method = "corp_visa"
                
                # Load wallet context and select method
                with open(f"{samples_dir}/wallet_context.json", "r") as f:
                    wallet_context = json.load(f)
                wallet_context["selected_method"] = chosen_method
                
                select_response = await http_client.post(
                    f"{AGENT_URLS['opal']}/wallet/select",
                    json=wallet_context,
                    headers=opal_headers
                )
                
                if select_response.status_code == 200:
                    results["opal"]["selection"] = select_response.json()
                else:
                    results["opal"]["selection_error"] = f"Selection failed: {select_response.status_code}"
            else:
                results["opal"]["error"] = f"Methods failed: {methods_response.status_code}"
            
            # Step 4: Olive incentives
            print(f"🫒 Step 4: Olive incentives for trace {trace_id}")
            with open(f"{samples_dir}/incentives_apply.json", "r") as f:
                incentives_data = json.load(f)
            
            olive_headers = with_trace({}, trace_id)
            olive_response = await http_client.post(
                f"{AGENT_URLS['olive']}/incentives/apply",
                json=incentives_data,
                headers=olive_headers
            )
            
            if olive_response.status_code == 200:
                results["olive"]["incentives"] = olive_response.json()
            else:
                results["olive"]["error"] = f"Incentives failed: {olive_response.status_code}"
            
            # Step 5: Okra BNPL quote
            print(f"🦏 Step 5: Okra BNPL quote for trace {trace_id}")
            with open(f"{samples_dir}/bnpl_request.json", "r") as f:
                bnpl_data = json.load(f)
            
            okra_headers = with_trace({}, trace_id)
            okra_response = await http_client.post(
                f"{AGENT_URLS['okra']}/bnpl/quote",
                json=bnpl_data,
                headers=okra_headers
            )
            
            if okra_response.status_code == 200:
                results["okra"]["bnpl_quote"] = okra_response.json()
            else:
                results["okra"]["error"] = f"BNPL quote failed: {okra_response.status_code}"
            
            # Step 6: Onyx KYB verification with CE emission
            print(f"🖤 Step 6: Onyx KYB verification for trace {trace_id}")
            with open(f"{samples_dir}/kyb_vendor.json", "r") as f:
                kyb_data = json.load(f)
            
            onyx_headers = with_trace({}, trace_id)
            onyx_response = await http_client.post(
                f"{AGENT_URLS['onyx']}/kyb/verify?emit_ce=true",
                json=kyb_data,
                headers=onyx_headers
            )
            
            if onyx_response.status_code == 200:
                results["onyx"]["kyb_verification"] = onyx_response.json()
            else:
                results["onyx"]["error"] = f"KYB verification failed: {onyx_response.status_code}"
            
        except Exception as e:
            print(f"❌ Demo 1 error: {str(e)}")
            results["error"] = str(e)
    
    return results

@app.get("/status")
async def get_status():
    """Get health status of all agents."""
    status = {}
    
    async with httpx.AsyncClient(timeout=10.0) as http_client:
        for agent_name, url in AGENT_URLS.items():
            try:
                # Try /health first, then /
                for endpoint in ["/health", "/"]:
                    try:
                        response = await http_client.get(f"{url}{endpoint}")
                        status[agent_name] = response.status_code == 200
                        break
                    except:
                        continue
                else:
                    status[agent_name] = False
            except:
                status[agent_name] = False
    
    return status

@app.get("/receipts/{trace_id}")
async def get_receipts(trace_id: str):
    """Get receipts for a trace ID from Weave."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as http_client:
            response = await http_client.get(f"{AGENT_URLS['weave']}/receipts/{trace_id}")
            if response.status_code == 200:
                return response.json()
            else:
                return {"available": False, "error": f"Weave returned {response.status_code}"}
    except Exception as e:
        return {"available": False, "error": str(e)}

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "OCN Demo 1 Gateway", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8090)