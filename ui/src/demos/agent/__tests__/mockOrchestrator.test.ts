import { runAgentFlow, simulateAgentFlow, getOxfordsCart } from '../mockOrchestrator';
import { Explanation } from '../types';

describe('MockOrchestrator', () => {
  describe('getOxfordsCart', () => {
    it('should return the correct Oxfords cart', () => {
      const cart = getOxfordsCart();
      
      expect(cart.currency).toBe('USD');
      expect(cart.total).toBe(380);
      expect(cart.items).toHaveLength(2);
      expect(cart.items[0]).toEqual({
        sku: 'OXFORDS-SLIM-M',
        name: 'Slim-Fit Crew Oxfords (M)',
        qty: 2,
        price: 120.00
      });
      expect(cart.items[1]).toEqual({
        sku: 'BLAZER-NAVY',
        name: 'Navy Blazer',
        qty: 1,
        price: 140.00
      });
    });
  });

  describe('runAgentFlow', () => {
    it('should return 7 explanations in default flow (no choice)', () => {
      const explanations = runAgentFlow();
      
      expect(explanations).toHaveLength(7);
      
      // Check agent sequence
      const agents = explanations.map(exp => exp.agent);
      expect(agents).toEqual(['onyx', 'okra', 'opal', 'olive', 'weave', 'orca', 'weave']);
      
      // Check Okra decision
      const okraExplanation = explanations.find(exp => exp.agent === 'okra');
      expect(okraExplanation?.decision).toBe('propose_alt');
    });

    it('should have deterministic risk/cost scores', () => {
      const explanations = runAgentFlow();
      
      // Check Onyx risk score
      const onyxExplanation = explanations.find(exp => exp.agent === 'onyx');
      expect(onyxExplanation?.score).toBe(0.07);
      expect(onyxExplanation?.score_type).toBe('risk');
      
      // Check Weave cost score
      const weaveExplanation = explanations.find(exp => exp.agent === 'weave' && exp.step_id.includes('auction'));
      expect(weaveExplanation?.score).toBe(0.1655);
      expect(weaveExplanation?.score_type).toBe('cost');
    });

    it('should have deterministic processor auction result', () => {
      const explanations = runAgentFlow();
      
      const weaveExplanation = explanations.find(exp => exp.agent === 'weave' && exp.step_id.includes('auction'));
      expect(weaveExplanation?.extra?.winning_processor).toBe('Carat');
      expect(weaveExplanation?.extra?.total_processing_cost).toBe(6.32);
    });

    describe('Credit choice', () => {
      it('should show 5% rewards when choice is credit', () => {
        const explanations = runAgentFlow('credit');
        
        const oliveExplanation = explanations.find(exp => exp.agent === 'olive');
        expect(oliveExplanation?.summary).toContain('5% cash back available');
        expect(oliveExplanation?.extra?.expected_value).toBe(19.00);
        
        const orcaExplanation = explanations.find(exp => exp.agent === 'orca');
        expect(orcaExplanation?.summary).toContain('rewards 5% applied');
        expect(orcaExplanation?.extra?.rewards_amount).toBe(19.00);
      });
    });

    describe('BNPL choice', () => {
      it('should show 0% rewards when choice is bnpl', () => {
        const explanations = runAgentFlow('bnpl');
        
        const oliveExplanation = explanations.find(exp => exp.agent === 'olive');
        expect(oliveExplanation?.summary).toContain('Cashback not applicable');
        expect(oliveExplanation?.extra?.expected_value).toBe(0);
        
        const orcaExplanation = explanations.find(exp => exp.agent === 'orca');
        expect(orcaExplanation?.summary).toContain('rewards not applied');
        expect(orcaExplanation?.extra?.rewards_amount).toBe(0);
      });
    });

    it('should include all required fields in explanations', () => {
      const explanations = runAgentFlow();
      
      explanations.forEach((explanation, index) => {
        expect(explanation.trace_id).toBeDefined();
        expect(explanation.step_id).toBeDefined();
        expect(explanation.agent).toBeDefined();
        expect(explanation.model_version).toBeDefined();
        expect(explanation.policy_version).toBeDefined();
        expect(explanation.summary).toBeDefined();
        expect(explanation.decision).toBeDefined();
        expect(explanation.timestamp).toBeDefined();
        
        // Check trace_id format
        expect(explanation.trace_id).toMatch(/^trace_[a-z0-9]+$/);
        
        // Check timestamp format
        expect(new Date(explanation.timestamp).getTime()).not.toBeNaN();
      });
    });

    it('should have seeded data as specified', () => {
      const explanations = runAgentFlow();
      
      // Check Onyx seeded data
      const onyxExplanation = explanations.find(exp => exp.agent === 'onyx');
      expect(onyxExplanation?.summary).toBe('No fraud indicators above threshold. Device recognized; geo-IP consistent with prior sessions.');
      expect(onyxExplanation?.uncertainty).toBe(0.18);
      expect(onyxExplanation?.key_signals).toEqual([
        { path: 'device.recognized', value: true, weight: 0.12 },
        { path: 'ip.geo_distance_km', value: 8, weight: 0.06 },
        { path: 'cart.total.amount', value: 380, weight: 0.03 }
      ]);
      expect(onyxExplanation?.ap2_refs).toEqual(['payer.device.id', 'payer.ip.address', 'cart.total.amount']);
      expect(onyxExplanation?.redactions).toEqual(['payer.ip.address', 'payer.device.id']);
      
      // Check Okra seeded data
      const okraExplanation = explanations.find(exp => exp.agent === 'okra');
      expect(okraExplanation?.summary).toBe('Customer qualifies for both revolving credit and BNPL. BNPL: 4 payments of $95.00 (0% interest, $0 fees). Revolving credit: approved, APR 19.9%.');
      expect(okraExplanation?.uncertainty).toBe(0.22);
      expect(okraExplanation?.extra?.bnpl).toEqual({
        installments: 4,
        amount_per_payment: 95,
        apr: 0,
        fees: 0
      });
      
      // Check Opal seeded data
      const opalExplanation = explanations.find(exp => exp.agent === 'opal');
      expect(opalExplanation?.summary).toBe('Default card recommended. Higher expected rewards than debit; MCC 5651 eligible.');
      expect(opalExplanation?.score).toBe(0.09);
      expect(opalExplanation?.score_type).toBe('suitability');
      
      // Check Weave auction seeded data
      const weaveAuctionExplanation = explanations.find(exp => exp.agent === 'weave' && exp.step_id.includes('auction'));
      expect(weaveAuctionExplanation?.summary).toBe('Auction complete. Lowest total processing cost: 1.65% + $0.05; SLO within target.');
      expect(weaveAuctionExplanation?.key_signals).toEqual([
        { path: 'bids', value: [1.82, 1.74, 1.65], weight: 0.4 },
        { path: 'latency_p95', value: 210, weight: 0.3 },
        { path: 'reliability', value: 99.98, weight: 0.3 }
      ]);
      
      // Check Weave post-auth seeded data
      const weavePostAuthExplanation = explanations.find(exp => exp.agent === 'weave' && exp.step_id.includes('postauth'));
      expect(weavePostAuthExplanation?.summary).toBe('Authorization approved. Settlement T+1; receipt stored (hash only).');
      expect(weavePostAuthExplanation?.extra?.auth_network).toBe('Visa');
      expect(weavePostAuthExplanation?.extra?.issuer_resp).toBe('00');
      expect(weavePostAuthExplanation?.extra?.receipt_hash).toBe('weave:abc123…');
    });
  });

  describe('simulateAgentFlow', () => {
    it('should return the same explanations as runAgentFlow but asynchronously', async () => {
      const syncExplanations = runAgentFlow('credit');
      const asyncExplanations = await simulateAgentFlow('credit');
      
      expect(asyncExplanations).toHaveLength(syncExplanations.length);
      expect(asyncExplanations.map(exp => exp.agent)).toEqual(syncExplanations.map(exp => exp.agent));
    });

    it('should handle timing delays', async () => {
      const startTime = Date.now();
      await simulateAgentFlow();
      const endTime = Date.now();
      
      // Should take at least some time due to delays
      expect(endTime - startTime).toBeGreaterThan(100);
    });
  });
});








