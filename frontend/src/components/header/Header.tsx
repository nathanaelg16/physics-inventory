import './header.css'

interface Props {
    title: string
}

export default function Header({title}: Props) {
    return <div className="header-card">
        <h1 className="header-card--title">{title}</h1>
    </div>
}