##Crimeline

This project is under heavy development!  That means some of this is quite ugly …

###Overview

I plan to create a php backend to allow live querying against the dataset in a SQL backend.  To that end, I wrote some scripts that download the CSV data from the city's website and clean it up, since CSV is easy to directly import to most databases.

In the meantime, all data is stored as static json.  I run a second round of scripts to aggregate & convert the CSV data to json.

###Getting started

1) Run `clean_calls.php`.  This will download and sanitize the data, outputting to clean_calls.csv  It will also output clean_call_types.csv, which is intended for import to SQL as a related table.

2) Run `json_calls.php`.  This will aggregate the data into the "frames" needed by the mapplayer, and output calls.json.  Note that the `$framesep` variable at the top should match the `secPerFrame` variable in html/scripts/main.js.

3) Copy calls.json into html/scripts

###Other
The incident numbers in the calls data are in a slightly different format from the incident numbers in the incident reports.  I originally intended to link calls to incident reports but I haven't finished the code to munge the incident numbers so they match across data sets.

You'll find the beginning of this code in clean_incidents.php

