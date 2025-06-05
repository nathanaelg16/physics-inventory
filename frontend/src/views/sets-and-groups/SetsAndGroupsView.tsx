import './setsAndGroupsView.css'
import Header from "../../components/header/Header";
import {Tab, Tabs} from "@mui/material";
import {SyntheticEvent} from "react";
import {useSessionStorage} from "@uidotdev/usehooks";
import Groups from '../../components/groups/Groups';
import Sets from "../../components/sets/Sets";

export enum CollectionsTabIndex {
    Sets = 0,
    Groups = 1,
}

export default function SetsAndGroupsView() {
    const [tabIndex, setTabIndex] = useSessionStorage<CollectionsTabIndex>('sets_groups_tab_index', CollectionsTabIndex.Sets)

    const handleChange = (event: SyntheticEvent, newValue: number) => {
        const newTabIndex: CollectionsTabIndex = newValue as CollectionsTabIndex
        setTabIndex(newTabIndex)
    }

    const navigateToGroup = (groupId: number) => {
        sessionStorage.setItem('selected_group', String(groupId))
        setTabIndex(CollectionsTabIndex.Groups)
    }

    return <div className='sets-and-groups-view'>
        <Header title='Sets and Groups' />

        <div className='sets-and-groups-container'>
            <Tabs value={tabIndex} onChange={handleChange} centered sx={{mb: 2}}>
                <Tab label='Sets' />
                <Tab label='Groups' />
            </Tabs>
            { tabIndex === CollectionsTabIndex.Sets && <Sets onNavigateToGroup={navigateToGroup} /> }
            { tabIndex === CollectionsTabIndex.Groups && <Groups /> }
        </div>

    </div>
}