import './groups.css'
import {useContext, useEffect, useState} from "react";
import {main} from "../../../wailsjs/go/models";
import {useSessionStorage} from "@uidotdev/usehooks";
import {GetGroupAssets, GetGroups} from "../../../wailsjs/go/main/App";
import {
    Autocomplete,
    Button,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip
} from "@mui/material";
import {Delete, Preview} from "@mui/icons-material";
import {useNavigate} from "react-router";
import {AccessLevel, AuthContext} from "../../utils/auth";
import Group = main.Group;
import GroupAsset = main.GroupAsset;

export default function Groups() {
    const navigate = useNavigate()
    const [groups, setGroups] = useState<Array<Group>>([])
    const [selectedGroupId, setSelectedGroupId] = useSessionStorage<number | null>('selected_group', null)
    const [groupAssets, setGroupAssets] = useState<Array<GroupAsset>>([])

    const authContext = useContext(AuthContext)
    const canEdit = authContext.accessLevel >= AccessLevel.Maintainer

    useEffect(() => {
        GetGroups().then(groups => setGroups(groups))
            .catch((err) => console.error(err)) // todo show snackbar alert error
    }, [])

    useEffect(() => {
        if (selectedGroupId) {
            GetGroupAssets(selectedGroupId)
                .then((group) => setGroupAssets(group))
                .catch((err) => console.error(err)) // todo show snackbar alert error
        } else {
            setGroupAssets([])
        }
    }, [selectedGroupId])

    const autocompleteOptions = groups.map(group => ({
        id: group.id,
        label: group.name,
    }))

    return <div>
        <div className="group-selection">
            <Autocomplete
                renderInput={(params) => <TextField {...params} label='Groups' />}
                options={autocompleteOptions}
                disablePortal
                onChange={(e, value) => {
                    setSelectedGroupId(value ? value.id : null)
                }}
                fullWidth
                value={autocompleteOptions.find(option => option.id === selectedGroupId) || null}
            />
            {canEdit && <>
                <Tooltip title='Create a group'>
                    <Button>New</Button>
                </Tooltip>
            </>}
        </div>
        <div className="group-actions">
            {Boolean(selectedGroupId) && <>
            <Tooltip title='Export to CSV'>
                <Button size='small' variant='outlined'>Export</Button>
            </Tooltip>
            {canEdit && <>
            <Tooltip title='Rename group'>
                <Button size='small' variant='outlined'>Rename</Button>
            </Tooltip>
            <Tooltip title='Delete group'>
                <Button size='small' variant='outlined' color='error'>Delete</Button>
            </Tooltip>
            </>}
            </>}
        </div>
        <TableContainer component={Paper} >
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Asset</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Serial Number</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {groupAssets.map(groupAsset => (
                        <TableRow key={groupAsset.id} hover>
                            <TableCell>{groupAsset.name.String}</TableCell>
                            <TableCell>{groupAsset.location.String}</TableCell>
                            <TableCell>{groupAsset.serial.String}</TableCell>
                            <TableCell>
                                <Tooltip title='View'>
                                    <IconButton onClick={() => navigate(`/asset/${groupAsset.id}`)}><Preview /></IconButton>
                                </Tooltip>
                                {canEdit && <>
                                    <Tooltip title='Delete'>
                                        <IconButton><Delete /></IconButton>
                                    </Tooltip>
                                </>}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </div>
}