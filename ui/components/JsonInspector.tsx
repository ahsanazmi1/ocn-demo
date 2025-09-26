'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react'

interface JsonInspectorProps {
    demoResult: any
}

export function JsonInspector({ demoResult }: JsonInspectorProps) {
    const [expandedSections, setExpandedSections] = useState<string[]>(['orca'])
    const [copiedSection, setCopiedSection] = useState<string | null>(null)

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        )
    }

    const copyToClipboard = async (content: any, section: string) => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(content, null, 2))
            setCopiedSection(section)
            setTimeout(() => setCopiedSection(null), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const formatJsonValue = (value: any): string => {
        if (value === null) return 'null'
        if (typeof value === 'string') return `"${value}"`
        if (typeof value === 'number') return value.toString()
        if (typeof value === 'boolean') return value.toString()
        if (Array.isArray(value)) return `Array(${value.length})`
        if (typeof value === 'object') return `Object(${Object.keys(value).length} keys)`
        return String(value)
    }

    const renderJsonValue = (key: string, value: any, depth = 0) => {
        const indent = '  '.repeat(depth)
        const isExpanded = expandedSections.includes(`${key}-${depth}`)

        if (value === null) {
            return <span className="text-gray-500">null</span>
        }

        if (typeof value === 'string') {
            return <span className="text-green-600">"{value}"</span>
        }

        if (typeof value === 'number') {
            return <span className="text-blue-600">{value}</span>
        }

        if (typeof value === 'boolean') {
            return <span className="text-purple-600">{value.toString()}</span>
        }

        if (Array.isArray(value)) {
            return (
                <div>
                    <button
                        onClick={() => toggleSection(`${key}-${depth}`)}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                    >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        <span>Array({value.length})</span>
                    </button>
                    {isExpanded && (
                        <div className="ml-4 mt-1">
                            {value.map((item, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <span className="text-gray-500">{index}:</span>
                                    {renderJsonValue(`${key}[${index}]`, item, depth + 1)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )
        }

        if (typeof value === 'object') {
            const keys = Object.keys(value)
            return (
                <div>
                    <button
                        onClick={() => toggleSection(`${key}-${depth}`)}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                    >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        <span>Object({keys.length} keys)</span>
                    </button>
                    {isExpanded && (
                        <div className="ml-4 mt-1 space-y-1">
                            {keys.map(subKey => (
                                <div key={subKey} className="flex items-start gap-2">
                                    <span className="text-gray-700 font-medium">"{subKey}":</span>
                                    {renderJsonValue(`${key}.${subKey}`, value[subKey], depth + 1)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )
        }

        return <span className="text-gray-800">{String(value)}</span>
    }

    const agentConfigs = [
        { key: 'orca', name: 'Orca', icon: '🦈', color: 'bg-blue-50 border-blue-200' },
        { key: 'okra', name: 'Okra', icon: '🦏', color: 'bg-green-50 border-green-200' },
        { key: 'opal', name: 'Opal', icon: '💎', color: 'bg-purple-50 border-purple-200' },
        { key: 'orion', name: 'Orion', icon: '🚀', color: 'bg-orange-50 border-orange-200' },
        { key: 'oasis', name: 'Oasis', icon: '🏛️', color: 'bg-yellow-50 border-yellow-200' },
        { key: 'onyx', name: 'Onyx', icon: '🖤', color: 'bg-gray-50 border-gray-200' },
        { key: 'olive', name: 'Olive', icon: '🫒', color: 'bg-emerald-50 border-emerald-200' },
        { key: 'weave', name: 'Weave', icon: '🌊', color: 'bg-indigo-50 border-indigo-200' },
    ]

    return (
        <div className="space-y-6">
            {agentConfigs.map(config => {
                const data = demoResult[config.key]
                const isExpanded = expandedSections.includes(config.key)

                return (
                    <div key={config.key} className={`border rounded-lg ${config.color}`}>
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{config.icon}</span>
                                    <div>
                                        <h3 className="font-semibold text-lg">{config.name}</h3>
                                        <p className="text-sm text-gray-600">
                                            {data?.error ? 'Error occurred' : 'Response data'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => copyToClipboard(data, config.key)}
                                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                                        title="Copy JSON"
                                    >
                                        {copiedSection === config.key ? (
                                            <Check className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => toggleSection(config.key)}
                                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="w-5 h-5" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="p-4">
                                {data?.error ? (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <h4 className="font-semibold text-red-800 mb-2">Error</h4>
                                        <p className="text-red-700">{data.error}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {Object.entries(data || {}).map(([key, value]) => (
                                            <div key={key} className="flex items-start gap-2 text-sm">
                                                <span className="text-gray-700 font-medium min-w-0 flex-shrink-0">"{key}":</span>
                                                <div className="flex-1 min-w-0">
                                                    {renderJsonValue(key, value)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}

            {/* Full JSON View */}
            <div className="border rounded-lg bg-gray-50 border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Complete Response</h3>
                        <button
                            onClick={() => copyToClipboard(demoResult, 'complete')}
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            {copiedSection === 'complete' ? (
                                <Check className="w-4 h-4 text-green-600" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                            Copy Full JSON
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    <pre className="text-xs bg-white border border-gray-200 rounded-lg p-4 overflow-x-auto">
                        {JSON.stringify(demoResult, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    )
}
