#!/usr/bin/php
<?php


$data_file = 'Police_Incident_Reports.csv';
$output_file = 'clean_incidents.csv';
$start_date = '2011-11-01';
$end_date = '2012-11-01';


date_default_timezone_set('America/Chicago');

if (!file_exists($data_file)) {
	echo "Couldn't find the data file ... downloading from https://data.cityofmadison.com/api/views/d686-rvcw/rows.csv?accessType=DOWNLOAD ...\n";
	echo "This is a 20Mb file so be patient ....\n";
 	$ch = curl_init("https://data.cityofmadison.com/api/views/d686-rvcw/rows.csv?accessType=DOWNLOAD");
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


function cleanVal($val) {
	$val = trim($val);
	$val = str_replace("\r", '', $val);
	//$val = str_replace("\n", '', $val);
	$val = str_replace('"', '""', $val);
	return $val;
}




/*
$file_header = Array (
    'Incident ID',
    'Incident Type',
    'Case Number',
    'Incident Date',
    'Suspect',
    'Arrested',
    'Address',
    'Victim',
    'Details',
    'Released By',
    'Date Modified'
);
fwrite($fp_out, implode(',', $file_header) . "\n");
*/

$i = 0;
$j = 0;
$start_ts = strtotime($start_date);
$end_ts = strtotime($end_date);
echo "Sanitizing ...\n";
while (($line = fgetcsv($fp_in)) !== false) {
	$i++;

	//skip old stuff
	$ts = strtotime($line[3]);
	if ($ts < $start_ts || $ts > $end_ts) {
		continue;
	}

	$line = array_map('cleanVal', $line);
/*
Array
(
    [0] => Incident ID
    [1] => Incident Type
    [2] => Case Number
    [3] => Incident Date
    [4] => Suspect
    [5] => Arrested
    [6] => Address
    [7] => Victim
    [8] => Details
    [9] => Released By
    [10] => Date Modified
)
*/

	$line[3] = date("Y-m-d H:i:s", $ts);

	$line[2] = "\"{$line[2]}\"";
	$line[4] = "\"{$line[4]}\"";
	$line[5] = "\"{$line[5]}\"";
	$line[6] = "\"{$line[6]}\"";
	$line[7] = "\"{$line[7]}\"";
	$line[8] = "\"{$line[8]}\"";

	//print_r($line);
	fwrite($fp_out, implode(',', $line) . "\n");
	$j++;

	echo "\r$i lines, $j in date range ...";
}

echo " Done!\n";
