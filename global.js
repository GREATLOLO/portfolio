//console.log('IT’S ALIVE!');

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  {url: 'resume/', title: 'Resume'},
  {url: 'contact/', title: 'Contact'},
  {url: 'meta/', title: 'Meta'},
  {url: 'https://github.com/GREATLOLO', title: 'Me'}
];

const ARE_WE_HOME = document.documentElement.classList.contains('home');

// Create and prepend the h1 element

let color_changer = document.createElement('div');
color_changer.classList.add("color_changer");
let h1 = document.createElement('h1');
h1.classList.add('title');
h1.textContent = "Welcome To Keqing Li's Site";

color_changer.appendChild(h1); 
document.body.prepend(color_changer);

// Create and prepend the nav element
let nav = document.createElement('nav');
document.body.insertBefore(nav, color_changer.nextSibling);

for (let p of pages) {
  let url = p.url;
  let title = p.title;
  
  if (!ARE_WE_HOME && !url.startsWith('http')) {
    url = '../' + url;
  }
  
  let a = document.createElement('a');

  a.href = url;
  a.textContent = title;

  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname
  );
  if(a.host != location.host){
    a.target = "_blank";
  }
  nav.append(a);
}

const form = document.querySelector('form');

form?.addEventListener('submit', function (event) {
  event.preventDefault();
  const data = new FormData(form);
  let link = 'mailto:kel062@ucsd.edu?';
  for (let [name, value] of data) {
      link += `${encodeURIComponent(name)}=${encodeURIComponent(value)}&`;
      location.href = link;
  }
});


export async function fetchJSON(url) {
try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }
    const data = await response.json();
    return data; 

} catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
}
}



export function renderProjects(project, containerElement,  headingLevel = 'h2') {
containerElement.innerHTML = '';
//For each project, create a new <article> element to hold its details.

const current = document.querySelector('nav a.current').textContent

for (let p of project) {
  const article = document.createElement('article');
  let img = p.image;
  if(current == 'Home'){
    img = img.slice(3);
  }

  article.innerHTML = `
  <${headingLevel} id = 'heading'>${p.title}</${headingLevel}>
  <img src="${img}" id = 'image' alt="${p.title}">
  <p>${p.description}</p>
  <div class = 'font'> <p><i>c.</i> ${p.year}</p></div>
  `;
  containerElement.appendChild(article);
}
if (project.length === 0) {
  containerElement.innerHTML = '<p>No projects found</p>';
}

}

export async function fetchGithubData(username) {
return fetchJSON(`https://api.github.com/users/${username}`);
}

const githubData = await fetchGithubData('GREATLOLO');
const profileStats = document.querySelector('#profile-stats');

if (profileStats) {
  profileStats.innerHTML = `
        <h2>My Github Stats</h2>
        <dl class = "status" id = "status">
          <dt>Public Repos</dt><dd>${githubData.public_repos}</dd>
          <dt>Public Gists</dt><dd>${githubData.public_gists}</dd>
          <dt>Followers</dt><dd>${githubData.followers}</dd>
          <dt>Following</dt><dd>${githubData.following}</dd>
        </dl>
    `;
}


// Insert the color scheme selector
document.body.insertAdjacentHTML(
'afterbegin',
`
<label class="color-scheme">
    Theme:
    <select>
        <option value="auto">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
    </select>
</label>`
);

const select = document.querySelector('select');

if(localStorage.colorScheme){
console.log('Color scheme changed to', localStorage.colorScheme);
document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
select.value = localStorage.colorScheme;
}

select.addEventListener('input', function (event) {
console.log('Color scheme changed to', event.target.value);
document.documentElement.style.setProperty('color-scheme', event.target.value);
localStorage.colorScheme = event.target.value;
});



// Select the color_changer div


  


function redrawStoredPaths(data) {

  data.forEach((d) => {

      let commands = d.d.split(" "); // Split into segments
      let newPath = svg.append("path")
          .attr("stroke", d.color)
          .attr("stroke-width", 3)
          .attr("fill", "none")
          .attr("stroke-linecap", "round")
          .attr("stroke-linejoin", "round")
          .attr("d", ""); // Start with an empty path

      let currentD = "" 
      let index = 0;
      let interval = d.time / (commands.length / 2); // Set fixed interval (100ms per L)

      function drawNextSegment() {
          if (index >= commands.length) return; // Stop if all segments are drawn
          currentD += " " + commands[index]
          index ++;
          currentD += " " + commands[index];

          newPath.attr("d", currentD); // Update path in SVG
          index ++;

          setTimeout(drawNextSegment, interval); // Wait and draw next
      }

      drawNextSegment(); // Start drawing
  });
}  














