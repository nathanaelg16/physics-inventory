import {Button} from "@mui/material";

interface Props {
    label: string,
    documentAvailable: boolean,
    onView: () => void,
    onRemove: () => void,
    onUpload: () => void,
}

export default function AssetDocumentField({label, documentAvailable, onView, onRemove, onUpload}: Props) {
    return <div className="asset--details-field">
        <p><strong>{label}</strong></p>
        <div className="asset--details-manual-buttons">
            <Button disabled={!documentAvailable} onClick={onView}>View</Button>
            {documentAvailable ?
                <Button color='error' onClick={onRemove}>Remove</Button>
                : <Button onClick={onUpload}>Upload</Button>
            }
        </div>
    </div>
}