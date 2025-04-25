import {FormControl, MenuItem, Select, SelectChangeEvent} from '@mui/material'

interface Props {
    label: string
    onChange: (value: string) => void
    value: string
    options: Array<{ value: string, label: string }>
    disabled?: boolean
}

export default function NewAssetSelectField({
                                                label,
                                                onChange,
                                                value,
                                                options,
                                                disabled = false,
                                            }: Props) {
    const handleChange = (event: SelectChangeEvent<any>) => {
        onChange(event.target.value)
    }

    return (
        <div className="new-asset--details-field">
            <p><strong>{label}</strong></p>
            <FormControl fullWidth size="small" sx={{ margin: '4px 0' }} disabled={disabled}>
                <Select
                    value={value}
                    onChange={handleChange}
                    sx={{
                        backgroundColor: disabled ? '#f0f0f0' : 'white',
                        '&.Mui-disabled': {
                            opacity: 0.7
                        }
                    }}
                >
                    {options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    )
}