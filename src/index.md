---
theme: dashboard
title: Overview
toc: false
---

# 2024 Github Contributions 🚀

<!-- Load and transform the data -->

```js
const contributions = FileAttachment("data/contributions/github_contributions.csv").csv({typed: true});
```

<!-- A shared color scale for consistency, sorted by the number of contributions -->

```js
const color = Plot.scale({
  color: {
    type: "categorical",
    domain: d3.groupSort(contributions, (D) => -D.length, (d) => d.repo),
    unknown: "var(--theme-foreground-muted)"
  }
});
```

## What is the contribution distribution?

```js

import { pie, arc, scaleOrdinal, schemeObservable10 } from "d3";
function renderPieChart() {
  let  data = [
    { category: "Commits", value: contributions.filter((d) => d.type === "Commit").reduce((sum, d) => sum + d.count, 0) },
    { category: "Pull Requests", value: contributions.filter((d) => d.type === "Pull Request").length },
    { category: "Issues", value: contributions.filter((d) => d.type === "Issue").length },
    { category: "Code Reviews", value: contributions.filter((d) => d.type === "Code Review").length }
  ];
  
  data= data.filter((c) => c.value != 0)


  const total = data.reduce((sum, d) => sum + d.value, 0); // Calculate total sum of all values

  const width = 400;
  const height = 400;
  const radius =  150;

  const color = scaleOrdinal(schemeObservable10);

  const pieGenerator = pie().value((d) => d.value);

  const arcs = pieGenerator(data);
  
  const arcGenerator = arc().innerRadius(0).outerRadius(radius);

  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style"," height: auto; font: 10px sans-serif;");
  
  // Create the tooltip element
  const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "rgba(0, 0, 0, 0.7)")
    .style("color", "white")
    .style("padding", "5px")
    .style("border-radius", "4px")
    .style("font-size", "12px");
  
  // Draw pie chart
  svg.selectAll("path")
    .data(arcs)
    .join("path")
    .attr("fill", (d) => color(d.data.category))
    .attr("d", arcGenerator)
      .on("mouseover", function(event, d) {
      // Show the tooltip with the value and percentage
      const value = d.data.value;
      const percentage = ((value / total) * 100).toFixed(1);  // Calculate percentage
      tooltip.html(`${d.data.category}: ${value} (${percentage}%)`)
        .style("visibility", "visible");
    })
    .on("mousemove", function(event) {
      // Position the tooltip near the mouse
      tooltip.style("top", (event.pageY + 5) + "px")
        .style("left", (event.pageX + 5) + "px");
    })
    .on("mouseout", function() {
      // Hide the tooltip
      tooltip.style("visibility", "hidden");
    });;


  // Add text for value and percentage
  svg.selectAll("text")
    .data(arcs)
    .join("text")
    .attr("transform", (d) => `translate(${arcGenerator.centroid(d)})`)
    .style("font-size", "10px")  // Reduce text size
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .text((d) => {
      const value = d.data.value;
      const percentage = ((value / total) * 100).toFixed(1);  // Calculate percentage
      return `${d.data.category}`;  // Display both value and percentage
    });

  return svg.node();
}

```



<!-- Cards with big numbers -->

  <div class=" grid grid-cols-3">
      <div class="card">
        <h2>Total Contribution</h2>
        <span class="big">${contributions.reduce((sum, d) => sum + d.count, 0)}</span>
      </div>
      <div class="card">
        <h2>Commits</h2>
        <span class="big">${contributions.filter((d) => d.type === "Commit").reduce((sum, d) => sum + d.count, 0)}</span>
      </div>
      <div class="card">
        <h2>Pull Requests</h2>
        <span class="big">${contributions.filter((d) => d.type === "Pull Request").length.toLocaleString("en-US")}</span>
      </div>
      <div class="card">
        <h2>Issues</h2>
        <span class="big">${contributions.filter((d) => d.type === "Issue").length.toLocaleString("en-US")}</span>
      </div>
      <div class="card">
        <h2>Code Reviews</h2>
        <span class="big">${contributions.filter((d) => d.type === "Code Review").length.toLocaleString("en-US")}</span>
      </div>
</div>
<div class="grid grid-cols-1" style="margin-bottom: 300px">
    <svg >
        ${renderPieChart()}
    </svg>
        
  </div>




<!-- Plot of launch history -->

## How many contribution have I made each month over the last year ?
```js
import { rollup } from "d3";

function contributionTimeline(data, {width} = {}) {
    let datacopy = data;

    // Add the month property to each data entry
    datacopy.forEach(d => {
        const date = new Date(d.date);
        d.month = date.getMonth() + 1; // getMonth() returns 0-11, so we add 1
    });


    console.log("data",datacopy)

// Aggregate data to get the sum of 'count' for each 'month'
const aggregatedData = Array.from(
  rollup(datacopy, v => d3.sum(v, d => d.count), d => d.month),
  ([month, sum]) => ({ month, sum })
);

const basePlot = Plot.plot({
  title: "Contributions over the months",
  width,
  height: 300,
  y: { grid: true, label: "Contributions" },
  color: { legend: false },
  marks: [
    Plot.barY(aggregatedData, {
      x: "month",
      y: "sum",
      fill: "month",
      tip: d => `Month: ${d.month}, Total Contributions: ${d.sum}`,  // Custom tooltip
    }),
    Plot.ruleY([0]),
  ],
});

   let index = 12;  // Start with December (12)

// After the plot is rendered, use D3 to select the rect elements and add the data-month attribute
d3.select(basePlot).selectAll("rect")
    .each(function(event, d, i) {
        // Assign the current rect element with the correct month index
        d3.select(this).attr("data-month", index);

        // After setting the attribute, update the index, wrapping around from 12 to 1
        index = (index === 1) ? 12 : index - 1;  // Decrement index, wrapping around to 12 when it reaches 1
        })
        .on("click", function(event, d) {
            const clickedMonth = d3.select(this).attr("data-month");
            console.log("Clicked Month:", clickedMonth);  // Log the clicked month

            // Filter the data for the clicked month
            const monthData = datacopy.filter(d => d.month === parseInt(clickedMonth));
            console.log("Filtered Month Data:", monthData);

            // Now render the breakdown of contributions by repository for the clicked month
            renderRepoBreakdown(monthData, clickedMonth);
        });

    return basePlot;
}
function renderRepoBreakdown(monthData) {
    console.log("Rendering Repo Breakdown for Month Data:", monthData);

    // Aggregate the contributions by month and repo
    const aggregatedData = d3.rollups(
        monthData, 
        v => d3.sum(v, d => d.count),  // Sum the contributions (count) for each month-repo combination
        d => d.month,                  // Group by month
        d => d.repo                     // Group by repo
    );

    // Flatten the aggregated data
    const flattenedData = [];
    aggregatedData.forEach(([month, repoData]) => {
        repoData.forEach(([repo, count]) => {
            flattenedData.push({ month, repo, count });
        });
    });
    
    console.log(aggregatedData); // Check what is being aggregated for each month-repo combination


    // Create the plot
    const repoPlot = Plot.plot({
        title: "Contributions by Repo (Stacked) over Months",
        width: 600,
        height: 300,
        x: {
            label: "Month",
            domain: d3.range(1, 13), // Months 1 through 12
        },
        y: { 
            label: "Contributions",
            grid: true 
        },
        color: { 
            legend: true, // Automatically generates legend based on the `repo` field
            scale: { 
                domain: flattenedData.map(d => d.repo), 
                range: d3.schemeCategory10 
            }
        },
        marks: [
            Plot.barY(flattenedData, {
                x: d => d.month,
                y: d => d.count,
                fill: d => d.repo, // Use repository name for color
                stack: "repo", // Stack the bars by repo
                tip: true
            }),
            Plot.ruleY([0]) // Add a baseline at y = 0
        ]
    });

    // Append or replace the plot element for repo breakdown
    const repoBreakdownDiv = document.getElementById("repoBreakdown");
    repoBreakdownDiv.innerHTML = ''; // Clear previous plot
    repoBreakdownDiv.appendChild(repoPlot); // Append the new plot
}


```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => contributionTimeline(contributions, {width}))}
<div id="repoBreakdown"></div>

  </div>
</div>

<!-- Plot of contributions repositories -->

## What are the TOP 25 repositories to which I have contributed 2024?
```js
function repositoryChart(data, { width }) {
    const TOP = 24; // Top 24 repositories + 1 "Others" category

    // Aggregate contributions per repository
    const repoContributions = d3.rollup(
        data,
        (v) => d3.sum(v, (d) => d.count), // Sum contributions
        (d) => d.repo // Group by repository
    );

    // Convert rolled-up data into an array
    const repoData = Array.from(repoContributions, ([repo, count]) => ({ repo, count }));

    // Sort repositories by contribution count
    repoData.sort((a, b) => b.count - a.count);

    // Select the top 24 repositories
    const topRepos = repoData.slice(0, TOP);

    // Group the remaining repositories as "Others"
    const otherRepos = repoData.slice(TOP);
    const others = {
        repo: "Others",
        count: d3.sum(otherRepos, (d) => d.count), // Sum of contributions from "Others"
    };

    // Combine top 24 repositories with "Others"
    const finalRepoData = [...topRepos, others];

    // Define a color scale for the top 24 repositories + "Others"
    const colorScale = d3.scaleOrdinal()
        .domain(finalRepoData.map((d) => d.repo))
        .range(d3.schemeCategory10.concat(d3.schemeSet3).slice(0, 25)); // Use a palette with at least 25 distinct colors

    // Create the chart
    const svg = Plot.plot({
        title: "Top Contributed Repositories",
        width: 1200, // Chart width
        height: 1000, // Chart height
        marginTop: 20,
        marginLeft: 400, // Increased left margin for readability
        x: {
            grid: true,
            label: "Total Contributions",
        },
        y: {
            label: "Repositories",
            domain: finalRepoData.map((d) => d.repo), // Define y-axis based on repo names
        },
        color: {
            legend: true,
            domain: finalRepoData.map((d) => d.repo),
            range: colorScale.range(), // Use the defined color scale
        },
        marks: [
            Plot.barX(finalRepoData, {
                x: "count",
                y: "repo",
                fill: "repo", // Color bars by repository
                tip: (d) => `${d.repo}: ${d.count} Contributions`, // Tooltip
            }),
            Plot.ruleY([0]), // Add a baseline at Y=0
        ],
    });

    return svg;
}







```

<div class="grid grid-cols-12">
  <div class="card">
    ${resize((width) => repositoryChart(contributions, {width}))}
  </div>
</div>

