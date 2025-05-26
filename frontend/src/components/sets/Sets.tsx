import {MouseEvent, useContext, useEffect, useMemo, useState} from 'react'
import {main} from '../../../wailsjs/go/models'
import {useSessionStorage} from '@uidotdev/usehooks'
import {
    CreateSet,
    DeleteSet,
    DeleteSetRecordAssociatedByGroup,
    DeleteSetRecordAssociatedById,
    DeleteSetRecordAssociatedByRecordLocator,
    ExportSetCSV,
    ExportSetPDF,
    GetSetRecords,
    GetSets,
    RenameSet
} from '../../../wailsjs/go/main/App'
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material'
import {Add, Delete, Edit, GetApp, Preview} from '@mui/icons-material'
import {useNavigate} from 'react-router'
import {AccessLevel, AuthContext} from '../../utils/auth'
import NewCollectionDialog from "../collection-dialog/NewCollectionDialog"
import RenameCollectionDialog from "../collection-dialog/RenameCollectionDialog"
import DeleteCollectionDialog from "../collection-dialog/DeleteCollectionDialog"
import {SnackbarAlert} from "../../utils/snackbar-alert"
import ExportProgress from "../export-progress/ExportProgress"
import useCollectionDialogs from "../../hooks/useCollectionDialogs";
import Set = main.Set;
import SetRecord = main.CollectionRecord;

export default function Sets() {
    const navigate = useNavigate()
    const [sets, setSets] = useState<Array<Set>>([])
    const [selectedSetId, setSelectedSetId] = useSessionStorage<number | null>('selected_set', null)
    const [setRecords, setSetRecords] = useState<Array<SetRecord>>([])
    const [loading, setLoading] = useState(false)
    const [snackbarAlert, setSnackbarAlert] = useState<SnackbarAlert | null>(null)

    const {dialogs, openDialog, closeDialog} = useCollectionDialogs()
    const [newSetName, setNewSetName] = useState('')
    const [renamedSetName, setRenamedSetName] = useState('')

    const [isExporting, setIsExporting] = useState<boolean>(false)
    const [exportMenuAnchor, setExportMenuAnchor] = useState<HTMLElement | null>(null)
    const openExportMenu = Boolean(exportMenuAnchor)

    const [showDeleteSetRecordDialog, setShowDeleteSetRecordDialog] = useState(false)
    const [pendingSetRecordDeletion, setPendingSetRecordDeletion] = useState<{
        setId: number,
        recordLocator: number
    } | null>(null)

    const autocompleteOptions = useMemo(() => {
        return sets.map(set => ({
            id: set.id,
            label: set.name,
        }))
    }, [sets])

    const authContext = useContext(AuthContext)
    const canEdit = authContext.accessLevel >= AccessLevel.Maintainer

    const fetchSets = async () => {
        setLoading(true)
        GetSets()
            .then(sets => {
                setSets(sets)
                setLoading(false)
            })
            .catch((err) => {
                console.error(err)
                setSnackbarAlert({
                    severity: 'error',
                    msg: 'Failed to load sets'
                })
                setLoading(false)
            })
    }

    const fetchSetRecords = async (setId: number) => {
        setLoading(true)
        GetSetRecords(setId)
            .then((setRecords) => {
                setSetRecords(setRecords)
            }).catch(() => setSnackbarAlert({
                severity: 'error',
                msg: 'Failed to load set details'
            })).finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchSets()
    }, [])

    useEffect(() => {
        if (selectedSetId) {
            fetchSetRecords(selectedSetId)
        } else {
            setSetRecords([])
        }
    }, [selectedSetId])

    const selectedSet = sets.find(s => s.id === selectedSetId)

    const handleExportMenuOpen = (event: MouseEvent<HTMLElement>) => {
        setExportMenuAnchor(event.currentTarget)
    }

    const handleExportMenuClose = () => {
        setExportMenuAnchor(null)
    }

    const handleDeleteSetRecord = (setRecord: SetRecord) => {
        if (!selectedSetId) return;
        if (setRecord.associatedBy === 'recordLocator') {
            setPendingSetRecordDeletion({setId: selectedSetId, recordLocator: setRecord.recordLocator})
            setShowDeleteSetRecordDialog(true)
        } else if (setRecord.associatedBy === 'group') {
            DeleteSetRecordAssociatedByGroup(selectedSetId, setRecord.id)
                .then(() => {
                    setSnackbarAlert({
                        severity: 'success',
                        msg: 'Removed from set successfully!'
                    })
                    fetchSetRecords(selectedSetId)
                })
        } else {
            DeleteSetRecordAssociatedById(selectedSetId, setRecord.id)
                .then(() => {
                    setSnackbarAlert({
                        severity: 'success',
                        msg: 'Asset removed from set successfully!'
                    })
                    fetchSetRecords(selectedSetId)
                }).catch(err => {
                    setSnackbarAlert({
                        severity: 'error',
                        msg: err
                    })
                })
        }
    }

    const handlePendingSetRecordDeletion = () => {
        if (!pendingSetRecordDeletion) return
        setShowDeleteSetRecordDialog(false)
        DeleteSetRecordAssociatedByRecordLocator(pendingSetRecordDeletion.setId, pendingSetRecordDeletion.recordLocator)
            .then(() => {
                setSnackbarAlert({
                    severity: 'success',
                    msg: 'Asset removed from set successfully!'
                })
                fetchSetRecords(selectedSetId!)
            }).catch(err => {
                setSnackbarAlert({
                    severity: 'error',
                    msg: err
                })
            }).finally(() => setPendingSetRecordDeletion(null))
    }

    const createSet = () => {
        closeDialog('new')
        CreateSet(newSetName)
            .then(async (id) => {
                setSnackbarAlert({
                    severity: 'success',
                    msg: 'Set created successfully!'
                })
                await fetchSets()
                if (sets) {
                    setSelectedSetId(id)
                }
            }).catch((err) => {
                setSnackbarAlert({
                    severity: 'error',
                    msg: err
                })
            }).finally(() => {
                setNewSetName('')
            })
    }

    const renameSet = () => {
        closeDialog('rename')
        if (!selectedSetId) return;
        RenameSet(selectedSetId, renamedSetName)
            .then(async () => {
                setSnackbarAlert({
                    severity: 'success',
                    msg: 'Set successfully renamed!'
                })
                await fetchSets()
            }).catch(err => {
                setSnackbarAlert({
                    severity: 'error',
                    msg: err
                })
            }).finally(() => {
                setRenamedSetName('')
            })
    }

    const deleteSet = () => {
        closeDialog('delete')
        if (!selectedSetId) return;
        DeleteSet(selectedSetId)
            .then(async () => {
                setSnackbarAlert({
                    severity: 'success',
                    msg: 'Set deleted successfully!'
                })
                await fetchSets()
                setSelectedSetId(null)
            }).catch(err => {
                setSnackbarAlert({
                    severity: 'error',
                    msg: err
                })
            })
    }

    const cancelNewSetDialog = () => {
        closeDialog('new')
        setNewSetName('')
    }

    const cancelRenameSetDialog = () => {
        closeDialog('rename')
        setRenamedSetName('')
    }

    const exportToCSV = () => {
        handleExportMenuClose()
        if (!selectedSetId) return;
        setIsExporting(true)
        ExportSetCSV(selectedSetId)
            .then(() => setSnackbarAlert({
                severity: 'success',
                msg: 'Export finished successfully!'
            })).catch(err => {
                setIsExporting(false)
                setSnackbarAlert({
                    severity: 'error',
                    msg: `Error: ${err}`
                })
            })
    }

    const exportToPDF = () => {
        handleExportMenuClose()
        if (!selectedSetId) return;
        setIsExporting(true)
        ExportSetPDF(selectedSetId)
        .then(() => setSnackbarAlert({
            severity: 'success',
            msg: 'Export finished successfully!'
        })).catch(err => {
            setIsExporting(false)
            setSnackbarAlert({
                severity: 'error',
                msg: `Error: ${err}`
            })
        })
    }

    return (
        <Box>
            <Snackbar
                open={!!snackbarAlert}
                autoHideDuration={6000}
                onClose={() => setSnackbarAlert(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbarAlert(null)} severity={snackbarAlert?.severity} sx={{ width: '100%' }}>
                    {snackbarAlert?.msg}
                </Alert>
            </Snackbar>

            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Autocomplete
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select a Set"
                                placeholder="Choose a set to view or manage"
                                size="small"
                            />
                        )}
                        options={autocompleteOptions}
                        disablePortal
                        onChange={(e, value) => {
                            setSelectedSetId(value ? value.id : null)
                        }}
                        fullWidth
                        value={autocompleteOptions.find(option => option.id === selectedSetId) || null}
                        loading={loading}
                        loadingText="Loading sets..."
                        noOptionsText="No sets found"
                    />
                    {canEdit && (
                        <Tooltip title="Create a new set">
                            <Button
                                variant="outlined"
                                startIcon={<Add />}
                                onClick={() => openDialog('new')}
                                size="small"
                            >
                                New Set
                            </Button>
                        </Tooltip>
                    )}
                </Box>
            </Paper>

            {selectedSetId ? (
                <TableContainer component={Paper} elevation={2}>
                    <Box px={2} py={1.5} display="flex" justifyContent="space-between" alignItems="center" bgcolor="#f9f9f9" borderBottom="1px solid #e0e0e0">
                        <Typography variant="subtitle1">
                            {selectedSet?.name} {' '}
                            <Typography component="span" variant="body2" color="textSecondary">
                                ({setRecords.length} {setRecords.length === 1 ? 'item' : 'items'})
                            </Typography>
                        </Typography>

                        <Box display="flex" justifyContent="flex-end" gap={1} mb={2} alignItems='center'>
                                <Button size="small" variant="outlined" startIcon={<GetApp />} onClick={handleExportMenuOpen}>
                                    Export
                                </Button>
                                <Menu open={openExportMenu} anchorEl={exportMenuAnchor} onClose={handleExportMenuClose}>
                                    <MenuItem onClick={exportToCSV}>Export to CSV</MenuItem>
                                    <MenuItem onClick={exportToPDF}>Export to PDF</MenuItem>
                                </Menu>

                                {canEdit && (
                                    <>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<Edit />}
                                            onClick={() => openDialog('rename')}
                                        >
                                            Rename
                                        </Button>

                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="error"
                                            startIcon={<Delete />}
                                            onClick={() => openDialog('delete')}
                                        >
                                            Delete
                                        </Button>
                                    </>
                                )}
                            </Box>
                    </Box>

                    <ExportProgress isExporting={isExporting} onExportComplete={() => setIsExporting(false)} />

                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Serial Number</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {setRecords.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                        <Typography color="textSecondary">
                                            No items in this set yet
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                setRecords.map(setRecord => (
                                    <TableRow key={setRecord.id} hover>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {setRecord.name.String || 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {setRecord.location.String || 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {setRecord.serial.String || 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="View details">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => navigate(`/asset/${setRecord.id}`)} //todo: change this to navigate to group if associated by group
                                                >
                                                    <Preview fontSize="small" />
                                                </IconButton>
                                            </Tooltip>

                                            {canEdit && (
                                                <Tooltip title="Remove from set">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteSetRecord(setRecord)}
                                                    >
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="textSecondary" sx={{ my: 3 }}>
                        Select a set to view its contents
                    </Typography>
                </Paper>
            )}

            <NewCollectionDialog collectionType='set'
                                 collectionName={newSetName}
                                 setCollectionName={setNewSetName}
                                 onSave={createSet}
                                 onCancel={cancelNewSetDialog}
                                 open={dialogs.new}
            />
            {selectedSet && (
                <>
                    <RenameCollectionDialog collectionType='set'
                                            collectionName={renamedSetName}
                                            setCollectionName={setRenamedSetName}
                                            onSave={renameSet}
                                            onCancel={cancelRenameSetDialog}
                                            open={dialogs.rename}
                                            placeholder={selectedSet.name}
                    />

                    <DeleteCollectionDialog collectionType='set'
                                            collectionName={selectedSet.name}
                                            onDelete={deleteSet}
                                            onCancel={() => closeDialog('delete')}
                                            open={dialogs.delete}
                    />
                </>
            )}

            <Dialog open={showDeleteSetRecordDialog} onClose={() => setShowDeleteSetRecordDialog(false)}>
                <DialogTitle>Asset tied by Record Number</DialogTitle>
                <DialogContent>
                    <Typography>
                        This asset is tied to the set by its Record Number.
                        Removing this asset will remove all assets in this set with the same Record Number.
                        Are you sure you want to remove this asset from the set?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteSetRecordDialog(false)}>Cancel</Button>
                    <Button variant='contained' color='error' onClick={handlePendingSetRecordDeletion}>Remove</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}