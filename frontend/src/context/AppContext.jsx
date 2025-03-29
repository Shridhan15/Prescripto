import { createContext } from "react";
import { doctors } from "../assets/assets";

export const AppContext=createContext();

const AppContextProvider=(props)=>{

    const currenySymbol='$';
    const value={
        doctors,
        currenySymbol
    }
    return(
        // means all the child componentes wrapped inside AppContextProvider will be able to access the context data
        <AppContext.Provider value={value}>
            { props.children }
        </AppContext.Provider>
    )
}
export default AppContextProvider