import * as React from "react";
import { useGlobalContext } from 'global/GlobalProvider'

interface IHealth {
}

const Health: React.FC<IHealth> = (props: IHealth) => {
  const { health } = useGlobalContext();
  React.useEffect(()=> {
    health()
  }, [health])
  
  return (
    <div>
      Test Page
    </div>
  )
}

export default Health;
