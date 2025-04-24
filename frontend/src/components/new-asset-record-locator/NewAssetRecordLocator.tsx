import { TextField, FormControlLabel, Box, Switch } from '@mui/material'
import { useState, ChangeEvent } from 'react'
import {recordLocatorValidator} from "../../utils/validators";
import './newAssetRecordLocator.css'

interface Props {
    recordLocator: string
    setRecordLocator: (value: string) => void
    autoAssignRecordLocator: boolean
    setAutoAssignRecordLocator: (value: boolean) => void
}

export default function NewAssetRecordLocator({
                                          recordLocator,
                                          setRecordLocator,
                                          autoAssignRecordLocator,
                                          setAutoAssignRecordLocator
                                      }: Props) {
    const [touched, setTouched] = useState(false)
    const showError = touched && !recordLocatorValidator(recordLocator) && !autoAssignRecordLocator

    const handleRecordLocatorChange = (e: ChangeEvent<HTMLInputElement>) => {
        setRecordLocator(e.target.value)
    }

    const handleAutoAssignChange = (e: ChangeEvent<HTMLInputElement>) => {
        setAutoAssignRecordLocator(e.target.checked)
        // If turning on auto-assign, clear any existing record locator value
        if (e.target.checked) {
            setRecordLocator('')
        }
    }

    const handleBlur = () => {
        setTouched(true)
    }

    return (
        <div className="new-asset--record-locator">
            <div className="new-asset--record-field">
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <strong>Record #:</strong>
                </Box>
                <TextField
                    fullWidth
                    size="small"
                    value={recordLocator}
                    onChange={handleRecordLocatorChange}
                    onBlur={handleBlur}
                    disabled={autoAssignRecordLocator}
                    error={showError}
                    helperText={showError ? 'Only numbers allowed' : ''}
                    placeholder={autoAssignRecordLocator ? 'Will be assigned automatically' : 'Enter record number'}
                    autoComplete="off"
                    slotProps={{
                        input: {
                            sx: {
                                backgroundColor: autoAssignRecordLocator ? '#f0f0f0' : 'white',
                                '&.Mui-disabled': {
                                    opacity: 0.7,
                                    cursor: 'not-allowed',
                                }
                            }
                        }
                    }}
                />
            </div>

            <div className="new-asset--auto-assign">
                <FormControlLabel
                    control={
                        <Switch
                            checked={autoAssignRecordLocator}
                            onChange={handleAutoAssignChange}
                            color="primary"
                        />
                    }
                    label="Auto-assign"
                    sx={{ margin: 0 }}
                />
            </div>
        </div>
    )
}