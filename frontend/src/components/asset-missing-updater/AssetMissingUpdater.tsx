import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    Alert,
    Box,
} from '@mui/material'
import { useState, useEffect, ChangeEvent } from 'react'
import { ReportProblem, CheckCircle } from '@mui/icons-material'
import YesNoToggle from '../yes-no-toggle/YesNoToggle'

interface Props {
    isMissing: boolean
    quantity: string
    missingQuantity: string
    disabled: boolean
    onUpdate: (missing: boolean, quantityMissing: string) => void,
}

export default function AssetMissingUpdater({ isMissing, quantity, missingQuantity, disabled, onUpdate }: Props) {
    const [allFound, setAllFound] = useState<boolean>(true)
    const [showDialog, setShowDialog] = useState<boolean>(false)
    const [quantityValue, setQuantityValue] = useState<string>('')
    const [error, setError] = useState<string>('')

    // Reset state when dialog is opened
    useEffect(() => {
        if (showDialog) {
            setAllFound(true)
            setQuantityValue(isMissing ? missingQuantity : quantity)
            setError('')
        }
    }, [showDialog, isMissing, missingQuantity])

    const validateQuantity = (value: string): boolean => {
        if (!value.trim()) {
            setError('Quantity is required')
            return false
        }

        setError('')
        return true
    }

    const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setQuantityValue(value)
        if (value) validateQuantity(value)
        else setError('')
    }

    const closeDialog = () => {
        setShowDialog(false)
    }

    const updateButtonClicked = () => {
        if ((!isMissing || !allFound) && !quantityValue.trim()) {
            setError('Quantity is required')
            return
        }

        closeDialog()
        onUpdate(isMissing ? !allFound : true, quantityValue)
    }

    return (
        <>
            <Button
                size="small"
                variant="outlined"
                color={isMissing ? 'success' : 'error'}
                onClick={() => setShowDialog(true)}
                disabled={disabled}
                startIcon={isMissing ? <CheckCircle /> : <ReportProblem />}
                sx={{
                    textTransform: 'none',
                    borderWidth: '1.5px',
                    '&:hover': {
                        borderWidth: '1.5px',
                    }
                }}
            >
                {isMissing ? 'Mark as Found' : 'Mark as Missing'}
            </Button>

            <Dialog
                open={showDialog}
                onClose={closeDialog}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: isMissing ? '#e8f5e9' : '#ffebee',
                        color: isMissing ? '#2e7d32' : '#d32f2f',
                        pb: 1
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {isMissing ?
                            <CheckCircle sx={{ mr: 1 }} /> :
                            <ReportProblem sx={{ mr: 1 }} />
                        }
                        Update Missing Status
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ pt: 2, pb: 1, mt: 2}}>
                    {!isMissing ? (
                        <>
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                This will mark the asset as missing in the system
                            </Alert>

                            <Typography variant="body1" sx={{ mb: 2 }}>
                                How many units are missing?
                            </Typography>

                            <TextField
                                label="Quantity missing"
                                variant="outlined"
                                fullWidth
                                value={quantityValue}
                                onChange={handleQuantityChange}
                                error={!!error}
                                helperText={error}
                                placeholder={quantity}
                                autoFocus
                            />
                        </>
                    ) : (
                        <>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Currently marked as missing: {missingQuantity}
                            </Alert>

                            <Typography variant="body1" sx={{ mb: 1 }}>
                                Have all missing assets been found?
                            </Typography>

                            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                                <YesNoToggle value={allFound} setValue={setAllFound} />
                            </Box>

                            {!allFound && (
                                <>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        How many are still missing?
                                    </Typography>

                                    <TextField
                                        label="Quantity still missing"
                                        variant="outlined"
                                        fullWidth
                                        value={quantityValue}
                                        onChange={handleQuantityChange}
                                        error={!!error}
                                        helperText={error}
                                        placeholder={missingQuantity}
                                    />
                                </>
                            )}
                        </>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={closeDialog}
                        sx={{
                            color: '#B8860B',
                            borderColor: '#B8860B',
                            '&:hover': {
                                borderColor: '#B8860B',
                                backgroundColor: 'rgba(184, 134, 11, 0.04)'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color={isMissing ? 'success' : 'error'}
                        onClick={updateButtonClicked}
                        disabled={(!isMissing && !quantityValue.trim()) || (!allFound && !quantityValue.trim())}
                    >
                        {isMissing ? (allFound ? 'Mark All Found' : 'Update Status') : 'Mark Missing'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}