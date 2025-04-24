import { TextField, Tooltip, InputAdornment } from '@mui/material'
import { Info } from '@mui/icons-material'
import { useState, ReactNode } from 'react'

interface Props {
    value: string
    label: string
    onChange: (value: string) => void
    required?: boolean
    inputType?: string
    multiline?: boolean
    validator?: (value: string) => boolean
    helperText?: string
    disabled?: boolean
    tooltip?: string
    minRows?: number
    maxRows?: number
    startAdornment?: ReactNode
    endAdornment?: ReactNode
}

export default function NewAssetField({
                                          value,
                                          label,
                                          onChange,
                                          required = false,
                                          inputType = 'text',
                                          multiline = false,
                                          validator = (_: string) => true,
                                          helperText = '',
                                          disabled = false,
                                          tooltip = '',
                                          minRows = 3,
                                          maxRows = 5,
                                          startAdornment,
                                          endAdornment
                                      }: Props) {
    const [touched, setTouched] = useState(false)
    const isValid = validator(value)
    const showError = touched && !isValid

    const handleBlur = () => {
        setTouched(true)
    }

    return (
        <div className="new-asset--details-field">
            <p>
                <strong>{label}</strong>
                {required && <span style={{ color: 'red' }}> *</span>}
                {tooltip && (
                    <Tooltip title={tooltip} arrow placement="top">
                        <Info fontSize="small" style={{ marginLeft: '4px', fontSize: '16px', verticalAlign: 'middle', color: '#666' }} />
                    </Tooltip>
                )}
            </p>
            <TextField
                size='small'
                fullWidth
                onChange={(e) => onChange(e.target.value)}
                onBlur={handleBlur}
                required={required}
                autoComplete='off'
                type={inputType}
                multiline={multiline}
                minRows={multiline ? minRows : undefined}
                maxRows={multiline ? maxRows : undefined}
                value={value}
                error={showError}
                helperText={showError ? helperText : ''}
                disabled={disabled}
                InputProps={{
                    startAdornment: startAdornment ? (
                        <InputAdornment position="start">{startAdornment}</InputAdornment>
                    ) : undefined,
                    endAdornment: endAdornment ? (
                        <InputAdornment position="end">{endAdornment}</InputAdornment>
                    ) : undefined,
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                            borderColor: '#004e89',
                        },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                        color: '#004e89',
                    },
                }}
            />
        </div>
    )
}