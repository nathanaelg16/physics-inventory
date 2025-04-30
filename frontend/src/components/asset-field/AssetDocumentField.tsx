import {Button, Tooltip, useMediaQuery, useTheme} from '@mui/material'
import {Delete, Download, Upload} from '@mui/icons-material'

interface Props {
    label: string
    documentAvailable: boolean
    onDownload: () => void
    onRemove: () => void
    onUpload: () => void
    allowEdits: boolean,
    disabled?: boolean
}

export default function AssetDocumentField({
                                               label,
                                               documentAvailable,
                                               onDownload,
                                               onRemove,
                                               onUpload,
                                               allowEdits,
                                               disabled = false
                                           }: Props) {
    const theme = useTheme()
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

    return (
        <div className="asset--details-field">
            <p><strong>{label}</strong></p>
            <div className="asset-document-field-buttons">
                <Tooltip title={documentAvailable ? 'Download document' : 'No document available'}>
                    <span>
                        <Button
                            variant="outlined"
                            size={isSmallScreen ? 'small' : 'medium'}
                            disabled={!documentAvailable || disabled}
                            onClick={onDownload}
                            startIcon={<Download />}
                        >
                            Download
                        </Button>
                    </span>
                </Tooltip>

                {allowEdits && (documentAvailable ? (
                    <Tooltip title="Remove document">
                        <Button
                            variant="outlined"
                            color="error"
                            size={isSmallScreen ? 'small' : 'medium'}
                            onClick={onRemove}
                            disabled={disabled}
                            startIcon={<Delete />}
                        >
                            Remove
                        </Button>
                    </Tooltip>
                ) : (
                    <Tooltip title="Upload new document">
                        <Button
                            variant="outlined"
                            color="primary"
                            size={isSmallScreen ? 'small' : 'medium'}
                            onClick={onUpload}
                            disabled={disabled}
                            startIcon={<Upload />}
                        >
                            Upload
                        </Button>
                    </Tooltip>
                ))}
            </div>
        </div>
    )
}