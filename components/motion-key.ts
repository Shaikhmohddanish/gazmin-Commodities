// Shared by the layout's inline script (a server module) and the motion switch (a client module).
export const MOTION_KEY = "gazmin-motion";
export const motionScript = `try{if(localStorage.getItem("${MOTION_KEY}")==="off")document.documentElement.classList.add("motion-off")}catch(e){}`;
