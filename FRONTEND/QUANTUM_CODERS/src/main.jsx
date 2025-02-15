import './index.css'
import { RouterProvider } from 'react-router-dom'
import ReactDOM from "react-dom/client"
import React from "react"
import { Provider } from 'react-redux'
import router from "./Router"
import { store } from './store'

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);