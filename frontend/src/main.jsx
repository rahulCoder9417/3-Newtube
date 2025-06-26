// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';  // Note the import change
import App from './App';
import { Provider } from 'react-redux';
import { store } from './store/store.js'; // Path to your store file
import "./index.css"
// Create a root element and render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
