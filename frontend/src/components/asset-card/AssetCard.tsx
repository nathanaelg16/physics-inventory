import {main} from "../../../wailsjs/go/models";
import Asset = main.Asset;
import imageNotAvailable from "../../assets/image_not_available.png"
import "./assetCard.css"

interface Props {
    asset: Asset
}

export default function AssetCard(props: Props) {
    const asset = props.asset

    return (
        <div className='asset-card'>
            <div className="asset-card--main">
                <img
                    className="asset-card--image"
                    alt={asset.name.String}
                    src={imageNotAvailable}
                    height={100}
                />
                <div className="asset-card--details">
                    <p className="asset-card--title">{asset.name.String}</p>

                    {asset.brand.Valid && Boolean(asset.brand.String) && (
                        <p className="asset-card--sub">
                            <strong>Brand:</strong> {asset.brand.String}
                        </p>
                    )}

                    {asset.model.Valid && Boolean(asset.model.String) && (
                        <p className="asset-card--sub">
                            <strong>Model:</strong> {asset.model.String}
                        </p>
                    )}

                    {asset.serial.Valid && Boolean(asset.serial.String) && (
                        <p className="asset-card--sub">
                            <strong>S/N:</strong> {asset.serial.String}
                        </p>
                    )}

                    <div className="asset-card--location-badge">
                        {asset.location.String}
                    </div>
                </div>
            </div>
        </div>
    )
}