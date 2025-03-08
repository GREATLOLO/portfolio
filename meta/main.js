
let data = [];
let commits = d3.groups(data, (d) => d.commit);
let xScale;
let yScale;
let selectedCommits = [];
let filteredCommits;

let commitProgress = 100;
let timeFilter = 0;

const timeSlider = d3.select('#time-slider');
const selectedTime = d3.select('#selected-time');
const anyTimeLabel = d3.select('#any-time');


let NUM_ITEMS = 100; // Ideally, let this value be the length of your commit history
let ITEM_HEIGHT = 30; // Feel free to change
let VISIBLE_COUNT = 10; // Feel free to change as well
let totalHeight = (NUM_ITEMS - 1) * ITEM_HEIGHT;
const scrollContainer = d3.select('#scroll-container');
const spacer = d3.select('#spacer');
spacer.style('height', `${totalHeight}px`);
const itemsContainer = d3.select('#items-container');
scrollContainer.on('scroll', () => {
  const scrollTop = scrollContainer.property('scrollTop');
  let startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
  startIndex = Math.max(0, Math.min(startIndex, commits.length - VISIBLE_COUNT));
  renderItems(startIndex);
});

function renderItems(startIndex) {
  // Clear things off
  itemsContainer.selectAll('div').remove();
  const endIndex = Math.min(startIndex + VISIBLE_COUNT, commits.length);
  let newCommitSlice = commits.slice(startIndex, endIndex);
  // TODO: how should we update the scatterplot (hint: it's just one function call)
  updateScatterplot(newCommitSlice);
  // Re-bind the commit data to the container and represent each using a div
  itemsContainer.selectAll('div')
                .data(newCommitSlice)
                .enter()
                .append('div')
                .html(d => `
                  <p>
                    On ${new Date(d.datetime).toLocaleString("en", { dateStyle: "full", timeStyle: "short" })}, 
                    I made <a href="${d.url}" target="_blank">${d.index > 0 ? "another glorious commit" : "my first commit, and it was glorious"}</a>.
                    I edited ${d.totalLines} lines across ${d3.rollups(d.lines, D => D.length, d => d.file).length} files.
                  </p>
                `)
                .style('top', (_, idx) => `${idx * ITEM_HEIGHT}px`);
}



async function loadData() {
    // original function as before
    data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: Number(row.line), // or just +row.line
        depth: Number(row.depth),
        length: Number(row.length),
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
      }));
  
    displayStats();

    // new feature
    data = processData(data);

    updateScatterplot(data);
    let timeScale = d3.scaleTime([d3.min(commits, d => d.datetime), d3.max(commits, d => d.datetime)], [0, 100]);
    let commitMaxTime = timeScale.invert(commitProgress);
    timeSlider.on('input', () => {
      updateTimeDisplay();   // First function\
  });

  renderItems(0)
  

  function updateTimeDisplay() {
    timeFilter = Number(timeSlider.property('value'));  // Get slider value
    if (timeFilter === 0) {
      selectedTime.textContent = '';  // Clear time display
      anyTimeLabel.style.display = 'block';  // Show "(any time)"
    } else {
      selectedTime.text(timeScale.invert(timeFilter).toLocaleString());  // Display formatted time
      anyTimeLabel.style.display = 'none';  // Hide "(any time)"
    }
    filteredCommits = d3.filter(commits, d => d.datetime < new Date(timeScale.invert(timeFilter).toLocaleString()));
    let lines = filteredCommits.flatMap((d) => d.lines);
    let files = [];
    files = d3
      .groups(lines, (d) => d.file)
      .map(([name, lines]) => {
        return { name, lines };
      });
    files = d3.sort(files, (d) => -d.lines.length);
    let fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);

    d3.select('.files').selectAll('div').remove(); // don't forget to clear everything first so we can re-render
    let filesContainer = d3.select('.files').selectAll('div').data(files).enter().append('div');
    console.log(files)

    filesContainer.append('dt').
    append('code').text(d => d.name);

    function getColor(lines) {
      const typeCounts = d3.rollup(
        data.flatMap(d => d.lines), // Flatten all lines arrays
        v => v.length, // Count occurrences
        d => d.type // Group by type
      );
      
      // Find the type with the max count
      const maxType = [...typeCounts.entries()].reduce((a, b) => (b[1] > a[1] ? b : a))[0];
      
      if (maxType == 'js'){
        return "steelblue"
      }else if (maxType == 'html'){
        return "red"
      }else {
        return "green"
      }
    }

    

    filesContainer.append('dd')
    .selectAll('div') // Select all divs within each <dd> (initially none)
    .data(d => d.lines) // Bind each line in d.lines
    .enter() // Enter the data join
    .append('div') // Append a div for each line
    .attr('class', 'line') // Add class for styling
    .style('background', d => getColor(d.lines));


    updateScatterplot(filteredCommits);
  }


    
  }


  function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url: 'https://github.com/vis-society/lab-7/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };
  
        Object.defineProperty(ret, 'lines', {
          value: lines,
          writable: false,   
          enumerable: false,  
          configurable: false
          // What other options do we need to set?

          // Hint: look up configurable, writable, and enumerable
        });
  
        return ret;
      });
  }


  function processData(data){
    let dataProcess = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/vis-society/lab-7/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        writable: false,   
        enumerable: false,  
        configurable: false
        // What other options do we need to set?

        // Hint: look up configurable, writable, and enumerable
      });

      return ret;
    });
    return dataProcess
  }


  function displayStats() {
    // Process commits first
    processCommits();
  
    // Create the dl element
    const dl = d3.select('#status').append('dl').attr('class', 'stats');
  
    // Add total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);
  
    // Add total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);
  
    // Add more stats as needed...
    dl.append('dt').text('Max total Lines');
    let maxTotalLines = Math.max(...commits.map(commit => commit.totalLines));
    dl.append('dd').text(maxTotalLines);


    dl.append('dt').text('Longest Lines length');
    let longestLines = Math.max(...commits.flatMap(commit => commit.lines.map(line => line.length)));
    dl.append('dd').text(longestLines);

    const fileLengths = d3.rollups(
        data,
        (v) => d3.max(v, (v) => v.line),
        (d) => d.file
      );
    const averageFileLength = d3.mean(fileLengths, (d) => d[1]);
    dl.append('dt').text('average file length(line)');
    let twoDecimalFormat = d3.format(".2f");
    dl.append('dd').text(twoDecimalFormat(averageFileLength))
  }

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});




//Create plot
 function updateScatterplot(filteredCommitsData){
    const width = 1000;
    const height = 600;
    const margin = { top: 10, right: 10, bottom: 30, left: 30 };


    const [minLines, maxLines] = d3.extent(filteredCommitsData, (d) => d.totalLines);
    const rScale = d3
  .scaleSqrt() // Change only this line
  .domain([minLines, maxLines])
  .range([2, 30]);



  // Sort commits by total lines in descending order
  const sortedCommits = d3.sort(filteredCommitsData, (d) => -d.totalLines);


  d3.select('svg').remove(); // first clear the svg

    const svg = d3
  .select('#chart')
  .append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`)
  .style('overflow', 'visible');



  xScale = d3
  .scaleTime()
  .domain(d3.extent(sortedCommits, (d) => d.datetime))
  .range([0, width])
  .nice();

  yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);


  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };
  
  // Update scales with new ranges
  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);


  // Create the axes
const xAxis = d3.axisBottom(xScale);
const yAxis = d3
  .axisLeft(yScale)
  .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');



svg.selectAll('g').remove(); // clear the scatters in order to re-draw the filtered ones


// Add X axis
svg
  .append('g')
  .attr('transform', `translate(0, ${usableArea.bottom})`)
  .call(xAxis);

// Add Y axis
svg
  .append('g')
  .attr('transform', `translate(${usableArea.left}, 0)`)
  .call(yAxis);


const dots = svg.append('g').attr('class', 'dots');


dots
  .selectAll('circle')
  .data(sortedCommits)
  .join('circle')
  .attr('cx', (d) => xScale(d.datetime))
  .attr('cy', (d) => yScale(d.hourFrac))
  .attr('r', 5)
  .attr('fill', 'steelblue')
  .attr('r', (d) => rScale(d.totalLines))
  .style('fill-opacity', 0.7) // Add transparency for overlapping dots
    // ... existing hover handlers
  //console.log(commits);

dots.selectAll('circle')
    .on('mouseenter',  (event, commit) => { // Get data bound to this dot
        updateTooltipContent(commit);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
        d3.select(event.currentTarget).style('fill-opacity', 1);
    })
    .on('mouseleave', () => {
        updateTooltipContent({});
        updateTooltipVisibility(false);
        d3.select(event.currentTarget).style('fill-opacity', 0.7);
    });



  // Add gridlines BEFORE the axes
const gridlines = svg
.append('g')
.attr('class', 'gridlines')
.attr('transform', `translate(${usableArea.left}, 0)`);

// Create gridlines as an axis with no labels and full-width ticks
gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));
// Create brush
brushSelector();
 }
//finish graph





 function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    //console.log(link)
  
    if (Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
      dateStyle: 'full',
    });
  }


  function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
  }

  function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }


  function brushSelector() {
    const svg = document.querySelector('svg');
    d3.select(svg).call(d3.brush().on('start brush end', brushed));
        // Create brush

// Raise dots and everything after overlay
    d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
  }

  let brushSelection = null

  function brushed(evt) {
    brushSelection = evt.selection;
    selectedCommits = !brushSelection
      ? []
      : commits.filter((commit) => {
          let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
          let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
          let x = xScale(commit.date);
          let y = yScale(commit.hourFrac);
  
          return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
        });
        updateSelection();
        updateSelectionCount();
        updateLanguageBreakdown();
  }


function isCommitSelected(commit) {
  return selectedCommits.includes(commit);
}
  
  function updateSelection() {
    // Update visual state of dots based on selection
    d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
  }

  function updateSelectionCount() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
  
    const countElement = document.getElementById('selection-count');
    countElement.textContent = `${
      selectedCommits.length || 'No'
    } commits selected`;
  
    return selectedCommits;
  }



  function updateLanguageBreakdown() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
    const container = document.getElementById('language-breakdown');
  
    if (selectedCommits.length === 0) {
      container.innerHTML = '';
      return;
    }
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);
  
    // Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
      lines,
      (v) => v.length,
      (d) => d.type
    );
  
    // Update DOM with breakdown
    container.innerHTML = '';
  
    for (const [language, count] of breakdown) {
      const proportion = count / lines.length;
      const formatted = d3.format('.1~%')(proportion);
  
      container.innerHTML += `
              <dt>${language}</dt>
              <dd>${count} lines (${formatted})</dd>
          `;
    }
  
    return breakdown;
  }