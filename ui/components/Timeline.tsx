'use client'

import { Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react'

interface TimelineProps {
    traceId: string
    receipts: any
    demoResult: any
}

export function Timeline({ traceId, receipts, demoResult }: TimelineProps) {
    // Build timeline events from demo results and receipts
    const events = []

    // Add CloudEvents from receipts if available
    if (receipts?.events) {
        receipts.events.forEach((event: any) => {
            events.push({
                id: event.id,
                type: event.type,
                time: event.time,
                source: event.source,
                data: event.data,
                from_receipts: true
            })
        })
    }

    // Add derived events from demo results
    if (demoResult) {
        // Orca explanation event
        if (demoResult.orca?.explanation) {
            events.push({
                id: `orca-explanation-${traceId}`,
                type: 'ocn.orca.explanation.v1',
                time: demoResult.timestamp,
                source: 'orca',
                data: {
                    reason: demoResult.orca.explanation.explanation,
                    confidence: demoResult.orca.explanation.confidence,
                    key_signals: demoResult.orca.explanation.key_factors || []
                },
                from_receipts: false
            })
        }

        // Orion optimization event
        if (demoResult.orion?.optimization) {
            events.push({
                id: `orion-optimization-${traceId}`,
                type: 'ocn.orion.explanation.v1',
                time: demoResult.timestamp,
                source: 'orion',
                data: {
                    selected_rail: demoResult.orion.optimization.best_rail,
                    reason: demoResult.orion.optimization.explanation?.reason,
                    cost_savings: demoResult.orion.optimization.explanation?.cost_savings
                },
                from_receipts: false
            })
        }

        // Onyx KYB verification event
        if (demoResult.onyx?.verification) {
            events.push({
                id: `onyx-kyb-${traceId}`,
                type: 'ocn.onyx.kyb_verified.v1',
                time: demoResult.timestamp,
                source: 'onyx',
                data: {
                    status: demoResult.onyx.verification.status,
                    vendor: demoResult.onyx.verification.vendor_name,
                    checks: demoResult.onyx.verification.checks || []
                },
                from_receipts: false
            })
        }

        // Olive loyalty event (if available)
        if (demoResult.olive?.incentives) {
            events.push({
                id: `olive-loyalty-${traceId}`,
                type: 'ocn.olive.incentive_applied.v1',
                time: demoResult.timestamp,
                source: 'olive',
                data: {
                    discount_amount: demoResult.olive.incentives.total_discount,
                    tier: demoResult.olive.incentives.applied_incentives?.[0]?.tier,
                    program: demoResult.olive.incentives.program_name
                },
                from_receipts: false
            })
        }
    }

    // Sort events by time
    events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'ocn.orca.explanation.v1':
                return '🦈'
            case 'ocn.orion.explanation.v1':
                return '🚀'
            case 'ocn.onyx.kyb_verified.v1':
                return '🖤'
            case 'ocn.olive.incentive_applied.v1':
                return '🫒'
            default:
                return '📄'
        }
    }

    const getEventTitle = (type: string) => {
        switch (type) {
            case 'ocn.orca.explanation.v1':
                return 'Orca Decision Explanation'
            case 'ocn.orion.explanation.v1':
                return 'Orion Rail Optimization'
            case 'ocn.onyx.kyb_verified.v1':
                return 'Onyx KYB Verification'
            case 'ocn.olive.incentive_applied.v1':
                return 'Olive Loyalty Applied'
            default:
                return 'CloudEvent'
        }
    }

    const getEventDescription = (event: any) => {
        switch (event.type) {
            case 'ocn.orca.explanation.v1':
                return `Risk assessment completed with ${(event.data.confidence * 100).toFixed(1)}% confidence`
            case 'ocn.orion.explanation.v1':
                return `Selected ${event.data.selected_rail} rail for vendor payout`
            case 'ocn.onyx.kyb_verified.v1':
                return `Verified ${event.data.vendor} - Status: ${event.data.status}`
            case 'ocn.olive.incentive_applied.v1':
                return `Applied ${event.data.tier} tier discount: $${event.data.discount_amount}`
            default:
                return 'Event processed'
        }
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-shirtco-primary" />
                    <h2 className="text-2xl font-bold text-gray-900">CloudEvents Timeline</h2>
                </div>
                <p className="text-gray-600">Trace ID: <code className="bg-gray-100 px-2 py-1 rounded">{traceId}</code></p>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No CloudEvents found for this trace ID</p>
                    <p className="text-sm">Events will appear here as they are processed by Weave</p>
                </div>
            ) : (
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                    <div className="space-y-6">
                        {events.map((event, index) => (
                            <div key={event.id} className="relative flex items-start gap-4">
                                {/* Event icon */}
                                <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-white border-2 border-gray-200 rounded-full">
                                    <span className="text-lg">{getEventIcon(event.type)}</span>
                                </div>

                                {/* Event content */}
                                <div className="flex-1 min-w-0">
                                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900">{getEventTitle(event.type)}</h3>
                                            <div className="flex items-center gap-2">
                                                {event.from_receipts ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <FileText className="w-4 h-4 text-blue-500" />
                                                )}
                                                <span className="text-xs text-gray-500">
                                                    {new Date(event.time).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 text-sm mb-3">{getEventDescription(event)}</p>

                                        <div className="space-y-2 text-xs text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Event ID:</span>
                                                <code className="bg-gray-100 px-2 py-1 rounded">{event.id}</code>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Source:</span>
                                                <span className="capitalize">{event.source}</span>
                                            </div>
                                            {event.from_receipts && (
                                                <div className="flex items-center gap-2 text-green-600">
                                                    <CheckCircle className="w-3 h-3" />
                                                    <span>Verified by Weave</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Event data preview */}
                                        {event.data && (
                                            <details className="mt-3">
                                                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                                                    View Event Data
                                                </summary>
                                                <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                                                    {JSON.stringify(event.data, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {receipts && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-blue-900">Weave Audit Status</span>
                    </div>
                    <p className="text-sm text-blue-700">
                        {receipts.count || 0} CloudEvents processed and stored as hash receipts
                    </p>
                </div>
            )}
        </div>
    )
}
