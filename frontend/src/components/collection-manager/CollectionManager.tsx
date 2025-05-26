import {MouseEvent, useState} from 'react'
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
import NewCollectionDialog from '../collection-dialog/NewCollectionDialog'
import RenameCollectionDialog from '../collection-dialog/RenameCollectionDialog'
import DeleteCollectionDialog from '../collection-dialog/DeleteCollectionDialog'
import ExportProgress from '../export-progress/ExportProgress'
import useCollectionManager from '../../hooks/useCollectionManager'

interface CollectionOperations {
    fetch: () => Promise<any[]>
    fetchRecords: (id: number) => Promise<any[]>
    create: (name: string) => Promise<number>
    rename: (id: number, name: string) => Promise<void>
    delete: (id: number) => Promise<void>
    deleteRecordById: (collectionId: number, recordId: number) => Promise<void>
    deleteRecordByRecordLocator: (collectionId: number, recordLocator: number) => Promise<void>
    deleteRecordByGroup?: (collectionId: number, recordId: number) => Promise<void>
    exportCSV: (id: number) => Promise<void>
    exportPDF: (id: number) => Promise<void>
}

interface CollectionManagerProps {
    type: 'set' | 'group'
    operations: CollectionOperations
    storageKey: string
}

export default function CollectionManager({ type, operations, storageKey }: CollectionManagerProps) {
    const {
        // State
        collections,
        selectedId,
        setSelectedId,
        records,
        loading,
        snackbarAlert,
        setSnackbarAlert,
        canEdit,

        // Dialog state
        dialogs,
        openDialog,
        newName,
        setNewName,
        renamedName,
        setRenamedName,

        // Export state
        isExporting,
        setIsExporting,

        // Delete confirmation state
        showDeleteRecordDialog,
        setShowDeleteRecordDialog,

        // Computed values
        autocompleteOptions,
        selectedCollection,

        // Operations
        createCollection,
        renameCollection,
        deleteCollection,
        handleDeleteRecord,
        handlePendingRecordDeletion,
        exportToCSV,
        exportToPDF,
        cancelNewDialog,
        cancelRenameDialog,

        // Navigate function
        navigate
    } = useCollectionManager({ type, operations, storageKey })

    // Export menu state
    const [exportMenuAnchor, setExportMenuAnchor] = useState<HTMLElement | null>(null)
    const openExportMenu = Boolean(exportMenuAnchor)

    const handleExportMenuOpen = (event: MouseEvent<HTMLElement>) => {
        setExportMenuAnchor(event.currentTarget)
    }

    const handleExportMenuClose = () => {
        setExportMenuAnchor(null)
    }

    const handleExportToCSV = () => {
        handleExportMenuClose()
        exportToCSV()
    }

    const handleExportToPDF = () => {
        handleExportMenuClose()
        exportToPDF()
    }

    const typeName = type.charAt(0).toUpperCase() + type.slice(1)
    const pluralTypeName = type === 'set' ? 'Sets' : 'Groups'

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
                                label={`Select a ${typeName}`}
                                placeholder={`Choose a ${type} to view or manage`}
                                size="small"
                            />
                        )}
                        options={autocompleteOptions}
                        disablePortal
                        onChange={(e, value) => {
                            setSelectedId(value ? value.id : null)
                        }}
                        fullWidth
                        value={autocompleteOptions.find(option => option.id === selectedId) || null}
                        loading={loading}
                        loadingText={`Loading ${type}s...`}
                        noOptionsText={`No ${type}s found`}
                    />
                    {canEdit && (
                        <Tooltip title={`Create a new ${type}`}>
                            <Button
                                variant="outlined"
                                startIcon={<Add />}
                                onClick={() => openDialog('new')}
                                size="small"
                            >
                                New {typeName}
                            </Button>
                        </Tooltip>
                    )}
                </Box>
            </Paper>

            {selectedId ? (
                <TableContainer component={Paper} elevation={2}>
                    <Box px={2} py={1.5} display="flex" justifyContent="space-between" alignItems="center" bgcolor="#f9f9f9" borderBottom="1px solid #e0e0e0">
                        <Typography variant="subtitle1">
                            {selectedCollection?.name} {' '}
                            <Typography component="span" variant="body2" color="textSecondary">
                                ({records.length} {records.length === 1 ? 'item' : 'items'})
                            </Typography>
                        </Typography>

                        <Box display="flex" justifyContent="flex-end" gap={1} mb={2} alignItems='center'>
                            <Button size="small" variant="outlined" startIcon={<GetApp />} onClick={handleExportMenuOpen}>
                                Export
                            </Button>
                            <Menu open={openExportMenu} anchorEl={exportMenuAnchor} onClose={handleExportMenuClose}>
                                <MenuItem onClick={handleExportToCSV}>Export to CSV</MenuItem>
                                <MenuItem onClick={handleExportToPDF}>Export to PDF</MenuItem>
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
                                <TableCell sx={{ fontWeight: 'bold' }}>
                                    {type === 'group' ? 'Asset' : 'Name'}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Serial Number</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {records.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                        <Typography color="textSecondary">
                                            No items in this {type} yet
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                records.map(record => (
                                    <TableRow key={record.id} hover>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {record.name.String || 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {record.location.String || 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {record.serial.String || 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="View details">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        // For sets, navigate to group if associated by group
                                                        if (type === 'set' && record.associatedBy === 'group') {
                                                            // TODO: Navigate to group page
                                                            navigate(`/asset/${record.id}`)
                                                        } else {
                                                            navigate(`/asset/${record.id}`)
                                                        }
                                                    }}
                                                >
                                                    <Preview fontSize="small" />
                                                </IconButton>
                                            </Tooltip>

                                            {canEdit && (
                                                <Tooltip title={`Remove from ${type}`}>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteRecord(record)}
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
                        Select a {type} to view its contents
                    </Typography>
                </Paper>
            )}

            <NewCollectionDialog
                collectionType={type}
                collectionName={newName}
                setCollectionName={setNewName}
                onSave={createCollection}
                onCancel={cancelNewDialog}
                open={dialogs.new}
            />

            {selectedCollection && (
                <>
                    <RenameCollectionDialog
                        collectionType={type}
                        collectionName={renamedName}
                        setCollectionName={setRenamedName}
                        onSave={renameCollection}
                        onCancel={cancelRenameDialog}
                        open={dialogs.rename}
                        placeholder={selectedCollection.name}
                    />

                    <DeleteCollectionDialog
                        collectionType={type}
                        collectionName={selectedCollection.name}
                        onDelete={deleteCollection}
                        onCancel={() => openDialog('delete')}
                        open={dialogs.delete}
                    />
                </>
            )}

            <Dialog open={showDeleteRecordDialog} onClose={() => setShowDeleteRecordDialog(false)}>
                <DialogTitle>Asset tied by Record Number</DialogTitle>
                <DialogContent>
                    <Typography>
                        This asset is tied to the {type} by its Record Number.
                        Removing this asset will remove all assets in this {type} with the same Record Number.
                        Are you sure you want to remove this asset from the {type}?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteRecordDialog(false)}>Cancel</Button>
                    <Button variant='contained' color='error' onClick={handlePendingRecordDeletion}>Remove</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}