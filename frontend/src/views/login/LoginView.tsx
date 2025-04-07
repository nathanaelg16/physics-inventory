import "./login.css"
import {Alert, Button, Snackbar, Stack, TextField} from "@mui/material";
import {useState} from "react";
import { Login } from "../../../wailsjs/go/main/App"
import {useNavigate} from "react-router";

export default function LoginView() {
    const navigate = useNavigate()
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false)

    const updateUsername = (e: any) => setUsername(e.target.value)
    const updatePassword = (e: any) => setPassword(e.target.value)

    async function login() {
        const success = await Login(username, password)
        if (success) navigate('/search')
        else setShowErrorMessage(true)
    }

    return <div id='login-viewport'>
        <Snackbar anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} open={showErrorMessage} onClose={() => setShowErrorMessage(false)}>
            <Alert severity='error'>Unable to log in with the supplied credentials.</Alert>
        </Snackbar>
        <Stack id='login-form' gap={2}>
            <TextField variant='outlined' placeholder='Username' type='text' size='small' onChange={updateUsername} autoComplete='off' />
            <TextField variant='outlined' placeholder='Password' type='password' size='small' onChange={updatePassword} />
            <Button sx={{backgroundColor: '#0d1321', color: 'white'}} variant='contained' onClick={login}>Login</Button>
        </Stack>
    </div>
}