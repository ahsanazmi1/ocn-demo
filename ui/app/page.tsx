'use client'

import { useState, useEffect } from 'react'
import { Play, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'
import { AgentCard } from '@/components/AgentCard'
import { OrderSummary } from '@/components/OrderSummary'
import { Timeline } from '@/components/Timeline'
import { JsonInspector } from '@/components/JsonInspector'
import { runShirtCoDemo, getAgentStatus, getReceipts } from '@/lib/api'

interface DemoResult {
    trace_id: string
    timestamp: string
    orca: any
    okra: any
    opal: any
    orion: any
    oasis: any
    onyx: any
    olive: any
    weave: any
}

interface AgentStatus {
    name: string
    status: string
    url: string
    response_time_ms?: number
    error?: string
}

export default function ShirtCoDemo() {
    const [isRunning, setIsRunning] = useState(false)
    const [demoResult, setDemoResult] = useState<DemoResult | null>(null)
    const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([])
    const [receipts, setReceipts] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    // Load initial agent statuses
    useEffect(() => {
        loadAgentStatuses()
    }, [])

    // Poll receipts if we have a trace_id
    useEffect(() => {
        if (demoResult?.trace_id) {
            const interval = setInterval(async () => {
                try {
                    const receiptsData = await getReceipts(demoResult.trace_id)
                    setReceipts(receiptsData)
                } catch (err) {
                    console.warn('Failed to fetch receipts:', err)
                }
            }, 2000)

            return () => clearInterval(interval)
        }
    }, [demoResult?.trace_id])

    const loadAgentStatuses = async () => {
        try {
            const statuses = await getAgentStatus()
            setAgentStatuses(statuses.agents || [])
        } catch (err) {
            console.error('Failed to load agent statuses:', err)
        }
    }

    const handleRunDemo = async () => {
        setIsRunning(true)
        setError(null)
        setDemoResult(null)
        setReceipts(null)

        try {
            const result = await runShirtCoDemo()
            setDemoResult(result)

            // Refresh agent statuses after demo
            await loadAgentStatuses()
        } catch (err: any) {
            setError(err.message || 'Demo execution failed')
        } finally {
            setIsRunning(false)
        }
    }

    const getAgentStatusByName = (name: string) => {
        return agentStatuses.find(agent => agent.name === name)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                OCN Demo — ShirtCo (Mid-Market Apparel)
                            </h1>
                            <p className="mt-2 text-lg text-gray-600">
                                End-to-end B2B transaction flow across all 8 OCN agents
                            </p>
                        </div>
                        <button
                            onClick={handleRunDemo}
                            disabled={isRunning}
                            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isRunning ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Running Demo...
                                </>
                            ) : (
                                <>
                                    <Play className="w-5 h-5" />
                                    Run ShirtCo Demo
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Error Display */}
                {error && (
                    <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-500" />
                            <span className="text-red-800 font-semibold">Demo Error</span>
                        </div>
                        <p className="text-red-700 mt-2">{error}</p>
                    </div>
                )}

                {/* Order Summary */}
                {demoResult && (
                    <div className="mb-8">
                        <OrderSummary demoResult={demoResult} />
                    </div>
                )}

                {/* Agent Status Grid */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Agent Status</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AgentCard
                            name="orca"
                            title="Checkout risk & decision"
                            status={getAgentStatusByName('orca')}
                            result={demoResult?.orca}
                        />
                        <AgentCard
                            name="okra"
                            title="BNPL quote & underwriting"
                            status={getAgentStatusByName('okra')}
                            result={demoResult?.okra}
                        />
                        <AgentCard
                            name="opal"
                            title="Wallet selection (Corp Visa)"
                            status={getAgentStatusByName('opal')}
                            result={demoResult?.opal}
                        />
                        <AgentCard
                            name="orion"
                            title="Vendor payout rail choice"
                            status={getAgentStatusByName('orion')}
                            result={demoResult?.orion}
                        />
                        <AgentCard
                            name="oasis"
                            title="14-day liquidity forecast"
                            status={getAgentStatusByName('oasis')}
                            result={demoResult?.oasis}
                        />
                        <AgentCard
                            name="onyx"
                            title="KYB verification"
                            status={getAgentStatusByName('onyx')}
                            result={demoResult?.onyx}
                        />
                        <AgentCard
                            name="olive"
                            title="Loyalty (Gold 5%)"
                            status={getAgentStatusByName('olive')}
                            result={demoResult?.olive}
                        />
                        <AgentCard
                            name="weave"
                            title="Audit receipts (hash-only)"
                            status={getAgentStatusByName('weave')}
                            result={demoResult?.weave}
                        />
                    </div>
                </div>

                {/* Timeline */}
                {demoResult && (
                    <div className="mb-8">
                        <Timeline
                            traceId={demoResult.trace_id}
                            receipts={receipts}
                            demoResult={demoResult}
                        />
                    </div>
                )}

                {/* JSON Inspectors */}
                {demoResult && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Response Details</h2>
                        <JsonInspector demoResult={demoResult} />
                    </div>
                )}
            </main>
        </div>
    )
}
