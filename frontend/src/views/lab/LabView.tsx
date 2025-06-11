import styles from './labView.module.css'
import {useNavigate, useParams} from 'react-router'
import {useContext, useEffect, useState} from 'react'
import {AccessLevel, AuthContext} from '../../utils/auth'
import {main} from '../../../wailsjs/go/models'
import {DeleteLab, ExportLabCSV, ExportLabPDF, GetLabData, GetLabDetails, RenameLab} from '../../../wailsjs/go/main/App'
import {SnackbarAlert} from '../../utils/snackbar-alert'
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Skeleton,
    Snackbar,
    Stack,
    Typography,
} from '@mui/material'
import LabHeader from '../../components/header/LabHeader'
import {ArrowBack, Science} from '@mui/icons-material'
import LabDataCard from "../../components/lab-data-card/LabDataCard";
import LabDetails = main.LabDetails;
import LabData = main.LabData;

export default function LabView() {
    const { id } = useParams()
    const navigate = useNavigate()
    const authContext = useContext(AuthContext)

    const [labDetails, setLabDetails] = useState<LabDetails>()
    const [labData, setLabData] = useState<LabData[]>([])
    const [loading, setLoading] = useState(true)

    const [showDeleteLabDialog, setShowDeleteLabDialog] = useState(false)

    const [snackbarAlert, setSnackbarAlert] = useState<SnackbarAlert | null>()

    const canEdit = authContext.accessLevel >= AccessLevel.Maintainer

    const fetchLabDetails = async () => {
        if (id === undefined) return
        try {
            const labDetails = await GetLabDetails(parseInt(id))
            setLabDetails(labDetails)
        } catch (err) {
            setSnackbarAlert({
                severity: 'error',
                msg: err as string
            })
        }
    }

    const fetchLabData = async () => {
        if (id === undefined) return
        try {
            const labData = await GetLabData(parseInt(id))
            setLabData(labData)
        } catch (err) {
            setSnackbarAlert({
                severity: 'error',
                msg: err as string
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            await Promise.all([fetchLabDetails(), fetchLabData()])
        }
        loadData()
    }, [id])

    const renameLab = async (newName: string) => {
        if (id === undefined) return
        if (labDetails === undefined) return
        if (newName === labDetails.labName) return
        try {
            await RenameLab(parseInt(id), newName)
            setSnackbarAlert({
                severity: 'success',
                msg: 'Lab renamed successfully'
            })
            await fetchLabDetails()
        } catch (err) {
            setSnackbarAlert({
                severity: 'error',
                msg: err as string
            })
        }
    }

    const deleteLab = async () => {
        if (id === undefined) return
        try {
            await DeleteLab(parseInt(id))
            setSnackbarAlert({
                severity: 'success',
                msg: 'Lab deleted successfully'
            })
            setTimeout(() => navigate('/labs'), 1500)
        } catch (err) {
            setSnackbarAlert({
                severity: 'error',
                msg: err as string
            })
        }
    }

    const handleExport = (option: 'csv' | 'pdf') => {
        if (id === undefined) return
        if (option === 'csv') {
            ExportLabCSV(parseInt(id))
                .then(() => setSnackbarAlert({
                    severity: 'success',
                    msg: 'Export completed successfully.'
                })).catch((err) => setSnackbarAlert({
                    severity: 'error',
                    msg: err
                }))
        } else {
            ExportLabPDF(parseInt(id))
                .then(() => setSnackbarAlert({
                    severity: 'success',
                    msg: 'Export completed successfully.'
                })).catch((err) => setSnackbarAlert({
                    severity: 'error',
                    msg: err
                }))
        }
    }

    const handleEdited = (success: boolean, msg: string) => {
        if (success) {
            setSnackbarAlert({
                severity: 'success',
                msg: msg
            })
            fetchLabData()
        } else {
            setSnackbarAlert({
                severity: 'error',
                msg: msg
            })
        }
    }

    if (loading) {
        return (
            <Box className={styles.container}>
                <Skeleton variant="rectangular" height={120} className={styles.headerSkeleton} />
                <Skeleton variant="rectangular" height={60} className={styles.controlsSkeleton} />
                <Skeleton variant="rectangular" height={400} />
            </Box>
        )
    }

    if (!labDetails) {
        return (
            <Box className={styles.container}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 2 }}
                >
                    Back
                </Button>
                <Typography variant="h6" color="error">
                    Lab not found
                </Typography>
            </Box>
        )
    }

    return (
        <Box className={styles.container}>
            <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2 }}
            >
                Back
            </Button>

            <LabHeader
                courseNumber={labDetails.courseNumber}
                courseName={labDetails.courseName}
                labName={labDetails.labName}
                allowEdits={canEdit}
                onRename={renameLab}
                onDelete={() => setShowDeleteLabDialog(true)}
                onExport={handleExport}
            />

            <Box>
                <Stack spacing={0}>
                    {labData.map((ld) => (
                        <LabDataCard key={ld.id} data={ld} allowEdits={canEdit} onEdited={handleEdited} />
                    ))}
                </Stack>

                {labData.length === 0 && (
                    <Paper elevation={0}
                           sx={{
                               textAlign: 'center',
                               py: 8,
                               bgcolor: '#fafafa',
                               border: '2px dashed #e0e0e0'
                           }}
                    >
                        <Science sx={{ fontSize: 80, mb: 2, opacity: 0.3, color: 'text.secondary' }} />
                        <Typography variant="h6" gutterBottom color="text.secondary">
                            No items found
                        </Typography>
                    </Paper>
                )}
            </Box>

            <Dialog open={showDeleteLabDialog} onClose={() => setShowDeleteLabDialog(false)}>
                <DialogTitle>Delete Lab</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this lab? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteLabDialog(false)}>Cancel</Button>
                    <Button color='error' variant='contained' onClick={() => {
                        setShowDeleteLabDialog(false)
                        deleteLab()
                    }}>Delete</Button>
                </DialogActions>
            </Dialog>

            {snackbarAlert && (
                <Snackbar
                    open={!!snackbarAlert}
                    autoHideDuration={6000}
                    onClose={() => setSnackbarAlert(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert severity={snackbarAlert.severity} onClose={() => setSnackbarAlert(null)}>
                        {snackbarAlert.msg}
                    </Alert>
                </Snackbar>
            )}
        </Box>
    )
}