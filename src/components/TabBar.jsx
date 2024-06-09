import React, {useState} from "react";
import { NavLink } from "react-router-dom";
import {FaBeer, FaBars } from "react-icons/fa"
import './styles-tabbar.css'

const TabBar = ({children}) =>{

    const menuItem =[
        {
            path:"/levels",
            name:"Level",
            icon:<FaBeer />
        },
    ]
    
    return (
        <div className="tab-container">
            
            <div className="tabbar">
                <div className="top_section">
                    <div className="logo">Admin</div>
                    
                </div>

                <div className="tabbar-items">
                    {menuItem.map((item, index) =>(
                        <NavLink to={item.path} key={index} className="link" activeClassName ="active">
                            
                            <div className="link_text">{item.name}</div>
                        </NavLink>
                    ))}
                </div>
            </div>
            {children}
        </div>
    );
};

export default TabBar;