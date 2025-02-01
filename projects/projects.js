import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects')
renderProjects(projects, projectsContainer, 'h4');
const count = document.querySelector('.projects_counts');
count.textContent = `${projects.length} projects`;

