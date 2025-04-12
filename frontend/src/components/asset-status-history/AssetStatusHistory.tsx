import { useState } from 'react'
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    useMediaQuery,
    useTheme,
    Tooltip
} from '@mui/material'
import { ExpandMore, History } from '@mui/icons-material'
import { main } from '../../../wailsjs/go/models'
import HistoricalStatus = main.HistoricalStatus

interface Props {
    statusHistory: HistoricalStatus[]
}

export default function AssetStatusHistory({ statusHistory }: Props) {
    const [expanded, setExpanded] = useState<boolean>(false)
    const theme = useTheme()
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return 'Unknown date'

        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            })
        } catch (e) {
            return dateString
        }
    }

    // Handle accordion expand/collapse
    const handleChange = () => {
        setExpanded(!expanded)
    }

    // Check if there's any history to display
    const hasHistory = statusHistory && statusHistory.length > 0

    return (
        <div className="asset--status-history">
            <Accordion
                expanded={expanded}
                onChange={handleChange}
                className="asset--status-history-accordion"
                disabled={!hasHistory}
                sx={{
                    boxShadow: 'none',
                    '&:before': {
                        display: 'none',
                    },
                    borderTop: '1px solid #e0e0e0',
                    marginTop: '8px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px'
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="status-history-content"
                    id="status-history-header"
                    sx={{
                        padding: '0 0 0 8px',
                        '& .MuiAccordionSummary-expandIconWrapper': {
                            transform: 'rotate(0deg)',
                        },
                        '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                            transform: 'rotate(180deg)',
                        },
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <History fontSize="small" sx={{ marginRight: '8px', color: '#757575' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#757575' }}>
                            Status History {hasHistory ? `(${statusHistory.length})` : '(No records)'}
                        </Typography>
                    </div>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: '0 8px 16px 8px' }}>
                    {hasHistory ? (
                        <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 'none' }}>
                            <Table size={isSmallScreen ? 'small' : 'medium'} aria-label="status history table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date Changed</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {statusHistory.map((status, index) => (
                                        <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell component="th" scope="row">
                                                {formatDate(status.statusChangeDate)}
                                            </TableCell>
                                            <TableCell>
                                                <span>{status.repairStatus}</span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', padding: '8px' }}>
                            No status history available
                        </Typography>
                    )}
                </AccordionDetails>
            </Accordion>
        </div>
    )
}