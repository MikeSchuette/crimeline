##Crimeline

This project is under heavy development!  That means some of this is quite ugly …

###Overview

I plan to create a php/SQL backend to allow live querying against the dataset.  To that end, I wrote some php CLI scripts that download the CSV data from the city's website and clean it up, since CSV is easy to directly import into most databases.

In the meantime, all data is stored as static json.  After cleaning the CSV data, I run a second round of scripts to aggregate & output as json.

###Getting started

The code is committed with the necessary .json files already created.  If you need to recreate them for any reason:

1) Run `clean_calls.php`.  This will download and sanitize the call data, outputting to clean_calls.csv  It will also output clean_call_types.csv, which is intended for import to SQL as a related table.

2) Run `json_calls.php`.  This will aggregate the data into the "frames" needed by the mapplayer, outputted as calls.json.  Note that the `$framesep` variable at the top should match the `secPerFrame` variable in html/scripts/main.js.

3) Copy calls.json into html/scripts

###Other
The incident numbers in the calls data are in a slightly different format from the incident numbers in the incident reports.  I originally intended to link the calls to incident reports but I haven't finished the code to munge the incident numbers so they match across data sets.

You'll find the beginning of this code in clean_incidents.php

