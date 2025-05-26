import './setsAndGroupsView.css'
import Header from "../../components/header/Header";
import {Tab, Tabs} from "@mui/material";
import {SyntheticEvent} from "react";
import {useSessionStorage} from "@uidotdev/usehooks";
import Groups from '../../components/groups/Groups';
import Sets from "../../components/sets/Sets";

enum TabIndex {
    Sets = 0,
    Groups = 1,
}

export default function SetsAndGroupsView() {
    const [tabIndex, setTabIndex] = useSessionStorage<TabIndex>('sets_groups_tab_index', TabIndex.Sets)

    const handleChange = (event: SyntheticEvent, newValue: number) => {
        const newTabIndex: TabIndex = newValue as TabIndex
        setTabIndex(newTabIndex)
    }

    return <div className='sets-and-groups-view'>
        <Header title='Sets and Groups' />

        <div className='sets-and-groups-container'>
            <Tabs value={tabIndex} onChange={handleChange} centered sx={{mb: 2}}>
                <Tab label='Sets' />
                <Tab label='Groups' />
            </Tabs>
            { tabIndex === TabIndex.Sets && <Sets /> }
            { tabIndex === TabIndex.Groups && <Groups /> }
        </div>

    </div>
}