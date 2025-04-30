import EditableParagraph from '../editable-paragraph/EditableParagraph'

interface Props {
    label: string,
    fieldName: string,
    value: string,
    onSave: (field: string, value: string) => void,
    allowEdits: boolean,
    multiline?: boolean,
    placeholder?: string,
    inputType?: string,
    validator?: (value: string) => boolean,
    helperText?: string,
    slotProps?: any,
    isEdited?: boolean,
    className?: string,
}

export default function AssetField({
                                       label,
                                       fieldName,
                                       value,
                                       onSave,
                                       allowEdits,
                                       multiline = false,
                                       placeholder = 'N/A',
                                       inputType = 'text',
                                       validator = (_: string) => true,
                                       helperText = '',
                                       slotProps = {},
                                       isEdited = false,
                                       className = ''
                                   }: Props) {
    return (
        <div className="asset--details-field">
            <p><strong>{label}</strong></p>
            <EditableParagraph
                text={value}
                onSave={(newText) => onSave(fieldName, newText)}
                multiline={multiline}
                placeholder={placeholder}
                inputType={inputType}
                validator={validator}
                helperText={helperText}
                slotProps={slotProps}
                isEdited={isEdited}
                className={className}
                allowEdits={allowEdits}
            />
        </div>
    )
}