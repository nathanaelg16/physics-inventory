import styles from './labsView.module.css'
import Header from '../../components/header/Header'
import {main} from '../../../wailsjs/go/models'
import {useEffect, useMemo, useState} from 'react'
import {Alert, Autocomplete, Button, Snackbar, TextField} from '@mui/material'
import {SnackbarAlert} from '../../utils/snackbar-alert'
import {GetLabCourses} from '../../../wailsjs/go/main/App'
import LabsList from '../../components/labs-list/LabsList'
import {Add, Class} from '@mui/icons-material'
import NewLabCourseDialog from "../../components/new-lab-course-dialog/NewLabCourseDialog";
import LabCourse = main.LabCourse;

export default function LabsView() {
    const [labCourses, setLabCourses] = useState<LabCourse[]>([])
    const [selectedLabCourseNumber, setSelectedLabCourseNumber] = useState<string | null>(null)

    const [showNewLabCourseDialog, setShowNewLabCourseDialog] = useState<boolean>(false)

    const [loading, setLoading] = useState<boolean>(false)
    const [snackbarAlert, setSnackbarAlert] = useState<SnackbarAlert | null>()

    const fetchLabCourses = () => {
        setLoading(true)
        GetLabCourses()
            .then((labCourses) => setLabCourses(labCourses))
            .catch((err) => setSnackbarAlert({
                severity: 'error', msg: err
            })).finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchLabCourses()
    }, [])

    const autocompleteOptions = useMemo(() => {
        return labCourses.map(lc => ({
            courseNumber: lc.courseNumber, label: `${lc.courseNumber}: ${lc.courseName}`
        }))
    }, [labCourses])

    const selectedCourse = useMemo(() => {
        return autocompleteOptions.find(option => option.courseNumber === selectedLabCourseNumber) || null
    }, [autocompleteOptions, selectedLabCourseNumber])

    return <div>
        <Header title='Labs'/>

        <div className={styles.labsViewContainer}>
            <div className={styles.courseSelectionSection}>
                <div className={styles.courseSelectionHeader}>
                    <h2 className={styles.courseSelectionLabel}>
                        <Class sx={{ marginRight: 1, verticalAlign: 'middle' }} />
                        Course Selection
                    </h2>
                </div>

                <div className={styles.courseSelectionControls}>
                    <Autocomplete
                        className={styles.courseAutocomplete}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label='Select a course'
                                placeholder='Select a course to view its labs'
                                size='small'
                                variant='outlined'
                            />
                        )}
                        options={autocompleteOptions}
                        disablePortal
                        onChange={(e, value) => {
                            setSelectedLabCourseNumber(value ? value.courseNumber : null)
                        }}
                        value={selectedCourse}
                        loading={loading}
                        loadingText='Loading lab courses...'
                        noOptionsText='No lab courses found'
                        isOptionEqualToValue={(option, value) => option.courseNumber === value.courseNumber}
                    />

                    <Button
                        className={styles.newCourseButton}
                        variant='contained'
                        startIcon={<Add />}
                        color='primary'
                        onClick={() => setShowNewLabCourseDialog(true)}
                    >
                        New Course
                    </Button>
                </div>
            </div>
        </div>

        {selectedLabCourseNumber && (
            <LabsList
                labCourseNumber={selectedLabCourseNumber}
                onAlert={(alert) => setSnackbarAlert(alert)}
                onNewLab={() => {}}
            />
        )}

        <NewLabCourseDialog open={showNewLabCourseDialog}
                            onClose={() => setShowNewLabCourseDialog(false)}
                            onCreate={(courseNumber: string) => {
                                fetchLabCourses()
                                setSelectedLabCourseNumber(courseNumber)
                            }}
        />

        <Snackbar
            autoHideDuration={3000}
            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            open={Boolean(snackbarAlert)}
            onClose={() => setSnackbarAlert(null)}
        >
            <Alert severity={snackbarAlert?.severity}>{snackbarAlert?.msg}</Alert>
        </Snackbar>
    </div>
}