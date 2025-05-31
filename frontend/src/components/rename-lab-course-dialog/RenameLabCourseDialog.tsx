import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import {Close as CloseIcon} from '@mui/icons-material'
import {KeyboardEvent, useEffect, useState} from 'react'
import {RenameLabCourse} from '../../../wailsjs/go/main/App'

interface Props {
    open: boolean
    onClose: () => void
    onRenamed: () => void
    courseNumber: string
    courseName: string
}

export default function RenameLabCourseDialog({ open, onClose, onRenamed, courseNumber, courseName }: Props) {
    const [newCourseName, setNewCourseName] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    const [courseNameTouched, setCourseNameTouched] = useState<boolean>(false)

    const courseNameValid = newCourseName.trim().length > 0
    const courseNameError = courseNameTouched && !courseNameValid

    const renameCourse = async () => {
        if (!courseNameValid) return

        setIsSubmitting(true)
        setError(null)

        try {
            await RenameLabCourse(courseNumber, newCourseName.trim())
            onRenamed()
            onClose()
        } catch (err) {
            setError(err as string)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        if (isSubmitting) return
        onClose()
    }

    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && courseNameValid && !isSubmitting) {
            renameCourse()
        }
    }

    useEffect(() => {
        if (open) {
            // Reset form when dialog opens
            setNewCourseName(courseName)
            setError(null)
            setCourseNameTouched(false)
            setIsSubmitting(false)
        }
    }, [open, courseName])

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth='sm'
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 2,
                        minHeight: 280
                    }
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 1
            }}>
                <Typography variant='h6' component='div' fontWeight={600}>
                   Rename Lab Course
                </Typography>
                <IconButton
                    onClick={handleClose}
                    size='small'
                    disabled={isSubmitting}
                    sx={{ ml: 2 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pb: 2 }}>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    {error && (
                        <Alert severity='error' sx={{ borderRadius: 1.5 }}>
                            Error: {error}
                        </Alert>
                    )}

                    <Typography><Typography fontWeight='600'>Course Number:</Typography> {courseNumber}</Typography>

                    <TextField
                        label='Course Name'
                        fullWidth
                        variant='outlined'
                        placeholder='e.g., Introduction to Physics'
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        onBlur={() => setCourseNameTouched(true)}
                        onKeyDown={handleKeyPress}
                        error={courseNameError}
                        helperText={courseNameError ? 'Course name is required' : ''}
                        disabled={isSubmitting}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5
                            }
                        }}
                        autoComplete='off'
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{
                px: 3,
                pb: 3,
                gap: 1.5,
                justifyContent: 'flex-end'
            }}>
                <Button
                    onClick={handleClose}
                    variant='outlined'
                    disabled={isSubmitting}
                    sx={{
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 500,
                        minWidth: 80
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={renameCourse}
                    disabled={!courseNameValid || isSubmitting}
                    variant='contained'
                    sx={{
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 500,
                        minWidth: 80
                    }}
                >
                    {isSubmitting ? 'Renaming...' : 'Rename Course'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}