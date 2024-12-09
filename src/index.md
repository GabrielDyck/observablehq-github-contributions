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
  const data = [
    { category: "Commits", value: contributions.filter((d) => d.type === "Commit").reduce((sum, d) => sum + d.count, 0) },
    { category: "Pull Requests", value: contributions.filter((d) => d.type === "Pull Request").length },
    { category: "Issues", value: contributions.filter((d) => d.type === "Issue").length },
    { category: "Code Reviews", value: contributions.filter((d) => d.type === "Code Review").length }
  ];


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

  <div class=" grid grid-cols-4">
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

## How many contribution have I made on each repo the last year grouped by month ?
```js
function contributionTimeline(data, {width} = {}) {
    return Plot.plot({
        title: "Contributions over the months",
        width,
        height: 300,
        y: {grid: true, label: "Contributions"},
        color: {...color, legend: true},
        marks: [
            Plot.rectY(data, Plot.binX({y: "count"}, {x: "date", fill: "repo", interval: "month", tip: true})),
            Plot.ruleY([0])
        ]
    });
}
```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => contributionTimeline(contributions, {width}))}
  </div>
</div>

<!-- Plot of contributions repositories -->

## What are the TOP 25 repositories to which I have contributed 2024?
```js
function repositoryChart(data, { width }) {
    const TOP=25
    // Aggregate contributions per repository (sum of commits, PRs, code reviews, and issues)
    const repoContributions = d3.rollup(data, 
        (v) => d3.sum(v, (d) => d.count),  // Sum of counts per repository
        (d) => d.repo  // Group by repository
    );

    // Convert rolled-up data into an array for plotting
    const repoData = Array.from(repoContributions, ([repo, count]) => ({ repo, count }));

    // Sort repositories by contribution count in descending order
    repoData.sort((a, b) => b.count - a.count);

    // Select the top 50 repositories
    const topRepos = repoData.slice(0, TOP);

    // Group remaining repositories as "Others"
    const otherRepos = repoData.slice(TOP);
    const others = {
        repo: "Others",
        count: d3.sum(otherRepos, (d) => d.count)  // Sum of contributions from "Others"
    };

    // Combine top 50 repos with "Others"
    const finalRepoData = [...topRepos, others];

    // Create the chart with a larger size
    const svg = Plot.plot({
        title: "Top Contributed Repositories",
        width: 1200,  // Increase width for better display of 50 repos
        height: 1000,  // Increase height for better spacing of bars
        marginTop: 20,
        marginLeft: 400,  // Increase left margin for better readability of repo names
        x: {
            grid: true, 
            label: "Total Contributions",  // Label for X-axis
        },
        y: {
            label: "Repositories",  // Label for Y-axis
            domain: finalRepoData.map((d) => d.repo),  // Define the domain for Y-axis based on repo names
        },
        color: {
            ...color,
            legend: true  // Optional: color for the bars
        },
        marks: [
            Plot.barX(finalRepoData, {  // Create horizontal bars
                x: "count",  // X-axis uses the contribution count
                y: "repo",   // Y-axis uses the repository names
                fill: "repo",  // Fill color by repository
                tip: (d) => `${d.repo}: ${d.count} Contributions`  // Tooltip functionality integrated with Plot
            }),
            Plot.ruleY([0])  // Add a baseline at Y = 0
        ]
    });

    return svg;
}






```

<div class="grid grid-cols-12">
  <div class="card">
    ${resize((width) => repositoryChart(contributions, {width}))}
  </div>
</div>

