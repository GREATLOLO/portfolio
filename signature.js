import  {fetchJSON} from '/global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let svg = d3.select(".color_changer")
    .append("svg") // Append an SVG element
    .attr("width", 200) // Set width
    .attr("height", 50)
    .attr('id', 'signature'); // Set height



async function fetchData() {
    let data = await fetchJSON("lib/signature.json");

    
    redrawStoredPaths(data);
}
    fetchData();


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