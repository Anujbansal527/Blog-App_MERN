

//creating sesson storing data 
export const storeInSession = (key,value) => {
    return sessionStorage.setItem(key,value)
}

//fetching data from session
export const lookInSession = (key) => {
    return sessionStorage.getItem(key);
}

//removing data from sessionstorage 
export const removeSession = (key) => {
    return sessionStorage.removeItem(key);
}

//sessioon for logout user 
export const logOutUser = () => {
    sessionStorage.clear();
}
