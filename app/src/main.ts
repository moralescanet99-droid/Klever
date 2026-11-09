import './estilos/nacar.css';
import { mount } from 'svelte';
import App from './App.svelte';
import { aplicarTema } from './lib/estado/tema';
aplicarTema();
export default mount(App, { target: document.getElementById('app')! });
