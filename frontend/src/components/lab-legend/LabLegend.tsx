import {Recycling} from '@mui/icons-material'
import styles from './labLegend.module.css'

export default function LabLegend() {
    return (
        <div className={styles.legend}>
            <h4 className={styles.legendTitle}>Legend</h4>
            <div className={styles.legendItems}>
                <div className={styles.legendItem}>
                    <span className={`${styles.legendMarker} ${styles.assetMarker}`}>•</span>
                    <span>Asset</span>
                </div>
                <div className={styles.legendItem}>
                    <span className={`${styles.legendMarker} ${styles.groupMarker}`}>•</span>
                    <span>Group</span>
                </div>
                <div className={styles.legendItem}>
                    <span className={`${styles.legendMarker} ${styles.setMarker}`}>•</span>
                    <span>Set</span>
                </div>
                <div className={styles.legendItem}>
                    <Recycling className={styles.consumableIcon} fontSize='small' />
                    <span>Consumable</span>
                </div>
            </div>
        </div>
    )
}