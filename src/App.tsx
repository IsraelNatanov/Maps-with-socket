import {  useEffect } from 'react'

import './App.css'
import { QueryClientProvider, QueryClient } from 'react-query'

import { fetchFature } from "./store/features/eventFeaturesSlice";
import { useAppDispatch } from "./store/hooks";
import MapContainer from './component/map-cotainer';



function App() {

  const queryClient = new QueryClient()
 
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchFature());
  });
  return (
 

<QueryClientProvider client={queryClient}>
    <MapContainer/>
    </QueryClientProvider>
      
  )
}

export default App
