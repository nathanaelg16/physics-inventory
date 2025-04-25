import './newAssetView.css'
import {Alert, Box, Button, Paper, Step, StepLabel, Stepper, TextField, useMediaQuery, useTheme} from '@mui/material'
import NewAssetField from '../../components/new-asset-field/NewAssetField'
import {FormEvent, useEffect, useState} from 'react'
import NewAssetSelectField from '../../components/new-asset-field/NewAssetSelectField'
import {Info, NavigateBefore, NavigateNext, Save} from '@mui/icons-material'
import {useNavigate} from 'react-router'
import NewAssetDocumentSelectField from '../../components/new-asset-field/NewAssetDocumentSelectField'
import {currencyValidator, nonEmptyFieldValidator} from '../../utils/validators'
import NewAssetRecordLocator from '../../components/new-asset-record-locator/NewAssetRecordLocator'

export default function NewAssetView() {
    const navigate = useNavigate()
    const [name, setName] = useState<string>('')
    const [location, setLocation] = useState<string>('')
    const [keywords, setKeywords] = useState<string>('')
    const [brand, setBrand] = useState<string>('')
    const [model, setModel] = useState<string>('')
    const [part, setPart] = useState<string>('')
    const [serial, setSerial] = useState<string>('')
    const [auInventory, setAUInventory] = useState<string>('')
    const [quantity, setQuantity] = useState<string>('')
    const [vendor, setVendor] = useState<string>('')
    const [purchaseDate, setPurchaseDate] = useState<string>('')
    const [purchaseAmount, setPurchaseAmount] = useState<string>('')
    const [unitPrice, setUnitPrice] = useState<string>('')
    const [receipt, setReceipt] = useState<string>('')
    const [image, setImage] = useState<string>('')
    const [softCopyManual, setSoftCopyManual] = useState<string>('')
    const [hardCopyAvailable, setHardCopyAvailable] = useState<string>('false')
    const [recordLocator, setRecordLocator] = useState<string>('')
    const [autoAssignRecordLocator, setAutoAssignRecordLocator] = useState<boolean>(false)
    const [repairStatus, setRepairStatus] = useState<'W' | 'C' | 'R' | 'T' | 'U'>('W')
    const [nextCalibrationDate, setNextCalibrationDate] = useState<string>('')
    const [maintenanceNotes, setMaintenanceNotes] = useState<string>('')
    const [notes, setNotes] = useState<string>('')

    const [activeStep, setActiveStep] = useState(0)

    const [showValidationError, setShowValidationError] = useState(false)
    const [validationMessage, setValidationMessage] = useState('')

    // Track if fields have been touched for validation
    const [fieldsTouched, setFieldsTouched] = useState({
        name: false,
        location: false,
        quantity: false,
        purchaseAmount: false,
        unitPrice: false,
        recordLocator: false
    })

    const theme = useTheme()
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

    // Steps for the form
    const steps = [
        'General Details',
        'Product Information',
        'Purchase Details',
        'Documents',
        'Maintenance & Notes'
    ]

    // Check if record locator is valid or auto-assigned
    const hasValidRecordLocator = Boolean(recordLocator) || autoAssignRecordLocator

    // Mark a field as touched
    const markFieldTouched = (field: keyof typeof fieldsTouched) => {
        setFieldsTouched(prev => ({
            ...prev,
            [field]: true
        }))
    }

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 0: // General Details
                if (!nonEmptyFieldValidator(name)) {
                    setValidationMessage('Name is a required field')
                    markFieldTouched('name')
                    return false
                }
                if (!nonEmptyFieldValidator(location)) {
                    setValidationMessage('Location is a required field')
                    markFieldTouched('location')
                    return false
                }
                if (!nonEmptyFieldValidator(quantity)) {
                    setValidationMessage('Quantity is a required field')
                    markFieldTouched('quantity')
                    return false
                }
                return true

            case 1: // Product Information
                // No validation in this step
                return true

            case 2: // Purchase Details
                if (purchaseAmount && !currencyValidator(purchaseAmount)) {
                    setValidationMessage('Purchase Amount must be formatted as currency')
                    markFieldTouched('purchaseAmount')
                    return false
                }
                if (unitPrice && !currencyValidator(unitPrice)) {
                    setValidationMessage('Unit Price must be formatted as currency')
                    markFieldTouched('unitPrice')
                    return false
                }
                return true

            case 3: // Documents
                if (!autoAssignRecordLocator && recordLocator && !/^\d*$/.test(recordLocator)) {
                    setValidationMessage('Record # must contain only numbers')
                    markFieldTouched('recordLocator')
                    return false
                }
                return true

            case 4: // Maintenance & Notes
                // No validation for the last step
                return true

            default:
                return true
        }
    }

    const handleNext = () => {
        // Validate before proceeding
        if (!validateStep(activeStep)) {
            setShowValidationError(true)
            return
        }

        setShowValidationError(false)
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    const handleBack = () => {
        setShowValidationError(false)
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault()

        // Validate all steps before submission
        let isValid = true
        for (let i = 0; i < steps.length; i++) {
            if (!validateStep(i)) {
                setActiveStep(i)
                setShowValidationError(true)
                isValid = false
                break
            }
        }

        if (isValid) {
            // TODO Add form submission logic here
            console.log('Form submitted')
        }
    }

    // Reset manual fields when record locator is cleared or auto-assign is disabled
    useEffect(() => {
        if (!hasValidRecordLocator) {
            setHardCopyAvailable('false')
            setSoftCopyManual('')
        }
    }, [hasValidRecordLocator])

    // Clear validation error when fields change
    useEffect(() => {
        if (showValidationError) {
            setShowValidationError(false)
        }
    }, [name, location, quantity, purchaseAmount, unitPrice, recordLocator])

    return (
        <Box className="new-asset-container">
            <Box className="new-asset-header">
                <div>
                    <h1>Add a new asset</h1>
                </div>
                <Button
                    variant="outlined"
                    color="error"
                    size={isSmallScreen ? 'small' : 'medium'}
                    onClick={() => navigate(-1)}
                    className="header-cancel-button"
                >
                    Cancel
                </Button>
            </Box>

            {/* Stepper */}
            <Stepper activeStep={activeStep} className="new-asset-stepper" alternativeLabel={!isSmallScreen}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{!isSmallScreen && label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <form onSubmit={handleSubmit}>
                {showValidationError && (
                    <Alert severity="error" className="new-asset-validation-alert">
                        {validationMessage || 'Please correct the errors before proceeding'}
                    </Alert>
                )}

                <Paper elevation={2} className="new-asset-form-container">
                    {/* Step content */}
                    {activeStep === 0 && (
                        <div className="new-asset--details-section">
                            <p>General Details</p>
                            <div className="new-asset--details-content">
                                <NewAssetField value={name}
                                               label='Name:'
                                               onChange={setName}
                                               validator={nonEmptyFieldValidator}
                                               helperText='Name is a required field'
                                               required
                                               onBlur={() => markFieldTouched('name')}
                                               touched={fieldsTouched.name}
                                />
                                <NewAssetField value={location}
                                               label='Location:'
                                               onChange={setLocation}
                                               validator={nonEmptyFieldValidator}
                                               helperText='Location is a required field'
                                               required
                                               onBlur={() => markFieldTouched('location')}
                                               touched={fieldsTouched.location}
                                               tooltip='e.g. HYH-211-A1'
                                />
                                <NewAssetField value={keywords}
                                               label='Keywords:'
                                               onChange={setKeywords}
                                />
                                <NewAssetField value={quantity}
                                               label='Quantity:'
                                               onChange={setQuantity}
                                               validator={nonEmptyFieldValidator}
                                               helperText='Quantity is a required field'
                                               required
                                               onBlur={() => markFieldTouched('quantity')}
                                               touched={fieldsTouched.quantity}
                                />
                                <NewAssetDocumentSelectField label='Image:'
                                                             value={image}
                                                             onChange={setImage}
                                                             fileType='image'
                                />
                            </div>
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="new-asset--details-section">
                            <p>Product Information</p>
                            <div className="new-asset--details-content">
                                <NewAssetField value={brand}
                                               label='Brand:'
                                               onChange={setBrand}
                                />
                                <NewAssetField value={model}
                                               label='Model:'
                                               onChange={setModel}
                                />
                                <NewAssetField value={part}
                                               label='Part:'
                                               onChange={setPart}
                                />
                                <NewAssetField value={serial}
                                               label='S/N:'
                                               onChange={setSerial}
                                />
                                <NewAssetField value={auInventory}
                                               label='AU Inventory:'
                                               onChange={setAUInventory}
                                />
                            </div>
                        </div>
                    )}

                    {activeStep === 2 && (
                        <div className="new-asset--details-section">
                            <p>Purchase Details</p>
                            <div className="new-asset--details-content">
                                <NewAssetField value={vendor}
                                               label='Vendor:'
                                               onChange={setVendor}
                                />
                                <NewAssetField value={purchaseDate}
                                               label='Purchase Date:'
                                               onChange={setPurchaseDate}
                                               inputType='date'
                                />
                                <NewAssetField value={purchaseAmount}
                                               label='Purchase Amount:'
                                               onChange={setPurchaseAmount}
                                               validator={(value) => Boolean(purchaseAmount) ? currencyValidator(value) : true}
                                               helperText='Value must be formatted as currency'
                                               onBlur={() => markFieldTouched('purchaseAmount')}
                                               touched={fieldsTouched.purchaseAmount}
                                />
                                <NewAssetField value={unitPrice}
                                               label='Unit Price:'
                                               onChange={setUnitPrice}
                                               validator={(value) => Boolean(unitPrice) ? currencyValidator(value) : true}
                                               helperText='Value must be formatted as currency'
                                               onBlur={() => markFieldTouched('unitPrice')}
                                               touched={fieldsTouched.unitPrice}
                                />
                                <NewAssetDocumentSelectField label='Receipt:'
                                                             value={receipt}
                                                             onChange={setReceipt}
                                                             fileType='document'
                                />
                            </div>
                        </div>
                    )}

                    {activeStep === 3 && (
                        <div className="new-asset--details-section">
                            <p>Documents</p>
                            <div className="new-asset--details-content">
                                <NewAssetRecordLocator
                                    recordLocator={recordLocator}
                                    setRecordLocator={setRecordLocator}
                                    autoAssignRecordLocator={autoAssignRecordLocator}
                                    setAutoAssignRecordLocator={setAutoAssignRecordLocator}
                                    touched={fieldsTouched.recordLocator}
                                    onBlur={() => markFieldTouched('recordLocator')}
                                />

                                {!hasValidRecordLocator && (
                                    <div className="record-dependency-notice">
                                        <Alert severity="info" icon={<Info />}>
                                            A record number must be assigned or set to auto-assign before adding manual information
                                        </Alert>
                                    </div>
                                )}

                                <NewAssetSelectField
                                    value={hardCopyAvailable}
                                    label='Physical Manual:'
                                    onChange={setHardCopyAvailable}
                                    options={[{value: 'true', label: 'Available'}, {value: 'false', label: 'Not Available'}]}
                                    disabled={!hasValidRecordLocator}
                                />

                                <NewAssetDocumentSelectField
                                    label='Digital Manual:'
                                    value={softCopyManual}
                                    onChange={setSoftCopyManual}
                                    fileType='document'
                                    disabled={!hasValidRecordLocator}
                                />
                            </div>
                        </div>
                    )}

                    {activeStep === 4 && (
                        <>
                            <div className="new-asset--details-section">
                                <p>Maintenance</p>
                                <div className="new-asset--details-content">
                                    <NewAssetSelectField value={repairStatus}
                                                         label='Repair Status:'
                                                         onChange={(value) => setRepairStatus(value as any)}
                                                         options={[
                                                             {value: 'W', label: 'Working'},
                                                             {value: 'C', label: 'Out for calibration'},
                                                             {value: 'R', label: 'Out for repair'},
                                                             {value: 'T', label: 'Out for testing'},
                                                             {value: 'U', label: 'Unknown'}
                                                         ]}
                                    />
                                    <NewAssetField value={nextCalibrationDate}
                                                   label='Next Calibration:'
                                                   onChange={setNextCalibrationDate}
                                                   inputType='date'
                                    />
                                    <NewAssetField value={maintenanceNotes}
                                                   label='Maintenance Notes:'
                                                   onChange={setMaintenanceNotes}
                                                   multiline
                                                   placeholder='Enter notes...'
                                    />
                                </div>
                            </div>
                            <div className="new-asset--details-section">
                                <p>Notes</p>
                                <div className="new-asset--details-content">
                                    <TextField value={notes}
                                               onChange={(e) => setNotes(e.target.value)}
                                               fullWidth
                                               multiline
                                               minRows={3}
                                               placeholder='Enter notes...' />
                                </div>
                            </div>
                        </>
                    )}
                </Paper>

                {/* Navigation buttons */}
                <Box className="new-asset-navigation">
                    <Button
                        variant="outlined"
                        onClick={handleBack}
                        disabled={activeStep === 0}
                        startIcon={<NavigateBefore />}
                    >
                        Back
                    </Button>

                    {activeStep === steps.length - 1 ? (
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            endIcon={<Save />}
                        >
                            Save Asset
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNext}
                            endIcon={<NavigateNext />}
                        >
                            Next
                        </Button>
                    )}
                </Box>
            </form>
        </Box>
    )
}