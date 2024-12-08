---
theme: dashboard
title: Overview
toc: false
---

# Contributions 🚀

<!-- Load and transform the data -->

```js
const contributions = FileAttachment("data/contributions/github_contributions.csv").csv({typed: true});
```

<!-- A shared color scale for consistency, sorted by the number of contributions -->

```js
const color = Plot.scale({
  color: {
    type: "categorical",
    domain: d3.groupSort(contributions, (D) => -D.length, (d) => d.repo).filter((d) => d !== "Other"),
    unknown: "var(--theme-foreground-muted)"
  }
});
```

<!-- Cards with big numbers -->

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Commits</h2>
    <span class="big">${contributions.filter((d) => d.type === "Commit").reduce((sum, d) => sum + d.count, 0)}</span>
  </div>
  <div class="card">
    <h2>Pull Requests <span class="muted">/ </span></h2>
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

<!-- Plot of launch history -->

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

```js
function repositoryChart(data, {width}) {
    return Plot.plot({
        title: "Popular repositories",
        width,
        height: 300,
        marginTop: 0,
        marginLeft: 50,
        x: {grid: true, label: "Contributions"},
        y: {label: null},
        color: {...color, legend: true},
        marks: [
            Plot.rectX(data, Plot.groupY({x: "count"}, {y: "family", fill: "repo", tip: true, sort: {y: "-x"}})),
            Plot.ruleX([0])
        ]
    });
}
```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => repositoryChart(contributions, {width}))}
  </div>
</div>

Data: Gabriel Fernando Dyck, [2024 Github Contributions](https://github.com/GabrielDyck/observablehq-github-contributions/blob/main/src/data/contributions/github_contributions.csv)
