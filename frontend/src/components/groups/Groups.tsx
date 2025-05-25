import './groups.css'
import {MouseEvent, useContext, useEffect, useState} from 'react'
import {main} from '../../../wailsjs/go/models'
import {useSessionStorage} from '@uidotdev/usehooks'
import {
    CreateGroup,
    DeleteGroup,
    ExportGroupCSV,
    ExportGroupPDF,
    GetGroupAssets,
    GetGroups,
    RenameGroup
} from '../../../wailsjs/go/main/App'
import {
    Alert,
    Autocomplete,
    Box,
    Button,
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
import Group = main.Group;
import GroupAsset = main.GroupAsset;

export default function Groups() {
    const navigate = useNavigate()
    const [groups, setGroups] = useState<Array<Group>>([])
    const [selectedGroupId, setSelectedGroupId] = useSessionStorage<number | null>('selected_group', null)
    const [groupAssets, setGroupAssets] = useState<Array<GroupAsset>>([])
    const [loading, setLoading] = useState(false)
    const [snackbarAlert, setSnackbarAlert] = useState<SnackbarAlert | null>(null)

    const [showNewGroupDialog, setShowNewGroupDialog] = useState(false)
    const [showRenameGroupDialog, setShowRenameGroupDialog] = useState(false)
    const [showDeleteGroupDialog, setShowDeleteGroupDialog] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')
    const [renamedGroupName, setRenamedGroupName] = useState('')

    const [isExporting, setIsExporting] = useState<boolean>(false)
    const [exportMenuAnchor, setExportMenuAnchor] = useState<HTMLElement | null>(null)
    const openExportMenu = Boolean(exportMenuAnchor)

    const authContext = useContext(AuthContext)
    const canEdit = authContext.accessLevel >= AccessLevel.Maintainer

    const fetchGroups = async () => {
        setLoading(true)
        GetGroups()
            .then(groups => {
                setGroups(groups)
                setLoading(false)
            })
            .catch((err) => {
                console.error(err)
                setSnackbarAlert({
                    severity: 'error',
                    msg: 'Failed to load groups'
                })
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchGroups()
    }, [])

    useEffect(() => {
        if (selectedGroupId) {
            setLoading(true)
            GetGroupAssets(selectedGroupId)
                .then((group) => {
                    setGroupAssets(group)
                    setLoading(false)
                }).catch(() => {
                    setSnackbarAlert({
                        severity: 'error',
                        msg: 'Failed to load group details'
                    })
                    setLoading(false)
                })
        } else {
            setGroupAssets([])
        }
    }, [selectedGroupId])

    const autocompleteOptions = groups.map(group => ({
        id: group.id,
        label: group.name,
    }))

    const selectedGroup = groups.find(g => g.id === selectedGroupId)

    const handleExportMenuOpen = (event: MouseEvent<HTMLElement>) => {
        setExportMenuAnchor(event.currentTarget)
    }

    const handleExportMenuClose = () => {
        setExportMenuAnchor(null)
    }

    const handleDeleteAsset = (assetId: number) => {
        // TODO: Implement delete asset from group functionality
        console.log('Delete asset', assetId)
    }

    const createGroup = () => {
        setShowNewGroupDialog(false)
        CreateGroup(newGroupName)
            .then(async (id) => {
                setSnackbarAlert({
                    severity: 'success',
                    msg: 'Group created successfully!'
                })
                await fetchGroups()
                if (groups) {
                    setSelectedGroupId(id)
                }
            }).catch((err) => {
                setSnackbarAlert({
                    severity: 'error',
                    msg: err
                })
            }).finally(() => {
                setNewGroupName('')
            })
    }

    const renameGroup = () => {
        setShowRenameGroupDialog(false)
        if (!Boolean(selectedGroupId)) return;
        RenameGroup(selectedGroupId!, renamedGroupName)
            .then(async () => {
                setSnackbarAlert({
                    severity: 'success',
                    msg: 'Group successfully renamed!'
                })
                await fetchGroups()
            }).catch(err => {
                setSnackbarAlert({
                    severity: 'error',
                    msg: err
                })
            }).finally(() => {
                setRenamedGroupName('')
            })
    }

    const deleteGroup = () => {
        setShowDeleteGroupDialog(false)
        if (!Boolean(selectedGroupId)) return;
        DeleteGroup(selectedGroupId!)
            .then(async () => {
                setSnackbarAlert({
                    severity: 'success',
                    msg: 'Group deleted successfully!'
                })
                await fetchGroups()
                setSelectedGroupId(null)
            }).catch(err => {
                setSnackbarAlert({
                    severity: 'error',
                    msg: err
                })
            })
    }

    const cancelNewGroupDialog = () => {
        setShowNewGroupDialog(false)
        setNewGroupName('')
    }

    const cancelRenameGroupDialog = () => {
        setShowRenameGroupDialog(false)
        setRenamedGroupName('')
    }

    const exportToCSV = () => {
        handleExportMenuClose()
        if (!Boolean(selectedGroupId)) return;
        setIsExporting(true)
        ExportGroupCSV(selectedGroupId!)
            .then(() => setSnackbarAlert({
                severity: 'success',
                msg: 'Export finished successfully!'
            })).catch(err => {
                setSnackbarAlert({
                    severity: 'error',
                    msg: `Error: ${err}`
                })
                setIsExporting(false)
            })
    }

    const exportToPDF = () => {
        handleExportMenuClose()
        if (!Boolean(selectedGroupId)) return;
        setIsExporting(true)
        ExportGroupPDF(selectedGroupId!)
        .then(() => setSnackbarAlert({
            severity: 'success',
            msg: 'Export finished successfully!'
        })).catch(err => {
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
                                label="Select a Group"
                                placeholder="Choose a group to view or manage"
                                size="small"
                            />
                        )}
                        options={autocompleteOptions}
                        disablePortal
                        onChange={(e, value) => {
                            setSelectedGroupId(value ? value.id : null)
                        }}
                        fullWidth
                        value={autocompleteOptions.find(option => option.id === selectedGroupId) || null}
                        loading={loading}
                        loadingText="Loading groups..."
                        noOptionsText="No groups found"
                    />
                    {canEdit && (
                        <Tooltip title="Create a new group">
                            <Button
                                variant="outlined"
                                startIcon={<Add />}
                                onClick={() => setShowNewGroupDialog(true)}
                                size="small"
                            >
                                New Group
                            </Button>
                        </Tooltip>
                    )}
                </Box>
            </Paper>

            {selectedGroupId ? (
                <TableContainer component={Paper} elevation={2}>
                    <Box px={2} py={1.5} display="flex" justifyContent="space-between" alignItems="center" bgcolor="#f9f9f9" borderBottom="1px solid #e0e0e0">
                        <Typography variant="subtitle1">
                            {selectedGroup?.name} {' '}
                            <Typography component="span" variant="body2" color="textSecondary">
                                ({groupAssets.length} {groupAssets.length === 1 ? 'item' : 'items'})
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
                                            onClick={() => setShowRenameGroupDialog(true)}
                                        >
                                            Rename
                                        </Button>

                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="error"
                                            startIcon={<Delete />}
                                            onClick={() => setShowDeleteGroupDialog(true)}
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
                                <TableCell sx={{ fontWeight: 'bold' }}>Asset</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Serial Number</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {groupAssets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                        <Typography color="textSecondary">
                                            No items in this group yet
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                groupAssets.map(groupAsset => (
                                    <TableRow key={groupAsset.id} hover>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {groupAsset.name.String || 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {groupAsset.location.String || 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {groupAsset.serial.String || 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="View details">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => navigate(`/asset/${groupAsset.id}`)}
                                                >
                                                    <Preview fontSize="small" />
                                                </IconButton>
                                            </Tooltip>

                                            {canEdit && (
                                                <Tooltip title="Remove from group">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteAsset(groupAsset.id)}
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
                        Select a group to view its contents
                    </Typography>
                </Paper>
            )}

            <NewCollectionDialog collectionType='group'
                                 collectionName={newGroupName}
                                 setCollectionName={setNewGroupName}
                                 onSave={createGroup}
                                 onCancel={cancelNewGroupDialog}
                                 open={showNewGroupDialog}
            />
            {selectedGroup && (
                <>
                    <RenameCollectionDialog collectionType='group'
                                            collectionName={renamedGroupName}
                                            setCollectionName={setRenamedGroupName}
                                            onSave={renameGroup}
                                            onCancel={cancelRenameGroupDialog}
                                            open={showRenameGroupDialog}
                                            placeholder={selectedGroup.name}
                    />

                    <DeleteCollectionDialog collectionType='group'
                                            collectionName={selectedGroup.name}
                                            onDelete={deleteGroup}
                                            onCancel={() => setShowDeleteGroupDialog(false)}
                                            open={showDeleteGroupDialog}
                    />
                </>
            )}

        </Box>
    )
}