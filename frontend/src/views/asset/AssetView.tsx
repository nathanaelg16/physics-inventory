import { useNavigate, useParams } from "react-router";
import { Button, Skeleton, useMediaQuery, useTheme } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { main } from "../../../wailsjs/go/models";
import Asset = main.Asset;
import { useEffect, useState } from "react";
import imageNotAvailable from "../../assets/image_not_available.png";
import { SnackbarAlert } from "../../utils/snackbar-alert";
import { GetAsset } from "../../../wailsjs/go/main/App";
import EditableParagraph from "../../components/editable-paragraph/EditableParagraph";
import "./assetView.css";

// Helper component for field display
const AssetField = ({
                        label,
                        fieldName,
                        value,
                        onSave,
                        multiline = false,
                        placeholder = 'N/A'
                    }: {
    label: string;
    fieldName: string;
    value: string;
    onSave: (field: string, value: string) => Promise<void>;
    multiline?: boolean;
    placeholder?: string;
}) => (
    <div className="asset--details-field">
        <p><strong>{label}</strong></p>
        <EditableParagraph
            text={value}
            onSave={(newText) => onSave(fieldName, newText)}
            multiline={multiline}
            placeholder={placeholder}
        />
    </div>
);

export default function AssetView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [asset, setAsset] = useState<Asset>();
    const [loading, setLoading] = useState(true);
    const [alert, showAlert] = useState<SnackbarAlert | null>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isExtraSmall = useMediaQuery('(max-width:480px)');

    useEffect(() => {
        if (id !== undefined) {
            setLoading(true);
            GetAsset(parseInt(id))
                .then((res) => {
                    setAsset(res);
                    setLoading(false);
                })
                .catch(() => {
                    showAlert({
                        severity: 'error',
                        msg: 'An error occurred fetching asset details.'
                    });
                    setLoading(false);
                });
        }
    }, [id]);

    const saveChangesToField = (field: string, newValue: string): Promise<void> => {
        // todo save these changes in database
        return Promise.resolve();
    };

    if (loading) {
        return (
            <div className="asset-view-container">
                <Button
                    variant="text"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    className="asset-back-button"
                    size={isMobile ? "small" : "medium"}
                >
                    Back
                </Button>
                <Skeleton variant="rectangular" height={isMobile ? 300 : 400} />
            </div>
        );
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
        );
    }

    return (
        <div className="asset-view-container">
            <Button
                variant="text"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                className="asset-back-button"
                size={isMobile ? "small" : "medium"}
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

                    {/* Location information is included in the form fields section for all screen sizes */}

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
    );
}