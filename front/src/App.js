import * as React from 'react';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import Client from "./components/Client";
import Agent from "./components/Agent";
import Login from "./components/Login";
import NoPage from "./components/NoPage";
import RemoteSaved from "./components/RemoteSaved";


function App() {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <BrowserRouter>
                <Routes>
                    <Route path="/client/*" element={<Client/>}/>
                    <Route path="/page/agent" element={< Agent/>}/>
                    <Route path="/page/login" element={<Login/>}/>
                    <Route path={"/page/remoteSaved"} element={<RemoteSaved/>}/>
                    <Route path="/page/*" element={<NoPage/>}/>
                    <Route path="/*" element={<NoPage/>}/>
                    <Route path="*" element={<NoPage/>}/>
                </Routes>
            </BrowserRouter>
        </LocalizationProvider>
    )
}

export default App;
