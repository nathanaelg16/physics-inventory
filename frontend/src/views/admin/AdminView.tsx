import './adminView.css'
import {useState} from 'react'
import UserManagementTable from "../../components/user-management-table/UserManagementTable";
import {Alert, Snackbar} from "@mui/material";
import {SnackbarAlert} from "../../utils/snackbar-alert";
import Header from "../../components/header/Header";

export default function AdminView() {
    const [alert, showAlert] = useState<SnackbarAlert | null>(null)

    return (
        <div className='admin-view'>
            <Header title='Admin Portal' />

            <div className='admin--content-card'>
                <div className='admin--content-card-header'>
                    <h2 className='admin--section-title'>Manage Users</h2>
                </div>
                <div className='admin--content-card-divider'></div>
                <div className='admin--content-card-content'>
                    <UserManagementTable onAlert={showAlert} />
                </div>
            </div>

            {alert && (
                <Snackbar
                    open={!!alert}
                    autoHideDuration={6000}
                    onClose={() => showAlert(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert severity={alert.severity} onClose={() => showAlert(null)}>
                        {alert.msg}
                    </Alert>
                </Snackbar>
            )}
        </div>
    )
}