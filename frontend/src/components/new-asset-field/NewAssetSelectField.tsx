import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent} from "@mui/material";
import {useState} from "react";

interface Props {
    label: string
    onChange: (value: string) => void,
    value: string,
    options: Array<{ value: string | number, label: string }>
}

export default function NewAssetSelectField({label, onChange, value, options}: Props) {
    const handleChange = (event: SelectChangeEvent<any>) => {
        onChange(event.target.value)
    }

    return <div className="new-asset--details-field">
        <p><strong>{label}</strong></p>
        <FormControl fullWidth size="small" sx={{ margin: '4px 0' }}>
            <Select
                value={value}
                onChange={handleChange}
            >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    </div>
}