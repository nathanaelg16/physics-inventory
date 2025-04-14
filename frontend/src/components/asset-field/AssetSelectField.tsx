import { useState } from 'react'
import { Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material'
import { Edit } from '@mui/icons-material'

interface Props {
    label: string
    fieldName: string
    value: any
    options: Array<{ value: any, label: string }>
    onSave: (field: string, value: any) => void
    placeholder?: string
    isEdited?: boolean
}

export default function AssetSelectField({
                                             label,
                                             fieldName,
                                             value,
                                             options,
                                             onSave,
                                             placeholder = 'Select an option',
                                             isEdited = false
                                         }: Props) {
    const [isEditing, setEditing] = useState<boolean>(false)
    const [currentValue, setCurrentValue] = useState<any>(value)

    const handleClick = () => {
        setEditing(true)
    }

    const handleChange = (event: SelectChangeEvent<any>) => {
        const newValue = event.target.value
        onSave(fieldName, newValue)
        setCurrentValue(newValue)
    }

    const handleClose = () => {
        setEditing(false)
    }

    return (
        <div className="asset--details-field">
            <p><strong>{label}</strong></p>
            {isEditing ? (
                <FormControl fullWidth size="small" sx={{ margin: '4px 0' }}>
                    <InputLabel id={`${fieldName}-select-label`}>{placeholder}</InputLabel>
                    <Select
                        labelId={`${fieldName}-select-label`}
                        value={currentValue}
                        label={placeholder}
                        onChange={handleChange}
                        onClose={handleClose}
                        onBlur={handleClose}
                        open={isEditing}
                        autoFocus
                    >
                        {options.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ) : (
                <div className={`editable-paragraph-container ${isEdited ? 'edited-field' : ''}`}>
                    <p
                        className="editable-paragraph"
                        onClick={handleClick}
                        style={{ cursor: 'pointer' }}
                    >
                        {options.find(opt => opt.value === currentValue)?.label ||
                            <span style={{ color: '#999', fontStyle: 'italic' }}>{placeholder}</span>}
                    </p>
                    {isEdited && (
                        <Edit className="edit-indicator" fontSize="small" titleAccess="Field has unsaved changes" />
                    )}
                </div>
            )}
        </div>
    )
}