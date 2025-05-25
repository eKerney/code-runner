import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { parseLayers } from './functions'
import layerData from './layerData.json'
import RenderLayers from './RenderLayers'

function App() {

  return (
    <>
      <h1>CODE RUNNER</h1>
      <div className="card">
        {<RenderLayers nestedLayers={layerData} />}
      </div>
    </>
  )
}

export default App
// <h2> <code>{results}</code> </h2>
