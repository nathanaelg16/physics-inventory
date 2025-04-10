import {main} from "../../../wailsjs/go/models"
import Asset = main.Asset
import imageNotAvailable from "../../assets/image_not_available.png"
import {useNavigate} from "react-router"
import "./assetCard.css"

interface Props {
    asset: Asset
}

export default function AssetCard(props: Props) {
    const asset = props.asset
    const navigate = useNavigate()

    const handleClick = () => navigate(`/asset/${asset.id}`)

    // Helper function to truncate text if needed for small screens
    const truncateText = (text: string, maxLength: number) => {
        if (!text) return ''
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    }

    return (
        <div className='asset-card' onClick={handleClick}>
            <div className="asset-card--main">
                <img
                    className="asset-card--image"
                    alt={asset.name.String}
                    src={asset.image !== null ? `data:image/unknown;base64,${asset.image}` : imageNotAvailable}
                    height={100}
                    width={100}
                />
                <div className="asset-card--details">
                    <p className="asset-card--title">{truncateText(asset.name.String, 40)}</p>

                    {asset.brand.Valid && Boolean(asset.brand.String) && (
                        <p className="asset-card--sub">
                            <strong>Brand:</strong> {truncateText(asset.brand.String, 30)}
                        </p>
                    )}

                    {asset.model.Valid && Boolean(asset.model.String) && (
                        <p className="asset-card--sub">
                            <strong>Model:</strong> {truncateText(asset.model.String, 30)}
                        </p>
                    )}

                    {asset.serial.Valid && Boolean(asset.serial.String) && (
                        <p className="asset-card--sub">
                            <strong>S/N:</strong> {truncateText(asset.serial.String, 20)}
                        </p>
                    )}

                    <div className="asset-card--location-badge">
                        {truncateText(asset.location.String, 25)}
                    </div>
                </div>
            </div>
        </div>
    )
}