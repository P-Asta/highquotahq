import { loadNavbar } from './utils.js';
import { handleAuthButtons } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    loadNavbar(handleAuthButtons);
});

const pageBtns = document.querySelectorAll('.rules-section-button');
const rulePages = document.querySelectorAll('.rules-page');

pageBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        pageBtns.forEach(button => button.classList.remove('active'));
        btn.classList.add('active');
        rulePages.forEach(page => {
            if (!page.classList.contains('hidden')){
                page.classList.add('hidden');
            }
            if (page.id === btn.getAttribute('rules')){
                page.classList.remove('hidden');
            }
        })
    })
})