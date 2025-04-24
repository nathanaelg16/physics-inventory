import {TextField} from "@mui/material";

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
}

export default function NewAssetField({value, label, onChange, required = false, inputType = 'text', multiline = false, validator = (_: string) => true, helperText = '', disabled = false}: Props) {
    return <div className="new-asset--details-field">
        <p><strong>{label}</strong></p>
        <TextField size='small'
                   fullWidth
                   onChange={(e) => onChange(e.target.value)}
                   required={required}
                   autoComplete='off'
                   type={inputType}
                   multiline={multiline}
                   value={value}
                   error={!validator(value)}
                   helperText={!validator(value) && helperText}
                   disabled={disabled}
        />
    </div>
}