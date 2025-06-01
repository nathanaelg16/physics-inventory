import styles from './header.module.css'

interface Props {
    title: string
}

export default function Header({title}: Props) {
    return <div className={styles.headerCard}>
        <h1 className={styles.headerCardTitle}>{title}</h1>
    </div>
}