import {useState} from 'react'
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Typography
} from '@mui/material'
import {CameraAlt, Close, DeleteOutline, Warning, ZoomIn} from '@mui/icons-material'
import defaultImage from '../../assets/image_not_available.png'
import './assetImageManager.css'

interface Props {
    imageData: any
    assetName: string
    onChangeImage: () => Promise<void>
    onDeleteImage: () => Promise<void>
    disabled: boolean,
    allowEdits: boolean
}

export default function AssetImageManager({
                                              imageData,
                                              assetName,
                                              onChangeImage,
                                              onDeleteImage,
                                              disabled,
                                              allowEdits
                                          }: Props) {
    const [processing, setProcessing] = useState<boolean>(false)
    const [zoomDialogOpen, setZoomDialogOpen] = useState<boolean>(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)

    const handleChangeImage = () => {
        setProcessing(true)
        onChangeImage()
            .then(() => setProcessing(false))
    }

    const openDeleteDialog = () => {
        setDeleteDialogOpen(true)
    }

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false)
    }

    const confirmDelete = () => {
        closeDeleteDialog()
        setProcessing(true)
        onDeleteImage()
            .then(() => setProcessing(false))
    }

    const handleZoomClick = () => {
        setZoomDialogOpen(true)
    }

    const closeZoomDialog = () => {
        setZoomDialogOpen(false)
    }

    const currentImage = imageData !== null
        ? `data:image/unknown;base64,${imageData}`
        : defaultImage

    return (
        <div className="asset-image-manager">
            <Paper
                elevation={1}
                className="image-paper"
            >
                <div className="image-container">
                    <img
                        src={currentImage}
                        alt={assetName || 'Asset'}
                        className="asset-image"
                    />

                    {!disabled && !processing && (
                        <div className="image-overlay">
                            <div className="image-overlay-content">
                                {imageData !== null && (
                                    <>
                                        <Button
                                            variant="contained"
                                            onClick={handleZoomClick}
                                            startIcon={<ZoomIn />}
                                            size="small"
                                            className="zoom-button"
                                        >
                                            Zoom
                                        </Button>
                                    </>
                                )}

                                {allowEdits && <Button
                                    variant="contained"
                                    onClick={handleChangeImage}
                                    startIcon={<CameraAlt />}
                                    className="upload-button"
                                    size="small"
                                >
                                    Change Image
                                </Button>}

                                {imageData !== null && allowEdits && (
                                        <Button
                                            variant="contained"
                                            onClick={openDeleteDialog}
                                            startIcon={<DeleteOutline />}
                                            size="small"
                                            className="delete-button"
                                        >
                                            Remove
                                        </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {processing && (
                        <div className="processing-overlay">
                            <CircularProgress size={40} />
                        </div>
                    )}
                </div>
            </Paper>

            {/* Zoom dialog for viewing larger images */}
            <Dialog
                open={zoomDialogOpen}
                onClose={closeZoomDialog}
                maxWidth="lg"
                fullWidth
                slotProps={{
                    paper: {
                        style: { borderRadius: '12px' }
                    }
                }}
                className="zoom-dialog"
            >
                <DialogContent className="zoom-dialog-content">
                    <div className="zoom-header">
                        <Typography variant="h6">{assetName || 'Asset Image'}</Typography>
                        <IconButton
                            onClick={closeZoomDialog}
                            color="inherit"
                            size="small"
                            className="close-button"
                        >
                            <Close />
                        </IconButton>
                    </div>

                    <div className="zoom-image-container">
                        <img
                            src={currentImage}
                            alt={assetName || 'Asset'}
                            className="zoom-image"
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={closeDeleteDialog}
                maxWidth="xs"
                slotProps={{
                    paper: {
                        style: { borderRadius: '12px' }
                    }
                }}
                className="delete-dialog"
            >
                <DialogTitle className="delete-dialog-title">
                    <div className="delete-dialog-title-content">
                        <Warning color="error" className="delete-warning-icon" />
                        <Typography variant="h6">Remove Image</Typography>
                    </div>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to remove this image? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions className="delete-dialog-actions">
                    <Button
                        onClick={closeDeleteDialog}
                        color="inherit"
                        variant="text"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        color="error"
                        variant="contained"
                        startIcon={<DeleteOutline />}
                    >
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}