console.log('IT’S ALIVE!');

// function $$(selector, context = document) {
//   return Array.from(context.querySelectorAll(selector));
// }

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
//  );

//  if (currentLink) {
//     // or if (currentLink !== undefined)
//     currentLink.classList.add('current');
// }

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    {url: 'resume/', title: 'Resume'},
    {url: 'contact/', title: 'Contact'},
    {url: 'https://github.com/GREATLOLO', title: 'Me'}
  ];

const ARE_WE_HOME = document.documentElement.classList.contains('home');

let nav = document.createElement('nav');
document.body.prepend(nav);


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
    select.value = localStorage.colorScheme
}

select.addEventListener('input', function (event) {
  console.log('Color scheme changed to', event.target.value);
  document.documentElement.style.setProperty('color-scheme', event.target.value);
  localStorage.colorScheme = event.target.value
});

const form = document.querySelector('form');

form?.addEventListener('submit', function (event) {
    event.preventDefault();
    const data = new FormData(form);
    let link = 'mailto:kel062@ucsd.edu?'
    for (let [name, value] of data) {
        link += `${encodeURIComponent(name)}=${encodeURIComponent(value)}&`;
        console.log(link);
        location.href = link;
      }

});

console.log(document.documentElement.classList.contains('home'));


  