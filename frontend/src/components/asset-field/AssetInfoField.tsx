interface Props {
    label: string,
    value: string,
    placeholder?: string,
    className?: string,
}

export default function AssetInfoField({label, value, placeholder = 'N/A', className = ''}: Props) {
    return <div className={`asset--details-field ${className}`}>
        <p><strong>{label}</strong></p>
        <p className="readonly-field">
            {value || <span style={{ color: '#999', fontStyle: 'italic' }}>{placeholder}</span>}
        </p>
    </div>
}