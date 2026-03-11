// ─── TORUK Review Service ─────────────────────────────────────────────────────
// Analyzes the current Flowise flow and returns structured findings

const REVIEW_SYSTEM_PROMPT = `You are TORUK Review Agent — an expert AI system that analyzes Flowise chatflow/agentflow configurations.

Your job is to review the provided flow (nodes + edges + configs) and return a structured JSON report.

You must check for:
1. LLM Configuration issues (temperature, maxTokens, model choice, streaming)
2. Prompt Engineering issues (missing system messages, vague prompts, no output format)
3. Security issues (hardcoded API keys, exposed credentials)
4. Memory configuration (window size, memory type fit)
5. Tool configuration (missing descriptions, unsafe tools)
6. Flow structure (disconnected nodes, missing outputs, circular dependencies)
7. Cost & Performance (no token limits, no caching, unnecessary nodes)

Severity levels:
- critical: Will cause failures, security issues, or completely wrong behavior
- warning: Reduces quality, increases cost, or creates reliability issues  
- suggestion: Best practice improvements for better performance

Return ONLY valid JSON in this exact format, no markdown, no explanation:
{
  "score": <0-100, subtract 25 per critical, 10 per warning, 3 per suggestion>,
  "findings": [
    {
      "id": "f_0",
      "severity": "critical|warning|suggestion",
      "category": "category name",
      "title": "short title",
      "description": "detailed explanation of the problem",
      "node": "node label that has the issue",
      "fix": "specific actionable fix",
      "reference": "best practice reference"
    }
  ]
}`

// ─── Build prompt from flow data ──────────────────────────────────────────────
const buildReviewPrompt = (nodes, edges, chatflow) => {
    const nodesSummary = nodes.map((node) => ({
        id: node.id,
        type: node.data?.name || node.type,
        label: node.data?.label || node.id,
        inputs: node.data?.inputs || {},
        category: node.data?.category || ''
    }))

    const edgesSummary = edges.map((e) => ({
        from: e.source,
        to: e.target
    }))

    return `Review this Flowise flow:

Flow Name: ${chatflow?.name || 'Unnamed Flow'}
Flow Type: ${chatflow?.type || 'chatflow'}
Total Nodes: ${nodes.length}
Total Connections: ${edges.length}

NODES:
${JSON.stringify(nodesSummary, null, 2)}

CONNECTIONS:
${JSON.stringify(edgesSummary, null, 2)}

Analyze thoroughly and return the JSON findings report.`
}

// ─── Call Anthropic API ───────────────────────────────────────────────────────
const callReviewerLLM = async (prompt) => {
    const apiKey = 'AIzaSyBzTTBDglx502MaYswUWfEnlWulnLfXbpY'

    if (!apiKey) {
        throw new Error('No API key found. Add VITE_GEMINI_API_KEY in packages/ui/.env file')
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: REVIEW_SYSTEM_PROMPT }] },
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 8192, temperature: 0.2 }
        })
    })

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`)
    const data = await response.json()
    return data.candidates[0].content.parts[0].text
}
// ─── Parse LLM response ───────────────────────────────────────────────────────
const parseReviewResponse = (text) => {
    try {
        const clean = text
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim()
        return JSON.parse(clean)
    } catch (e) {
        console.error('Failed to parse review response:', e)
        return {
            score: 0,
            findings: [
                {
                    id: 'f_parse_error',
                    severity: 'warning',
                    category: 'Review Engine',
                    title: 'Could not parse review results',
                    description: 'The reviewer returned an unexpected format. Raw response saved to console.',
                    node: 'System',
                    fix: 'Try re-running the review.',
                    reference: 'TORUK Internal'
                }
            ]
        }
    }
}

// ─── Main export ──────────────────────────────────────────────────────────────
export const reviewFlow = async (nodes, edges, chatflow) => {
    if (!nodes || nodes.length === 0) {
        return {
            score: 100,
            findings: [
                {
                    id: 'f_empty',
                    severity: 'warning',
                    category: 'Flow Structure',
                    title: 'Empty Flow',
                    description: 'This flow has no nodes. Add nodes to get a meaningful review.',
                    node: 'Canvas',
                    fix: 'Add LLM, memory, and tool nodes to build your agent.',
                    reference: 'Flowise Getting Started'
                }
            ]
        }
    }

    const prompt = buildReviewPrompt(nodes, edges, chatflow)
    const rawResponse = await callReviewerLLM(prompt)
    const result = parseReviewResponse(rawResponse)

    // Ensure unique IDs
    result.findings = result.findings.map((f, i) => ({ ...f, id: `f_${i}` }))

    return result
}

export default reviewFlow
