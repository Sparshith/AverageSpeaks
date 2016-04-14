<?php

/**
* @author Sparshith Sampath
* csvfile mannipulation: http://stackoverflow.com/questions/5593473/how-to-upload-and-parse-a-csv-file-in-php
*/

$action = isset($_POST['action']) ? $_POST['action'] : '';
$output = array(
    'status' => 'failed',
    'message' => 'something went wrong'
);

function getMedian($speaks) {
	sort($speaks, 1);
    $count = count($speaks); 
    if($count % 2 != 0) {
        $median = $speaks[$count/2];
    } else {
        $low = $speaks[($count/2)];
        $high = $speaks[$count/2 + 1];
        $median = (($low+$high)/2);
    }
    return $median;
}

function getMean($arr) {
    $mean = (array_sum($arr)/count($arr));
    return $mean;
}

function returnJSON($out = array()) {
        ob_clean();
        header("Content-Type: application/json");
        echo json_encode($out);
        exit(0);
}

switch($action) {
    case 'upload-speaks':
        $tmpName = $_FILES['csv']['tmp_name'];
        $csvAsArray = array_map('str_getcsv', file($tmpName));
        $output = array(
            'status' => 'success',
            'message' => 'File uploaded successfully',
            'speaks_array' => $csvAsArray
        );
        break;

    case 'calculate-avg':
        $speaks_array = isset($_POST['speaks_array']) ? $_POST['speaks_array'] : [];

        if(empty($speaks_array)) {
            $output = array(
                'status' => 'failed',
                'message' => 'please upload tabs'
            );
        }

        $rounds = array();
        $all_speaks = array();
        foreach ($speaks_array as $rows) {
            foreach ($rows as $idx => $value) {
                if($value) { //Some teams might dropout in the middle of a tournament. Calculate median only for the rest.
                    $rounds[$idx][] =  floatval($value);
                    $all_speaks[] = floatval($value);
                }
            }   
        }

        $medians = array();
        $means = array();

        foreach ($rounds as $round_no => $round) {
            $medians[$round_no] = getMedian($round);
            $means[$round_no] = getMean($round);
        }

        $total_median = round(getMedian($all_speaks), 2);
        $total_mean = round(getMean($all_speaks), 2);

        $display_html = '
        <h2>Computed Averages</h2>
        <div class="ui statistics">
            <div class="statistic">
                <div class="value">
                '.$total_median.'
                </div>
                <div class="label">
                    Median
                </div>
            </div>
            <div class="statistic">
                <div class="value">
                    '.$total_mean.'
                </div>
                <div class="label">
                    Mean
                </div>
            </div>
        </div>
        ';

        $output = array(
            'status' => 'success',
            'message' => 'Averages calculated successfully',
            'total_mean' => $total_mean,
            'total_median' => $total_median,
            'display_html' => $display_html
        );

        break;
        
    case 'upload-gscript':    
        $url = 'https://script.google.com/macros/s/AKfycbwjEDut1Zyyn9T3BFMdq_V8bLZQ2Ri2EjYUxXDLl1Db2ieD46uX/exec';
        $data = array('tour_name' =>  $_POST['tour_name'], 'median' => $_POST['median'], 'mean' => $_POST['mean']);

        // use key 'http' even if you send the request to https://...
        $options = array(
            'http' => array(
                'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                'method'  => 'POST',
                'content' => http_build_query($data),
            ),
        );
        $context  = stream_context_create($options);
        $result = file_get_contents($url, false, $context);
        $output = array(
            'status' => 'success',
            'message' => 'Uploaded successfully',
        );

        break;

    default:
        break;
}

returnJSON($output);

?>