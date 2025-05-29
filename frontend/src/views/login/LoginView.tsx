import styles from "./login.module.css"
import {Alert, Button, Snackbar, Stack, TextField} from "@mui/material";
import {KeyboardEvent, useContext, useState} from "react";
import {Login} from "../../../wailsjs/go/main/App"
import {useNavigate} from "react-router";
import logo from "../../assets/logo.png";
import {AuthContext} from "../../utils/auth";

export default function LoginView() {
    const navigate = useNavigate()
    const authContext = useContext(AuthContext)

    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [errorMessage, setErrorMessage] = useState<string>('')

    const updateUsername = (e: any) => setUsername(e.target.value)
    const updatePassword = (e: any) => setPassword(e.target.value)

    const enterKeyListener = async (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key == 'Enter') {
            await login()
        }
    }

    async function login() {
        try {
            const accessLevel = await Login(username, password)
            authContext.setAuthenticated(true)
            authContext.setAccessLevel(accessLevel)
            navigate('/search', {replace: true})
        } catch (e: any) {
            setErrorMessage(e)
        }
    }

    return <div className={styles.loginViewport}>
        <Snackbar anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} open={Boolean(errorMessage)} onClose={() => setErrorMessage('')}>
            <Alert severity='error'>{errorMessage}</Alert>
        </Snackbar>
        <Stack className={styles.loginForm} gap={2}>
            <img id='logo' alt='Physics Inventory' src={logo} width={250}/>
            <TextField variant='outlined' placeholder='Username' type='text' size='small' onChange={updateUsername} autoComplete='off' />
            <TextField variant='outlined' placeholder='Password' type='password' size='small' onChange={updatePassword} onKeyUp={enterKeyListener} />
            <Button sx={{backgroundColor: '#cbb677', color: 'white'}} variant='contained' onClick={login}>Login</Button>
        </Stack>
    </div>
}