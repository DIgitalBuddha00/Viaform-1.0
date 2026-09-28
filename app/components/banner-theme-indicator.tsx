"use client";
import {useEffect,useState} from "react";
const names:Record<string,string>={preparation:"Preparation",determination:"Determination",focus:"Focus",growth:"Growth",connection:"Connection",reflection:"Reflection"};
export function BannerThemeIndicator(){const [theme,setTheme]=useState("preparation");useEffect(()=>{setTheme(document.documentElement.dataset.theme||"preparation")},[]);return <a href="/appearance" className="app-banner-theme" title="Change your Viaform theme">{names[theme]??"Preparation"}</a>}