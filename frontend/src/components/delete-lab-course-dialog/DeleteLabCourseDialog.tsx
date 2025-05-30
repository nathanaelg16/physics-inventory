import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography
} from '@mui/material'
import {DeleteLabCourse} from '../../../wailsjs/go/main/App'
import {useState} from 'react'

interface Props {
    open: boolean
    onClose: () => void
    onDeleted: () => void
    courseNumber: string
    courseName: string
}

export default function DeleteLabCourseDialog({open, onClose, onDeleted, courseNumber, courseName}: Props) {
    const [error, setError] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleClose = () => {
        if (!isDeleting) {
            setError(null)
            onClose()
        }
    }

    const deleteCourse = async () => {
        if (isDeleting) return

        setIsDeleting(true)
        setError(null)

        try {
            await DeleteLabCourse(courseNumber)
            onDeleted()
            handleClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth='sm'
            fullWidth
            disableEscapeKeyDown={isDeleting}
        >
            <DialogTitle>Delete Course</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert
                        severity='error'
                        sx={{ borderRadius: 1.5, mb: 2 }}
                    >
                        {error}
                    </Alert>
                )}

                <Box sx={{ mb: 2 }}>
                    <Typography variant='h6' component='div' gutterBottom>
                        {courseName}
                    </Typography>
                </Box>

                <Typography variant='body1' sx={{ mb: 1 }}>
                    Are you sure you want to delete this course and all its associated labs?
                </Typography>
                <Typography variant='body2' color='error' fontWeight='500'>
                    This action cannot be undone.
                </Typography>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                    onClick={handleClose}
                    disabled={isDeleting}
                    variant='outlined'
                >
                    Cancel
                </Button>
                <Button
                    onClick={deleteCourse}
                    disabled={isDeleting}
                    variant='contained'
                    color='error'
                    startIcon={isDeleting ? <CircularProgress size={16} /> : null}
                >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}