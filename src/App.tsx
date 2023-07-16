import {  useEffect } from 'react'

import './App.css'
import MapContainer from './component/maps/map-cotainer'
import { fetchFature } from "./store/features/eventFeaturesSlice";
import { useAppDispatch } from "./store/hooks";



function App() {


  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchFature());
  });
  return (
   <div>

    
    <MapContainer/>
   </div>
      
  )
}

export default App
