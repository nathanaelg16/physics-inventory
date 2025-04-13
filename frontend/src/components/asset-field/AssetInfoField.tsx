interface Props {
    label: string,
    value: string,
    placeholder?: string
}

export default function AssetInfoField({label, value, placeholder = 'N/A'}: Props) {
    return <div className="asset--details-field">
        <p><strong>{label}</strong></p>
        <p className="readonly-field">
            {value || <span style={{ color: '#999', fontStyle: 'italic' }}>{placeholder}</span>}
        </p>
    </div>
}