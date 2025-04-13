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
    useTheme
} from '@mui/material'
import { ExpandMore, CalendarMonth } from '@mui/icons-material'
import {formatDate} from "../../utils/utils";

interface Props {
    calibrationHistory: string[]
}

export default function AssetCalibrationHistory({ calibrationHistory }: Props) {
    const [expanded, setExpanded] = useState<boolean>(false)
    const theme = useTheme()
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

    // Handle accordion expand/collapse
    const handleChange = () => {
        setExpanded(!expanded)
    }

    // Check if there's any history to display
    const hasHistory = calibrationHistory && calibrationHistory.length > 0

    return (
        <div className="asset--calibration-history">
            <Accordion
                expanded={expanded}
                onChange={handleChange}
                className="asset--calibration-history-accordion"
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
                    aria-controls="calibration-history-content"
                    id="calibration-history-header"
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
                        <CalendarMonth fontSize="small" sx={{ marginRight: '8px', color: '#757575' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#757575' }}>
                            Calibration History {hasHistory ? `(${calibrationHistory.length})` : '(No records)'}
                        </Typography>
                    </div>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: '0 8px 16px 8px' }}>
                    {hasHistory ? (
                        <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 'none' }}>
                            <Table size={isSmallScreen ? 'small' : 'medium'} aria-label="calibration history table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date Calibrated</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {calibrationHistory.map((dateString, index) => (
                                        <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell component="th" scope="row">
                                                {formatDate(dateString)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', padding: '8px' }}>
                            No calibration history available
                        </Typography>
                    )}
                </AccordionDetails>
            </Accordion>
        </div>
    )
}