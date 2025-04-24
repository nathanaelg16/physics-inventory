import { Button, Chip, Tooltip, Box } from '@mui/material'
import { SelectFile } from '../../../wailsjs/go/main/App'
import {AttachFile, Image, Delete, InsertDriveFile, Info} from '@mui/icons-material'

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
    fileType: 'image' | 'document'
    required?: boolean
    tooltip?: string
}

export default function NewAssetDocumentSelectField({
                                                        label,
                                                        value,
                                                        onChange,
                                                        fileType,
                                                        required = false,
                                                        tooltip = ''
                                                    }: Props) {
    const handleClick = () => {
        SelectFile(fileType)
            .then((fileName) => onChange(fileName))
            .catch((error) => console.error('Error selecting file:', error))
    }

    const handleDelete = () => {
        onChange('')
    }

    const FileIcon = fileType === 'image' ? Image : InsertDriveFile

    return (
        <div className="new-asset--details-field">
            <p>
                <strong>{label}</strong>
                {required && <span style={{ color: 'red' }}> *</span>}
                {tooltip && (
                    <Tooltip title={tooltip} arrow placement="top">
                        <Info fontSize="small" style={{ marginLeft: '4px', fontSize: '16px', verticalAlign: 'middle', color: '#666' }} />
                    </Tooltip>
                )}
            </p>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Button
                    variant="outlined"
                    onClick={handleClick}
                    startIcon={<AttachFile />}
                    size="small"
                    sx={{
                        width: 'fit-content',
                        borderColor: '#004e89',
                        color: '#004e89',
                        '&:hover': {
                            borderColor: '#003865',
                            backgroundColor: 'rgba(0, 78, 137, 0.05)',
                        }
                    }}
                >
                    {value ? 'Change File' : `Select ${fileType === 'image' ? 'Image' : 'Document'}`}
                </Button>

                {Boolean(value) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Chip
                            icon={<FileIcon fontSize="small" />}
                            label={trimFileName(value)}
                            onDelete={handleDelete}
                            deleteIcon={<Delete fontSize="small" />}
                            sx={{
                                maxWidth: '100%',
                                '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }
                            }}
                        />
                    </Box>
                )}
            </Box>
        </div>
    )
}