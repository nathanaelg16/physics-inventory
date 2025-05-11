import './searchInput.css'
import SearchIcon from "@mui/icons-material/Search";
import {TextField} from "@mui/material";
import {ChangeEvent} from "react";

interface Props {
    value: string,
    onChange: (e: ChangeEvent<HTMLInputElement>) => void,
    placeholder?: string,
}

export default function SearchInput({value, onChange, placeholder = ''}: Props) {
    return <div className="si-wrapper">
        <SearchIcon className='si-icon' />
        <TextField
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            variant='standard'
            fullWidth
            slotProps={{
                input: {
                    disableUnderline: true,
                    className: 'si-input'
                }
            }}
        />
    </div>
}