#!/usr/bin/php
<?php

$data_file = 'Madison_Police_Calls_for_Service.csv';
$output_file = 'clean_calls.csv';
$type_output_file = 'clean_call_types.csv';
$start_date = '2011-11-01';
$end_date = '2012-11-01';


date_default_timezone_set('America/Chicago');

if (!file_exists($data_file)) {
	echo "Couldn't find the data file ... downloading from https://data.cityofmadison.com/api/views/4gss-84dk/rows.csv?accessType=DOWNLOAD\n";
 	$ch = curl_init("https://data.cityofmadison.com/api/views/4gss-84dk/rows.csv?accessType=DOWNLOAD");
	$fp = fopen($data_file, 'w');
	curl_setopt($ch, CURLOPT_FILE, $fp);
	curl_setopt($ch, CURLOPT_HEADER, 0);
	$rv = curl_exec($ch);
	curl_close($ch);
	fclose($fp);
	if (!$rv) {
		die("Couldn't find data file $data_file and couldn't download it.");
	}
}


$fp_in = @fopen($data_file, 'r');
if (!$fp_in) {
	die("Couldn't find data file $data_file for reading");
}


$fp_out = @fopen($output_file, 'w');
if (!$fp_out) {
	die("Couldn't open $output_file for writing");
}

$fp_type_out = @fopen($type_output_file, 'w');
if (!$fp_out) {
	die("Couldn't open $type_output_file for writing");
}

function cleanVal($val) {
	$val = trim($val);
	$val = str_replace("\r", '', $val);
	//$val = str_replace("\n", '', $val);
	$val = str_replace('"', '""', $val);
	return $val;
}


$i = 0;
$j = 0;
$t = 0;
$types = array();
$start_ts = strtotime($start_date);
$end_ts = strtotime($end_date);
echo "Sanitizing ...\n";
fgetcsv($fp_in); //throw away the header
while (($line = fgetcsv($fp_in)) !== false) {
	$i++;

	//skip old stuff
	$ts = strtotime($line[3]);
	if ($ts < $start_ts || $ts > $end_ts) {
		//continue;
	}

	$line = array_map('cleanVal', $line);
/*
Array
(
    [0] => Incident Number
    [1] => Type (code)
    [2] => Description (code description)
    [3] => Date/Time
    [4] => Address
)
*/
	//associative tables in csv 'cuz I can
	$type_id = array_search($line[1], $types);
	if ($type_id === false) {
		$types[] = $line[1];
		$type_id = count($types);
		fwrite($fp_type_out, "$type_id,{$line[1]},\"{$line[2]}\"\n");
		$t++;
	} else {
		$type_id++;  //array_search and count() use different bases for 'first item'
	}

	/* XXX This is what's needed to make the sense of incident types!
	unset($line[1]);
	$line[2] = $type_id;
	*/
	unset($line[2]);
	//$line[2] = $line[2];

	$line[3] = date("Y-m-d H:i:s", $ts);

	//$line[4] is overloaded
	$loc = explode("\n", $line[4]);
	$line[4] = "\"{$loc[0]}\""; //address
	//$loc[1] is always 'Madison, WI' so not included
	$loc[2] = str_replace('(', '', $loc[2]);
	$loc[2] = str_replace(')', '', $loc[2]);
	$coords = explode(",", $loc[2]);
	$coords = array_map('trim', $coords);
	$line[5] = $coords[0]; //lat
	$line[6] = $coords[1]; //lng
	
	//make date the first column
	$temp = $line[0];
	$line[0] = $line[3];
	$line[3] = $temp;

	fwrite($fp_out, implode(',', $line) . "\n");
	$j++;

	/*
	if ($j > 5) {
		die();
	}
	*/
	
	echo "\r$i lines, $j in date range ...";
}
echo "\n";

echo "Sorting by date ...\n";
fclose($fp_out);

system("sort $output_file -o $output_file");
echo "Done!\n";
echo "Found $t incident types.\n";

