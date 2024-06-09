import React, { useEffect, useState } from "react";
import { readDataToRealTimeDB } from "../../untils/DataHelper";

const LesonsComponet = () =>{
    const [data, setData] = useState(null);
    useEffect(() => {
        readDataToRealTimeDB('Lessons', setData);
    })
    
}