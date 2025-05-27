import './assetView.css'
import {useNavigate, useParams} from 'react-router'
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Menu,
    MenuItem,
    Skeleton,
    Snackbar,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material'
import {ArrowBack, Close, ErrorOutline, Save} from '@mui/icons-material'
import {main} from '../../../wailsjs/go/models'
import {MouseEvent, useContext, useEffect, useRef, useState} from 'react'
import {SnackbarAlert} from '../../utils/snackbar-alert'
import {
    AssignRecordLocator,
    ChangeImage,
    DeleteAsset,
    DownloadManual,
    DownloadReceipt,
    DuplicateAsset,
    ExportAssetsCSV,
    ExportAssetsPDF,
    GetAsset,
    RemoveImage,
    RemoveManual,
    RemoveReceipt,
    ToggleMissing,
    UpdateAsset,
    UploadManual,
    UploadReceipt
} from '../../../wailsjs/go/main/App'
import EditableParagraph from '../../components/editable-paragraph/EditableParagraph'
import AssetField from '../../components/asset-field/AssetField'
import AssetFieldWithAction from '../../components/asset-field/AssetFieldWithAction'
import AssetSelectField from '../../components/asset-field/AssetSelectField'
import AssetDocumentField from '../../components/asset-field/AssetDocumentField'
import AssetInfoField from '../../components/asset-field/AssetInfoField'
import AssetStatusHistory from '../../components/asset-status-history/AssetStatusHistory'
import AssetCalibrationHistory from '../../components/asset-calibration-history/AssetCalibrationHistory'
import {formatDate} from '../../utils/utils'
import AssetMissingUpdater from "../../components/asset-missing-updater/AssetMissingUpdater";
import AssetImageManager from "../../components/asset-image-manager/AssetImageManager";
import {currencyValidator, nonEmptyFieldValidator, recordLocatorValidator} from "../../utils/validators";
import {AccessLevel, AuthContext} from "../../utils/auth";
import AddToCollectionsDialog from "../../components/add-to-collections-dialog/AddToCollectionsDialog";
import Asset = main.Asset;

export default function AssetView() {
    const { id } = useParams()
    const navigate = useNavigate()
    const authContext = useContext(AuthContext)

    const [asset, setAsset] = useState<Asset>()
    const [loading, setLoading] = useState<boolean>(true)
    const [alert, showAlert] = useState<SnackbarAlert | null>(null)
    const [edits, setEdits] = useState<any>({})
    const [saving, setSaving] = useState<boolean>(false)
    const [isStuck, setIsStuck] = useState<boolean>(false)
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean,
        title: string,
        message: string,
        onConfirm: () => void,
        onConfirmButtonText: string,
    }>({
        open: false,
        title: '',
        message: '',
        onConfirm: () => {},
        onConfirmButtonText: 'OK'
    })

    const [exportMenuAnchor, setExportMenuAnchor] = useState<HTMLElement | null>(null)
    const openExportMenu = Boolean(exportMenuAnchor)

    const theme = useTheme()
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
    const containerRef = useRef<HTMLDivElement>(null)

    const canEdit = authContext.accessLevel >= AccessLevel.Maintainer
    const hasEdits = Object.keys(edits).length > 0

    // Set up intersection observer for sticky container effect
    useEffect(() => {
        if (!containerRef.current || isSmallScreen || !hasEdits) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                // When the container intersects with the threshold, it's not stuck
                // When it doesn't intersect, it's stuck to the top
                setIsStuck(!entry.isIntersecting)
            },
            {
                // This threshold is the point where we consider the element "stuck"
                threshold: 0,
                rootMargin: '-16px 0px 0px 0px'
            }
        )

        observer.observe(containerRef.current)

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current)
            }
        }
    }, [containerRef, isSmallScreen, hasEdits])

    const getAsset = () => {
        if (id !== undefined) {
            setLoading(true)
            GetAsset(parseInt(id))
                .then((res) => {
                    setAsset(res)
                    setLoading(false)
                })
                .catch(() => {
                    showAlert({
                        severity: 'error',
                        msg: 'An error occurred fetching asset details.'
                    })
                    setLoading(false)
                })
        }
    }

    useEffect(() => {
        getAsset()
    }, [id])

    const saveChangesToField = (field: string, newValue: any) => {
        if (!asset) return

        let currentValue: any

        switch (field) {
            case 'vendor':
            case 'unitPrice':
            case 'repairStatus':
                currentValue = asset[field]
                break
            case 'purchaseDate':
                currentValue = asset.purchaseDate.Valid ? formatDate(asset.purchaseDate.Time) : ''
                break
            case 'name':
                currentValue = asset.name.String
                break
            case 'location':
                currentValue = asset.location.String
                newValue = (newValue as string).toUpperCase()
                break
            case 'keywords':
                currentValue = asset.keywords.String
                break
            case 'brand':
                currentValue = asset.brand.String
                break
            case 'model':
                currentValue = asset.model.String
                break
            case 'part':
                currentValue = asset.part.String
                break
            case 'serial':
                currentValue = asset.serial.String
                break
            case 'auInventory':
                currentValue = asset.auInventory.String
                break
            case 'quantity':
                currentValue = asset.quantity.String
                break
            case 'purchaseAmount':
                currentValue = asset.purchaseAmount.String
                break
            case 'notes':
                currentValue = asset.notes.String
                break
            case 'nextCalibrationDate':
                currentValue = asset.nextCalibrationDate.Valid ? formatDate(asset.nextCalibrationDate.Time) : ''
                break
            case 'maintenanceNotes':
                currentValue = asset.maintenanceNotes.String
                break
            case 'recordLocator':
                currentValue = asset.recordLocator.toString()
                if ((newValue as string) === '') newValue = "-1"
                break
            case 'hardCopyAvailable':
                currentValue = asset.hardCopyAvailable
                break
            default:
                return
        }

        // Check if the value is actually changing
        if (currentValue === newValue) {
            // If the values are the same, remove the field from edits
            const newEdits = { ...edits }
            delete newEdits[field]
            setEdits(newEdits)
        } else {
            // If the values are different, update the edits object
            setEdits({
                ...edits,
                [field]: newValue
            })
        }
    }

    const saveChanges = () => {
        if (id === undefined || !asset || !hasEdits) return

        setSaving(true)

        const editsConv = Object.fromEntries(
            Object.entries(edits).map(([key, value]) => [key, String(value)])
        )

        UpdateAsset(parseInt(id), editsConv)
            .then(() => {
                showAlert({
                    severity: 'success',
                    msg: 'Asset updated successfully!'
                })
                setEdits({}) // Clear edits after successful save
                setSaving(false)
                getAsset()
            })
            .catch((err) => {
                console.error('Error updating asset:', err)
                showAlert({
                    severity: 'error',
                    msg: err
                })
                setSaving(false)
            })
    }

    const cancelEdits = () => {
        // We need to force a re-render of all editable fields to their original values
        // The simplest way is to re-fetch the asset data
        getAsset()

        // Clear the edits object
        setEdits({})

        showAlert({
            severity: 'info',
            msg: 'Changes discarded.'
        })
    }

    const assignRecordLocator = () => {
        if (!asset) return

        if (hasEdits) {
            showAlert({
                severity: 'warning',
                msg: 'Please save or discard all changes before performing this action.'
            })

            return
        }

        AssignRecordLocator(asset.id)
            .then(() => {
                showAlert({
                    severity: 'success',
                    msg: 'Record number assigned!'
                })
            }).catch(() => {
                showAlert({
                    severity: 'error',
                    msg: 'An error occurred while assigning the record number.'
                })
            }).finally(() => getAsset())
    }

    const toggleMissing = (missing: boolean, quantityMissing: string) => {
        if (id === undefined || !asset) return

        ToggleMissing(parseInt(id), missing, quantityMissing)
            .then(() => showAlert({
                severity: 'success',
                msg: 'Asset updated!'
            })).catch((err) => {
                showAlert({
                    severity: 'error',
                    msg: `Error updating missing status: ${err}`
                })
            }).finally(() => getAsset())
    }

    const uploadAssetImage = async (): Promise<void> => {
        if (!asset) return

        ChangeImage(asset.id)
            .then((success) => {
                if (success) {
                    showAlert({
                        severity: 'success',
                        msg: 'Image changed successfully!'
                    })

                    getAsset()
                }
            }).catch((err) => showAlert({
            severity: 'error',
            msg: err
        }))
    }

    const deleteAssetImage = async (): Promise<void> => {
        if (!asset) return

        RemoveImage(asset.id)
            .then(() => {
                showAlert({
                    severity: 'success',
                    msg: 'Image deleted successfully!'
                })

                getAsset()
            }).catch((err) => showAlert({
            severity: 'error',
            msg: err
        }))
    }

    const downloadDocument = (document: 'manual' | 'receipt') => {
        if (!asset) return

        const promise = document === 'manual'
            ? DownloadManual(asset.id, asset.recordLocator) : DownloadReceipt(asset.id)

        promise.then((success) => {
            if (success) {
                showAlert({
                    severity: 'success',
                    msg: 'File downloaded successfully!'
                })
            }
        }).catch((err) => showAlert({
            severity: 'error',
            msg: err
        }))
    }

    const removeDocument = (document: 'manual' | 'receipt') => {
        if (!asset) return

        if (hasEdits) {
            showAlert({
                severity: 'warning',
                msg: 'Please save or discard all changes before performing this action.'
            })

            return
        }

        if (document === 'manual') {
            setConfirmDialog({
                open: true,
                title: 'Remove Manual',
                message: `Warning: Removing this manual will affect all assets with record number ${asset.recordLocator.toString().padStart(5, '0')}. Are you sure you want to continue?`,
                onConfirm: () => {
                    RemoveManual(asset.recordLocator)
                        .then(() => {
                            showAlert({
                                severity: 'success',
                                msg: 'Document removed successfully!'
                            })
                            setConfirmDialog({ ...confirmDialog, open: false })
                            getAsset()
                        })
                        .catch(err => showAlert({
                            severity: 'error',
                            msg: err
                        }))
                },
                onConfirmButtonText: 'Remove'
            })
        } else {
            RemoveReceipt(asset.id)
                .then(() => {
                    showAlert({
                        severity: 'success',
                        msg: 'Document removed successfully!'
                    })
                    getAsset()
                })
                .catch(err => showAlert({
                    severity: 'error',
                    msg: err
                }))
        }
    }

    const uploadDocument = (document: 'manual' | 'receipt') => {
        if (!asset) return

        if (hasEdits) {
            showAlert({
                severity: 'warning',
                msg: 'Please save or discard all changes before performing this action.'
            })

            return
        }

        const promise: Promise<boolean> = document == 'manual'
            ? UploadManual(asset.recordLocator)
            : UploadReceipt(asset.id)
        promise.then((success) => {
            if (success) {
                showAlert({
                    severity: 'success',
                    msg: 'Document uploaded successfully!'
                })

                getAsset()
            }
        }).catch((err) => showAlert({
            severity: 'error',
            msg: err
        }))
    }

    const handleDuplicateAsset = () => {
        if (!asset) return

        DuplicateAsset(asset.id)
            .then(id => {
                showAlert({
                    severity: 'success',
                    msg: 'Asset duplicated successfully!'
                })
                navigate(`/asset/${id}`)
            })
            .catch(e => showAlert({
                severity: 'error',
                msg: `Error duplicating asset: ${e}`
            }))
    }

    const handleDeleteConfirmation = () => {
        // Show confirmation dialog before deletion
        setConfirmDialog({
            open: true,
            title: 'Delete Asset',
            message: 'Are you sure you want to delete this asset? This action cannot be undone.',
            onConfirm: handleDeleteAsset,
            onConfirmButtonText: 'Delete'
        })
    }

    const handleDeleteAsset = () => {
        if (!asset) return

        DeleteAsset(asset.id)
            .then(() => {
                showAlert({
                    severity: 'success',
                    msg: 'Asset deleted successfully!'
                })
                navigate('/search')
            }).catch(e => showAlert({
                severity: 'error',
                msg: `Error deleting asset: ${e}`
            }))
    }

    const handleExportMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
        setExportMenuAnchor(event.currentTarget)
    }

    const handleExportMenuClose = () => {
        setExportMenuAnchor(null)
    }

    const handleExportToCSV = () => {
        handleExportMenuClose()

        if (!asset) return

        ExportAssetsCSV([asset.id])
            .then(() => showAlert({
                severity: 'success',
                msg: 'Export finished successfully!'
            })).catch(err => showAlert({
                severity: 'error',
                msg: `Error: ${err}`
            }))
    }

    const handleExportToPDF = () => {
        handleExportMenuClose()

        if (!asset) return

        ExportAssetsPDF([asset.id])
            .then(() => showAlert({
                severity: 'success',
                msg: 'Export finished successfully!'
            })).catch(err => showAlert({
                severity: 'error',
                msg: `Error: ${err}`
            }))
    }

    // Helper function to check if a field has been edited
    const isFieldEdited = (fieldName: string): boolean => {
        return edits.hasOwnProperty(fieldName)
    }

    const noRecordLocator = asset?.recordLocator == -1

    if (loading) {
        return (
            <div className="asset-view-container">
                <Button
                    variant="text"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    className="asset-back-button"
                    size={isSmallScreen ? 'small' : 'medium'}
                >
                    Back
                </Button>
                <Skeleton variant="rectangular" height={isSmallScreen ? 300 : 400} />
            </div>
        )
    }

    if (!asset) {
        return (
            <div className="asset-view-container">
                <Button
                    variant="text"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    className="asset-back-button"
                >
                    Back
                </Button>
                <p>Asset not found or an error occurred.</p>
            </div>
        )
    }

    const missingTooltipText = asset.missing && asset.dateReportedMissing
        ? `Asset marked as missing on ${formatDate(asset.dateReportedMissing.Time)} by user ${asset.reportedMissingBy.String || 'Unknown'}`
        : 'Asset marked as missing'

    return (
        <div className="asset-view-container">
            <div className="asset-header">
                <Button
                    variant="text"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    className="asset-back-button"
                    size={isSmallScreen ? 'small' : 'medium'}
                >
                    Back
                </Button>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant='outlined'
                            color='secondary'
                            disabled={loading || hasEdits}
                            size={isSmallScreen ? 'small' : 'medium'}
                            onClick={handleExportMenuOpen}
                    >
                        Export
                    </Button>
                    <Menu open={openExportMenu} anchorEl={exportMenuAnchor} onClose={handleExportMenuClose}>
                        <MenuItem onClick={handleExportToCSV}>Export to CSV</MenuItem>
                        <MenuItem onClick={handleExportToPDF}>Export to PDF</MenuItem>
                    </Menu>
                    {canEdit && (
                        <AddToCollectionsDialog
                            assetId={asset.id}
                            recordLocator={asset.recordLocator}
                            disabled={loading || hasEdits}
                        />
                    )}
                    {canEdit && (
                        <>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={handleDuplicateAsset}
                                disabled={loading || hasEdits}
                                size={isSmallScreen ? 'small' : 'medium'}
                            >
                                Duplicate
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleDeleteConfirmation}
                                disabled={loading || hasEdits}
                                size={isSmallScreen ? 'small' : 'medium'}
                            >
                                Delete
                            </Button>
                        </>)}
                </div>
            </div>

            {/* Floating unsaved changes container */}
            {hasEdits && (
                <div
                    ref={containerRef}
                    className={`asset-unsaved-container ${isStuck ? 'is-stuck' : ''}`}
                >
                    <Alert
                        severity="warning"
                        className="asset-unsaved-warning"
                        variant={isSmallScreen ? "outlined" : "standard"}
                    >
                        You have unsaved changes
                    </Alert>
                    <div className="asset-action-buttons">
                        <Button
                            variant="outlined"
                            style={{
                                color: '#B8860B',
                                borderColor: '#B8860B'
                            }}
                            startIcon={<Close />}
                            onClick={cancelEdits}
                            className="asset-cancel-button"
                            size={isSmallScreen ? 'small' : 'medium'}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Save />}
                            onClick={saveChanges}
                            disabled={saving}
                            className="asset-save-button"
                            size={isSmallScreen ? 'small' : 'medium'}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Missing asset banner above the main details when asset is missing */}
            {asset.missing && (
                <div className="asset--missing-banner">
                    <Tooltip title={missingTooltipText} arrow placement="bottom">
                        <div className="asset--missing-banner-content">
                            <ErrorOutline className="asset--missing-icon" />
                            <span>This asset is currently marked as missing.</span>
                        </div>
                    </Tooltip>
                </div>
            )}

            <div className="asset--main-details">
                <div className="asset--image">
                    <AssetImageManager
                        imageData={asset.image}
                        assetName={asset.name.String}
                        onChangeImage={uploadAssetImage}
                        onDeleteImage={deleteAssetImage}
                        disabled={loading}
                        allowEdits={canEdit}
                    />
                </div>
                <div className="asset--details">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <EditableParagraph
                            text={asset.name.String}
                            onSave={(newText) => saveChangesToField('name', newText)}
                            className="asset--details-name"
                            isEdited={isFieldEdited('name')}
                            validator={nonEmptyFieldValidator}
                            helperText='Asset name must not be empty'
                            allowEdits={canEdit}
                        />
                        <Chip
                            label={`ID: ${asset.id}`}
                            size='small'
                            color="primary"
                            variant="outlined"
                            sx={{
                                marginBottom: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                borderColor: theme.palette.primary.light
                            }}
                        />
                    </div>

                    <div className="asset--details-sub-group-container">
                        <div className="asset--details-sub-group">
                            <AssetField
                                label="Brand:"
                                fieldName="brand"
                                value={asset.brand.String}
                                onSave={saveChangesToField}
                                isEdited={isFieldEdited('brand')}
                                allowEdits={canEdit}
                            />
                            <AssetField
                                label="Model:"
                                fieldName="model"
                                value={asset.model.String}
                                onSave={saveChangesToField}
                                isEdited={isFieldEdited('model')}
                                allowEdits={canEdit}
                            />
                            <AssetField
                                label="Part:"
                                fieldName="part"
                                value={asset.part.String}
                                onSave={saveChangesToField}
                                isEdited={isFieldEdited('part')}
                                allowEdits={canEdit}
                            />
                            <AssetField
                                label="S/N:"
                                fieldName="serial"
                                value={asset.serial.String}
                                onSave={saveChangesToField}
                                isEdited={isFieldEdited('serial')}
                                allowEdits={canEdit}
                            />
                        </div>
                        <div className="asset--details-sub-group">
                            <AssetField
                                label="Location:"
                                fieldName="location"
                                value={asset.location.String}
                                onSave={saveChangesToField}
                                isEdited={isFieldEdited('location')}
                                validator={nonEmptyFieldValidator}
                                helperText='Location must not be empty'
                                className='uppercase-text'
                                allowEdits={canEdit}
                            />
                            <AssetField
                                label="Keywords:"
                                fieldName="keywords"
                                value={asset.keywords.String}
                                onSave={saveChangesToField}
                                isEdited={isFieldEdited('keywords')}
                                allowEdits={canEdit}
                            />
                            <AssetField
                                label="AU Inventory:"
                                fieldName="auInventory"
                                value={asset.auInventory.String}
                                onSave={saveChangesToField}
                                isEdited={isFieldEdited('auInventory')}
                                allowEdits={canEdit}
                            />
                            <AssetField
                                label="Quantity:"
                                fieldName="quantity"
                                value={asset.quantity.String}
                                onSave={saveChangesToField}
                                isEdited={isFieldEdited('quantity')}
                                validator={nonEmptyFieldValidator}
                                allowEdits={canEdit}
                            />
                            {asset.missing && <AssetInfoField label='Missing:' value={asset.quantityMissing.String} className='asset--missing-text' />}
                        </div>
                    </div>
                    <div className="asset--status-actions" style={{ marginTop: '16px' }}>
                        {canEdit && <AssetMissingUpdater isMissing={asset.missing}
                                             quantity={asset.quantity.String}
                                             missingQuantity={asset.quantityMissing.String}
                                             disabled={hasEdits}
                                             onUpdate={toggleMissing}
                        />}
                    </div>
                </div>
            </div>

            <div className="asset--details-addl">
                <p>Purchase Details</p>
                <div className="asset--details-addl-content">
                    <AssetField
                        label="Vendor:"
                        fieldName="vendor"
                        value={asset.vendor}
                        onSave={saveChangesToField}
                        isEdited={isFieldEdited('vendor')}
                        allowEdits={canEdit}
                    />
                    <AssetField
                        label="Purchase Date:"
                        fieldName="purchaseDate"
                        value={asset.purchaseDate.Valid ? formatDate(asset.purchaseDate.Time) : ''}
                        onSave={saveChangesToField}
                        inputType='date'
                        isEdited={isFieldEdited('purchaseDate')}
                        allowEdits={canEdit}
                    />
                    <AssetField
                        label="Purchase Amount:"
                        fieldName="purchaseAmount"
                        value={asset.purchaseAmount.String}
                        onSave={saveChangesToField}
                        validator={currencyValidator}
                        helperText='Value must be formatted as currency'
                        isEdited={isFieldEdited('purchaseAmount')}
                        allowEdits={canEdit}
                    />
                    <AssetField
                        label="Unit Price:"
                        fieldName="unitPrice"
                        value={asset.unitPrice}
                        onSave={saveChangesToField}
                        validator={currencyValidator}
                        helperText='Value must be formatted as currency'
                        isEdited={isFieldEdited('unitPrice')}
                        allowEdits={canEdit}
                    />
                    <AssetDocumentField
                        label='Receipt:'
                        documentAvailable={asset.receiptAvailable}
                        onDownload={() => downloadDocument('receipt')}
                        onRemove={() => removeDocument('receipt')}
                        onUpload={() => uploadDocument('receipt')}
                        allowEdits={canEdit}
                    />
                </div>
            </div>

            <div className="asset--details-addl">
                <p>Documents</p>
                <div className="asset--details-addl-content">
                    {noRecordLocator && <Box
                        sx={{
                            mt: 2,
                            mb: 2,
                            p: 1.5,
                            borderLeft: '4px solid',
                            borderColor: 'info.main',
                            backgroundColor: 'info.lighter',
                            borderRadius: 1
                        }}
                    >
                        <Typography variant="body2">
                            <Typography component="span" fontWeight={600}>Note:</Typography> A record number is required before you can add or modify documents.
                        </Typography>
                    </Box>}
                    <AssetFieldWithAction
                        label='Record #:'
                        fieldName='recordLocator'
                        value={asset.recordLocator >= 0 ? asset.recordLocator.toString().padStart(5, '0') : ''}
                        onSave={saveChangesToField}
                        showAction={asset.recordLocator === -1 && edits['recordLocator'] === undefined}
                        actionLabel='Auto-assign'
                        onAction={assignRecordLocator}
                        validator={recordLocatorValidator}
                        helperText='Only numbers allowed'
                        isEdited={isFieldEdited('recordLocator')}
                        allowEdits={canEdit}
                    />
                    <AssetSelectField
                        label='Physical Manual:'
                        fieldName='hardCopyAvailable'
                        value={asset.hardCopyAvailable ? "true" : "false"}
                        options={[{value: "true", label: 'Available'}, {value: "false", label: 'Not Available'}]}
                        onSave={saveChangesToField}
                        placeholder=''
                        isEdited={isFieldEdited('hardCopyAvailable')}
                        disabled={noRecordLocator}
                        allowEdits={canEdit}
                    />
                    <AssetDocumentField
                        label='Digital Manual:'
                        documentAvailable={asset.softCopyAvailable}
                        onDownload={() => downloadDocument('manual')}
                        onRemove={() => removeDocument('manual')}
                        onUpload={() => uploadDocument('manual')}
                        disabled={noRecordLocator}
                        allowEdits={canEdit}
                    />
                </div>
            </div>

            <div className="asset--details-addl">
                <p>Maintenance</p>
                <div className="asset--details-addl-content">
                    <AssetSelectField
                        label='Repair Status:'
                        fieldName='repairStatus'
                        value={asset.repairStatus}
                        options={[
                            {value: 'W', label: 'Working'},
                            {value: 'C', label: 'Out for calibration'},
                            {value: 'R', label: 'Out for repair'},
                            {value: 'T', label: 'Out for testing'},
                            {value: 'U', label: 'Unknown'}
                        ]}
                        onSave={saveChangesToField}
                        isEdited={isFieldEdited('repairStatus')}
                        allowEdits={canEdit}
                    />
                    <AssetInfoField
                        label='Status Changed:'
                        value={asset.statusChangeDate.Valid ? formatDate(asset.statusChangeDate.Time) : ''}
                    />

                    <div style={{margin: '16px 0'}}>
                        <AssetStatusHistory statusHistory={asset.statusHistory} />
                    </div>

                    <AssetInfoField
                        label='Last Calibration:'
                        value={asset.lastCalibrationDate.Valid ? formatDate(asset.lastCalibrationDate.Time) : ''}
                    />
                    <AssetField
                        label='Next Calibration:'
                        fieldName='nextCalibrationDate'
                        value={asset.nextCalibrationDate.Valid ? formatDate(asset.nextCalibrationDate.Time) : ''}
                        onSave={saveChangesToField}
                        inputType='date'
                        isEdited={isFieldEdited('nextCalibrationDate')}
                        allowEdits={canEdit}
                    />

                    <div style={{margin: '16px 0'}}>
                        <AssetCalibrationHistory calibrationHistory={asset.calibrationHistory} />
                    </div>

                    <AssetField
                        label='Maintenance Notes:'
                        fieldName='maintenanceNotes'
                        value={asset.maintenanceNotes.String}
                        onSave={saveChangesToField}
                        multiline
                        placeholder={canEdit ? "Click to add notes..." : 'N/A'}
                        isEdited={isFieldEdited('maintenanceNotes')}
                        allowEdits={canEdit}
                    />
                </div>
            </div>

            <div className="asset--details-addl">
                <p>Notes</p>
                <div className="asset--details-addl-content">
                    <div className="asset--notes-content">
                        <EditableParagraph
                            text={asset.notes.String}
                            onSave={(newText) => saveChangesToField('notes', newText)}
                            multiline
                            placeholder={canEdit ? "Click to add notes..." : 'N/A'}
                            isEdited={isFieldEdited('notes')}
                            allowEdits={canEdit}
                        />
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
            >
                <DialogTitle id="alert-dialog-title">{confirmDialog.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {confirmDialog.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDialog.onConfirm}
                        color="error"
                        variant="contained"
                        autoFocus
                    >
                        {confirmDialog.onConfirmButtonText}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Alert/Snackbar for messages */}
            {alert && (
                <Snackbar
                    open={!!alert}
                    autoHideDuration={6000}
                    onClose={() => showAlert(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert severity={alert.severity} onClose={() => showAlert(null)}>
                        {alert.msg}
                    </Alert>
                </Snackbar>
            )}
        </div>
    )
}