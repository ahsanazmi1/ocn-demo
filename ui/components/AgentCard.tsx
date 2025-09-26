'use client'

import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

interface AgentStatus {
    name: string
    status: string
    url: string
    response_time_ms?: number
    error?: string
}

interface AgentCardProps {
    name: string
    title: string
    status?: AgentStatus
    result?: any
}

const agentColors = {
    orca: 'bg-blue-100 text-blue-800',
    okra: 'bg-green-100 text-green-800',
    opal: 'bg-purple-100 text-purple-800',
    orion: 'bg-orange-100 text-orange-800',
    oasis: 'bg-yellow-100 text-yellow-800',
    onyx: 'bg-gray-100 text-gray-800',
    olive: 'bg-emerald-100 text-emerald-800',
    weave: 'bg-indigo-100 text-indigo-800',
}

const agentIcons = {
    orca: '🦈',
    okra: '🦏',
    opal: '💎',
    orion: '🚀',
    oasis: '🏛️',
    onyx: '🖤',
    olive: '🫒',
    weave: '🌊',
}

export function AgentCard({ name, title, status, result }: AgentCardProps) {
    const isHealthy = status?.status === 'healthy'
    const hasResult = result && !result.error
    const isLoading = !status

    const getStatusIcon = () => {
        if (isLoading) return <Clock className="w-5 h-5 text-gray-400 animate-pulse" />
        if (isHealthy) return <CheckCircle className="w-5 h-5 text-green-500" />
        return <XCircle className="w-5 h-5 text-red-500" />
    }

    const getStatusText = () => {
        if (isLoading) return 'Checking...'
        if (isHealthy) return 'Healthy'
        return 'Unhealthy'
    }

    const getResultSummary = () => {
        if (!hasResult) return null

        switch (name) {
            case 'orca':
                return `Decision: ${result.decision?.decision || 'N/A'}`
            case 'okra':
                return `Quote: ${result.quote?.status || 'N/A'}`
            case 'opal':
                return `Selected: ${result.selection?.selected_method || 'N/A'}`
            case 'orion':
                return `Rail: ${result.optimization?.best_rail || 'N/A'}`
            case 'oasis':
                return `Forecast: ${result.forecast?.total_liquidity || 'N/A'}`
            case 'onyx':
                return `Status: ${result.verification?.status || 'N/A'}`
            case 'olive':
                return `Applied: ${result.incentives?.total_discount || 'N/A'}`
            case 'weave':
                return `Receipts: ${result.receipts?.count || 0}`
            default:
                return 'Completed'
        }
    }

    return (
        <div className={`agent-card ${isHealthy ? 'healthy' : 'unhealthy'} ${isLoading ? 'loading' : ''}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{agentIcons[name as keyof typeof agentIcons]}</span>
                    <div>
                        <h3 className="font-semibold text-lg capitalize">{name}</h3>
                        <p className="text-sm text-gray-600">{title}</p>
                    </div>
                </div>
                {getStatusIcon()}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <span className={`status-badge ${isHealthy ? 'success' : 'error'}`}>
                        {getStatusText()}
                    </span>
                </div>

                {status?.response_time_ms && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Response Time:</span>
                        <span className="text-sm text-gray-600">{status.response_time_ms}ms</span>
                    </div>
                )}

                {hasResult && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Result:</span>
                        <span className="text-sm text-gray-600">{getResultSummary()}</span>
                    </div>
                )}

                {result?.error && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                        <AlertCircle className="w-4 h-4" />
                        <span>{result.error}</span>
                    </div>
                )}

                {status?.error && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                        <AlertCircle className="w-4 h-4" />
                        <span>{status.error}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
