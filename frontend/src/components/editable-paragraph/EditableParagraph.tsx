import {ChangeEvent, KeyboardEvent, useEffect, useRef, useState} from 'react'
import {TextField} from '@mui/material'
import {Edit} from '@mui/icons-material'
import {formatDate} from '../../utils/utils'

interface Props {
    text: string,
    onSave: (newText: string) => void,
    className?: string,
    multiline?: boolean,
    placeholder?: string,
    inputType?: string,
    validator?: (value: string) => boolean,
    helperText?: string,
    slotProps?: any,
    isEdited?: boolean,
}

export default function EditableParagraph({
                                              text,
                                              onSave,
                                              className = '',
                                              multiline = false,
                                              placeholder = 'N/A',
                                              inputType = 'text',
                                              validator = (_: string) => true,
                                              helperText = '',
                                              slotProps = {},
                                              isEdited = false,
                                          }: Props) {
    const [isEditing, setEditing] = useState<boolean>(false)
    const [value, setValue] = useState<string>(() => {
        if (inputType === 'date') return formatDate(text)
        else return text
    })
    const textFieldRef = useRef<HTMLInputElement>(null)

    // Focus the text field when entering edit mode
    useEffect(() => {
        if (isEditing && textFieldRef.current) {
            textFieldRef.current.focus()
        }
    }, [isEditing])

    const handleClick = () => {
        setEditing(true)
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value)
    }

    const handleBlur = () => {
        if (!validator(value)) {
            if (textFieldRef.current) textFieldRef.current.focus()
            return
        }

        setEditing(false)
        onSave(value)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) {
            e.preventDefault()
            if (validator(value)) {
                setEditing(false)
                onSave(value)
            } else {
                if (textFieldRef.current) textFieldRef.current.focus()
            }
        } else if (e.key === 'Escape') {
            e.preventDefault()
            setValue(text) // Reset to original value
            setEditing(false)
        }
    }

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
            sx={{margin: '4px 0'}}
            autoComplete='off'
            type={inputType}
            error={!validator(value)}
            helperText={!validator(value) && helperText}
            slotProps={slotProps}
        />
    ) : (
        <div className={`editable-paragraph-container ${isEdited ? 'edited-field' : ''}`}>
            <p
                className={`editable-paragraph ${className}`}
                onClick={handleClick}
                style={{cursor: 'pointer'}}
            >
                {value || <span style={{color: '#999', fontStyle: 'italic'}}>{placeholder}</span>}
            </p>
            {isEdited && (
                <Edit className="edit-indicator" fontSize="small" titleAccess="Field has unsaved changes" />
            )}
        </div>
    )
}