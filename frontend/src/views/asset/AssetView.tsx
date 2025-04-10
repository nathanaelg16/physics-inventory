import {useNavigate, useParams} from "react-router";
import {Button} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import {main} from "../../../wailsjs/go/models";
import Asset = main.Asset;
import {useEffect, useState} from "react";
import imageNotAvailable from "../../assets/image_not_available.png";
import {SnackbarAlert} from "../../utils/snackbar-alert";
import {GetAsset} from "../../../wailsjs/go/main/App";
import EditableParagraph from "../../components/editable-paragraph/EditableParagraph";
import "./assetView.css"

export default function AssetView() {
    const {id} = useParams()
    const navigate = useNavigate()
    const [asset, setAsset] = useState<Asset>()
    const [alert, showAlert] = useState<SnackbarAlert | null>(null)

    useEffect(() => {
        if (id !== undefined) {
            GetAsset(parseInt(id))
                .then((res) => setAsset(res))
                .catch(() => showAlert({
                    severity: 'error',
                    msg: 'An error occurred fetching asset details.'
                }))
        }
    }, [id])

    const saveChangesToField = (field: string, newValue: string): Promise<void> => {
        // todo save these changes in database
        return Promise.resolve()
    }

    return <>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>Back</Button>
        {asset && <>
            <div className="asset--main-details">
                <div className="asset--image">
                    <img alt={asset.name.String}
                         src={asset.image !== null ? `data:image/unknown;base64,${asset.image}` : imageNotAvailable}
                         width={250}
                         height={250}
                    />
                </div>
                <div className="asset--details">
                    <EditableParagraph text={asset.name.String} onSave={(newText) => saveChangesToField('name', newText)} className='asset--details-name' />
                    <div className="asset--details-sub-group-container">
                        <div className="asset--details-sub-group">
                            <div className="asset--details-field">
                                <p><strong>Brand: </strong></p>
                                <EditableParagraph text={asset.brand.String} onSave={(newText) => saveChangesToField('brand', newText)} />
                            </div>
                            <div className="asset--details-field">
                                <p><strong>Model: </strong></p>
                                <EditableParagraph text={asset.model.String} onSave={(newText) => saveChangesToField('model', newText)} />
                            </div>
                            <div className="asset--details-field">
                                <p><strong>Part: </strong></p>
                                <EditableParagraph text={asset.part.String} onSave={(newText) => saveChangesToField('part', newText)} />
                            </div>
                            <div className="asset--details-field">
                                <p><strong>S/N: </strong></p>
                                <EditableParagraph text={asset.serial.String} onSave={(newText) => saveChangesToField('serial', newText)} />
                            </div>
                        </div>
                        <div className="asset--details-sub-group">
                            <div className="asset--details-field">
                                <p><strong>Location: </strong></p>
                                <EditableParagraph text={asset.location.String} onSave={(newText) => saveChangesToField('location', newText)} />
                            </div>
                            <div className="asset--details-field">
                                <p><strong>Keywords: </strong></p>
                                <EditableParagraph text={asset.keywords.String} onSave={(newText) => saveChangesToField('keywords', newText)} />
                            </div>
                            <div className="asset--details-field">
                                <p><strong>AU Inventory: </strong></p>
                                <EditableParagraph text={asset.auInventory.String} onSave={(newText) => saveChangesToField('auInventory', newText)} />
                            </div>
                            <div className="asset--details-field">
                                <p><strong>Quantity: </strong></p>
                                <EditableParagraph text={asset.quantity.String} onSave={(newText) => saveChangesToField('quantity', newText)} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="asset--details-addl">
                <p>Additional Information</p>
                <div className="asset--details-field">
                    <p><strong>Vendor: </strong></p>
                    <EditableParagraph text={asset.vendor} onSave={(newText) => saveChangesToField('vendor', newText)} />
                </div>
                <div className="asset--details-field">
                    <p><strong>Purchase Date: </strong></p>
                    <EditableParagraph text={asset.purchaseDate.Time} onSave={(newText) => saveChangesToField('purchaseDate', newText)} />
                </div>
                <div className="asset--details-field">
                    <p><strong>Purchase Amount: </strong></p>
                    <EditableParagraph text={asset.purchaseAmount.String} onSave={(newText) => saveChangesToField('purchaseAmount', newText)} />
                </div>
                <div className="asset--details-field">
                    <p><strong>Unit Price: </strong></p>
                    <EditableParagraph text={asset.unitPrice} onSave={(newText) => saveChangesToField('unitPrice', newText)} />
                </div>
            </div>
            <div className="asset--details-addl">
                <p>Maintenance</p>
            </div>
            <div className="asset--details-addl">
                <p>Notes</p>
                <EditableParagraph text={asset.notes.String} onSave={(newText) => saveChangesToField('notes', newText)} multiline />
            </div>
        </>
        }
    </>
}

// todo add record locator, receipt, and manuals, and maintenance