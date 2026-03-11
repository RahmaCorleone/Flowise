import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { Box, Typography, IconButton, Chip, CircularProgress, Collapse, Button, Stack, Paper } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { IconX, IconChevronDown, IconRefresh, IconDownload } from '@tabler/icons-react'

// ─── Severity Config ──────────────────────────────────────────────────────────
const SEV_CONFIG = {
    critical: { label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', icon: '⛔' },
    warning: { label: 'Warning', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', icon: '⚠️' },
    suggestion: { label: 'Suggestion', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)', icon: '💡' }
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
    const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
    return (
        <Box sx={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
            <CircularProgress
                variant='determinate'
                value={100}
                size={90}
                thickness={4}
                sx={{ color: 'rgba(255,255,255,0.06)', position: 'absolute', top: 0, left: 0 }}
            />
            <CircularProgress
                variant='determinate'
                value={score}
                size={90}
                thickness={4}
                sx={{ color, position: 'absolute', top: 0, left: 0, filter: `drop-shadow(0 0 6px ${color})` }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Typography sx={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{score}</Typography>
                <Typography sx={{ fontSize: 9, color: 'text.secondary', letterSpacing: '0.1em' }}>SCORE</Typography>
            </Box>
        </Box>
    )
}

// ─── Finding Card ─────────────────────────────────────────────────────────────
const FindingCard = ({ finding }) => {
    const [expanded, setExpanded] = useState(false)
    const s = SEV_CONFIG[finding.severity]

    return (
        <Paper
            onClick={() => setExpanded(!expanded)}
            elevation={0}
            sx={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius: 2,
                p: '12px 14px',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: s.color }
            }}
        >
            <Stack direction='row' spacing={1} alignItems='flex-start'>
                <Typography sx={{ fontSize: 15, mt: '2px' }}>{s.icon}</Typography>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap' mb={0.5}>
                        <Chip
                            label={s.label}
                            size='small'
                            sx={{
                                background: `${s.color}18`,
                                color: s.color,
                                fontWeight: 700,
                                fontSize: 10,
                                height: 20,
                                border: `1px solid ${s.color}40`
                            }}
                        />
                        <Chip
                            label={finding.category}
                            size='small'
                            sx={{ background: 'rgba(255,255,255,0.05)', color: 'text.secondary', fontSize: 10, height: 20 }}
                        />
                        <Typography sx={{ fontSize: 10, color: 'text.disabled', ml: 'auto !important' }}>{finding.node}</Typography>
                    </Stack>

                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{finding.title}</Typography>

                    <Collapse in={expanded}>
                        <Box mt={1.5}>
                            <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.7, mb: 1.5 }}>
                                {finding.description}
                            </Typography>
                            <Box
                                sx={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: 1.5,
                                    p: '10px 12px',
                                    mb: 1
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: 10,
                                        color: 'text.disabled',
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                        mb: 0.5
                                    }}
                                >
                                    Recommended Fix
                                </Typography>
                                <Typography sx={{ fontSize: 12, color: '#86efac' }}>{finding.fix}</Typography>
                            </Box>
                            <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>📖 {finding.reference}</Typography>
                        </Box>
                    </Collapse>
                </Box>
                <Box
                    sx={{
                        color: 'text.disabled',
                        mt: '2px',
                        transition: 'transform 0.2s',
                        transform: expanded ? 'rotate(180deg)' : 'none'
                    }}
                >
                    <IconChevronDown size={14} />
                </Box>
            </Stack>
        </Paper>
    )
}

// ─── Scan Steps Animation ─────────────────────────────────────────────────────
const ScanAnimation = ({ flowName }) => {
    const steps = [
        'Parsing flow structure...',
        'Analyzing LLM configurations...',
        'Checking prompt templates...',
        'Scanning for security issues...',
        'Comparing against best practices...',
        'Evaluating memory & tools...',
        'Generating findings report...'
    ]
    const [step, setStep] = useState(0)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const t = setInterval(() => {
            setStep((s) => (s < steps.length - 1 ? s + 1 : s))
            setProgress((p) => Math.min(p + 100 / steps.length, 95))
        }, 400)
        return () => clearInterval(t)
    }, [steps.length])

    return (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
            <Box sx={{ position: 'relative', width: 56, height: 56 }}>
                <CircularProgress
                    size={56}
                    thickness={2}
                    sx={{ color: 'primary.main', opacity: 0.3, position: 'absolute' }}
                    variant='determinate'
                    value={100}
                />
                <CircularProgress size={56} thickness={2} sx={{ color: 'primary.main', position: 'absolute' }} />
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    🔍
                </Box>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'primary.main', mb: 1 }}>
                    Reviewing &quot;{flowName}&quot;
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: 'text.secondary', minHeight: 18 }}>{steps[step]}</Typography>
            </Box>
            <Box sx={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <Box
                    sx={{
                        height: '100%',
                        borderRadius: 2,
                        background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                        width: `${progress}%`,
                        transition: 'width 0.4s ease',
                        boxShadow: '0 0 10px rgba(99,102,241,0.5)'
                    }}
                />
            </Box>
        </Box>
    )
}

// ─── Main ReviewPanel ─────────────────────────────────────────────────────────
const ReviewPanel = ({ chatflow, nodes, edges, onClose, onReview }) => {
    const theme = useTheme()
    const [phase, setPhase] = useState('scanning') // scanning | results
    const [result, setResult] = useState(null)
    const [filter, setFilter] = useState('all')

    const runReview = useCallback(async () => {
        setPhase('scanning')
        setResult(null)
        try {
            const findings = await onReview(nodes, edges, chatflow)
            setResult(findings)
            setPhase('results')
        } catch (e) {
            console.error('Review failed:', e)
            setPhase('results')
            setResult({ findings: [], score: 0, error: e.message })
        }
    }, [nodes, edges, chatflow, onReview])

    useEffect(() => {
        runReview()
    }, [runReview])

    const findings = result?.findings || []
    const filtered = filter === 'all' ? findings : findings.filter((f) => f.severity === filter)
    const counts = {
        critical: findings.filter((f) => f.severity === 'critical').length,
        warning: findings.filter((f) => f.severity === 'warning').length,
        suggestion: findings.filter((f) => f.severity === 'suggestion').length
    }

    const handleExport = () => {
        const data = JSON.stringify(result, null, 2)
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `toruk-review-${chatflow?.name || 'flow'}-${Date.now()}.json`
        a.click()
    }

    return (
        <Box
            sx={{
                width: 400,
                height: '100%',
                background: theme.palette.background.paper,
                borderLeft: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0
            }}
        >
            {/* Header */}
            <Stack
                direction='row'
                alignItems='center'
                spacing={1.5}
                sx={{ p: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}` }}
            >
                <Box
                    sx={{
                        width: 30,
                        height: 30,
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        flexShrink: 0
                    }}
                >
                    🔍
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Agent Review</Typography>
                    <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>TORUK Learning Engine</Typography>
                </Box>
                <IconButton size='small' onClick={onClose}>
                    <IconX size={16} />
                </IconButton>
            </Stack>

            {/* Content */}
            <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {phase === 'scanning' && (
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                        <ScanAnimation flowName={chatflow?.name || 'Flow'} />
                    </Box>
                )}

                {phase === 'results' && result && (
                    <>
                        {/* Summary */}
                        <Stack
                            direction='row'
                            spacing={2}
                            alignItems='center'
                            sx={{ p: '14px 16px', borderBottom: `1px solid ${theme.palette.divider}` }}
                        >
                            <ScoreRing score={result.score || 0} />
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontSize: 12.5, fontWeight: 600, mb: 1 }}>{chatflow?.name || 'Flow'}</Typography>
                                <Stack direction='row' spacing={1}>
                                    {['critical', 'warning', 'suggestion'].map((sev) => (
                                        <Box
                                            key={sev}
                                            sx={{
                                                background: SEV_CONFIG[sev].bg,
                                                border: `1px solid ${SEV_CONFIG[sev].border}`,
                                                borderRadius: 1.5,
                                                p: '5px 8px',
                                                textAlign: 'center',
                                                flex: 1
                                            }}
                                        >
                                            <Typography sx={{ fontSize: 17, fontWeight: 800, color: SEV_CONFIG[sev].color, lineHeight: 1 }}>
                                                {counts[sev]}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: 9,
                                                    color: 'text.disabled',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    mt: 0.3
                                                }}
                                            >
                                                {sev === 'suggestion' ? 'Tips' : sev}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                                <Typography sx={{ fontSize: 10, color: 'text.disabled', mt: 1 }}>
                                    {nodes?.length || 0} nodes · {new Date().toLocaleTimeString()}
                                </Typography>
                            </Box>
                        </Stack>

                        {/* Filter Tabs */}
                        <Stack direction='row' spacing={0.8} sx={{ px: 2, py: 1.2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                            {['all', 'critical', 'warning', 'suggestion'].map((f) => {
                                const active = filter === f
                                const col = f === 'all' ? '#6366f1' : SEV_CONFIG[f]?.color
                                return (
                                    <Chip
                                        key={f}
                                        label={f === 'all' ? `All (${findings.length})` : `${f} (${counts[f]})`}
                                        size='small'
                                        onClick={() => setFilter(f)}
                                        sx={{
                                            fontSize: 10,
                                            height: 22,
                                            cursor: 'pointer',
                                            textTransform: 'capitalize',
                                            background: active ? `${col}18` : 'transparent',
                                            color: active ? col : 'text.disabled',
                                            border: `1px solid ${active ? col : 'rgba(255,255,255,0.1)'}`,
                                            fontWeight: active ? 700 : 400
                                        }}
                                    />
                                )
                            })}
                        </Stack>

                        {/* Findings */}
                        <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {result.error && (
                                <Typography sx={{ fontSize: 12, color: 'error.main', textAlign: 'center', py: 4 }}>
                                    Error: {result.error}
                                </Typography>
                            )}
                            {filtered.length === 0 && !result.error && (
                                <Typography sx={{ fontSize: 13, color: 'text.disabled', textAlign: 'center', py: 4 }}>
                                    ✓ No findings in this category
                                </Typography>
                            )}
                            {filtered.map((f) => (
                                <FindingCard key={f.id} finding={f} />
                            ))}
                        </Box>

                        {/* Footer */}
                        <Stack direction='row' spacing={1} sx={{ p: '10px 16px', borderTop: `1px solid ${theme.palette.divider}` }}>
                            <Button
                                fullWidth
                                size='small'
                                variant='outlined'
                                startIcon={<IconRefresh size={14} />}
                                onClick={runReview}
                                sx={{
                                    fontSize: 11,
                                    borderColor: 'rgba(99,102,241,0.3)',
                                    color: '#a5b4fc',
                                    '&:hover': { borderColor: '#6366f1', background: 'rgba(99,102,241,0.08)' }
                                }}
                            >
                                Re-run
                            </Button>
                            <Button
                                fullWidth
                                size='small'
                                variant='outlined'
                                startIcon={<IconDownload size={14} />}
                                onClick={handleExport}
                                sx={{ fontSize: 11 }}
                            >
                                Export
                            </Button>
                        </Stack>
                    </>
                )}
            </Box>
        </Box>
    )
}

ReviewPanel.propTypes = {
    chatflow: PropTypes.object,
    nodes: PropTypes.array,
    edges: PropTypes.array,
    onClose: PropTypes.func,
    onReview: PropTypes.func
}

ScoreRing.propTypes = { score: PropTypes.number }
FindingCard.propTypes = { finding: PropTypes.object }
ScanAnimation.propTypes = { flowName: PropTypes.string }

export default ReviewPanel
