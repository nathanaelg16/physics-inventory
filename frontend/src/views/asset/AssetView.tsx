import { useNavigate, useParams } from 'react-router'
import {
    Button,
    Skeleton,
    useMediaQuery,
    useTheme,
    Alert,
    Snackbar,
    Tooltip
} from '@mui/material'
import { ArrowBack, Save, ErrorOutline, Close } from '@mui/icons-material'
import { main } from '../../../wailsjs/go/models'
import Asset = main.Asset
import { useEffect, useState } from 'react'
import imageNotAvailable from '../../assets/image_not_available.png'
import { SnackbarAlert } from '../../utils/snackbar-alert'
import {AssignRecordLocator, GetAsset, UpdateAsset} from '../../../wailsjs/go/main/App'
import EditableParagraph from '../../components/editable-paragraph/EditableParagraph'
import AssetField from '../../components/asset-field/AssetField'
import AssetFieldWithAction from '../../components/asset-field/AssetFieldWithAction'
import AssetSelectField from '../../components/asset-field/AssetSelectField'
import AssetDocumentField from '../../components/asset-field/AssetDocumentField'
import AssetInfoField from '../../components/asset-field/AssetInfoField'
import AssetStatusHistory from '../../components/asset-status-history/AssetStatusHistory'
import AssetCalibrationHistory from '../../components/asset-calibration-history/AssetCalibrationHistory'
import {formatDate} from '../../utils/utils'
import './assetView.css'

export default function AssetView() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [asset, setAsset] = useState<Asset>()
    const [loading, setLoading] = useState<boolean>(true)
    const [alert, showAlert] = useState<SnackbarAlert | null>(null)
    const [edits, setEdits] = useState<any>({})
    const [saving, setSaving] = useState<boolean>(false)

    const theme = useTheme()
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

    const hasEdits = Object.keys(edits).length > 0

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
                currentValue = asset[field] || ''
                break
            case 'purchaseDate':
                currentValue = formatDate(asset.purchaseDate.Time) || ''
                break
            case 'name':
                currentValue = asset.name.String || ''
                break
            case 'location':
                currentValue = asset.location.String || ''
                break
            case 'keywords':
                currentValue = asset.keywords.String || ''
                break
            case 'brand':
                currentValue = asset.brand.String || ''
                break
            case 'model':
                currentValue = asset.model.String || ''
                break
            case 'part':
                currentValue = asset.part.String || ''
                break
            case 'serial':
                currentValue = asset.serial.String || ''
                break
            case 'auInventory':
                currentValue = asset.auInventory.String || ''
                break
            case 'quantity':
                currentValue = asset.quantity.String || ''
                break
            case 'purchaseAmount':
                currentValue = asset.purchaseAmount.String || ''
                break
            case 'notes':
                currentValue = asset.notes.String || ''
                break
            case 'recordLocator':
                currentValue = asset.recordLocator
                break
            case 'hardCopyAvailable':
                currentValue = asset.hardCopyAvailable
                break
            default:
                currentValue = ''
        }

        // Check if the value is actually changing
        if (currentValue === newValue) {
            // If the values are the same, remove the field from edits if it exists
            if (edits[field]) {
                const newEdits = { ...edits }
                delete newEdits[field]
                setEdits(newEdits)
            }
        } else {
            // If the values are different, update the edits object
            setEdits({
                ...edits,
                [field]: newValue
            })
        }
    }

    const saveChanges = () => {
        if (!asset || !hasEdits) return

        setSaving(true)

        UpdateAsset(edits)
            .then(() => {
                showAlert({
                    severity: 'success',
                    msg: 'Asset updated successfully!'
                })
                setEdits({}) // Clear edits after successful save
                setSaving(false)
            })
            .catch((err) => {
                console.error('Error updating asset:', err)
                showAlert({
                    severity: 'error',
                    msg: 'Failed to update asset. Please try again.'
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

                getAsset()
            }).catch(() => {
                showAlert({
                    severity: 'error',
                    msg: 'An error occurred while assigning the record number.'
                })

                setTimeout(() => getAsset(), 4000)
            })
    }

    const recordLocatorValidator = (recordLocator: string): boolean => {
        // Check if the string is empty or consists only of digits 0-9
        const digitRegex = /^[0-9]*$/
        return digitRegex.test(recordLocator)
    }

    const currencyValidator = (amount: string): boolean => {
        // Basic check for valid currency format with or without leading $
        const currencyRegex = /^\$?(\d+)(\.\d{2})?$|^\$?(0\.\d{2})$/

        // Check for the case where we have a decimal without a leading 0
        if (/^\$?\.\d{2}$/.test(amount)) {
            return false // Reject .XX format, should be 0.XX
        }

        // Reject if it's just a dollar sign or decimal point or empty
        if (amount === '$' || amount === '.' || amount === '$.' || amount === '') {
            return false
        }

        return currencyRegex.test(amount)
    }

    const viewDocument = (document: string) => {
        if (hasEdits) {
            showAlert({
                severity: 'warning',
                msg: 'Please save or discard all changes before performing this action.'
            })

            return
        }

        // todo implement this
    }

    const removeDocument = (document: string) => {
        // todo implement this
    }

    const uploadDocument = (document: string) => {
        // todo implement this
    }

    // Helper function to check if a field has been edited
    const isFieldEdited = (fieldName: string): boolean => {
        return edits.hasOwnProperty(fieldName)
    }

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

                {hasEdits && (
                    <div className="asset-unsaved-container">
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
            </div>

            {/* Missing asset banner above the main details when asset is missing */}
            {asset.missing && (
                <div className="asset--missing-banner">
                    <Tooltip title={missingTooltipText} arrow placement="bottom">
                        <div className="asset--missing-banner-content">
                            <ErrorOutline className="asset--missing-icon" />
                            <span>This asset is currently marked as missing</span>
                        </div>
                    </Tooltip>
                </div>
            )}

            <div className="asset--main-details">
                <div className="asset--image">
                    <img
                        alt={asset.name.String}
                        src={asset.image !== null ? `data:image/unknown;base64,${asset.image}` : imageNotAvailable}
                    />
                </div>
                <div className="asset--details">
                    <EditableParagraph
                        text={asset.name.String}
                        onSave={(newText) => saveChangesToField('name', newText)}
                        className="asset--details-name"
                        isEdited={isFieldEdited('name')}
                    />

                    <div className="asset--details-sub-group-container">
                        <div className="asset--details-sub-group">
                            <AssetField
                                label="Brand:"
                                fieldName="brand"
                                value={asset.brand.String}
                                onSave={saveChangesToField}
                                isEdited={isFieldEdited('brand')}
                            />
                            <AssetField
                                label="Model:"
                                fieldName="model"
                                value={asset.model.String}
                                onSave={saveChangesToField}
                                isEdited={isFieldEdited('model')}
                            />
                            <AssetField
                                label="Part:"
                                fieldName="part"
                                value={asset.part.String}
                                onSave={saveChangesToField}
                                isEdited={isFieldEdited('part')}
                            />
                            <AssetField
                                label="S/N:"
                                fieldName="serial"
                                value={asset.serial.String}
                                onSave={saveChangesToField}
                                isEdited={isFieldEdited('serial')}
                            />
                        </div>
                        <div className="asset--details-sub-group">
                            <AssetField
                                label="Location:"
                                fieldName="location"
                                value={asset.location.String}
                                onSave={saveChangesToField}
                                isEdited={isFieldEdited('location')}
                            />
                            <AssetField
                                label="Keywords:"
                                fieldName="keywords"
                                value={asset.keywords.String}
                                onSave={saveChangesToField}
                                isEdited={isFieldEdited('keywords')}
                            />
                            <AssetField
                                label="AU Inventory:"
                                fieldName="auInventory"
                                value={asset.auInventory.String}
                                onSave={saveChangesToField}
                                isEdited={isFieldEdited('auInventory')}
                            />
                            <AssetField
                                label="Quantity:"
                                fieldName="quantity"
                                value={asset.quantity.String}
                                onSave={saveChangesToField}
                                isEdited={isFieldEdited('quantity')}
                            />
                        </div>
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
                    />
                    <AssetField
                        label="Purchase Date:"
                        fieldName="purchaseDate"
                        value={asset.purchaseDate.Time}
                        onSave={saveChangesToField}
                        inputType='date'
                        isEdited={isFieldEdited('purchaseDate')}
                    />
                    <AssetField
                        label="Purchase Amount:"
                        fieldName="purchaseAmount"
                        value={asset.purchaseAmount.String}
                        onSave={saveChangesToField}
                        validator={currencyValidator}
                        helperText='Value must be formatted as currency'
                        isEdited={isFieldEdited('purchaseAmount')}
                    />
                    <AssetField
                        label="Unit Price:"
                        fieldName="unitPrice"
                        value={asset.unitPrice}
                        onSave={saveChangesToField}
                        validator={currencyValidator}
                        helperText='Value must be formatted as currency'
                        isEdited={isFieldEdited('unitPrice')}
                    />
                    <AssetDocumentField
                        label='Receipt:'
                        documentAvailable={asset.receiptAvailable}
                        onView={() => viewDocument('receipt')}
                        onRemove={() => removeDocument('receipt')}
                        onUpload={() => uploadDocument('receipt')}
                    />
                </div>
            </div>

            <div className="asset--details-addl">
                <p>Documents</p>
                <div className="asset--details-addl-content">
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
                    />
                    <AssetSelectField
                        label='Physical Manual:'
                        fieldName='hardCopyAvailable'
                        value={asset.hardCopyAvailable}
                        options={[{value: true, label: 'Available'}, {value: false, label: 'Not Available'}]}
                        onSave={saveChangesToField}
                        placeholder=''
                        isEdited={isFieldEdited('hardCopyAvailable')}
                    />
                    <AssetDocumentField
                        label='Digital Manual:'
                        documentAvailable={asset.softCopyAvailable}
                        onView={() => viewDocument('manual')}
                        onRemove={() => removeDocument('manual')}
                        onUpload={() => uploadDocument('manual')}
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
                        value={asset.nextCalibrationDate.Time}
                        onSave={saveChangesToField}
                        inputType='date'
                        isEdited={isFieldEdited('nextCalibrationDate')}
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
                        placeholder='Click to add notes...'
                        isEdited={isFieldEdited('maintenanceNotes')}
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
                            placeholder="Click to add notes..."
                            isEdited={isFieldEdited('notes')}
                        />
                    </div>
                </div>
            </div>

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