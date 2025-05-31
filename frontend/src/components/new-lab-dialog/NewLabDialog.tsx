import {KeyboardEvent, useEffect, useState} from "react";
import {CreateLab} from "../../../wailsjs/go/main/App";
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
    Typography
} from "@mui/material";
import {Close} from "@mui/icons-material";

interface Props {
    open: boolean
    onClose: () => void
    onCreated: () => void
    courseNumber: string
    courseName: string
}

export default function NewLabDialog({open, onClose, onCreated, courseNumber, courseName}: Props) {
    const [labName, setLabName] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    const [labNameTouched, setLabNameTouched] = useState<boolean>(false)

    const labNameValid = labName.trim().length > 0
    const labNameError = labNameTouched && !labNameValid

    const addLab = async () => {
        if (!labNameValid) return

        setIsSubmitting(true)
        setError(null)

        try {
            await CreateLab(courseNumber, labName.trim())
            onCreated()
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
        if (e.key === 'Enter' && labNameValid && !isSubmitting) {
            addLab()
        }
    }

    useEffect(() => {
        if (open) {
            // Reset form when dialog opens
            setLabName('')
            setError(null)
            setLabNameTouched(false)
            setIsSubmitting(false)
        }
    }, [open])

    return (<Dialog open={open}
                    onClose={handleClose}
                    fullWidth
                    maxWidth='sm'
                    slotProps={{
                        paper: {
                            sx: {
                                borderRadius: 2, minHeight: 280
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
                <Close />
            </IconButton>
        </DialogTitle>
        <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
                {error && (
                    <Alert severity='error' sx={{ borderRadius: 1.5 }}>
                        Error: {error}
                    </Alert>
                )}

                <Typography><Typography fontWeight='600'>Course: </Typography>{courseName}</Typography>

                <TextField label='Lab Name'
                           fullWidth
                           variant='outlined'
                           value={labName}
                           onChange={(e) => setLabName(e.target.value)}
                           onBlur={() => setLabNameTouched(true)}
                           error={labNameError}
                           helperText={labNameError ? 'Lab name is required' : ''}
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
            <Button onClick={handleClose}
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
            <Button onClick={addLab}
                    variant='outlined'
                    disabled={!labNameValid || isSubmitting}
                    sx={{
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 500,
                        minWidth: 80
                    }}
            >
                {isSubmitting ? 'Creating...' : 'Create Lab'}
            </Button>
        </DialogActions>
    </Dialog>)
}