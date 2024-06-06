import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Eventes } from "../../typs/featuresType";




  
  const initialState: Eventes = {
    features: [],
  };
  export const fetchFature = createAsyncThunk(
    "feature/fetch",
    async (thunkAPI) => {
      const response = await fetch("http://localhost:5000/eventesFeatures", {
        method: "GET",
      });
      const data = response.json();
      return data;
    },
  );
  

  export const FeatureSlice = createSlice({
    name: "feature",
    initialState,
    reducers: {
    //   addPerson: (state, action: PayloadAction<{ name: string }>) => {
    //     state.persons.push({
    //       id: state.persons.length,
    //       name: action.payload.name,
    //     });
    //   },
    },
    extraReducers: (builder) => {
      builder.addCase(fetchFature.fulfilled, (state, action) => {
        state.features = action.payload;
      });
  
    
    },
  });
  
  export default FeatureSlice.reducer;
//   export const { addPerson } = FeatureSlice.actions;


