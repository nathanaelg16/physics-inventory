import './userManagementTable.css'
import {ChangeEvent, useEffect, useMemo, useState} from 'react'
import {AccessLevel} from '../../utils/auth'
import {
    FormControl,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Tooltip
} from '@mui/material'
import {
    AdminPanelSettings as AdminIcon,
    Build as BuildIcon,
    Delete as DeleteIcon,
    PersonOutline as PersonOutlineIcon,
    Search as SearchIcon
} from '@mui/icons-material'
import {DeleteUser, GetUsers, UpdateUserAccessLevel} from "../../../wailsjs/go/main/App"
import {main} from "../../../wailsjs/go/models"
import {SnackbarAlert} from "../../utils/snackbar-alert"
import SearchInput from "../search-input/SearchInput";
import User = main.User;

interface Props {
    onAlert: (alert: SnackbarAlert) => void
}

const getAccessLevelIcon = (level: AccessLevel) => {
    switch(level) {
        case AccessLevel.Viewer:
            return <PersonOutlineIcon fontSize='small' />
        case AccessLevel.Maintainer:
            return <BuildIcon fontSize='small' />
        case AccessLevel.Administrator:
            return <AdminIcon fontSize='small' />
        default:
            return <PersonOutlineIcon fontSize='small' />
    }
}

export default function UserManagementTable({onAlert}: Props) {
    const [users, setUsers] = useState<User[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)

    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)

    useEffect(() => {
        getUsers()
    }, [])

    const getUsers = async () => {
        try {
            const users = await GetUsers()
            setUsers(users)
        } catch (e) {
            onAlert({
                severity: 'error',
                msg: `${e}`
            })
            setUsers([])
        }
    }

    const handleAccessLevelChange = async (username: string, newLevel: AccessLevel) => {
        // First update the local state
        const updatedUsers = users.map(user =>
            user.username === username
                ? { ...user, accessLevel: newLevel }
                : user
        )
        setUsers(updatedUsers)

        // Then update in the backend
        const userToUpdate = updatedUsers.find(user => user.username === username)
        if (userToUpdate) {
            setIsUpdating(true)
            try {
                await UpdateUserAccessLevel(userToUpdate)
                onAlert({
                    severity: 'success',
                    msg: `Access level for ${username} updated successfully`
                })
            } catch (e) {
                onAlert({
                    severity: 'error',
                    msg: `${e}`
                })
                getUsers()
            } finally {
                setIsUpdating(false)
            }
        }
    }

    const handleDeleteUser = (username: string) => {
        DeleteUser(username)
            .catch((e) => {
                onAlert({
                    severity: 'error',
                    msg: e
                })
            }).finally(() => getUsers())
    }

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
        setPage(0) // Reset to first page when search changes
    }

    // Filter users based on search query
    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [users, searchQuery])

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    // Calculate the slice of data to display
    const currentItems = filteredUsers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    )

    return (
        <div className='user-management'>
            <div className='um-search-bar-container'>
                <SearchInput placeholder='Search by username...' value={searchQuery} onChange={handleSearchChange} />
            </div>

            <TableContainer component={Paper} className='um-table-container'>
                <Table size='small'>
                    <TableHead>
                        <TableRow>
                            <TableCell className='um-table-header'>User</TableCell>
                            <TableCell className='um-table-header'>Access Level</TableCell>
                            <TableCell align='right' className='um-table-header'>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {currentItems.length > 0 ? (
                            currentItems.map(user => (
                                <TableRow key={user.username} className='um-table-row'>
                                    <TableCell>
                                        <div className='um-user-cell'>
                                            <div className='um-username'>{user.username}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <FormControl fullWidth size='small'>
                                            <Select
                                                value={user.accessLevel}
                                                onChange={(e) => handleAccessLevelChange(
                                                    user.username,
                                                    e.target.value as AccessLevel
                                                )}
                                                disabled={isUpdating}
                                                className={`um-access-level-select um-access-level-${AccessLevel[user.accessLevel].toLowerCase()}`}
                                                renderValue={(selected) => (
                                                    <div className={`um-access-level-chip um-access-level-${AccessLevel[selected].toLowerCase()}`}>
                                                        {getAccessLevelIcon(selected)}
                                                        <span>{AccessLevel[selected]}</span>
                                                    </div>
                                                )}
                                            >
                                                <MenuItem value={AccessLevel.Viewer}>
                                                    <div className='um-menu-item'>
                                                        <PersonOutlineIcon fontSize='small' />
                                                        <span>Viewer</span>
                                                    </div>
                                                </MenuItem>
                                                <MenuItem value={AccessLevel.Maintainer}>
                                                    <div className='um-menu-item'>
                                                        <BuildIcon fontSize='small' />
                                                        <span>Maintainer</span>
                                                    </div>
                                                </MenuItem>
                                                <MenuItem value={AccessLevel.Administrator}>
                                                    <div className='um-menu-item'>
                                                        <AdminIcon fontSize='small' />
                                                        <span>Administrator</span>
                                                    </div>
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                    <TableCell align='right'>
                                        <Tooltip title='Delete user'>
                                            <IconButton
                                                onClick={() => handleDeleteUser(user.username)}
                                                size='small'
                                                className='um-delete-button'
                                            >
                                                <DeleteIcon fontSize='small' />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} align='center'>
                                    <div className='um-no-results'>
                                        <SearchIcon className='um-no-results-icon' />
                                        <div className='um-no-results-text'>
                                            No users found matching your search.
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <div className='um-table-footer'>
                <TablePagination
                    component='div'
                    count={filteredUsers.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage='Rows:'
                    className='um-pagination'
                />
            </div>
        </div>
    )
}