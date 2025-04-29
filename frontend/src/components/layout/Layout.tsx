import {Outlet, useNavigate} from 'react-router'
import {List, ListItem, ListItemIcon, ListItemText, SvgIcon} from '@mui/material'
import {useEffect, useState} from 'react'
import logo from '../../assets/logo-no-text.png'
import {GetProductVersion} from "../../../wailsjs/go/main/App"
import {AccessLevel, AuthContext} from '../../utils/auth'
import {useSessionStorage} from "@uidotdev/usehooks";
import './layout.css'

export default function Layout() {
    const navigate = useNavigate()
    const [expanded, setExpanded] = useState(true)
    const [productVersion, setProductVersion] = useState<string | null>(null)

    const [isAuthenticated, setAuthenticated] = useSessionStorage('authenticated',false)
    const [accessLevel, setAccessLevel] = useSessionStorage<AccessLevel>('accessLevel', AccessLevel.Viewer)

    // Get product version
    useEffect(() => {
        GetProductVersion()
            .then((res) => setProductVersion(res))
            .catch(() => {})
    }, [])

    // Check screen size on initial load and resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setExpanded(false)
            } else {
                setExpanded(true)
            }
        }

        // Set initial state
        handleResize()

        // Add event listener
        window.addEventListener('resize', handleResize)

        // Clean up
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    const toggleNav = () => {
        setExpanded(!expanded)
    }

    const navigateTo = (path: string) => {
        if (isAuthenticated) {
            navigate(path)
        }
    }

    return (
        <div id='layout'>
            <div id='nav' className={expanded ? 'expanded' : ''}>
                <div id='nav-header'>
                    <img alt='Physics Inventory' src={logo} width={100} />
                </div>
                <button
                    id='nav-toggle'
                    onClick={toggleNav}
                    aria-label={expanded ? 'Collapse menu' : 'Expand menu'}
                >
                    {expanded ? '◀' : '▶'}
                </button>
                <List id='nav-list' component='nav'>
                    <ListItem onClick={() => navigateTo('/search')}>
                        <ListItemIcon>
                            <SvgIcon>
                                <svg fill='#ffffff' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><title>package-variant-closed</title><path d='M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L10.11,5.22L16,8.61L17.96,7.5L12,4.15M6.04,7.5L12,10.85L13.96,9.75L8.08,6.35L6.04,7.5M5,15.91L11,19.29V12.58L5,9.21V15.91M19,15.91V9.21L13,12.58V19.29L19,15.91Z' /></svg>
                            </SvgIcon>
                        </ListItemIcon>
                        <ListItemText primary='Assets' />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <SvgIcon>
                                <svg fill='#ffffff' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><title>select-group</title><path d='M5 3A2 2 0 0 0 3 5H5M7 3V5H9V3M11 3V5H13V3M15 3V5H17V3M19 3V5H21A2 2 0 0 0 19 3M3 7V9H5V7M7 7V11H11V7M13 7V11H17V7M19 7V9H21V7M3 11V13H5V11M19 11V13H21V11M7 13V17H11V13M13 13V17H17V13M3 15V17H5V15M19 15V17H21V15M3 19A2 2 0 0 0 5 21V19M7 19V21H9V19M11 19V21H13V19M15 19V21H17V19M19 19V21A2 2 0 0 0 21 19Z' /></svg>
                            </SvgIcon>
                        </ListItemIcon>
                        <ListItemText primary='Sets/Groups' />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <SvgIcon>
                                <svg fill='#ffffff' width='800px' height='800px' viewBox='0 0 32 32' version='1.1' xmlns='http://www.w3.org/2000/svg'>
                                    <title>lab</title>
                                    <path d='M19.332 19.041c0 0-1.664 2.125-3.79 0-2.062-2-3.562 0-3.562 0l-4.967 9.79c-0.144 0.533 0.173 1.081 0.706 1.224h16.497c0.533-0.143 0.85-0.69 0.707-1.224l-5.591-9.79zM26.939 28.33l-7.979-13.428v-0.025l-0.014-7.869h0.551c0.826 0 1.498-0.671 1.498-1.499 0-0.827-0.672-1.498-1.498-1.498h-7.995c-0.827 0-1.498 0.671-1.498 1.498 0 0.828 0.671 1.499 1.498 1.499h0.482l-0.016 7.871-6.908 13.451c-0.428 1.599 0.521 3.242 2.119 3.67h17.641c1.6-0.428 2.549-2.071 2.119-3.67zM24.553 30.998l-17.108-0.019c-1.065-0.286-1.697-1.382-1.412-2.446l6.947-13.616 0.021-8.908h-1.498c-0.275 0-0.499-0.224-0.499-0.5s0.224-0.499 0.499-0.499h7.995c0.275 0 0.498 0.224 0.498 0.499 0 0.276-0.223 0.5-0.498 0.5h-1.498l0.025 8.875 7.939 13.666c0.286 1.067-0.347 2.163-1.411 2.448zM16.48 2.512c0 0.552 0.448 1 1 1s1-0.448 1-1-0.447-1-1-1-1 0.447-1 1zM17.48 0.012c0.828 0 1.5-0.671 1.5-1.5s-0.672-1.5-1.5-1.5-1.5 0.671-1.5 1.5 0.672 1.5 1.5 1.5zM13.48 2.512c0.553 0 1-0.448 1-1s-0.447-1-1-1-1 0.448-1 1 0.447 1 1 1z'></path>
                                </svg>
                            </SvgIcon>
                        </ListItemIcon>
                        <ListItemText primary='Labs' />
                    </ListItem>
                    {accessLevel === AccessLevel.Administrator
                        && <ListItem onClick={() => navigateTo('/admin')}>
                        <ListItemIcon>
                            <SvgIcon>
                                <svg fill='#ffffff' width='800px' height='800px' viewBox='0 0 1920 1920' xmlns='http://www.w3.org/2000/svg'>
                                    <title>admin</title>
                                    <path d='M983.727 5.421 1723.04 353.62c19.765 9.374 32.414 29.252 32.414 51.162v601.525c0 489.6-424.207 719.774-733.779 887.943l-34.899 18.975c-8.47 4.517-17.731 6.889-27.105 6.889-9.262 0-18.523-2.372-26.993-6.89l-34.9-18.974C588.095 1726.08 164 1495.906 164 1006.306V404.78c0-21.91 12.65-41.788 32.414-51.162L935.727 5.42c15.134-7.228 32.866-7.228 48 0ZM757.088 383.322c-176.075 0-319.285 143.323-319.285 319.398 0 176.075 143.21 319.285 319.285 319.285 1.92 0 3.84 0 5.76-.113l58.504 58.503h83.689v116.781h116.781v83.803l91.595 91.482h313.412V1059.05l-350.57-350.682c.114-1.807.114-3.727.114-5.647 0-176.075-143.21-319.398-319.285-319.398Zm0 112.942c113.732 0 206.344 92.724 205.327 216.62l-3.953 37.271 355.426 355.652v153.713h-153.713l-25.412-25.299v-149.986h-116.78v-116.78H868.108l-63.812-63.7-47.209 5.309c-113.732 0-206.344-92.5-206.344-206.344 0-113.732 92.612-206.456 206.344-206.456Zm4.98 124.98c-46.757 0-84.705 37.948-84.705 84.706s37.948 84.706 84.706 84.706c46.757 0 84.706-37.948 84.706-84.706s-37.949-84.706-84.706-84.706Z' fillRule='evenodd'/>
                                </svg>
                            </SvgIcon>
                        </ListItemIcon>
                        <ListItemText primary='Admin' />
                    </ListItem> }
                </List>

                {/* Version label */}
                <div id='nav-version'>
                    {productVersion && <span>v{productVersion}</span>}
                </div>
            </div>
            <main>
                <AuthContext.Provider value={{isAuthenticated, setAuthenticated, accessLevel, setAccessLevel}}>
                    <Outlet />
                </AuthContext.Provider>
            </main>
        </div>
    )
}