import * as React from 'react';
import {styled} from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from "@mui/material/InputLabel";
import {useEffect} from "react";
import {getAgents, login} from "../api";
import { useNavigate } from "react-router-dom";
import {Button, Input} from "@mui/material";

const Item = styled(Paper)(({theme}) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

const Login = () => {

    const [agents, setAgents] = React.useState([])
    const [agent, setAgent] = React.useState('')
    const [password,setPassword]= React.useState('')
    const [hidden,setHidden]= React.useState(true)

    const navigate = useNavigate();
    const handleChange = (event) => {
        setAgent(event.target.value)
    };

    const handlePswdChange =(e)=>{
        setPassword(e.target.value)
    }
    const  handleSubmit=()=>{
        if(agent ==='' || password===''){
            setHidden(false)
            timeOut()
            return
        }
        login({agent,password}).then(data=>{
            console.log(data)
            if(data ==="error"){
                setHidden(false)
                setPassword('')
                timeOut()
            }else{
                localStorage.setItem("agent",data)
                navigate('/page/agent')
            }
        })
    }
    const timeOut = ()=>{
        setTimeout(()=>{
            setHidden(true)
        },3000)
    }
    useEffect(()=>{
        getAgents().then(data=>{
            setAgents(data)
        })
    })

    return (<div>
        <Box sx={{minWidth: 120, maxWidth: 480}} style={{margin: '200px auto'}}>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <Item>
                        <InputLabel id="username">Select to log in as:</InputLabel>
                        <Select
                            style={{width: "90%"}}
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Select"
                            value={agent}
                            onChange={handleChange}
                        >
                            {agents.map(agent =>{
                                return (<MenuItem
                                    key ={agent.name}
                                    value={agent.name}>
                                    {agent.name}
                                </MenuItem>)
                            })
                            }

                        </Select>
                    </Item>
                <Item>
                    <InputLabel id="password">Password:</InputLabel>
                    <Input type="password" required value={password} onChange={handlePswdChange}></Input>
                </Item>
                    <Item>
                        <Button type='primary'variant="contained" onClick ={handleSubmit}>Submit</Button>
                    </Item>
                    <Item hidden ={hidden}>
                        <p  style={{color:'red'}}>Invalid username or password</p>
                    </Item>
                </Grid>
            </Grid>
        </Box>
    </div>)
}

export default Login;