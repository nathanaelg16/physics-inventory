import {Box, Button, Chip} from '@mui/material'
import {SelectFile} from '../../../wailsjs/go/main/App'
import {AttachFile, Delete, Image, InsertDriveFile} from '@mui/icons-material'

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
    disabled?: boolean
}

export default function NewAssetDocumentSelectField({
                                                        label,
                                                        value,
                                                        onChange,
                                                        fileType,
                                                        required = false,
                                                        disabled = false
                                                    }: Props) {
    const handleClick = () => {
        if (disabled) return

        SelectFile(fileType)
            .then((fileName) => onChange(fileName))
            .catch((error) => console.error('Error selecting file:', error))
    }

    const handleDelete = () => {
        if (disabled) return
        onChange('')
    }

    const FileIcon = fileType === 'image' ? Image : InsertDriveFile

    return (
        <div className="new-asset--details-field">
            <p>
                <strong>{label}</strong>
                {required && <span style={{ color: 'red' }}> *</span>}
            </p>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: disabled ? 0.7 : 1 }}>
                <Button
                    variant="outlined"
                    onClick={handleClick}
                    startIcon={<AttachFile />}
                    size="small"
                    disabled={disabled}
                    sx={{
                        width: 'fit-content',
                        borderColor: '#004e89',
                        color: '#004e89',
                        '&:hover': {
                            borderColor: '#003865',
                            backgroundColor: 'rgba(0, 78, 137, 0.05)',
                        },
                        '&.Mui-disabled': {
                            backgroundColor: '#f0f0f0',
                            borderColor: '#ccc',
                            color: '#999'
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
                            onDelete={disabled ? undefined : handleDelete}
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