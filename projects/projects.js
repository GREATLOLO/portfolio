import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON('../lib/projects.json');

let query = '';
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let colors = d3.scaleOrdinal(d3.schemeTableau10);
let searchInput = document.querySelector('.searchBar');

// Refactor all plotting into one function
function renderPieChart(projectsGiven) {
  let projectsContainer = document.querySelector('.projects');
  
  // Re-calculate rolled data
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );

  let selectedIndex = -1;
  // Re-calculate data
  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  // Re-calculate slice generator, arc data, arc, etc.
  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);
  let arcs = arcData.map((d) => arcGenerator(d));

  // Clear up paths and legends

  let legend = d3.select('.legend');
  legend.selectAll("*").remove();
  
  // Update paths and legends
  data.forEach((d, idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`)
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });


  let svg = d3.select('svg');
  svg.selectAll('path').remove();
  arcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;
    svg
      .selectAll('path')
      .attr('class', (_, idx) => (
      idx === selectedIndex ? 'selected' : ''));
      console.log(projectsGiven[selectedIndex])

      legend.selectAll('li')
      .attr('class', (_, idx) => (
        idx === selectedIndex ? 'selected' : ''));
      

      console.log(selectedIndex)
      if (selectedIndex === -1) {
        renderProjects(projectsGiven, projectsContainer, 'h4');
      } else {
        console.log(projectsGiven)
        let selectedLabel = projectsGiven[selectedIndex].year;  // Ensure selection is valid
        let filteredProjects = projectsGiven.filter(projectsGiven => projectsGiven.year === selectedLabel);
        
        // Render only the filtered project
        renderProjects(filteredProjects, projectsContainer, 'h4');
      }
      

      
      }
    );
  });
  // console.log(legend)

  renderProjects(projectsGiven, projectsContainer, 'h4');
  let count = document.querySelector('.projects_counts');
  count.textContent = `${projectsGiven.length} projects`;
}

// Call this function on page load
renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
  query = event.target.value.toLowerCase();
  
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query);
  });

  renderPieChart(filteredProjects);
});

 




/*  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let rolledData = d3.rollups(
  projects,
  (v) => v.length,
  (d) => d.year,
);

let data = rolledData.map(([year, count]) => {
  return { value: count, label: year };
});

let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));
let colors = d3.scaleOrdinal(d3.schemeTableau10);

let legend = d3.select('.legend');

data.forEach((d, idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`)
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
});

arcs.forEach((arc, idx) => {
  d3.select('svg')
    .append('path')
    .attr('d', arc)
    .attr('fill', colors(idx)) 
})

let query = '';

let searchInput = document.querySelector('.searchBar');
let projectsContainer = document.querySelector('.projects');

searchInput.addEventListener('input', (event) => {
  // update query value
  query = event.target.value.toLowerCase();
  
  // filter the projects based on the query
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  // render updated projects
  renderProjects(filteredProjects, projectsContainer, 'h4');
});

renderProjects(projects, projectsContainer, 'h4');
const count = document.querySelector('.projects_counts');
count.textContent = `${projects.length} projects`; */