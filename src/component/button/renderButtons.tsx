import React from 'react'
import {ButtonsDataType} from '../../typs/buttonsDataType'
import { Button } from '@mui/material'
import { styleButton } from '../../style/styleFunction'
interface RenderButtonsType{
    buttonsData:ButtonsDataType[]
}
const RenderButtons: React.FC<RenderButtonsType> = ({buttonsData }:RenderButtonsType) => {
    
  return (
    <>
    {Object.values(buttonsData).map((button:ButtonsDataType) => (
      <Button key={button.id} style={styleButton} variant="text" onClick={button.onClick}>
        {button.text}
        {button.icon}
      </Button>
    ))}
  </>
  )
}
export default RenderButtons