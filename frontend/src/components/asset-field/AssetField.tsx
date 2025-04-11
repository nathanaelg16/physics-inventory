import EditableParagraph from "../editable-paragraph/EditableParagraph";

interface Props {
    label: string,
    fieldName: string,
    value: string,
    onSave: (field: string, value: string) => void,
    multiline?: boolean,
    placeholder?: string,
}

export default function AssetField({label, fieldName, value, onSave, multiline = false, placeholder = 'N/A'}: Props) {
    return (
        <div className="asset--details-field">
            <p><strong>{label}</strong></p>
            <EditableParagraph
                text={value}
                onSave={(newText) => onSave(fieldName, newText)}
                multiline={multiline}
                placeholder={placeholder}
            />
        </div>
    )
}