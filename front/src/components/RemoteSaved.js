import * as React from 'react';

const style={color:"white"}
const RemoteSaved =()=>{
    return (<div ><div style={{height:"300px", width:"400px", top:"30%", marginLeft:"40%", position:'fixed',borderRadius:"10px"}}  >
        <h2 style={style}>&#9989; Remote saved successfully!</h2>
        <h3 style={style}>Our agent will send you a confirmation email once the remote is added to our schedule.</h3>
        <h3 style={style}>If you have any questions, please reply to the open email ticket and we will get back to you asap!</h3>
        <h3 style={style}>Thank you!</h3>
    </div>
    </div>)
}

export default RemoteSaved;