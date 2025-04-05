import {Outlet} from "react-router";
import {List, ListItem, ListItemIcon, ListItemText, SvgIcon, Typography} from "@mui/material";
import "./layout.css"

export default function Layout() {
    return <div id='layout'>
        <List id='nav' component='nav'>
            <ListItem>
                <ListItemIcon>
                    <SvgIcon>
                        <svg fill="#ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>package-variant-closed</title><path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L10.11,5.22L16,8.61L17.96,7.5L12,4.15M6.04,7.5L12,10.85L13.96,9.75L8.08,6.35L6.04,7.5M5,15.91L11,19.29V12.58L5,9.21V15.91M19,15.91V9.21L13,12.58V19.29L19,15.91Z" /></svg>
                    </SvgIcon>
                </ListItemIcon>
                <ListItemText primary='Assets' />
            </ListItem>
            <ListItem>
                <ListItemIcon>
                    <SvgIcon>
                        <svg fill="#ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>select-group</title><path d="M5 3A2 2 0 0 0 3 5H5M7 3V5H9V3M11 3V5H13V3M15 3V5H17V3M19 3V5H21A2 2 0 0 0 19 3M3 7V9H5V7M7 7V11H11V7M13 7V11H17V7M19 7V9H21V7M3 11V13H5V11M19 11V13H21V11M7 13V17H11V13M13 13V17H17V13M3 15V17H5V15M19 15V17H21V15M3 19A2 2 0 0 0 5 21V19M7 19V21H9V19M11 19V21H13V19M15 19V21H17V19M19 19V21A2 2 0 0 0 21 19Z" /></svg>
                    </SvgIcon>
                </ListItemIcon>
                <ListItemText primary='Sets/Groups' />
            </ListItem>
            <ListItem>
                <ListItemIcon>
                    <SvgIcon>
                        <svg fill="#ffffff" width="800px" height="800px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <title>lab</title>
                            <path d="M19.332 19.041c0 0-1.664 2.125-3.79 0-2.062-2-3.562 0-3.562 0l-4.967 9.79c-0.144 0.533 0.173 1.081 0.706 1.224h16.497c0.533-0.143 0.85-0.69 0.707-1.224l-5.591-9.79zM26.939 28.33l-7.979-13.428v-0.025l-0.014-7.869h0.551c0.826 0 1.498-0.671 1.498-1.499 0-0.827-0.672-1.498-1.498-1.498h-7.995c-0.827 0-1.498 0.671-1.498 1.498 0 0.828 0.671 1.499 1.498 1.499h0.482l-0.016 7.871-6.908 13.451c-0.428 1.599 0.521 3.242 2.119 3.67h17.641c1.6-0.428 2.549-2.071 2.119-3.67zM24.553 30.998l-17.108-0.019c-1.065-0.286-1.697-1.382-1.412-2.446l6.947-13.616 0.021-8.908h-1.498c-0.275 0-0.499-0.224-0.499-0.5s0.224-0.499 0.499-0.499h7.995c0.275 0 0.498 0.224 0.498 0.499 0 0.276-0.223 0.5-0.498 0.5h-1.498l0.025 8.875 7.939 13.666c0.286 1.067-0.347 2.163-1.411 2.448zM16.48 2.512c0 0.552 0.448 1 1 1s1-0.448 1-1-0.447-1-1-1-1 0.447-1 1zM17.48 0.012c0.828 0 1.5-0.671 1.5-1.5s-0.672-1.5-1.5-1.5-1.5 0.671-1.5 1.5 0.672 1.5 1.5 1.5zM13.48 2.512c0.553 0 1-0.448 1-1s-0.447-1-1-1-1 0.448-1 1 0.447 1 1 1z"></path>
                        </svg>
                    </SvgIcon>
                </ListItemIcon>
                <ListItemText primary='Labs' />
            </ListItem>
        </List>
        <main>
            <Outlet />
        </main>
    </div>
}