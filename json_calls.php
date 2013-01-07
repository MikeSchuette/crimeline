#!/usr/bin/php
<?php

$data_file = 'clean_calls.csv';
$output_file = 'calls.json';
$framesep = 600; //num seconds between frames

date_default_timezone_set('America/Chicago');

if (!file_exists($data_file)) {
	die("Couldn't find data file $data_file");
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

function roundMinute($testTime) {
	//eg, if $framesep is 900, round this minute down to the nearest 15
	global $framesep;
	$minute = date('i', $testTime);
	//echo "rounding minute $minute ..";
	$minute = $minute - ($minute % ($framesep / 60));
	//echo " to $minute\n";
	return $minute;
}

$framenum = 0;
$i = 0;
$frames = array();
$curTime = false;

while (($line = fgetcsv($fp_in)) !== false) {
	$i++;
	$line = array_map('cleanVal', $line);

/*
2012-10-01 00:21:00,53,201200902764,"2400 UPHAM ST",43.10118008608769,-89.35492067868942
*/
	
	$item['d'] = date("Y/m/d H:i:00", strtotime($line[0]));
	$item['it'] = $line[1]; //incident type
	$item['in'] = $line[2]; //incident number
	$item['title'] = $line[3];
	$item['lat'] = $line[4];
	$item['lng'] = $line[5];
	
	$testTime = strtotime($item['d']);
	if ($curTime === false) {
		//one-time init to the first time segment
		$curTime = strtotime(date("Y-m-d H:" . roundMinute($testTime) . ":00", $testTime));
		echo "curTime init to " . date("Y-m-d H:i:s", $curTime) . "\n";
	}

	if ($testTime - $curTime >= $framesep) {
		//increment frame
		$curTime += $framesep;
		$framenum++;
		while ($curTime + $framesep < $testTime) {
			//insert blank frames if necessary
			$frames[$framenum]['data'] = array();
			$frames[$framenum]['t'] = date("Y/m/d H:i:00", $curTime); //frame title
			$curTime += $framesep;
			$framenum++;
		}
	}

	$frames[$framenum]['data'][] = $item;
	$frames[$framenum]['t'] = date("Y/m/d H:i:00", $curTime); //frame title
	// see http://dygraphs.com/date-formats.html for why Y/m/d

	/*
	if ($framenum > 5) {
		break;
	}
	*/
	echo "\r$i lines, $framenum frames...";
}
$data = array_values($frames);
$json = json_encode($data);
fwrite($fp_out, $json);
echo "\n";

echo "Done!\n";

