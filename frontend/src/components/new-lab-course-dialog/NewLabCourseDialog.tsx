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
import {CreateLabCourse} from '../../../wailsjs/go/main/App'

interface Props {
    open: boolean
    onClose: () => void
    onCreated: (courseNumber: string) => void
}

export default function NewLabCourseDialog({ open, onClose, onCreated }: Props) {
    const [courseNumber, setCourseNumber] = useState<string>('')
    const [courseName, setCourseName] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    const [courseNumberTouched, setCourseNumberTouched] = useState<boolean>(false)
    const [courseNameTouched, setCourseNameTouched] = useState<boolean>(false)

    const courseNumberValid = courseNumber.trim().length > 0
    const courseNameValid = courseName.trim().length > 0
    const validAttributes = courseNumberValid && courseNameValid

    const courseNumberError = courseNumberTouched && !courseNumberValid
    const courseNameError = courseNameTouched && !courseNameValid

    const addCourse = async () => {
        if (!validAttributes) return

        setIsSubmitting(true)
        setError(null)

        try {
            await CreateLabCourse(courseNumber.trim(), courseName.trim())
            onCreated(courseNumber.trim())
            handleClose()
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
        if (e.key === 'Enter' && validAttributes && !isSubmitting) {
            addCourse()
        }
    }

    useEffect(() => {
        if (open) {
            // Reset form when dialog opens
            setCourseName('')
            setCourseNumber('')
            setError(null)
            setCourseNumberTouched(false)
            setCourseNameTouched(false)
            setIsSubmitting(false)
        }
    }, [open])

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
                    Add New Lab Course
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

                    <TextField
                        label='Course Number'
                        fullWidth
                        variant='outlined'
                        placeholder='e.g., PHYS 111'
                        value={courseNumber}
                        onChange={(e) => {
                            const value = e.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, '')
                            setCourseNumber(value)
                        }}
                        onBlur={() => setCourseNumberTouched(true)}
                        error={courseNumberError}
                        helperText={courseNumberError ? 'Course number is required' : ''}
                        disabled={isSubmitting}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5
                            }
                        }}
                    />

                    <TextField
                        label='Course Name'
                        fullWidth
                        variant='outlined'
                        placeholder='e.g., Introduction to Physics'
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
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
                    onClick={addCourse}
                    disabled={!validAttributes || isSubmitting}
                    variant='contained'
                    sx={{
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 500,
                        minWidth: 80
                    }}
                >
                    {isSubmitting ? 'Creating...' : 'Create Course'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}