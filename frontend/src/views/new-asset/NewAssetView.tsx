import './newAssetView.css'
import {Button, Checkbox, FormControlLabel, TextField, useMediaQuery, useTheme} from "@mui/material";
import NewAssetField from "../../components/new-asset-field/NewAssetField";
import {useState} from "react";
import NewAssetSelectField from "../../components/new-asset-field/NewAssetSelectField";
import {ArrowBack} from "@mui/icons-material";
import {useNavigate} from "react-router";
import NewAssetDocumentSelectField from "../../components/new-asset-field/NewAssetDocumentSelectField";
import {currencyValidator, nonEmptyFieldValidator, recordLocatorValidator} from "../../utils/validators";

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
    
    const theme = useTheme()
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

    return <>
        <Button
            variant="text"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            className="asset-back-button"
            size={isSmallScreen ? 'small' : 'medium'}
        >
            Back
        </Button>
    <h1>New Asset</h1>
        <form>
        <div className="new-asset--details-section">
            <p>Main Details</p>
            <div className="new-asset--details-content">
                <NewAssetField value={name}
                               label='Name:'
                               onChange={setName}
                               validator={nonEmptyFieldValidator}
                               helperText='Name is a required field'
                               required
                />
                <NewAssetField value={location}
                               label='Location:'
                               onChange={setLocation}
                               validator={nonEmptyFieldValidator}
                               helperText='Location is a required field'
                               required
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
                />
                <NewAssetDocumentSelectField label='Image:'
                                             value={image}
                                             onChange={setImage}
                                             fileType='image'
                />
            </div>
        </div>
        <div className="new-asset--details-section">
            <p>Metadata</p>
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
                />
                <NewAssetField value={unitPrice}
                               label='Unit Price:'
                               onChange={setUnitPrice}
                               validator={(value) => Boolean(unitPrice) ? currencyValidator(value) : true}
                               helperText='Value must be formatted as currency'
                />
                <NewAssetDocumentSelectField label='Receipt:'
                                             value={receipt}
                                             onChange={setReceipt}
                                             fileType='document'
                />
            </div>
        </div>
        <div className="new-asset--details-section">
            <p>Documents</p>
            <div className="new-asset--details-content">
                <div className="new-asset--record-locator">
                    <NewAssetField value={recordLocator}
                                   label='Record #:'
                                   onChange={setRecordLocator}
                                   validator={recordLocatorValidator}
                                   helperText='Only numbers allowed'
                                   disabled={autoAssignRecordLocator}
                    />
                    <FormControlLabel control={<Checkbox value={autoAssignRecordLocator} onChange={(e) => setAutoAssignRecordLocator(e.target.checked)} />} label='Auto-assign' />
                </div>
                <NewAssetSelectField value={hardCopyAvailable} label='Physical Manual:' onChange={setHardCopyAvailable} options={[{value: "true", label: 'Available'}, {value: "false", label: 'Not Available'}]} />
                <NewAssetDocumentSelectField label='Digital Manual:'
                                             value={softCopyManual}
                                             onChange={setSoftCopyManual}
                                             fileType='document'
                />
            </div>
        </div>
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
                           placeholder='Enter notes...' />
            </div>
        </div>
        <div className="new-asset--actions">
            <Button type='submit' variant='contained'>Save</Button>
        </div>
        </form>
    </>
}