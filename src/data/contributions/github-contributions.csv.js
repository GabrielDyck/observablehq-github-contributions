import {csvFormat, tsvParse} from "d3-dsv";
import {utcParse} from "d3-time-format";

// Load and parse launch-log and trim down to smaller size.
const contributionHistory = csvParse("github_contributions.csv")

// Write out csv formatted data.
process.stdout.write(contributionHistory);
