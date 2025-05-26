import {useContext, useEffect, useMemo, useState} from 'react'
import {main} from '../../wailsjs/go/models'
import {useSessionStorage} from '@uidotdev/usehooks'
import {useNavigate} from 'react-router'
import {AccessLevel, AuthContext} from '../utils/auth'
import {SnackbarAlert} from '../utils/snackbar-alert'
import useCollectionDialogs from './useCollectionDialogs'

type CollectionType = 'set' | 'group'
type Collection = main.Set | main.Group
type CollectionRecord = main.CollectionRecord

interface CollectionOperations {
    fetch: () => Promise<Collection[]>
    fetchRecords: (id: number) => Promise<CollectionRecord[]>
    create: (name: string) => Promise<number>
    rename: (id: number, name: string) => Promise<void>
    delete: (id: number) => Promise<void>
    deleteRecordById: (collectionId: number, recordId: number) => Promise<void>
    deleteRecordByRecordLocator: (collectionId: number, recordLocator: number) => Promise<void>
    deleteRecordByGroup?: (collectionId: number, recordId: number) => Promise<void>
    exportCSV: (id: number) => Promise<void>
    exportPDF: (id: number) => Promise<void>
}

interface UseCollectionManagerProps {
    type: CollectionType
    operations: CollectionOperations
    storageKey: string
}

export default function useCollectionManager({ type, operations, storageKey }: UseCollectionManagerProps) {
    const navigate = useNavigate()
    const authContext = useContext(AuthContext)
    const canEdit = authContext.accessLevel >= AccessLevel.Maintainer

    // State
    const [collections, setCollections] = useState<Collection[]>([])
    const [selectedId, setSelectedId] = useSessionStorage<number | null>(storageKey, null)
    const [records, setRecords] = useState<CollectionRecord[]>([])
    const [loading, setLoading] = useState(false)
    const [snackbarAlert, setSnackbarAlert] = useState<SnackbarAlert | null>(null)

    // Dialog management
    const { dialogs, openDialog, closeDialog } = useCollectionDialogs()
    const [newName, setNewName] = useState('')
    const [renamedName, setRenamedName] = useState('')

    // Export state
    const [isExporting, setIsExporting] = useState(false)

    // Delete confirmation state
    const [showDeleteRecordDialog, setShowDeleteRecordDialog] = useState(false)
    const [pendingRecordDeletion, setPendingRecordDeletion] = useState<{
        collectionId: number
        recordLocator: number
    } | null>(null)

    // Computed values
    const autocompleteOptions = useMemo(() => {
        return collections.map(collection => ({
            id: collection.id,
            label: collection.name,
        }))
    }, [collections])

    const selectedCollection = collections.find(c => c.id === selectedId)

    // Fetch functions
    const fetchCollections = async () => {
        setLoading(true)
        try {
            const fetchedCollections = await operations.fetch()
            setCollections(fetchedCollections)
        } catch (err) {
            console.error(err)
            setSnackbarAlert({
                severity: 'error',
                msg: `Failed to load ${type}s`
            })
        } finally {
            setLoading(false)
        }
    }

    const fetchRecords = async (collectionId: number) => {
        setLoading(true)
        try {
            const fetchedRecords = await operations.fetchRecords(collectionId)
            setRecords(fetchedRecords)
        } catch {
            setSnackbarAlert({
                severity: 'error',
                msg: `Failed to load ${type} details`
            })
        } finally {
            setLoading(false)
        }
    }

    // Effects
    useEffect(() => {
        fetchCollections()
    }, [])

    useEffect(() => {
        if (selectedId) {
            fetchRecords(selectedId)
        } else {
            setRecords([])
        }
    }, [selectedId])

    // Collection operations
    const createCollection = async () => {
        closeDialog('new')
        try {
            const id = await operations.create(newName)
            setSnackbarAlert({
                severity: 'success',
                msg: `${type.charAt(0).toUpperCase() + type.slice(1)} created successfully!`
            })
            await fetchCollections()
            setSelectedId(id)
        } catch (err) {
            setSnackbarAlert({
                severity: 'error',
                msg: String(err)
            })
        } finally {
            setNewName('')
        }
    }

    const renameCollection = async () => {
        closeDialog('rename')
        if (!selectedId) return

        try {
            await operations.rename(selectedId, renamedName)
            setSnackbarAlert({
                severity: 'success',
                msg: `${type.charAt(0).toUpperCase() + type.slice(1)} successfully renamed!`
            })
            await fetchCollections()
        } catch (err) {
            setSnackbarAlert({
                severity: 'error',
                msg: String(err)
            })
        } finally {
            setRenamedName('')
        }
    }

    const deleteCollection = async () => {
        closeDialog('delete')
        if (!selectedId) return

        try {
            await operations.delete(selectedId)
            setSnackbarAlert({
                severity: 'success',
                msg: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`
            })
            await fetchCollections()
            setSelectedId(null)
        } catch (err) {
            setSnackbarAlert({
                severity: 'error',
                msg: String(err)
            })
        }
    }

    // Record operations
    const handleDeleteRecord = (record: CollectionRecord) => {
        if (!selectedId) return

        if (record.associatedBy === 'recordLocator') {
            setPendingRecordDeletion({
                collectionId: selectedId,
                recordLocator: record.recordLocator
            })
            setShowDeleteRecordDialog(true)
        } else if (record.associatedBy === 'group' && operations.deleteRecordByGroup) {
            operations.deleteRecordByGroup(selectedId, record.id)
                .then(() => {
                    setSnackbarAlert({
                        severity: 'success',
                        msg: `Removed from ${type} successfully!`
                    })
                    fetchRecords(selectedId)
                })
                .catch(err => {
                    setSnackbarAlert({
                        severity: 'error',
                        msg: String(err)
                    })
                })
        } else {
            operations.deleteRecordById(selectedId, record.id)
                .then(() => {
                    setSnackbarAlert({
                        severity: 'success',
                        msg: `Asset removed from ${type} successfully!`
                    })
                    fetchRecords(selectedId)
                })
                .catch(err => {
                    setSnackbarAlert({
                        severity: 'error',
                        msg: String(err)
                    })
                })
        }
    }

    const handlePendingRecordDeletion = async () => {
        if (!pendingRecordDeletion) return

        setShowDeleteRecordDialog(false)
        try {
            await operations.deleteRecordByRecordLocator(
                pendingRecordDeletion.collectionId,
                pendingRecordDeletion.recordLocator
            )
            setSnackbarAlert({
                severity: 'success',
                msg: `Asset removed from ${type} successfully!`
            })
            if (selectedId) {
                fetchRecords(selectedId)
            }
        } catch (err) {
            setSnackbarAlert({
                severity: 'error',
                msg: String(err)
            })
        } finally {
            setPendingRecordDeletion(null)
        }
    }

    // Export operations
    const exportToCSV = async () => {
        if (!selectedId) return
        setIsExporting(true)
        try {
            await operations.exportCSV(selectedId)
            setSnackbarAlert({
                severity: 'success',
                msg: 'Export finished successfully!'
            })
        } catch (err) {
            setIsExporting(false)
            setSnackbarAlert({
                severity: 'error',
                msg: `Error: ${err}`
            })
        }
    }

    const exportToPDF = async () => {
        if (!selectedId) return
        setIsExporting(true)
        try {
            await operations.exportPDF(selectedId)
            setSnackbarAlert({
                severity: 'success',
                msg: 'Export finished successfully!'
            })
        } catch (err) {
            setIsExporting(false)
            setSnackbarAlert({
                severity: 'error',
                msg: `Error: ${err}`
            })
        }
    }

    // Dialog handlers
    const cancelNewDialog = () => {
        closeDialog('new')
        setNewName('')
    }

    const cancelRenameDialog = () => {
        closeDialog('rename')
        setRenamedName('')
    }

    return {
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
        closeDialog,
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
        pendingRecordDeletion,

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
    }
}