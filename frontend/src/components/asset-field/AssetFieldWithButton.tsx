import EditableParagraph from '../editable-paragraph/EditableParagraph'
import { Button } from '@mui/material'
import './assetFieldWithButton.css'

interface Props {
    label: string
    fieldName: string
    value: string
    onSave: (field: string, value: string) => void
    showAction?: boolean
    actionLabel?: string
    onAction?: () => void
    multiline?: boolean
    placeholder?: string
}

export default function AssetFieldWithButton({
                                                 label,
                                                 fieldName,
                                                 value,
                                                 onSave,
                                                 showAction = false,
                                                 actionLabel = 'Action',
                                                 onAction = () => {},
                                                 multiline = false,
                                                 placeholder = 'N/A'
                                             }: Props) {
    return (
        <div className="asset--details-field asset--field-with-button">
            <p><strong>{label}</strong></p>
            <div className="field-content-container">
                <EditableParagraph
                    text={value}
                    onSave={(newText) => onSave(fieldName, newText)}
                    multiline={multiline}
                    placeholder={placeholder}
                    className="field-editable-content"
                />
                {showAction && (
                    <Button
                        onClick={onAction}
                        size="small"
                        variant="outlined"
                        className="field-action-button"
                    >
                        {actionLabel}
                    </Button>
                )}
            </div>
        </div>
    )
}