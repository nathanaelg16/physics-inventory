import {useEffect, useRef, useState, ChangeEvent, KeyboardEvent} from "react";
import {TextField} from "@mui/material";

interface Props {
    text: string,
    onSave: (newText: string) => void,
    className?: string,
    multiline?: boolean,
    placeholder?: string,
}

export default function EditableParagraph({
  text,
  onSave,
  className = '',
  multiline = false,
  placeholder = 'N/A'
}: Props) {
    const [isEditing, setEditing] = useState<boolean>(false)
    const [value, setValue] = useState<string>(text)
    const textFieldRef = useRef<HTMLInputElement>(null)

    // Focus the text field when entering edit mode
    useEffect(() => {
        if (isEditing && textFieldRef.current) {
            textFieldRef.current.focus()
        }
    }, [isEditing])

    const handleClick = () => {
        setEditing(true)
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value)
    };

    const handleBlur = () => {
        setEditing(false);
        if (value !== text) {
            onSave(value)
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) {
            e.preventDefault()
            setEditing(false)
            onSave(value)
        } else if (e.key === 'Escape') {
            e.preventDefault()
            setValue(text) // Reset to original value
            setEditing(false)
        }
    };

    return isEditing ? (
        <TextField
            inputRef={textFieldRef}
            fullWidth
            multiline={multiline}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            variant="outlined"
            size="small"
            autoFocus
            sx={{ margin: '4px 0' }}
            autoComplete='off'
        />
    ) : (
        <p
            className={`editable-paragraph ${className}`}
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
        >
            {value || <span style={{ color: '#999', fontStyle: 'italic' }}>{placeholder}</span>}
        </p>
    );
}