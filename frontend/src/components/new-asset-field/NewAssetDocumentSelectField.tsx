import {Button, Chip} from "@mui/material";
import {SelectFile} from "../../../wailsjs/go/main/App";

function trimFileName(fileName: string): string {
    const split = fileName.split(/[\\/]/)
    const trimmedFileName = split.pop()
    if (trimmedFileName === undefined) return fileName
    else return trimmedFileName
}

interface Props {
    label: string
    value: string
    onChange: (value: string) => void
    fileType: "image" | "document"
}

export default function NewAssetDocumentSelectField({label, value, onChange, fileType}: Props) {

    const handleClick = () => {
        SelectFile(fileType)
            .then((fileName) => onChange(fileName))
    }

    const handleDelete = () => {
        onChange('')
    }

    return <div className="new-asset--details-field">
        <p><strong>{label}</strong></p>
        <div>
            <Button onClick={handleClick}>Select</Button>
            {Boolean(value) && <Chip label={trimFileName(value)} onDelete={handleDelete}/>}
        </div>
    </div>
}