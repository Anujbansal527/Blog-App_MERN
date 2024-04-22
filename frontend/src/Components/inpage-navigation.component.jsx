import React, { useEffect, useRef, useState } from "react";


export let activeTabLine;

export let ActiveTab;

const InPageNavigation = ({ routes , defaultHidden = [] , defaultActiveIndex = 0, children }) => {

  let [inPageNavInd, setInPageNavInd] = useState(defaultActiveIndex);

  let [isResize , setIsResize] = useState(false)

  let [width,setWidth] = useState(window.innerWidth)

  activeTabLine = useRef();

  ActiveTab = useRef();

  const PageState = (btn,i) => {
    //console.log(btn,i)
    let { offsetWidth, offsetLeft } = btn;

    activeTabLine.current.style.width = offsetWidth+"px";
    activeTabLine.current.style.left = offsetLeft+"px";
    setInPageNavInd(i);

  }
  useEffect(()=>{
    
    if(width > 766 && inPageNavInd != defaultActiveIndex )
    {
      PageState(ActiveTab.current,defaultActiveIndex)
    }

    if(!isResize){
      window.addEventListener("resize", () =>{
        if(!isResize){
          setIsResize(true)
        }
        setWidth(window.innerWidth)
      })
    }

  },[width])

  return (
    <>
      <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-a-auto">
        {routes.map((route, i) => {
          return (
            <button
              ref={ i == defaultActiveIndex ? ActiveTab : null}
              key={i}
              className={`p-4 px-5 capitalize  ${ inPageNavInd == i ? " text-black " : " text-dark-grey "} ${ defaultHidden.includes(route) ? " md:hidden " : " " }`}
              onClick={(e)=>{PageState(e.target , i)}}
            >
              {route}
            </button>
          );
        })}

        <hr ref={activeTabLine} className="absolute bottom-0  duration-300"/>
        
      </div>

        { 
          Array.isArray(children) ? children[inPageNavInd] : children
        }
     
    </>
  );
};

export default InPageNavigation;
