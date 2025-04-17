import './yesNoToggle.css'

interface Props {
    value: boolean
    setValue: (value: boolean) => void
}

export default function YesNoToggle({ value, setValue }: Props) {
    const handleChange = (newValue: boolean) => {
        setValue(newValue)
    }

    return (
        <div className="yes-no-selector">
            <button
                type="button"
                className={`option-button ${!value ? 'selected' : ''}`}
                onClick={() => handleChange(false)}
            >
                No
            </button>
            <button
                type="button"
                className={`option-button ${value ? 'selected' : ''}`}
                onClick={() => handleChange(true)}
            >
                Yes
            </button>
        </div>
    )
}