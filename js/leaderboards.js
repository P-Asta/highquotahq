import { loadNavbar } from './utils.js';
import { handleAuthButtons } from './auth.js';


document.addEventListener('DOMContentLoaded', function() {
    loadNavbar(handleAuthButtons);
});
