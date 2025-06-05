import {useNavigate, useParams} from 'react-router'
import {useContext, useEffect, useState} from 'react'
import {AccessLevel, AuthContext} from '../../utils/auth'
import {main} from '../../../wailsjs/go/models'
import {GetLabData, GetLabDetails, RenameLab} from '../../../wailsjs/go/main/App'
import {SnackbarAlert} from '../../utils/snackbar-alert'
import {
    Alert,
    Box,
    Skeleton,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material'
import LabHeader from '../../components/header/LabHeader'
import LabDataTableRow from '../../components/lab-data-table-row/LabDataTableRow'
import LabLegend from '../../components/lab-legend/LabLegend'
import styles from './labView.module.css'
import LabDetails = main.LabDetails;
import LabData = main.LabData;

export default function LabView() {
    const { id } = useParams()
    const navigate = useNavigate()
    const authContext = useContext(AuthContext)

    const [labDetails, setLabDetails] = useState<LabDetails>()
    const [labData, setLabData] = useState<LabData[]>([])
    const [loading, setLoading] = useState(true)

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

    const handleDeleteLab = () => {
        // TODO: implement this
        console.log('Delete lab functionality to be implemented')
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
                <Typography variant="h6" color="error">
                    Lab not found
                </Typography>
            </Box>
        )
    }

    return (
        <Box className={styles.container}>
            <LabHeader
                courseNumber={labDetails.courseNumber}
                courseName={labDetails.courseName}
                labName={labDetails.labName}
                allowEdits={canEdit}
                onRename={renameLab}
                onDelete={handleDeleteLab}
            />

            <LabLegend />

            <TableContainer className={styles.tableContainer}>
                <Table className={styles.labTable} stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell className={styles.typeColumn}>Type</TableCell>
                            <TableCell className={styles.nameColumn}>Name</TableCell>
                            <TableCell className={styles.locationColumn}>Location</TableCell>
                            <TableCell className={styles.quantityColumn}>Qty Per Station</TableCell>
                            <TableCell className={styles.quantityColumn}>Qty Front Table</TableCell>
                            <TableCell className={styles.notesColumn}>Notes</TableCell>
                            <TableCell className={styles.actionsColumn}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {labData.map((ld) => (
                                <LabDataTableRow
                                    key={ld.id}
                                    data={ld}
                                    allowEdits={canEdit}
                                />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

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