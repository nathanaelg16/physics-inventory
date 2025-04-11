import { useNavigate, useParams } from "react-router"
import { Button, Skeleton, useMediaQuery, useTheme } from "@mui/material"
import { ArrowBack } from "@mui/icons-material"
import { main } from "../../../wailsjs/go/models"
import Asset = main.Asset
import { useEffect, useState } from "react"
import imageNotAvailable from "../../assets/image_not_available.png"
import { SnackbarAlert } from "../../utils/snackbar-alert"
import {GetAsset, UpdateAsset} from "../../../wailsjs/go/main/App"
import EditableParagraph from "../../components/editable-paragraph/EditableParagraph"
import "./assetView.css"
import AssetField from "../../components/asset-field/AssetField";

export default function AssetView() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [asset, setAsset] = useState<Asset>()
    const [loading, setLoading] = useState<boolean>(true)
    const [alert, showAlert] = useState<SnackbarAlert | null>(null)
    const [edits, setEdits] = useState<any>({})


    const theme = useTheme()
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

    const hasEdits = Object.keys(edits).length > 0
    console.log('hasEdits', hasEdits)

    useEffect(() => {
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
    }, [id])

    const saveChangesToField = (field: string, newValue: string) => {
        if (!asset) return

        let currentValue: any = ""

        switch (field) {
            case 'vendor':
            case 'unitPrice':
                currentValue = asset[field] || ""
                break
            case 'purchaseDate':
                currentValue = asset.purchaseDate.Time || ""
                break
            case 'name':
                currentValue = asset.name.String || ""
                break
            case 'location':
                currentValue = asset.location.String || ""
                break
            case 'keywords':
                currentValue = asset.keywords.String || ""
                break
            case 'brand':
                currentValue = asset.brand.String || ""
                break
            case 'model':
                currentValue = asset.model.String || ""
                break
            case 'part':
                currentValue = asset.part.String || ""
                break
            case 'serial':
                currentValue = asset.serial.String || ""
                break
            case 'auInventory':
                currentValue = asset.auInventory.String || ""
                break
            case 'quantity':
                currentValue = asset.quantity.String || ""
                break
            case 'purchaseAmount':
                currentValue = asset.purchaseAmount.String || ""
                break
            case 'notes':
                currentValue = asset.notes.String || ""
                break
            default:
                currentValue = ""
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

    if (loading) {
        return (
            <div className="asset-view-container">
                <Button
                    variant="text"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    className="asset-back-button"
                    size={isSmallScreen ? "small" : "medium"}
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

    return (
        <div className="asset-view-container">
            <Button
                variant="text"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                className="asset-back-button"
                size={isSmallScreen ? "small" : "medium"}
                sx={{mb: 2}}
            >
                Back
            </Button>

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
                    />

                    <div className="asset--details-sub-group-container">
                        <div className="asset--details-sub-group">
                            <AssetField
                                label="Brand:"
                                fieldName="brand"
                                value={asset.brand.String}
                                onSave={saveChangesToField}
                            />
                            <AssetField
                                label="Model:"
                                fieldName="model"
                                value={asset.model.String}
                                onSave={saveChangesToField}
                            />
                            <AssetField
                                label="Part:"
                                fieldName="part"
                                value={asset.part.String}
                                onSave={saveChangesToField}
                            />
                            <AssetField
                                label="S/N:"
                                fieldName="serial"
                                value={asset.serial.String}
                                onSave={saveChangesToField}
                            />
                        </div>
                        <div className="asset--details-sub-group">
                            <AssetField
                                label="Location:"
                                fieldName="location"
                                value={asset.location.String}
                                onSave={saveChangesToField}
                            />
                            <AssetField
                                label="Keywords:"
                                fieldName="keywords"
                                value={asset.keywords.String}
                                onSave={saveChangesToField}
                            />
                            <AssetField
                                label="AU Inventory:"
                                fieldName="auInventory"
                                value={asset.auInventory.String}
                                onSave={saveChangesToField}
                            />
                            <AssetField
                                label="Quantity:"
                                fieldName="quantity"
                                value={asset.quantity.String}
                                onSave={saveChangesToField}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="asset--details-addl">
                <p>Additional Information</p>
                <div className="asset--details-addl-content">
                    <AssetField
                        label="Vendor:"
                        fieldName="vendor"
                        value={asset.vendor}
                        onSave={saveChangesToField}
                    />
                    <AssetField
                        label="Purchase Date:"
                        fieldName="purchaseDate"
                        value={asset.purchaseDate.Time}
                        onSave={saveChangesToField}
                    />
                    <AssetField
                        label="Purchase Amount:"
                        fieldName="purchaseAmount"
                        value={asset.purchaseAmount.String}
                        onSave={saveChangesToField}
                    />
                    <AssetField
                        label="Unit Price:"
                        fieldName="unitPrice"
                        value={asset.unitPrice}
                        onSave={saveChangesToField}
                    />
                </div>
            </div>

            <div className="asset--details-addl">
                <p>Maintenance</p>
                <div className="asset--details-addl-content">
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No maintenance records found.</p>
                    {/* Maintenance records would go here */}
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
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}