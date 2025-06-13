import styles from './addToLabButton.module.css'
import {Science} from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material'
import {useEffect, useState} from 'react'
import {main} from '../../../wailsjs/go/models'
import {GetLabCourses, GetLabs} from '../../../wailsjs/go/main/App'
import LabCourse = main.LabCourse;
import Lab = main.Lab;

interface Props {
    onSave: (labId: number, qtyPerStation: string, qtyFrontTable: string, notes: string) => void,
    disabled: boolean
}

export default function AddToLabButton({ onSave, disabled }: Props) {
    const [dialogOpen, setDialogOpen] = useState<boolean>(false)

    const [labCourses, setLabCourses] = useState<LabCourse[]>([])
    const [labs, setLabs] = useState<Lab[]>([])

    const [selectedLabCourseNumber, setSelectedLabCourseNumber] = useState<string>('')
    const [selectedLabId, setSelectedLabId] = useState<number | null>(null)

    const [qtyPerStation, setQtyPerStation] = useState<string>('')
    const [qtyFrontTable, setQtyFrontTable] = useState<string>('')
    const [notes, setNotes] = useState<string>('')

    const [alert, setAlert] = useState<string | null>(null)

    useEffect(() => {
        if (dialogOpen) {
            GetLabCourses()
                .then((labCourses) => setLabCourses(labCourses))
                .catch((err) => setAlert(err))
        }
    }, [dialogOpen])

    useEffect(() => {
        if (selectedLabCourseNumber) {
            GetLabs(selectedLabCourseNumber)
                .then((labs) => {
                    setLabs(labs)
                    setSelectedLabId(null)
                })
                .catch((err) => setAlert(err))
        } else {
            setLabs([])
            setSelectedLabId(null)
        }
    }, [selectedLabCourseNumber])

    const handleDialogClose = () => {
        setSelectedLabCourseNumber('')
        setSelectedLabId(null)
        setQtyPerStation('')
        setQtyFrontTable('')
        setNotes('')
        setAlert(null)
        setDialogOpen(false)
    }

    const handleSave = () => {
        if (!selectedLabId) return
        onSave(selectedLabId, qtyPerStation, qtyFrontTable, notes)
        handleDialogClose()
    }

    const isFormValid = Boolean(selectedLabCourseNumber) && Boolean(selectedLabId) && Boolean(qtyPerStation) && Boolean(qtyFrontTable)

    return (
        <>
            <Button
                variant='outlined'
                color='primary'
                startIcon={<Science />}
                onClick={() => setDialogOpen(true)}
                disabled={disabled}
                size='small'
            >
                Add to Lab
            </Button>

            <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
                maxWidth='md'
                fullWidth
                slotProps={{
                    paper: {
                        sx: { minHeight: '400px' }
                    }
                }}
            >
                <DialogTitle>
                    <Box display='flex' alignItems='center' gap={1}>
                        <Science color='primary' />
                        <Typography variant='h6' component='span'>
                            Add to Lab
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent className={styles.dialogContent}>
                    {alert && (
                        <Alert severity='error' className={styles.alert}>
                            {alert}
                        </Alert>
                    )}

                    <div className={styles.formSection}>
                        <Typography className={styles.sectionTitle}>
                            Course & Lab Selection
                        </Typography>

                        <div className={styles.courseSelection}>
                            <FormControl fullWidth>
                                <InputLabel id='course-select-label'>Select Course</InputLabel>
                                <Select
                                    labelId='course-select-label'
                                    label='Select Course'
                                    value={selectedLabCourseNumber}
                                    onChange={(e) => setSelectedLabCourseNumber(e.target.value as string)}
                                    className={styles.selectField}
                                >
                                    <MenuItem value=''>
                                        <em>Choose a course...</em>
                                    </MenuItem>
                                    {labCourses.map((lc) => (
                                        <MenuItem key={lc.courseNumber} value={lc.courseNumber}>
                                            <Box>
                                                <Typography variant='body1' component='div'>
                                                    {lc.courseNumber}
                                                </Typography>
                                                <Typography variant='body2' color='text.secondary'>
                                                    {lc.courseName}
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth disabled={!selectedLabCourseNumber || labs.length === 0}>
                                <InputLabel id='lab-select-label'>Select Lab</InputLabel>
                                <Select
                                    labelId='lab-select-label'
                                    label='Select Lab'
                                    value={selectedLabId || ''}
                                    onChange={(e) => setSelectedLabId(e.target.value as number)}
                                    className={styles.selectField}
                                >
                                    <MenuItem value=''>
                                        <em>Choose a lab...</em>
                                    </MenuItem>
                                    {labs.map((lab) => (
                                        <MenuItem key={lab.id} value={lab.id}>
                                            {lab.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                    </div>

                    <Divider className={styles.divider} />

                    <div className={styles.formSection}>
                        <Typography className={styles.sectionTitle}>
                            Quantity Information
                        </Typography>

                        <div className={styles.quantityFields}>
                            <TextField
                                label='Quantity Per Station'
                                value={qtyPerStation}
                                onChange={(e) => setQtyPerStation(e.target.value)}
                                fullWidth
                                variant='outlined'
                            />
                            <TextField
                                label='Quantity Front Table'
                                value={qtyFrontTable}
                                onChange={(e) => setQtyFrontTable(e.target.value)}
                                fullWidth
                                variant='outlined'
                            />
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <Typography className={styles.sectionTitle}>
                            Additional Notes
                        </Typography>

                        <TextField
                            label='Notes'
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            multiline
                            rows={3}
                            fullWidth
                            variant='outlined'
                            className={styles.notesField}
                        />
                    </div>
                </DialogContent>

                <DialogActions className={styles.dialogActions}>
                    <Button onClick={handleDialogClose} className={styles.cancelButton}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!isFormValid}
                        variant='contained'
                        className={styles.addButton}
                    >
                        Add to Lab
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}