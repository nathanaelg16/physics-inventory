import "./login.css"
import {Button, Stack, TextField, Typography} from "@mui/material";
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
        else alert('Unable to log in with the supplied credentials.')
    }

    return <div id='login-viewport'>
        <Stack id='login-form' gap={2}>
            <TextField variant='outlined' placeholder='Username' type='text' size='small' onChange={updateUsername} />
            <TextField variant='outlined' placeholder='Password' type='password' size='small' onChange={updatePassword} />
            <Button sx={{backgroundColor: '#CBB677'}} variant='contained' onClick={login}>Login</Button>
        </Stack>
        <Typography color='error'>{showErrorMessage && 'Unable to log in with the supplied credentials.'}</Typography>
    </div>
}