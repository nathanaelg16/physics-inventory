import styles from "./login.module.css"
import {
    Alert,
    Button,
    CircularProgress,
    FormControl,
    InputLabel, MenuItem,
    Select,
    Snackbar,
    Stack,
    TextField
} from "@mui/material"
import {KeyboardEvent, useContext, useState} from "react"
import {Login} from "../../../wailsjs/go/main/App"
import {useNavigate} from "react-router"
import logo from "../../assets/logo.png"
import {AuthContext} from "../../utils/auth"

type TLSOption = "true" | "false" | "preferred"

export default function LoginView() {
    const navigate = useNavigate()
    const authContext = useContext(AuthContext)

    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [tlsOption, setTlsOption] = useState<TLSOption>("true")

    const updateUsername = (e: any) => setUsername(e.target.value)
    const updatePassword = (e: any) => setPassword(e.target.value)

    const enterKeyListener = async (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key == 'Enter' && !isLoading) {
            await login()
        }
    }

    async function login() {
        if (isLoading) return

        setIsLoading(true)
        setErrorMessage('')

        try {
            const accessLevel = await Login(username, password, tlsOption)
            authContext.setAuthenticated(true)
            authContext.setAccessLevel(accessLevel)
            navigate('/search', {replace: true})
        } catch (e: any) {
            setErrorMessage(e)
        } finally {
            setIsLoading(false)
        }
    }

    return <div className={styles.loginViewport}>
        <Snackbar anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} open={Boolean(errorMessage)} onClose={() => setErrorMessage('')}>
            <Alert severity='error'>{errorMessage}</Alert>
        </Snackbar>
        <Stack className={styles.loginForm} gap={2}>
            <img id='logo' alt='Physics Inventory' src={logo} width={250}/>
            <TextField
                variant='outlined'
                placeholder='Username'
                type='text'
                size='small'
                onChange={updateUsername}
                autoComplete='off'
                disabled={isLoading}
            />
            <TextField
                variant='outlined'
                placeholder='Password'
                type='password'
                size='small'
                onChange={updatePassword}
                onKeyUp={enterKeyListener}
                disabled={isLoading}
            />
            <FormControl>
                <InputLabel id='tlsOptionInputLabel'>TLS Option</InputLabel>
                <Select labelId='tlsOptionInputLabel'
                        variant='outlined'
                        value={tlsOption}
                        label='TLS Option'
                        onChange={(e) => setTlsOption(e.target.value as TLSOption)}
                >
                    <MenuItem value="true">TLS Active</MenuItem>
                    <MenuItem value="preferred">TLS Preferred</MenuItem>
                    <MenuItem value="false">No TLS</MenuItem>
                </Select>
            </FormControl>
            <Button
                sx={{backgroundColor: '#cbb677', color: 'white'}}
                variant='contained'
                onClick={login}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color='inherit' /> : null}
            >
                {isLoading ? 'Logging in...' : 'Login'}
            </Button>
        </Stack>
    </div>
}